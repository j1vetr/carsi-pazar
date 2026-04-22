import { Router, type IRouter } from "express";
import { runBackfillIfNeeded, runDailyUpdate } from "../metalprice/backfill";
import { SUPPORTED_SYMBOLS } from "../metalprice/symbols";
import { getMeta, getSeries, getSymbolCount } from "../metalprice/storage";

const router: IRouter = Router();

const RANGE_DAYS: Record<string, number> = {
  "1H": 7,
  "1A": 31,
  "3A": 92,
  "1Y": 366,
  "5Y": 366 * 5,
};

function fromDateForRange(range: string): string {
  const days = RANGE_DAYS[range] ?? RANGE_DAYS["1A"]!;
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

router.get("/history/status", async (_req, res) => {
  res.json({
    meta: getMeta(),
    symbolsStored: getSymbolCount(),
    supportedSymbols: Array.from(SUPPORTED_SYMBOLS),
    ranges: Object.keys(RANGE_DAYS),
  });
});

router.get("/history/:symbol", async (req, res) => {
  const symbol = String(req.params["symbol"] ?? "").toUpperCase();
  const range = String(req.query["range"] ?? "1A").toUpperCase();

  if (!SUPPORTED_SYMBOLS.has(symbol)) {
    res.status(404).json({ error: `Unsupported symbol: ${symbol}` });
    return;
  }
  if (!RANGE_DAYS[range]) {
    res.status(400).json({
      error: `Unknown range: ${range}`,
      supported: Object.keys(RANGE_DAYS),
    });
    return;
  }

  try {
    const points = await getSeries(symbol, fromDateForRange(range));
    res.json({ symbol, range, points });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Admin endpoints: dev-only. In production they trigger expensive upstream
// calls and write amplification, so we hide them entirely behind a 404.
function devOnly(): boolean {
  return process.env["NODE_ENV"] !== "production";
}

router.post("/history/admin/backfill", async (_req, res) => {
  if (!devOnly()) {
    res.status(404).end();
    return;
  }
  try {
    await runBackfillIfNeeded();
    res.json({ ok: true, meta: getMeta() });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post("/history/admin/refresh", async (_req, res) => {
  if (!devOnly()) {
    res.status(404).end();
    return;
  }
  try {
    await runDailyUpdate();
    res.json({ ok: true, meta: getMeta() });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
