import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "portfolio_snapshots_v1";
const MAX_DAYS = 365;

export interface DailySnapshot {
  d: string;
  v: number;
  c: number;
}

export type SnapshotRange = "1H" | "1A" | "3A" | "1Y" | "ALL";

function ymd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function loadSnapshots(): Promise<DailySnapshot[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (x: unknown): x is DailySnapshot =>
          !!x &&
          typeof x === "object" &&
          typeof (x as DailySnapshot).d === "string" &&
          typeof (x as DailySnapshot).v === "number" &&
          typeof (x as DailySnapshot).c === "number",
      )
      .sort((a, b) => a.d.localeCompare(b.d));
  } catch {
    return [];
  }
}

export async function saveSnapshots(snapshots: DailySnapshot[]): Promise<void> {
  const trimmed = snapshots.slice(-MAX_DAYS);
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {}
}

export function upsertTodaySnapshot(
  snapshots: DailySnapshot[],
  totalValue: number,
  totalCost: number,
  now = new Date(),
): { snapshots: DailySnapshot[]; changed: boolean } {
  const today = ymd(now);
  const last = snapshots[snapshots.length - 1];
  if (last && last.d === today) {
    if (Math.abs(last.v - totalValue) < 0.01 && Math.abs(last.c - totalCost) < 0.01) {
      return { snapshots, changed: false };
    }
    const next = snapshots.slice();
    next[next.length - 1] = { d: today, v: totalValue, c: totalCost };
    return { snapshots: next, changed: true };
  }
  if (totalValue <= 0 && totalCost <= 0 && snapshots.length === 0) {
    return { snapshots, changed: false };
  }
  return {
    snapshots: [...snapshots, { d: today, v: totalValue, c: totalCost }],
    changed: true,
  };
}

export function rangeToDays(range: SnapshotRange): number | null {
  switch (range) {
    case "1H":
      return 7;
    case "1A":
      return 30;
    case "3A":
      return 90;
    case "1Y":
      return 365;
    case "ALL":
    default:
      return null;
  }
}

export function sliceForRange(
  snapshots: DailySnapshot[],
  range: SnapshotRange,
): DailySnapshot[] {
  const days = rangeToDays(range);
  if (days == null) return snapshots;
  return snapshots.slice(-days);
}
