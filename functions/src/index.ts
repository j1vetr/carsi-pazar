import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest, type Request } from "firebase-functions/v2/https";
import type { Response } from "express";
import { logger } from "firebase-functions";
import { HAREMAPI_KEY, fetchHaremPrices, priceOf, type HaremPrice } from "./harem";
import { RSS_SOURCES, fetchAndParseRss, dedupeByTitle, isRelevantToFinance, type ParsedItem } from "./news";

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

/**
 * Haftada bir 30 günden eski (hiç refresh edilmemiş) push token kayıtlarını siler.
 * Aktif kullanıcının token'ı her uygulama açılışında setupPushAndRegister
 * tarafından `updatedAt`'i tazelendiği için temizlik sadece sessize alınmış
 * cihazları hedef alır. Expo Push servisi geçersiz token'a "DeviceNotRegistered"
 * döndürür; bu temizlik o gürültüyü kaynağında keser.
 */
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const cleanupStaleTokens = onSchedule(
  { region: REGION, schedule: "every 168 hours", memory: "256MiB" },
  async () => {
    const cutoff = Date.now() - TOKEN_TTL_MS;
    const cutoffTs = Timestamp.fromMillis(cutoff);
    const snap = await db
      .collection("tokens")
      .where("updatedAt", "<", cutoffTs)
      .get();
    if (snap.empty) {
      logger.info("[token-cleanup] no stale tokens");
      return;
    }
    let deleted = 0;
    // Firestore bulk delete API yerine 500'lük batch ile
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 500) {
      const batch = db.batch();
      const slice = docs.slice(i, i + 500);
      for (const d of slice) batch.delete(d.ref);
      await batch.commit();
      deleted += slice.length;
    }
    logger.info(`[token-cleanup] removed ${deleted} stale tokens (>30d)`);
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
    // Eski Firestore kayıtları henüz filtre eklenmeden yazılmış olabilir;
    // okuma sırasında da konu filtresinden geçir + "Ekonomi" kategorisini at.
    const relevantItems = items.filter(
      (it) => it.category !== "Ekonomi" && isRelevantToFinance(it.title, it.summary)
    );
    const filtered = category && category !== "all"
      ? relevantItems.filter((it) => it.category === category)
      : relevantItems;
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

  const ref = db.doc(`prefs/${deviceId}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = snap.exists ? (snap.data() ?? {}) : {};
    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (typeof body.newsEnabled === "boolean") update.newsEnabled = body.newsEnabled;
    if (Array.isArray(body.newsCategories)) {
      update.newsCategories = body.newsCategories.filter(
        (c): c is string => typeof c === "string"
      );
    }
    if (typeof body.briefingEnabled === "boolean") update.briefingEnabled = body.briefingEnabled;
    if (typeof body.movesEnabled === "boolean") update.movesEnabled = body.movesEnabled;
    if (typeof body.weeklyEnabled === "boolean") update.weeklyEnabled = body.weeklyEnabled;

    // Favoriler için timestamp-based CAS: gelen timestamp sunucudakinden eskiyse
    // yazma yapma (eş zamanlı yarış durumunda eski yazımın yenisini ezmesini engeller).
    if (Array.isArray(body.favorites)) {
      const incomingTs =
        typeof body.favoritesUpdatedAt === "number"
          ? body.favoritesUpdatedAt
          : Date.now();
      const existingTs =
        typeof existing.favoritesUpdatedAt === "number"
          ? existing.favoritesUpdatedAt
          : 0;
      if (incomingTs >= existingTs) {
        update.favorites = body.favorites
          .filter((c): c is string => typeof c === "string")
          .map((s) => s.toUpperCase())
          .slice(0, 30);
        update.favoritesUpdatedAt = incomingTs;
      }
    }

    tx.set(ref, update, { merge: true });
  });
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
    briefingEnabled: typeof d.briefingEnabled === "boolean" ? d.briefingEnabled : true,
    movesEnabled: typeof d.movesEnabled === "boolean" ? d.movesEnabled : true,
    weeklyEnabled: typeof d.weeklyEnabled === "boolean" ? d.weeklyEnabled : true,
    favorites: Array.isArray(d.favorites) ? d.favorites : [],
    favoritesUpdatedAt:
      typeof d.favoritesUpdatedAt === "number" ? d.favoritesUpdatedAt : 0,
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// PORTFÖY SYNC — cihaz başına Firestore'da tutulur, last-write-wins
// ──────────────────────────────────────────────────────────────────────────────

type PortfolioItemPayload = {
  id: string;
  type: "currency" | "gold";
  code: string;
  name: string;
  nameTR: string;
  amount: number;
  purchasePrice: number;
  purchaseDate: string;
};

function sanitizePortfolioItems(raw: unknown): PortfolioItemPayload[] {
  if (!Array.isArray(raw)) return [];
  const out: PortfolioItemPayload[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : null;
    const code = typeof o.code === "string" ? o.code : null;
    const type = o.type === "gold" ? "gold" : "currency";
    const amount = typeof o.amount === "number" && Number.isFinite(o.amount) ? o.amount : null;
    const purchasePrice =
      typeof o.purchasePrice === "number" && Number.isFinite(o.purchasePrice)
        ? o.purchasePrice
        : null;
    if (!id || !code || amount === null || purchasePrice === null) continue;
    out.push({
      id,
      type,
      code,
      name: typeof o.name === "string" ? o.name : code,
      nameTR: typeof o.nameTR === "string" ? o.nameTR : code,
      amount,
      purchasePrice,
      purchaseDate: typeof o.purchaseDate === "string" ? o.purchaseDate : "",
    });
    if (out.length >= 200) break;
  }
  return out;
}

export const setPortfolio = onRequest(COMMON, async (req, res) => {
  if (req.method !== "POST") return bad(res, 405, "POST only");
  const body = (req.body ?? {}) as Record<string, unknown>;
  const deviceId = getString(body.deviceId);
  if (!deviceId) return bad(res, 400, "deviceId required");
  const items = sanitizePortfolioItems(body.items);
  const clientUpdatedAt =
    typeof body.clientUpdatedAt === "number" ? body.clientUpdatedAt : Date.now();

  const ref = db.doc(`portfolios/${deviceId}`);
  // Timestamp-based CAS: gelen istekteki clientUpdatedAt sunucudakinden eskiyse
  // (eş zamanlı startup-sync vs kullanıcı değişikliği yarışında geç gelen eski payload)
  // yazma yapma. Bu, last-write-wins'i sunucu tarafında garanti eder.
  let written = false;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existingTs =
      snap.exists && typeof snap.data()?.clientUpdatedAt === "number"
        ? (snap.data()!.clientUpdatedAt as number)
        : 0;
    if (clientUpdatedAt < existingTs) return;
    tx.set(
      ref,
      {
        items,
        clientUpdatedAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    written = true;
  });
  res.json({ ok: true, count: items.length, written });
});

export const getPortfolio = onRequest(COMMON, async (req, res) => {
  const deviceId = getString(req.query.deviceId as string | undefined);
  if (!deviceId) return bad(res, 400, "deviceId required");
  const snap = await db.doc(`portfolios/${deviceId}`).get();
  const d = snap.data() ?? {};
  res.json({
    items: Array.isArray(d.items) ? d.items : [],
    clientUpdatedAt:
      typeof d.clientUpdatedAt === "number" ? d.clientUpdatedAt : 0,
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

// ──────────────────────────────────────────────────────────────────────────────
// PUSH HELPERS + SEMBOL EŞLEMESİ — açılış/kapanış brifingi ve önemli hareket
// ──────────────────────────────────────────────────────────────────────────────

const SYMBOL_LABELS: Record<string, string> = {
  USDTRY: "Dolar",
  EURTRY: "Euro",
  GBPTRY: "Sterlin",
  CHFTRY: "Frank",
  JPYTRY: "Yen",
  SARTRY: "Riyal",
  RUBTRY: "Ruble",
  ALTIN: "Ons Altın",
  HAS: "Has Altın",
  GRAMALTIN: "Gram Altın",
  CEYREK_YENI: "Çeyrek Altın",
  CEYREK_ESKI: "Çeyrek (Eski)",
  YARIM_YENI: "Yarım Altın",
  TAM_YENI: "Tam Altın",
  CUMHUR_YENI: "Cumhuriyet",
  ATA_YENI: "Ata Altın",
  RESAT_YENI: "Reşat Altın",
  GUMUS: "Gümüş",
  PLATIN: "Platin",
  PALADYUM: "Paladyum",
  EURUSD: "EUR/USD",
  GBPUSD: "GBP/USD",
  USDJPY: "USD/JPY",
};

function labelFor(symbol: string): string {
  const u = symbol.toUpperCase();
  return SYMBOL_LABELS[u] ?? u;
}

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions =
    abs >= 100
      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 4 };
  return n.toLocaleString("tr-TR", opts);
}

function fmtPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "▲" : n < 0 ? "▼" : "•";
  return `${sign} ${Math.abs(n).toFixed(2)}%`;
}

type ExpoMessage = {
  to: string;
  title?: string;
  body?: string;
  sound?: "default";
  priority?: "default" | "normal" | "high";
  channelId?: string;
  data?: Record<string, unknown>;
  _contentAvailable?: boolean;
};

async function sendExpoPush(messages: ExpoMessage[]): Promise<number> {
  if (messages.length === 0) return 0;
  let ok = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const r = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(chunk),
      });
      if (r.ok) ok += chunk.length;
    } catch (e) {
      logger.warn("[push] chunk failed", e);
    }
  }
  return ok;
}

async function getTokenForDevice(deviceId: string): Promise<string | null> {
  const td = await db.doc(`tokens/${deviceId}`).get();
  const d = td.data() as { expoPushToken?: string } | undefined;
  return d?.expoPushToken ?? null;
}

function priceMapFromItems(items: HaremPrice[]): Map<string, HaremPrice> {
  const m = new Map<string, HaremPrice>();
  for (const p of items) {
    const s = (p.symbol ?? p.code ?? "").toString().toUpperCase();
    if (s) m.set(s, p);
  }
  return m;
}

async function buildBriefingBody(
  favorites: string[],
  itemsMap: Map<string, HaremPrice>,
  prev24h: Prev24hMap
): Promise<string | null> {
  // Kullanıcı favorisi yoksa makul default
  const list =
    favorites && favorites.length > 0
      ? favorites
      : ["USDTRY", "EURTRY", "GRAMALTIN", "CEYREK_YENI"];
  const lines: string[] = [];
  for (const sym of list) {
    const p = itemsMap.get(sym.toUpperCase());
    if (!p) continue;
    const cur = priceOf(p);
    if (cur === null) continue;
    const prev = prev24h[sym.toUpperCase()]?.bid;
    const pct =
      typeof prev === "number" && prev > 0 ? ((cur - prev) / prev) * 100 : 0;
    lines.push(`${labelFor(sym)} ${fmtMoney(cur)} ${fmtPct(pct)}`);
    if (lines.length >= 4) break;
  }
  if (lines.length === 0) return null;
  return lines.join(" · ");
}

// ──────────────────────────────────────────────────────────────────────────────
// GÜNLÜK AÇILIŞ / KAPANIŞ BRİFİNGİ
// ──────────────────────────────────────────────────────────────────────────────

async function runBriefing(kind: "open" | "close"): Promise<void> {
  const prefsSnap = await db
    .collection("prefs")
    .where("briefingEnabled", "==", true)
    .get();
  if (prefsSnap.empty) {
    logger.info(`[briefing-${kind}] no devices`);
    return;
  }
  const latest = await db.doc("prices/latest").get();
  const data = latest.data() as { ts?: number; items?: HaremPrice[] } | undefined;
  if (!data?.items?.length) {
    logger.warn(`[briefing-${kind}] no prices`);
    return;
  }
  const itemsMap = priceMapFromItems(data.items);
  const prev24h = await fetchPrev24h().catch(() => ({} as Prev24hMap));

  const messages: ExpoMessage[] = [];
  for (const doc of prefsSnap.docs) {
    const p = doc.data() as { favorites?: string[] };
    const token = await getTokenForDevice(doc.id);
    if (!token) continue;
    const body = await buildBriefingBody(p.favorites ?? [], itemsMap, prev24h);
    if (!body) continue;
    const title =
      kind === "open"
        ? "🌅 Günaydın · Piyasa Açılışı"
        : "🌇 Kapanış Özeti";
    messages.push({
      to: token,
      title,
      body,
      sound: "default",
      priority: "normal",
      channelId: "briefing",
      data: { type: "briefing", kind, ts: Date.now() },
    });
  }
  const sent = await sendExpoPush(messages);
  logger.info(`[briefing-${kind}] sent=${sent}/${messages.length}`);
}

export const dailyOpenBriefing = onSchedule(
  {
    region: REGION,
    schedule: "0 9 * * *",
    timeZone: "Europe/Istanbul",
    memory: "256MiB",
    timeoutSeconds: 90,
  },
  async () => runBriefing("open")
);

export const dailyCloseBriefing = onSchedule(
  {
    region: REGION,
    schedule: "30 18 * * *",
    timeZone: "Europe/Istanbul",
    memory: "256MiB",
    timeoutSeconds: 90,
  },
  async () => runBriefing("close")
);

// ──────────────────────────────────────────────────────────────────────────────
// ÖNEMLİ HAREKET — favori sembollerde 30dk'da ±%1 hareket olunca push
// Cihaz başına gün limiti: 3
// ──────────────────────────────────────────────────────────────────────────────

const MOVE_THRESHOLD_PCT = 1.0;
const MOVE_WINDOW_MIN = 30;
const MOVE_DAILY_LIMIT = 3;

function todayKey(): string {
  const d = new Date();
  // Europe/Istanbul'a kaba çeviri (UTC+3, DST yok)
  const tr = new Date(d.getTime() + 3 * 3600_000);
  return tr.toISOString().slice(0, 10);
}

async function fetchSnapshotMinutesAgo(
  minutesAgo: number
): Promise<Map<string, number>> {
  const minute = Math.floor(Date.now() / 60000) - minutesAgo;
  const snap = await db.doc(`history/${minute}`).get();
  const out = new Map<string, number>();
  if (!snap.exists) return out;
  const d = snap.data() as { items?: CompactSnap[] } | undefined;
  for (const it of d?.items ?? []) {
    if (it?.s && typeof it.b === "number") out.set(it.s, it.b);
  }
  return out;
}

export const checkSignificantMoves = onSchedule(
  {
    region: REGION,
    schedule: "every 10 minutes",
    memory: "256MiB",
    timeoutSeconds: 90,
  },
  async () => {
    const prefsSnap = await db
      .collection("prefs")
      .where("movesEnabled", "==", true)
      .get();
    if (prefsSnap.empty) {
      logger.info("[moves] no devices");
      return;
    }
    const latest = await db.doc("prices/latest").get();
    const data = latest.data() as { items?: HaremPrice[] } | undefined;
    if (!data?.items?.length) {
      logger.warn("[moves] no latest prices");
      return;
    }
    const cur = priceMapFromItems(data.items);
    const prev = await fetchSnapshotMinutesAgo(MOVE_WINDOW_MIN);
    if (prev.size === 0) {
      logger.info("[moves] no 30m snapshot");
      return;
    }

    const today = todayKey();
    const messages: ExpoMessage[] = [];
    const updates: { ref: FirebaseFirestore.DocumentReference; sent: number }[] = [];

    for (const doc of prefsSnap.docs) {
      const p = doc.data() as {
        favorites?: string[];
        movesSentToday?: number;
        movesDate?: string;
      };
      const favs = (p.favorites ?? []).map((s) => s.toUpperCase());
      if (favs.length === 0) continue;
      const sentToday = p.movesDate === today ? (p.movesSentToday ?? 0) : 0;
      if (sentToday >= MOVE_DAILY_LIMIT) continue;
      const token = await getTokenForDevice(doc.id);
      if (!token) continue;

      // En büyük hareketi bul (mutlak yüzde)
      let best: { sym: string; pct: number; price: number } | null = null;
      for (const sym of favs) {
        const c = cur.get(sym);
        const pPrev = prev.get(sym);
        if (!c || typeof pPrev !== "number" || pPrev <= 0) continue;
        const cp = priceOf(c);
        if (cp === null) continue;
        const pct = ((cp - pPrev) / pPrev) * 100;
        if (Math.abs(pct) < MOVE_THRESHOLD_PCT) continue;
        if (!best || Math.abs(pct) > Math.abs(best.pct)) {
          best = { sym, pct, price: cp };
        }
      }
      if (!best) continue;

      const arrow = best.pct > 0 ? "📈" : "📉";
      const dir = best.pct > 0 ? "yükseldi" : "düştü";
      messages.push({
        to: token,
        title: `${arrow} ${labelFor(best.sym)} ${dir}`,
        body: `Son 30 dakikada ${fmtPct(best.pct)} → ${fmtMoney(best.price)} ₺`,
        sound: "default",
        priority: "high",
        channelId: "moves",
        data: { type: "move", code: best.sym, pct: best.pct, price: best.price },
      });
      updates.push({ ref: doc.ref, sent: sentToday + 1 });
    }

    const sent = await sendExpoPush(messages);
    if (updates.length > 0) {
      const batch = db.batch();
      for (const u of updates) {
        batch.set(
          u.ref,
          { movesSentToday: u.sent, movesDate: today },
          { merge: true }
        );
      }
      await batch.commit();
    }
    logger.info(`[moves] sent=${sent}/${messages.length}`);
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// WIDGET TICK — 30dk'da bir tüm cihazlara sessiz (data-only) push gönder.
// Mobil tarafta arka plan task'ı yakalayıp home-screen widget'ını yeniler.
// Bu, Android'in güvenilmez `updatePeriodMillis` mekanizmasını bypass eder
// (FCM high-priority data mesajları Doze mode'u kısa süreliğine atlatır).
// ──────────────────────────────────────────────────────────────────────────────

export const pollWidgetTick = onSchedule(
  { region: REGION, schedule: "every 30 minutes", memory: "256MiB", timeoutSeconds: 60 },
  async () => {
    const tokenSnap = await db.collection("tokens").get();
    if (tokenSnap.empty) {
      logger.info("[widget-tick] no tokens");
      return;
    }
    const tokens: string[] = [];
    for (const d of tokenSnap.docs) {
      const data = d.data() as { expoPushToken?: string };
      if (data?.expoPushToken) tokens.push(data.expoPushToken);
    }
    if (tokens.length === 0) {
      logger.info("[widget-tick] no expo tokens");
      return;
    }

    // Data-only mesaj: title/body yok → notification tray'e düşmez,
    // priority:high → FCM cihazı kısa süreliğine uyandırır.
    const ts = Date.now();
    const messages = tokens.map((to) => ({
      to,
      data: { type: "widget_refresh", ts },
      priority: "high" as const,
      _contentAvailable: true,
    }));

    let okCount = 0;
    for (let i = 0; i < messages.length; i += 100) {
      const chunk = messages.slice(i, i + 100);
      try {
        const r = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(chunk),
        });
        if (r.ok) okCount += chunk.length;
        logger.info(`[widget-tick] chunk status=${r.status} count=${chunk.length}`);
      } catch (err) {
        logger.warn("[widget-tick] chunk failed", err);
      }
    }
    logger.info(`[widget-tick] sent=${okCount}/${tokens.length}`);
  }
);

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
      const isAbove = t.type === "above";
      const arrow = isAbove ? "📈" : "📉";
      const title = isAbove
        ? `${arrow} Hedef Aşıldı: ${t.nameTR}`
        : `${arrow} Hedefin Altında: ${t.nameTR}`;
      const body = isAbove
        ? `${t.nameTR} ${fmt(t.price)} ile belirlediğin ${fmt(t.target)} hedefini aştı.`
        : `${t.nameTR} ${fmt(t.price)} ile belirlediğin ${fmt(t.target)} hedefinin altına indi.`;
      return {
        to,
        sound: "default" as const,
        priority: "high" as const,
        channelId: "price-alerts",
        title,
        body,
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
