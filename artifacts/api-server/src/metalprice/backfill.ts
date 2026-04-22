import { logger } from "../lib/logger";
import { fetchLatest, fetchTimeframe } from "./client";
import { deriveAllForDay } from "./symbols";
import {
  type DayPoint,
  getMeta,
  loadHistory,
  upsertDays,
} from "./storage";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const BACKFILL_YEARS = 5;
const CHUNK_DAYS = 364;

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shiftDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * ONE_DAY_MS);
}

function parseIso(s: string): Date {
  return new Date(`${s}T00:00:00Z`);
}

function deriveRows(date: string, rates: Record<string, number>): DayPoint[] {
  const close = deriveAllForDay(rates);
  const rows: DayPoint[] = [];
  for (const [symbol, c] of Object.entries(close)) {
    rows.push({ symbol, date, close: c });
  }
  return rows;
}

/**
 * Pulls a contiguous date range and persists it. Advances highWatermark
 * to the actual last day persisted in this batch, so a partial failure
 * mid-range still leaves a recoverable cursor for the next tick.
 */
async function fetchAndPersistRange(
  startDate: string,
  endDate: string,
  source: "backfill" | "gapfill",
): Promise<{ rows: number; lastDate: string | null }> {
  const days = await fetchTimeframe(startDate, endDate);
  const rows: DayPoint[] = [];
  let lastDate: string | null = null;
  for (const day of days) {
    rows.push(...deriveRows(day.date, day.rates as Record<string, number>));
    if (!lastDate || day.date > lastDate) lastDate = day.date;
  }
  if (rows.length > 0 && lastDate) {
    await upsertDays(rows, { source, advanceWatermarkTo: lastDate });
  }
  return { rows: rows.length, lastDate };
}

/**
 * Five-year backfill, chunked into ~yearly windows because MetalpriceAPI's
 * timeframe endpoint commonly caps at ~365 days per call. Skips work if
 * storage already extends beyond 4 years.
 */
export async function runBackfillIfNeeded(): Promise<void> {
  await loadHistory();
  const meta = getMeta();

  const today = new Date();
  const fourYearsAgo = shiftDays(today, -365 * 4);
  if (meta.earliestDate && meta.earliestDate <= toIsoDate(fourYearsAgo)) {
    logger.info(
      { earliest: meta.earliestDate },
      "metalprice: backfill not needed",
    );
    return;
  }

  const start = shiftDays(today, -365 * BACKFILL_YEARS);
  const end = shiftDays(today, -1);

  logger.info(
    { start: toIsoDate(start), end: toIsoDate(end) },
    "metalprice: starting backfill",
  );

  let cursor = start;
  let totalRows = 0;
  while (cursor <= end) {
    const chunkEnd = shiftDays(cursor, CHUNK_DAYS);
    const realEnd = chunkEnd > end ? end : chunkEnd;

    try {
      const { rows } = await fetchAndPersistRange(
        toIsoDate(cursor),
        toIsoDate(realEnd),
        "backfill",
      );
      totalRows += rows;
      logger.info(
        { from: toIsoDate(cursor), to: toIsoDate(realEnd), rows },
        "metalprice: chunk persisted",
      );
    } catch (err) {
      logger.error(
        { err, from: toIsoDate(cursor), to: toIsoDate(realEnd) },
        "metalprice: chunk failed (continuing)",
      );
    }

    cursor = shiftDays(realEnd, 1);
  }

  logger.info({ totalRows }, "metalprice: backfill complete");
}

/**
 * Self-healing daily catch-up:
 *  1. Fill any gap between highWatermark and yesterday in <=365-day chunks.
 *     Watermark only advances on successful chunk writes.
 *  2. Always refresh today via /latest. This write does NOT advance the
 *     watermark, so missed days remain retryable on the next tick.
 */
export async function runDailyUpdate(): Promise<void> {
  await loadHistory();
  const meta = getMeta();
  const today = new Date();
  const yesterday = shiftDays(today, -1);
  const yesterdayStr = toIsoDate(yesterday);

  const watermark = meta.highWatermark ?? meta.latestDate;
  if (watermark && watermark < yesterdayStr) {
    let cursor = shiftDays(parseIso(watermark), 1);
    while (cursor <= yesterday) {
      const chunkEnd = shiftDays(cursor, CHUNK_DAYS);
      const realEnd = chunkEnd > yesterday ? yesterday : chunkEnd;
      try {
        const { rows, lastDate } = await fetchAndPersistRange(
          toIsoDate(cursor),
          toIsoDate(realEnd),
          "gapfill",
        );
        logger.info(
          { from: toIsoDate(cursor), to: toIsoDate(realEnd), rows, lastDate },
          "metalprice: gap chunk filled",
        );
      } catch (err) {
        logger.error(
          { err, from: toIsoDate(cursor), to: toIsoDate(realEnd) },
          "metalprice: gap chunk failed (will retry next tick)",
        );
        break; // stop advancing; next tick retries from current watermark
      }
      cursor = shiftDays(realEnd, 1);
    }
  }

  try {
    const rates = await fetchLatest();
    const todayStr = toIsoDate(today);
    const rows = deriveRows(todayStr, rates as Record<string, number>);
    if (rows.length > 0) {
      // intentionally NO advanceWatermarkTo — today is provisional
      await upsertDays(rows, { source: "today" });
      logger.info({ date: todayStr, rows: rows.length }, "metalprice: today refreshed");
    }
  } catch (err) {
    logger.error({ err }, "metalprice: latest fetch failed");
  }
}
