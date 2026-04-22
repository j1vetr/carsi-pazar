import { logger } from "../lib/logger";
import { runBackfillIfNeeded, runDailyUpdate } from "./backfill";
import { loadHistory } from "./storage";

const HOUR_MS = 60 * 60 * 1000;
const DAILY_INTERVAL_MS = 6 * HOUR_MS;

let started = false;

/**
 * Boots the metalprice subsystem: loads JSON history, kicks off a one-time
 * backfill if the file is empty/stale, then runs the daily updater on a
 * 6-hour cadence. Runs detached so HTTP startup is not blocked.
 */
export function startMetalpriceJobs(): void {
  if (started) return;
  started = true;

  if (!process.env["METALPRICE_API_KEY"]) {
    logger.warn(
      "METALPRICE_API_KEY missing — historical chart jobs disabled",
    );
    return;
  }

  void (async () => {
    try {
      await loadHistory();
      await runBackfillIfNeeded();
      await runDailyUpdate();
    } catch (err) {
      logger.error({ err }, "metalprice: initial run failed");
    }
  })();

  setInterval(() => {
    void runDailyUpdate().catch((err) => {
      logger.error({ err }, "metalprice: scheduled daily update failed");
    });
  }, DAILY_INTERVAL_MS);

  logger.info(
    { intervalMs: DAILY_INTERVAL_MS },
    "metalprice: scheduler started",
  );
}
