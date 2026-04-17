import { Router, type IRouter } from "express";

const router: IRouter = Router();

const HAREM_BASE = "https://haremapi.tr/api/v1";
const API_KEY = process.env.HAREMAPI_KEY ?? process.env.EXPO_PUBLIC_HAREMAPI_KEY ?? "";

let cache: { ts: number; body: unknown } | null = null;
const CACHE_TTL_MS = 3000;

router.get("/harem/prices", async (_req, res) => {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
      res.json(cache.body);
      return;
    }
    const r = await fetch(`${HAREM_BASE}/prices`, {
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}`, "x-api-key": API_KEY } : {},
    });
    if (!r.ok) {
      res.status(r.status).json({ error: `Harem upstream ${r.status}` });
      return;
    }
    const body = await r.json();
    cache = { ts: Date.now(), body };
    res.json(body);
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

export default router;
