import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest, type Request } from "firebase-functions/v2/https";
import type { Response } from "express";
import { logger } from "firebase-functions";
import { HAREMAPI_KEY, fetchHaremPrices, priceOf, type HaremPrice } from "./harem";
import { RSS_SOURCES, fetchAndParseRss, dedupeByTitle, type ParsedItem } from "./news";

initializeApp();
const db = getFirestore();

const REGION = "europe-west1";
const COMMON = { region: REGION, cors: true, memory: "256MiB" as const, timeoutSeconds: 15 };
const HISTORY_KEEP_MINUTES = 24 * 60; // 1440 dakika = tam 24 saat

type CompactSnap = { s: string; b: number | null; a: number | null };

function compactSnapshot(items: HaremPrice[]): CompactSnap[] {
  const out: CompactSnap[] = [];
  for (const p of items) {
    const s = (p.symbol ?? p.code ?? "").toString().toUpperCase();
    if (!s) continue;
    const b = typeof p.bid === "number" ? p.bid : (typeof p.alis === "number" ? p.alis : null);
    const a = typeof p.ask === "number" ? p.ask : (typeof p.satis === "number" ? p.satis : null);
    if (b === null && a === null) continue;
    out.push({ s, b, a });
  }
  return out;
}

type Prev24hMap = Record<string, { bid: number | null; ask: number | null }>;
let prev24hCache: { ts: number; data: Prev24hMap } | null = null;
const PREV24H_CACHE_MS = 60_000; // 60 sn — mobil polling 5sn olduğu için 12x azalma

async function fetchPrev24h(): Promise<Prev24hMap> {
  const now = Date.now();
  if (prev24hCache && now - prev24hCache.ts < PREV24H_CACHE_MS) {
    return prev24hCache.data;
  }
  const minute = Math.floor(now / 60000);
  const targetMinute = minute - HISTORY_KEEP_MINUTES;
  let snap = await db.doc(`history/${targetMinute}`).get();
  if (!snap.exists) {
    // En yakın eski snapshot'ı bul (24 saatten daha geri olabilir)
    const q = await db
      .collection("history")
      .where("ts", "<=", Date.now() - HISTORY_KEEP_MINUTES * 60000)
      .orderBy("ts", "desc")
      .limit(1)
      .get();
    if (q.empty) return {};
    snap = q.docs[0];
  }
  const data = snap.data() as { items?: CompactSnap[] } | undefined;
  const out: Prev24hMap = {};
  for (const it of data?.items ?? []) {
    if (!it?.s) continue;
    out[it.s] = { bid: it.b, ask: it.a };
  }
  prev24hCache = { ts: now, data: out };
  return out;
}

function bad(res: Response, code: number, msg: string): void {
  res.status(code).json({ error: msg });
}

function getString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

export const getPrices = onRequest(
  { ...COMMON, secrets: [HAREMAPI_KEY] },
  async (_req, res) => {
    try {
      const snap = await db.doc("prices/latest").get();
      const data = snap.data();
      let ts: number;
      let items: HaremPrice[];
      if (data && typeof data.ts === "number" && Date.now() - data.ts < 8000) {
        ts = data.ts;
        items = data.items as HaremPrice[];
      } else {
        items = await fetchHaremPrices(HAREMAPI_KEY.value());
        ts = Date.now();
        await db.doc("prices/latest").set({ ts, items }, { merge: false });
      }
      const prev24h = await fetchPrev24h().catch((e) => {
        logger.warn("prev24h fetch failed", e);
        return {};
      });
      res.json({ ts, items, prev24h });
    } catch (err) {
      logger.error("getPrices failed", err);
      bad(res, 502, (err as Error).message);
    }
  }
);

export const pollPrices = onSchedule(
  { region: REGION, schedule: "every 1 minutes", secrets: [HAREMAPI_KEY], memory: "256MiB" },
  async () => {
    const items = await fetchHaremPrices(HAREMAPI_KEY.value());
    const ts = Date.now();
    const minute = Math.floor(ts / 60000);

    await db.doc("prices/latest").set({ ts, items }, { merge: false });

    // Dakikalık snapshot — 24 saatlik gerçek değişim için
    const compact = compactSnapshot(items);
    if (compact.length > 0) {
      await db.doc(`history/${minute}`).set({ ts, items: compact }, { merge: false });
    }

    // 24 saati dolmuş eski snapshot'ı sil (rolling window)
    await db
      .doc(`history/${minute - HISTORY_KEEP_MINUTES - 1}`)
      .delete()
      .catch(() => {});

    await checkAlerts(items);
  }
);

export const registerToken = onRequest(COMMON, async (req: Request, res) => {
  if (req.method !== "POST") return bad(res, 405, "POST only");
  const body = (req.body ?? {}) as Record<string, unknown>;
  const deviceId = getString(body.deviceId);
  const expoPushToken = getString(body.expoPushToken);
  const platform = getString(body.platform) ?? "unknown";
  if (!deviceId || !expoPushToken) return bad(res, 400, "deviceId and expoPushToken required");
  if (!expoPushToken.startsWith("ExponentPushToken[") && !expoPushToken.startsWith("ExpoPushToken[")) {
    return bad(res, 400, "invalid expo push token");
  }
  await db.doc(`tokens/${deviceId}`).set(
    { expoPushToken, platform, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  res.json({ ok: true });
});

export const listAlerts = onRequest(COMMON, async (req, res) => {
  const deviceId = getString(req.query.deviceId as string | undefined);
  if (!deviceId) return bad(res, 400, "deviceId required");
  const snap = await db.collection("alerts").where("deviceId", "==", deviceId).get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json({ items });
});

export const saveAlert = onRequest(COMMON, async (req, res) => {
  if (req.method !== "POST") return bad(res, 405, "POST only");
  const body = (req.body ?? {}) as Record<string, unknown>;
  const deviceId = getString(body.deviceId);
  const code = getString(body.code);
  const type = getString(body.type);
  const target = typeof body.target === "number" ? body.target : NaN;
  const currency = getString(body.currency) ?? "TRY";
  const name = getString(body.name) ?? code ?? "";
  const nameTR = getString(body.nameTR) ?? name;
  const id = getString(body.id);
  if (!deviceId || !code || (type !== "above" && type !== "below") || !Number.isFinite(target)) {
    return bad(res, 400, "deviceId, code, type (above|below), target required");
  }
  const data = {
    deviceId, code, type, target, currency, name, nameTR,
    active: true, createdAt: FieldValue.serverTimestamp(),
  };
  if (id) {
    const existing = await db.doc(`alerts/${id}`).get();
    if (!existing.exists || (existing.data() as { deviceId?: string }).deviceId !== deviceId) {
      return bad(res, 403, "not your alert");
    }
    await db.doc(`alerts/${id}`).set(data, { merge: true });
    res.json({ id });
    return;
  }
  const ref = await db.collection("alerts").add(data);
  res.json({ id: ref.id });
});

// ──────────────────────────────────────────────────────────────────────────────
// HABERLER
// ──────────────────────────────────────────────────────────────────────────────

const NEWS_KEEP = 200;

export const pollNews = onSchedule(
  { region: REGION, schedule: "every 60 minutes", memory: "256MiB", timeoutSeconds: 90 },
  async () => {
    const all = (await Promise.all(RSS_SOURCES.map(fetchAndParseRss))).flat();
    const fresh = dedupeByTitle(all);
    if (fresh.length === 0) {
      logger.warn("[news] no items fetched");
      return;
    }

    // Firestore'daki mevcut hash'leri topla → hangileri gerçekten yeni?
    const existingSnap = await db.collection("news").select().get();
    const existingIds = new Set(existingSnap.docs.map((d) => d.id));
    const isFirstRun = existingIds.size === 0;

    const now = Date.now();
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    const fresh200 = fresh.slice(0, NEWS_KEEP);
    const newItems = fresh200.filter(
      (it) => !existingIds.has(it.hashId) && it.publishedAt >= twoHoursAgo
    );

    let writes = 0;
    const batch = db.batch();
    for (const it of fresh200) {
      batch.set(
        db.doc(`news/${it.hashId}`),
        {
          title: it.title,
          summary: it.summary,
          url: it.url,
          source: it.source,
          category: it.category,
          imageUrl: it.imageUrl,
          publishedAt: it.publishedAt,
          fetchedAt: now,
        },
        { merge: true }
      );
      writes++;
      if (writes >= 400) break; // safety: batch limit 500
    }
    await batch.commit();

    // Eski haberleri temizle (NEWS_KEEP'i aşan en eskiler)
    const old = await db
      .collection("news")
      .orderBy("publishedAt", "desc")
      .offset(NEWS_KEEP)
      .limit(50)
      .get();
    if (!old.empty) {
      const delBatch = db.batch();
      old.docs.forEach((d) => delBatch.delete(d.ref));
      await delBatch.commit();
    }
    logger.info(`[news] saved=${writes} pruned=${old.size} new=${newItems.length} firstRun=${isFirstRun}`);

    // İlk deploy'da spam yapmamak için — Firestore boşsa hiç bildirim gönderme
    if (!isFirstRun && newItems.length > 0) {
      try {
        await sendNewsPush(newItems);
      } catch (err) {
        logger.warn("[news] push failed", err);
      }
    }
  }
);

async function sendNewsPush(newItems: ParsedItem[]): Promise<void> {
  // newsEnabled=true olan cihazları bul
  const prefsSnap = await db.collection("prefs").where("newsEnabled", "==", true).get();
  if (prefsSnap.empty) {
    logger.info("[news-push] no devices with newsEnabled=true");
    return;
  }
  const deviceIds = prefsSnap.docs.map((d) => d.id);

  // Token'ları getir
  const refs = deviceIds.map((id) => db.doc(`tokens/${id}`));
  const tokenDocs = await db.getAll(...refs);
  const tokens: string[] = [];
  for (const td of tokenDocs) {
    const d = td.data() as { expoPushToken?: string } | undefined;
    if (d?.expoPushToken) tokens.push(d.expoPushToken);
  }
  if (tokens.length === 0) {
    logger.info("[news-push] no tokens");
    return;
  }

  // 1 saatte 1 bildirim — en taze haberin başlığını gönder, gerisi için uygulamaya yönlendir
  const sorted = [...newItems].sort((a, b) => b.publishedAt - a.publishedAt);
  const top = sorted[0];
  const count = sorted.length;
  const title = `📰 ${top.source}`;
  const headline = top.title.trim().replace(/\s+/g, " ");
  const cta =
    count > 1
      ? `Diğer ${count - 1} haberi görmek için dokunun.`
      : `Tüm haberleri görmek için dokunun.`;
  const body = `${headline}\n${cta}`;

  const messages = tokens.map((to) => ({
    to,
    sound: "default" as const,
    priority: "normal" as const,
    channelId: "news",
    title,
    body,
    data: { type: "news", count, url: top.url },
  }));

  // Expo Push API max 100 mesaj/chunk
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const r = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(chunk),
    });
    logger.info(`[news-push] status=${r.status} count=${chunk.length}`);
  }
}

type NewsCacheItem = ParsedItem & { fetchedAt: number };
let newsCache: { ts: number; data: NewsCacheItem[] } | null = null;
const NEWS_CACHE_MS = 60_000;

export const getNews = onRequest(COMMON, async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10) || 50, 100);
    const category = getString(req.query.category as string | undefined);
    const now = Date.now();
    let items: NewsCacheItem[];
    if (newsCache && now - newsCache.ts < NEWS_CACHE_MS) {
      items = newsCache.data;
    } else {
      const snap = await db.collection("news").orderBy("publishedAt", "desc").limit(NEWS_KEEP).get();
      items = snap.docs.map((d) => {
        const x = d.data() as Record<string, unknown>;
        return {
          hashId: d.id,
          title: String(x.title ?? ""),
          summary: String(x.summary ?? ""),
          url: String(x.url ?? ""),
          source: String(x.source ?? ""),
          category: x.category as ParsedItem["category"],
          imageUrl: (x.imageUrl as string | null) ?? null,
          publishedAt: Number(x.publishedAt ?? 0),
          fetchedAt: Number(x.fetchedAt ?? 0),
        };
      });
      newsCache = { ts: now, data: items };
    }
    const filtered = category && category !== "all"
      ? items.filter((it) => it.category === category)
      : items;
    res.json({ items: filtered.slice(0, limit) });
  } catch (err) {
    logger.error("getNews failed", err);
    bad(res, 500, (err as Error).message);
  }
});

export const setPrefs = onRequest(COMMON, async (req, res) => {
  if (req.method !== "POST") return bad(res, 405, "POST only");
  const body = (req.body ?? {}) as Record<string, unknown>;
  const deviceId = getString(body.deviceId);
  if (!deviceId) return bad(res, 400, "deviceId required");
  const newsEnabled = typeof body.newsEnabled === "boolean" ? body.newsEnabled : null;
  const newsCategories = Array.isArray(body.newsCategories)
    ? (body.newsCategories.filter((c): c is string => typeof c === "string"))
    : null;
  const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (newsEnabled !== null) update.newsEnabled = newsEnabled;
  if (newsCategories) update.newsCategories = newsCategories;
  await db.doc(`prefs/${deviceId}`).set(update, { merge: true });
  res.json({ ok: true });
});

export const getPrefs = onRequest(COMMON, async (req, res) => {
  const deviceId = getString(req.query.deviceId as string | undefined);
  if (!deviceId) return bad(res, 400, "deviceId required");
  const snap = await db.doc(`prefs/${deviceId}`).get();
  const d = snap.data() ?? {};
  res.json({
    newsEnabled: typeof d.newsEnabled === "boolean" ? d.newsEnabled : false,
    newsCategories: Array.isArray(d.newsCategories) ? d.newsCategories : [],
  });
});

export const deleteAlert = onRequest(COMMON, async (req, res) => {
  if (req.method !== "POST" && req.method !== "DELETE") return bad(res, 405, "POST or DELETE");
  const body = (req.body ?? {}) as Record<string, unknown>;
  const deviceId = getString(body.deviceId) ?? getString(req.query.deviceId as string | undefined);
  const id = getString(body.id) ?? getString(req.query.id as string | undefined);
  if (!deviceId || !id) return bad(res, 400, "deviceId and id required");
  const doc = await db.doc(`alerts/${id}`).get();
  if (!doc.exists) {
    res.json({ ok: true });
    return;
  }
  if ((doc.data() as { deviceId?: string }).deviceId !== deviceId) {
    return bad(res, 403, "not your alert");
  }
  await db.doc(`alerts/${id}`).delete();
  res.json({ ok: true });
});

async function checkAlerts(items: HaremPrice[]): Promise<void> {
  const bySymbol = new Map<string, HaremPrice>();
  for (const p of items) {
    const s = (p as { symbol?: string }).symbol ?? p.code;
    if (s) bySymbol.set(String(s).toUpperCase(), p);
  }

  const snap = await db.collection("alerts").where("active", "==", true).get();
  if (snap.empty) return;

  const triggered: { id: string; deviceId: string; code: string; nameTR: string; price: number; target: number; type: string }[] = [];

  for (const doc of snap.docs) {
    const a = doc.data() as {
      deviceId: string; code: string; type: "above" | "below"; target: number; nameTR?: string; name?: string;
    };
    const p = bySymbol.get(String(a.code).toUpperCase());
    if (!p) continue;
    const price = priceOf(p);
    if (price === null) continue;
    const hit = a.type === "above" ? price >= a.target : price <= a.target;
    if (!hit) continue;
    triggered.push({
      id: doc.id, deviceId: a.deviceId, code: a.code,
      nameTR: a.nameTR ?? a.name ?? a.code,
      price, target: a.target, type: a.type,
    });
  }

  if (triggered.length === 0) return;

  const tokenDocs = await Promise.all(
    Array.from(new Set(triggered.map((t) => t.deviceId))).map((id) => db.doc(`tokens/${id}`).get())
  );
  const tokenByDevice = new Map<string, string>();
  for (const td of tokenDocs) {
    const d = td.data() as { expoPushToken?: string } | undefined;
    if (d?.expoPushToken) tokenByDevice.set(td.id, d.expoPushToken);
  }

  const fmt = (n: number) =>
    n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  const messages = triggered
    .map((t) => {
      const to = tokenByDevice.get(t.deviceId);
      if (!to) return null;
      const arrow = t.type === "above" ? "📈" : "📉";
      const dir = t.type === "above" ? "üzerine çıktı" : "altına indi";
      return {
        to,
        sound: "default" as const,
        priority: "high" as const,
        channelId: "price-alerts",
        title: `${arrow} ${t.nameTR}`,
        body: `${fmt(t.price)} — hedef ${fmt(t.target)} ${dir}`,
        data: { code: t.code, price: t.price, target: t.target, type: t.type, alertId: t.id },
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  if (messages.length > 0) {
    const r = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages),
    });
    logger.info(`expo push status=${r.status} count=${messages.length}`);
  }

  const batch = db.batch();
  for (const t of triggered) {
    batch.update(db.doc(`alerts/${t.id}`), {
      active: false,
      triggeredAt: FieldValue.serverTimestamp(),
      triggeredPrice: t.price,
    });
  }
  await batch.commit();
}
