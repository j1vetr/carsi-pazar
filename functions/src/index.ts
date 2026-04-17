import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest, type Request } from "firebase-functions/v2/https";
import type { Response } from "express";
import { logger } from "firebase-functions";
import { HAREMAPI_KEY, fetchHaremPrices, priceOf, type HaremPrice } from "./harem";

initializeApp();
const db = getFirestore();

const REGION = "europe-west1";
const COMMON = { region: REGION, cors: true, memory: "256MiB" as const, timeoutSeconds: 15 };

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
      if (data && typeof data.ts === "number" && Date.now() - data.ts < 8000) {
        res.json({ ts: data.ts, items: data.items });
        return;
      }
      const items = await fetchHaremPrices(HAREMAPI_KEY.value());
      const ts = Date.now();
      await db.doc("prices/latest").set({ ts, items }, { merge: false });
      res.json({ ts, items });
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
    await db.doc("prices/latest").set({ ts, items }, { merge: false });
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
