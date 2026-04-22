import { promises as fs } from "node:fs";
import path from "node:path";
import { logger } from "../lib/logger";

/**
 * Storage shape on disk:
 * {
 *   "USDTRY": { "2021-04-22": 8.18, "2021-04-23": 8.21, ... },
 *   "ALTIN":  { "2021-04-22": 491.2, ... },
 *   ...
 * }
 *
 * One JSON file is sufficient: ~31 symbols × 1825 days × ~25 bytes ≈ 1.5 MB.
 * The whole file is loaded into memory at startup and kept in sync on writes.
 */
export type SymbolHistory = Record<string, Record<string, number>>;

const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");
const HISTORY_TMP = path.join(DATA_DIR, "history.json.tmp");
const META_FILE = path.join(DATA_DIR, "history-meta.json");

interface MetaFile {
  lastBackfillAt?: string;
  lastDailyAt?: string;
  earliestDate?: string;
  latestDate?: string;
  /**
   * The newest date that is part of a contiguous, fully-backfilled run
   * (anchored at earliestDate). Today's optimistic "/latest" write does
   * NOT advance this — only successful gap fills do, so missed days are
   * always retried on the next cron tick.
   */
  highWatermark?: string;
}

let memory: SymbolHistory = {};
let meta: MetaFile = {};
let loaded = false;

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function loadHistory(): Promise<void> {
  if (loaded) return;
  await ensureDir();
  try {
    const raw = await fs.readFile(HISTORY_FILE, "utf8");
    memory = JSON.parse(raw) as SymbolHistory;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    memory = {};
  }
  try {
    const raw = await fs.readFile(META_FILE, "utf8");
    meta = JSON.parse(raw) as MetaFile;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    meta = {};
  }
  loaded = true;
  logger.info(
    { symbols: Object.keys(memory).length, latest: meta.latestDate },
    "metalprice: history loaded",
  );
}

async function persist(): Promise<void> {
  await ensureDir();
  await fs.writeFile(HISTORY_TMP, JSON.stringify(memory), "utf8");
  await fs.rename(HISTORY_TMP, HISTORY_FILE);
  await fs.writeFile(META_FILE, JSON.stringify(meta, null, 2), "utf8");
}

function recomputeBounds(): void {
  let earliest: string | undefined;
  let latest: string | undefined;
  for (const series of Object.values(memory)) {
    for (const date of Object.keys(series)) {
      if (!earliest || date < earliest) earliest = date;
      if (!latest || date > latest) latest = date;
    }
  }
  meta.earliestDate = earliest;
  meta.latestDate = latest;
}

export interface DayPoint {
  symbol: string;
  date: string;
  close: number;
}

let writeQueue: Promise<void> = Promise.resolve();

export interface UpsertOptions {
  source: "backfill" | "gapfill" | "today";
  /** Only set when caller is sure storage is contiguous up to this date. */
  advanceWatermarkTo?: string;
}

export async function upsertDays(
  rows: DayPoint[],
  opts: UpsertOptions,
): Promise<void> {
  if (rows.length === 0 && !opts.advanceWatermarkTo) return;
  // Serialize writes — admin endpoints + cron can race otherwise.
  const next = writeQueue.then(async () => {
    await loadHistory();
    for (const row of rows) {
      const series = memory[row.symbol] ?? (memory[row.symbol] = {});
      series[row.date] = row.close;
    }
    recomputeBounds();
    const nowIso = new Date().toISOString();
    if (opts.source === "backfill") meta.lastBackfillAt = nowIso;
    meta.lastDailyAt = nowIso;
    if (
      opts.advanceWatermarkTo &&
      (!meta.highWatermark || opts.advanceWatermarkTo > meta.highWatermark)
    ) {
      meta.highWatermark = opts.advanceWatermarkTo;
    }
    await persist();
  });
  writeQueue = next.catch(() => {
    /* keep queue alive on errors */
  });
  return next;
}

export interface PointOut {
  t: string;
  c: number;
}

export async function getSeries(
  symbol: string,
  fromDate: string,
): Promise<PointOut[]> {
  await loadHistory();
  const series = memory[symbol];
  if (!series) return [];
  const out: PointOut[] = [];
  for (const [date, close] of Object.entries(series)) {
    if (date >= fromDate) out.push({ t: date, c: close });
  }
  out.sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : 0));
  return out;
}

export function getMeta(): MetaFile {
  return { ...meta };
}

export function getSymbolCount(): number {
  return Object.keys(memory).length;
}
