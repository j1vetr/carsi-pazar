import { useEffect, useRef, useState } from "react";
import {
  fetchHistory,
  findClosestPoint,
  hasHistorySupport,
  pickRangeForDate,
  type HistoryPoint,
  type HistoryRange,
} from "@/lib/api/historyApi";

export interface HistoricalPriceState {
  loading: boolean;
  supported: boolean;
  point: HistoryPoint | null;
  error: string | null;
}

interface CacheEntry {
  ts: number;
  data: HistoryPoint[];
}

const cache = new Map<string, CacheEntry>();
const STALE_MS = 6 * 60 * 60 * 1000;

function cacheKey(code: string, range: HistoryRange): string {
  return `${code}::${range}`;
}

/**
 * Verilen kod + tarih için, geçmiş veride o güne en yakın işlem gününün
 * kapanış fiyatını döner. Hafta sonu/tatil için +/- 5 gün tolerans.
 *
 * - `date` null ise pasif (loading=false, supported=false döner)
 * - Sembolün geçmişi yoksa supported=false döner (UI render etmez)
 * - Range otomatik seçilir (1H/1A/3A/1Y/3Y/5Y)
 * - Aynı (code, range) için cache 6 saat geçerli
 */
export function useHistoricalPriceAt(code: string, date: Date | null): HistoricalPriceState {
  const supported = !!code && hasHistorySupport(code) && date != null;
  const [state, setState] = useState<HistoricalPriceState>({
    loading: supported,
    supported,
    point: null,
    error: null,
  });
  const reqId = useRef(0);

  useEffect(() => {
    // Her çalışmada id'yi bump et — eski in-flight isteklerin cache-hit/yeni
    // state'i overwrite etmesini engelle.
    const id = ++reqId.current;

    if (!code || !date || !hasHistorySupport(code)) {
      setState({ loading: false, supported: false, point: null, error: null });
      return;
    }
    const range = pickRangeForDate(date);
    const k = cacheKey(code, range);
    const cached = cache.get(k);
    const fresh = cached && Date.now() - cached.ts < STALE_MS;

    if (fresh) {
      if (id !== reqId.current) return;
      const point = findClosestPoint(cached.data, date);
      setState({ loading: false, supported: true, point, error: null });
      return;
    }

    setState({ loading: true, supported: true, point: null, error: null });
    fetchHistory(code, range)
      .then((points) => {
        if (id !== reqId.current) return;
        cache.set(k, { ts: Date.now(), data: points });
        const point = findClosestPoint(points, date);
        setState({ loading: false, supported: true, point, error: null });
      })
      .catch((err: Error) => {
        if (id !== reqId.current) return;
        setState({ loading: false, supported: true, point: null, error: err.message });
      });
  }, [code, date?.getTime()]);

  return state;
}
