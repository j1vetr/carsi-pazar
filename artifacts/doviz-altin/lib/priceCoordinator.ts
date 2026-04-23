import { fetchAllPrices, type RawHaremResponse } from "./haremApi";

/**
 * Single-flight fetch coordinator.
 *
 * Problem: widget headless task ve FGS tick loop, paralel olarak `fetchAllPrices`
 * çağırabiliyordu. RN'in fetch'i + OkHttp connection pool, aynı endpoint'e
 * paralel istekler atıldığında bazı istekleri "askıda" bırakabiliyor (özellikle
 * keep-alive bağlantıları stale olduğunda). Sonuç: widget "Yenileniyor..."
 * üstünde takılı kalıyor.
 *
 * Çözüm: tüm price fetch'leri tek bir in-memory promise üzerinden serialize et.
 * - inFlight varsa → onu join et (yeni istek atma)
 * - Cache TTL içindeyse → memory cache'i döndür (network'e hiç çıkma)
 * - Aksi halde → yeni fetch başlat, inFlight'a yaz, finally clear
 *
 * Bu sayede:
 *  • Network stack'te asla paralel iki request olmaz → connection starvation yok.
 *  • Battery + data tasarrufu (ardışık 5 sn içindeki çağrılar tek fetch).
 *  • Widget click sırasında FGS'in zaten devam eden fetch'ine bağlanır → tek
 *    fetch iki UI'yi de besler.
 */

interface CacheEntry {
  ts: number;
  data: RawHaremResponse;
}

let inFlight: Promise<RawHaremResponse> | null = null;
let inFlightStartedAt = 0;
let memCache: CacheEntry | null = null;

const DEFAULT_MAX_AGE_MS = 5_000;
const DEFAULT_TIMEOUT_MS = 7_000;

/**
 * Eğer önceki bir fetch ASLA resolve etmediyse (RN fetch hang bug'ı),
 * inFlight sonsuza kadar kalır ve hiçbir yeni istek atılmaz. Bunu engellemek
 * için inFlight'ın yaşı bu eşiği aşarsa "stuck" sayar ve yeni fetch başlatırız.
 */
const INFLIGHT_STUCK_AFTER_MS = 20_000;

export interface CoordinatorOptions {
  /** Memory cache freshness eşiği. Bu yaştan genç cache hit kabul edilir. */
  maxAgeMs?: number;
  /** Tek bir fetch için outer timeout. */
  timeoutMs?: number;
  /** Cache'i bypass et, mutlaka network'e çık (ama hâlâ inFlight'a join eder). */
  forceRefresh?: boolean;
}

export async function getPrices(
  opts: CoordinatorOptions = {},
): Promise<RawHaremResponse> {
  const maxAgeMs = opts.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const now = Date.now();

  // 1) Cache hit
  if (!opts.forceRefresh && memCache && now - memCache.ts < maxAgeMs) {
    return memCache.data;
  }

  // 2) Devam eden bir fetch'e join ol (stuck değilse)
  if (inFlight && now - inFlightStartedAt < INFLIGHT_STUCK_AFTER_MS) {
    return inFlight;
  }

  // 3) Yeni fetch başlat
  inFlightStartedAt = now;
  inFlight = (async () => {
    try {
      const data = await fetchAllPrices({ timeoutMs });
      memCache = { ts: Date.now(), data };
      return data;
    } finally {
      // inFlight'i temizle ki sonraki çağrı yeni istek atabilsin
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Test/diagnostics için. */
export function _resetCoordinator(): void {
  inFlight = null;
  inFlightStartedAt = 0;
  memCache = null;
}
