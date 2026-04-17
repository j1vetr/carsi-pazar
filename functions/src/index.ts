import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { HAREMAPI_KEY, fetchHaremPrices, priceOf, type HaremPrice } from "./harem";

initializeApp();
const db = getFirestore();

const REGION = "europe-west1";

export const getPrices = onRequest(
  { region: REGION, secrets: [HAREMAPI_KEY], cors: true, memory: "256MiB", timeoutSeconds: 15 },
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
      res.status(502).json({ error: (err as Error).message });
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

async function checkAlerts(items: HaremPrice[]): Promise<void> {
  const byCode = new Map<string, HaremPrice>();
  for (const p of items) if (p.code) byCode.set(String(p.code).toUpperCase(), p);

  const snap = await db.collection("alerts").where("active", "==", true).get();
  if (snap.empty) return;

  const triggered: { id: string; deviceId: string; code: string; price: number; target: number; type: string }[] = [];

  for (const doc of snap.docs) {
    const a = doc.data() as {
      deviceId: string;
      code: string;
      type: "above" | "below";
      target: number;
    };
    const p = byCode.get(String(a.code).toUpperCase());
    if (!p) continue;
    const price = priceOf(p);
    if (price === null) continue;
    const hit = a.type === "above" ? price >= a.target : price <= a.target;
    if (!hit) continue;
    triggered.push({ id: doc.id, deviceId: a.deviceId, code: a.code, price, target: a.target, type: a.type });
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

  const messages = triggered
    .map((t) => {
      const to = tokenByDevice.get(t.deviceId);
      if (!to) return null;
      const dir = t.type === "above" ? "üstüne çıktı" : "altına indi";
      return {
        to,
        sound: "default",
        title: `${t.code} hedefe ulaştı`,
        body: `${t.code} ${t.price.toLocaleString("tr-TR")} ${dir} (hedef ${t.target.toLocaleString("tr-TR")})`,
        data: { code: t.code, price: t.price, target: t.target, type: t.type },
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
