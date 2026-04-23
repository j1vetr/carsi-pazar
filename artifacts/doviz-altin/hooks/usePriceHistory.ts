import { useEffect, useRef, useState } from "react";
import {
  fetchHistory,
  hasHistorySupport,
  type HistoryPoint,
  type HistoryRange,
} from "@/lib/api/historyApi";

interface State {
  data: HistoryPoint[];
  loading: boolean;
  error: string | null;
}

const cache = new Map<string, HistoryPoint[]>();
const STALE_MS = 6 * 60 * 60 * 1000;
const cacheTs = new Map<string, number>();

function cacheKey(code: string, range: HistoryRange): string {
  return `${code}::${range}`;
}

export function usePriceHistory(code: string, range: HistoryRange): State {
  const [state, setState] = useState<State>(() => {
    const k = cacheKey(code, range);
    return {
      data: cache.get(k) ?? [],
      loading: hasHistorySupport(code),
      error: null,
    };
  });
  const reqId = useRef(0);

  useEffect(() => {
    if (!hasHistorySupport(code)) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    const k = cacheKey(code, range);
    const cached = cache.get(k);
    const ts = cacheTs.get(k) ?? 0;
    const fresh = cached && Date.now() - ts < STALE_MS;
    setState({
      data: cached ?? [],
      loading: !fresh,
      error: null,
    });
    if (fresh) return;

    const id = ++reqId.current;
    fetchHistory(code, range)
      .then((points) => {
        if (id !== reqId.current) return;
        cache.set(k, points);
        cacheTs.set(k, Date.now());
        setState({ data: points, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (id !== reqId.current) return;
        setState((prev) => ({
          data: prev.data,
          loading: false,
          error: err.message,
        }));
      });
  }, [code, range]);

  return state;
}
