import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchAllPrices,
  mapPrices,
  type AssetRate,
  type AssetGroup,
  type PreviousPriceCache,
  type RawHaremResponse,
  type SymbolMeta,
} from "@/lib/haremApi";
import { connectHaremSocket } from "@/lib/haremSocket";
import type { Socket } from "socket.io-client";

export interface CurrencyRate {
  code: string;
  symbol?: string;
  name: string;
  nameTR: string;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
  prevClose: number;
  flag?: string;
  group?: AssetGroup;
}

export interface GoldRate {
  code: string;
  symbol?: string;
  name: string;
  nameTR: string;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
  prevClose?: number;
  unit: string;
  icon?: string;
  group?: AssetGroup;
  emission?: "yeni" | "eski" | "standart";
}

export interface PortfolioItem {
  id: string;
  type: "currency" | "gold";
  code: string;
  name: string;
  nameTR: string;
  amount: number;
  purchasePrice: number;
  purchaseDate: string;
}

export interface PriceAlert {
  id: string;
  type: "currency" | "gold";
  code: string;
  name: string;
  nameTR: string;
  targetPrice: number;
  direction: "above" | "below";
  active: boolean;
  triggered: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  category: string;
}

export interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  country: string;
  flag: string;
  event: string;
  actual?: string;
  forecast?: string;
  previous?: string;
  impact: "low" | "medium" | "high";
}

export interface HistoricalPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface AppContextType {
  currencies: CurrencyRate[];
  currencyParities: CurrencyRate[];
  parities: CurrencyRate[];
  goldRates: GoldRate[];
  goldGram: GoldRate[];
  goldCoinsYeni: GoldRate[];
  goldCoinsEski: GoldRate[];
  goldBars: GoldRate[];
  goldBracelets: GoldRate[];
  goldParities: GoldRate[];
  metals: GoldRate[];
  silvers: GoldRate[];
  ratios: GoldRate[];
  spreads: GoldRate[];
  portfolio: PortfolioItem[];
  alerts: PriceAlert[];
  news: NewsItem[];
  economicEvents: EconomicEvent[];
  isLoading: boolean;
  isStale: boolean;
  lastUpdated: Date | null;
  favorites: string[];
  addToPortfolio: (item: Omit<PortfolioItem, "id">) => Promise<void>;
  removeFromPortfolio: (id: string) => Promise<void>;
  addAlert: (alert: Omit<PriceAlert, "id">) => Promise<void>;
  removeAlert: (id: string) => Promise<void>;
  toggleFavorite: (code: string) => Promise<void>;
  refreshData: () => Promise<void>;
  getHistoricalData: (
    code: string,
    period: "1D" | "1W" | "1M" | "3M" | "1Y"
  ) => HistoricalPoint[];
  getPortfolioTotalValue: () => number;
  getPortfolioGainLoss: () => { value: number; percent: number };
  convertAmount: (
    fromCode: string,
    toCode: string,
    amount: number
  ) => number;
  findRateByCode: (code: string) => CurrencyRate | GoldRate | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

const DEMO_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Fed Başkanı Powell: Faiz kararlarında sabırlı olacağız",
    summary:
      "Federal Rezerv Başkanı Jerome Powell, yüksek enflasyonun geride kaldığını ancak faiz indirimlerinde aceleci olmayacaklarını belirtti.",
    source: "Bloomberg HT",
    publishedAt: "2026-04-16T09:30:00",
    url: "#",
    category: "Merkez Bankası",
  },
  {
    id: "2",
    title: "Altın fiyatları jeopolitik gerilimle rekor kırdı",
    summary:
      "Ons altın, küresel belirsizlik ortamında 4.700 dolar sınırını aşarak yeni rekor seviyesine ulaştı.",
    source: "Anadolu Ajansı",
    publishedAt: "2026-04-16T08:15:00",
    url: "#",
    category: "Emtia",
  },
  {
    id: "3",
    title: "TCMB faiz kararı açıklandı: Beklenmedik değişiklik yok",
    summary:
      "Türkiye Cumhuriyet Merkez Bankası Para Politikası Kurulu, politika faizini sabit tutmaya devam etti.",
    source: "TCMB",
    publishedAt: "2026-04-16T07:45:00",
    url: "#",
    category: "TCMB",
  },
  {
    id: "4",
    title: "Dolar/TL kurunda son durum: Piyasalar ne bekliyor?",
    summary:
      "ABD-Türkiye ticaret ilişkilerindeki gelişmeler ve yurt içi ekonomik veriler doların seyrine yön veriyor.",
    source: "Ekonomist",
    publishedAt: "2026-04-15T22:00:00",
    url: "#",
    category: "Döviz",
  },
  {
    id: "5",
    title: "Platin ve Paladyum fiyatları yükselişte",
    summary:
      "Endüstriyel talebin artmasıyla birlikte platin ve paladyum yatırımcıların radarına girmeye başladı.",
    source: "Reuters",
    publishedAt: "2026-04-15T19:30:00",
    url: "#",
    category: "Emtia",
  },
  {
    id: "6",
    title: "Euro/Dolar paritesinde sert hareketler",
    summary:
      "ECB'nin açıkladığı politika kararları sonrasında Euro/Dolar paritesi gün içinde %0.8 değer kazandı.",
    source: "Reuters",
    publishedAt: "2026-04-15T17:20:00",
    url: "#",
    category: "Parite",
  },
];

const DEMO_EVENTS: EconomicEvent[] = [
  {
    id: "1",
    date: "2026-04-17",
    time: "15:30",
    country: "ABD",
    flag: "US",
    event: "Perakende Satışlar (Aylık)",
    forecast: "0.4%",
    previous: "0.2%",
    impact: "high",
  },
  {
    id: "2",
    date: "2026-04-17",
    time: "12:00",
    country: "TR",
    flag: "TR",
    event: "İşsizlik Oranı",
    forecast: "8.9%",
    previous: "9.1%",
    impact: "high",
  },
  {
    id: "3",
    date: "2026-04-16",
    time: "13:00",
    country: "AB",
    flag: "EU",
    event: "Sanayi Üretimi (Yıllık)",
    actual: "-1.2%",
    forecast: "-0.8%",
    previous: "-1.5%",
    impact: "medium",
  },
  {
    id: "4",
    date: "2026-04-16",
    time: "16:15",
    country: "ABD",
    flag: "US",
    event: "Sanayi Üretimi (Aylık)",
    actual: "0.3%",
    forecast: "0.2%",
    previous: "-0.1%",
    impact: "medium",
  },
  {
    id: "5",
    date: "2026-04-18",
    time: "09:30",
    country: "TR",
    flag: "TR",
    event: "TCMB PPK Toplantısı",
    forecast: "Sabit",
    previous: "%46.00",
    impact: "high",
  },
  {
    id: "6",
    date: "2026-04-18",
    time: "14:30",
    country: "ABD",
    flag: "US",
    event: "İşsizlik Başvuruları",
    forecast: "215K",
    previous: "220K",
    impact: "medium",
  },
];

function generateHistoricalData(
  basePrice: number,
  volatility: number,
  points: number
): HistoricalPoint[] {
  const data: HistoricalPoint[] = [];
  let price = basePrice * 0.88;
  const now = Date.now();
  const interval = (30 * 24 * 60 * 60 * 1000) / points;

  for (let i = 0; i < points; i++) {
    const time = new Date(now - (points - i) * interval).toISOString();
    const change = (Math.random() - 0.48) * volatility;
    price = Math.max(price + change, basePrice * 0.7);
    const open = price;
    const high = price + Math.random() * volatility * 0.5;
    const low = price - Math.random() * volatility * 0.5;
    const close = low + Math.random() * (high - low);
    data.push({ time, open, high, low, close });
    price = close;
  }

  if (data.length > 0) data[data.length - 1].close = basePrice;
  return data;
}

function toCurrencyRate(r: AssetRate): CurrencyRate {
  return {
    code: r.meta.code,
    symbol: r.meta.symbol,
    name: r.meta.name,
    nameTR: r.meta.nameTR,
    buy: r.buy,
    sell: r.sell,
    change: r.change,
    changePercent: r.changePercent,
    prevClose: r.prevClose,
    flag: r.meta.flag,
    group: r.meta.group,
  };
}

function toGoldRate(r: AssetRate): GoldRate {
  return {
    code: r.meta.code,
    symbol: r.meta.symbol,
    name: r.meta.name,
    nameTR: r.meta.nameTR,
    buy: r.buy,
    sell: r.sell,
    change: r.change,
    changePercent: r.changePercent,
    prevClose: r.prevClose,
    unit: r.meta.unit,
    icon: r.meta.iconKey,
    group: r.meta.group,
    emission: r.meta.emission,
  };
}

const CURRENCY_GROUP_PRIORITY: Record<string, number> = {
  USD: 1, EUR: 2, GBP: 3, CHF: 4, AUD: 5, CAD: 6, JPY: 7, SAR: 8,
  DKK: 9, NOK: 10, SEK: 11, XUSDTRY: 12,
};
const COIN_PRIORITY: Record<string, number> = {
  CEYREK: 1, YARIM: 2, TAM: 3, ATA: 4, ATA5: 5, GREMESE_YENI: 6,
  CEYREK_ESKI: 1, YARIM_ESKI: 2, TAM_ESKI: 3, ATA_ESKI: 4, ATA5_ESKI: 5, GREMESE_ESKI: 6,
};
const BAR_PRIORITY: Record<string, number> = {
  GRAM5: 1, GRAM10: 2, GRAM20: 3, GRAM50: 4, GRAM100: 5, KULCE: 6,
};
const sortBy = <T,>(items: T[], priority: Record<string, number>, key: (i: T) => string) =>
  [...items].sort((a, b) => (priority[key(a)] ?? 99) - (priority[key(b)] ?? 99));

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [allRates, setAllRates] = useState<AssetRate[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [favorites, setFavorites] = useState<string[]>(["USD", "EUR", "GBP", "ALTIN", "CEYREK"]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const historicalCache = useRef<Map<string, HistoricalPoint[]>>(new Map());
  const priceHistoryRef = useRef<Record<string, { t: number; buy: number; sell: number }[]>>({});
  const lastSnapshotPersistRef = useRef<number>(0);
  const isFetching = useRef<boolean>(false);
  const isHydrated = useRef<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const fallbackInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const SNAPSHOT_INTERVAL_MS = 60 * 60 * 1000;
  const HISTORY_MAX_AGE_MS = 48 * 60 * 60 * 1000;
  const TARGET_AGE_MS = 24 * 60 * 60 * 1000;
  const PERSIST_THROTTLE_MS = 5 * 60 * 1000;

  const buildBaselineCache = (now: number): PreviousPriceCache => {
    const baseline: PreviousPriceCache = {};
    const target = now - TARGET_AGE_MS;
    for (const [code, arr] of Object.entries(priceHistoryRef.current)) {
      if (!arr || arr.length === 0) continue;
      let best = arr[0];
      let bestDist = Math.abs(best.t - target);
      for (let i = 1; i < arr.length; i++) {
        const d = Math.abs(arr[i].t - target);
        if (d < bestDist) {
          best = arr[i];
          bestDist = d;
        }
      }
      const ageHours = (now - best.t) / (60 * 60 * 1000);
      if (ageHours >= 1) {
        baseline[code] = { buy: best.buy, sell: best.sell };
      }
    }
    return baseline;
  };

  const applyPrices = useCallback((data: RawHaremResponse, mode: "snapshot" | "update" = "snapshot") => {
    const now = Date.now();
    const baseline = buildBaselineCache(now);
    const newRates = mapPrices(data, baseline);
    if (newRates.length === 0) return;

    if (mode === "update") {
      // Delta merge: keep existing rates, replace only the codes present in the update
      setAllRates((prev) => {
        const map = new Map(prev.map((r) => [r.meta.code, r]));
        for (const r of newRates) map.set(r.meta.code, r);
        return Array.from(map.values());
      });
    } else {
      setAllRates(newRates);
    }
    if (typeof data.stale === "boolean") setIsStale(data.stale);

    let snapshotAdded = false;
    newRates.forEach((r) => {
      const arr = priceHistoryRef.current[r.meta.code] ?? [];
      const lastT = arr.length > 0 ? arr[arr.length - 1].t : 0;
      if (now - lastT >= SNAPSHOT_INTERVAL_MS) {
        arr.push({ t: now, buy: r.buy, sell: r.sell });
        snapshotAdded = true;
      }
      const cutoff = now - HISTORY_MAX_AGE_MS;
      const trimmed = arr.filter((s) => s.t >= cutoff);
      priceHistoryRef.current[r.meta.code] = trimmed.length > 0 ? trimmed : [arr[arr.length - 1]];
    });

    if (snapshotAdded && now - lastSnapshotPersistRef.current > PERSIST_THROTTLE_MS) {
      lastSnapshotPersistRef.current = now;
      AsyncStorage.setItem(
        "priceHistory_v1",
        JSON.stringify(priceHistoryRef.current)
      ).catch(() => {});
    }

    setLastUpdated(new Date());
  }, []);

  const refreshData = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);
    try {
      const data = await fetchAllPrices();
      applyPrices(data);
    } catch (err) {
      console.warn("Fiyatlar alınamadı:", err);
    } finally {
      isFetching.current = false;
      setIsLoading(false);
    }
  }, [applyPrices]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadStoredData();
      isHydrated.current = true;
      if (!mounted) return;
      await refreshData();
      try {
        const socket = connectHaremSocket({
          onConnect: () => {
            console.log("[harem] Socket bağlandı");
            if (fallbackInterval.current) {
              clearInterval(fallbackInterval.current);
              fallbackInterval.current = null;
            }
          },
          onDisconnect: (reason) => {
            console.warn("[harem] Socket koptu:", reason);
            if (!fallbackInterval.current) {
              fallbackInterval.current = setInterval(() => refreshData(), 30000);
            }
          },
          onError: (err) => {
            console.warn("[harem] Socket hatası:", err.message);
            if (!fallbackInterval.current) {
              fallbackInterval.current = setInterval(() => refreshData(), 30000);
            }
          },
          onPrices: (data, mode) => applyPrices(data, mode),
          onStale: () => setIsStale(true),
          onLive: () => setIsStale(false),
        });
        socketRef.current = socket;
      } catch (err) {
        console.warn("[harem] Socket başlatılamadı, polling'e düşülüyor", err);
        fallbackInterval.current = setInterval(() => refreshData(), 30000);
      }
    })();
    return () => {
      mounted = false;
      if (fallbackInterval.current) clearInterval(fallbackInterval.current);
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedPortfolio, storedAlerts, storedFavorites, storedHistory] = await Promise.all([
        AsyncStorage.getItem("portfolio"),
        AsyncStorage.getItem("alerts"),
        AsyncStorage.getItem("favorites"),
        AsyncStorage.getItem("priceHistory_v1"),
      ]);
      if (storedPortfolio) setPortfolio(JSON.parse(storedPortfolio));
      if (storedAlerts) setAlerts(JSON.parse(storedAlerts));
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      if (storedHistory) {
        try {
          const parsed = JSON.parse(storedHistory);
          if (parsed && typeof parsed === "object") {
            priceHistoryRef.current = parsed;
          }
        } catch {}
      }
    } catch {}
  };

  // Derived state
  const buckets = useMemo(() => {
    const currencies: CurrencyRate[] = [];
    const currencyParities: CurrencyRate[] = [];
    const parities: CurrencyRate[] = [];
    const spreadsCurr: CurrencyRate[] = [];

    const goldGram: GoldRate[] = [];
    const goldCoinsYeni: GoldRate[] = [];
    const goldCoinsEski: GoldRate[] = [];
    const goldBars: GoldRate[] = [];
    const goldBracelets: GoldRate[] = [];
    const goldParities: GoldRate[] = [];
    const metals: GoldRate[] = [];
    const silvers: GoldRate[] = [];
    const ratios: GoldRate[] = [];
    const spreadsMaden: GoldRate[] = [];

    for (const r of allRates) {
      const g = r.meta.group;
      const cat = r.meta.category;

      if (g === "currency") {
        currencies.push(toCurrencyRate(r));
      } else if (g === "parity" && cat === "DOVIZ") {
        currencyParities.push(toCurrencyRate(r));
      } else if (g === "parity" && cat === "PARITE") {
        parities.push(toCurrencyRate(r));
      } else if (g === "spread" && cat === "DOVIZ") {
        spreadsCurr.push(toCurrencyRate(r));
      } else if (g === "gold-gram") {
        goldGram.push(toGoldRate(r));
      } else if (g === "gold-coin") {
        if (r.meta.emission === "eski") goldCoinsEski.push(toGoldRate(r));
        else goldCoinsYeni.push(toGoldRate(r));
      } else if (g === "gold-bar") {
        goldBars.push(toGoldRate(r));
      } else if (g === "gold-bracelet") {
        goldBracelets.push(toGoldRate(r));
      } else if (g === "gold-parity") {
        goldParities.push(toGoldRate(r));
      } else if (g === "metal") {
        metals.push(toGoldRate(r));
      } else if (g === "silver") {
        silvers.push(toGoldRate(r));
      } else if (g === "ratio") {
        ratios.push(toGoldRate(r));
      } else if (g === "spread") {
        spreadsMaden.push(toGoldRate(r));
      }
    }

    const sortedCurrencies = [...currencies].sort(
      (a, b) => (CURRENCY_GROUP_PRIORITY[a.code] ?? 99) - (CURRENCY_GROUP_PRIORITY[b.code] ?? 99)
    );
    const sortedCoinsYeni = sortBy(goldCoinsYeni, COIN_PRIORITY, (c) => c.code);
    const sortedCoinsEski = sortBy(goldCoinsEski, COIN_PRIORITY, (c) => c.code);
    const sortedBars = sortBy(goldBars, BAR_PRIORITY, (c) => c.code);

    // goldRates: tüm altın varlıklar (UI eski uyum için)
    const goldRates: GoldRate[] = [
      ...goldGram,
      ...sortedCoinsYeni,
      ...sortedBars,
      ...goldBracelets,
    ];

    return {
      currencies: sortedCurrencies,
      currencyParities,
      parities,
      goldRates,
      goldGram,
      goldCoinsYeni: sortedCoinsYeni,
      goldCoinsEski: sortedCoinsEski,
      goldBars: sortedBars,
      goldBracelets,
      goldParities,
      metals,
      silvers,
      ratios,
      spreads: [
        ...spreadsCurr.map((c) => ({
          code: c.code, symbol: c.symbol, name: c.name, nameTR: c.nameTR,
          buy: c.buy, sell: c.sell, change: c.change, changePercent: c.changePercent,
          prevClose: c.prevClose, unit: "", icon: "FARK", group: c.group,
        }) as GoldRate),
        ...spreadsMaden,
      ],
    };
  }, [allRates]);

  const findRateByCode = useCallback(
    (code: string): CurrencyRate | GoldRate | undefined => {
      const all: (CurrencyRate | GoldRate)[] = [
        ...buckets.currencies,
        ...buckets.currencyParities,
        ...buckets.parities,
        ...buckets.goldGram,
        ...buckets.goldCoinsYeni,
        ...buckets.goldCoinsEski,
        ...buckets.goldBars,
        ...buckets.goldBracelets,
        ...buckets.goldParities,
        ...buckets.metals,
        ...buckets.silvers,
        ...buckets.ratios,
        ...buckets.spreads,
      ];
      return all.find((r) => r.code === code);
    },
    [buckets]
  );

  const addToPortfolio = useCallback(
    async (item: Omit<PortfolioItem, "id">) => {
      const newItem: PortfolioItem = {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      const updated = [...portfolio, newItem];
      setPortfolio(updated);
      await AsyncStorage.setItem("portfolio", JSON.stringify(updated));
    },
    [portfolio]
  );

  const removeFromPortfolio = useCallback(
    async (id: string) => {
      const updated = portfolio.filter((p) => p.id !== id);
      setPortfolio(updated);
      await AsyncStorage.setItem("portfolio", JSON.stringify(updated));
    },
    [portfolio]
  );

  const addAlert = useCallback(
    async (alert: Omit<PriceAlert, "id">) => {
      const newAlert: PriceAlert = {
        ...alert,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      const updated = [...alerts, newAlert];
      setAlerts(updated);
      await AsyncStorage.setItem("alerts", JSON.stringify(updated));
    },
    [alerts]
  );

  const removeAlert = useCallback(
    async (id: string) => {
      const updated = alerts.filter((a) => a.id !== id);
      setAlerts(updated);
      await AsyncStorage.setItem("alerts", JSON.stringify(updated));
    },
    [alerts]
  );

  const toggleFavorite = useCallback(
    async (code: string) => {
      const updated = favorites.includes(code)
        ? favorites.filter((f) => f !== code)
        : [...favorites, code];
      setFavorites(updated);
      await AsyncStorage.setItem("favorites", JSON.stringify(updated));
    },
    [favorites]
  );

  const getHistoricalData = useCallback(
    (code: string, period: "1D" | "1W" | "1M" | "3M" | "1Y"): HistoricalPoint[] => {
      const cacheKey = `${code}_${period}`;
      if (historicalCache.current.has(cacheKey)) {
        return historicalCache.current.get(cacheKey)!;
      }
      const rate = findRateByCode(code);
      const basePrice = rate ? rate.buy : 100;
      const pointsMap = { "1D": 48, "1W": 84, "1M": 90, "3M": 180, "1Y": 365 };
      const volatilityMap = {
        "1D": basePrice * 0.002,
        "1W": basePrice * 0.006,
        "1M": basePrice * 0.02,
        "3M": basePrice * 0.04,
        "1Y": basePrice * 0.08,
      };
      const data = generateHistoricalData(basePrice, volatilityMap[period], pointsMap[period]);
      historicalCache.current.set(cacheKey, data);
      return data;
    },
    [findRateByCode]
  );

  const getPortfolioTotalValue = useCallback(() => {
    return portfolio.reduce((total, item) => {
      const rate = findRateByCode(item.code);
      const currentPrice = rate?.buy ?? item.purchasePrice;
      return total + item.amount * currentPrice;
    }, 0);
  }, [portfolio, findRateByCode]);

  const getPortfolioGainLoss = useCallback(() => {
    const totalValue = getPortfolioTotalValue();
    const totalCost = portfolio.reduce((sum, item) => sum + item.amount * item.purchasePrice, 0);
    const gainLoss = totalValue - totalCost;
    const percent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
    return { value: gainLoss, percent };
  }, [portfolio, getPortfolioTotalValue]);

  const convertAmount = useCallback(
    (fromCode: string, toCode: string, amount: number): number => {
      if (fromCode === "TRY") {
        const toRate = findRateByCode(toCode);
        if (!toRate) return 0;
        return amount / toRate.sell;
      }
      if (toCode === "TRY") {
        const fromRate = findRateByCode(fromCode);
        if (!fromRate) return 0;
        return amount * fromRate.buy;
      }
      const fromRate = findRateByCode(fromCode);
      const toRate = findRateByCode(toCode);
      if (!fromRate || !toRate) return 0;
      return (amount * fromRate.buy) / toRate.sell;
    },
    [findRateByCode]
  );

  return (
    <AppContext.Provider
      value={{
        currencies: buckets.currencies,
        currencyParities: buckets.currencyParities,
        parities: buckets.parities,
        goldRates: buckets.goldRates,
        goldGram: buckets.goldGram,
        goldCoinsYeni: buckets.goldCoinsYeni,
        goldCoinsEski: buckets.goldCoinsEski,
        goldBars: buckets.goldBars,
        goldBracelets: buckets.goldBracelets,
        goldParities: buckets.goldParities,
        metals: buckets.metals,
        silvers: buckets.silvers,
        ratios: buckets.ratios,
        spreads: buckets.spreads,
        portfolio,
        alerts,
        news: DEMO_NEWS,
        economicEvents: DEMO_EVENTS,
        isLoading,
        isStale,
        lastUpdated,
        favorites,
        addToPortfolio,
        removeFromPortfolio,
        addAlert,
        removeAlert,
        toggleFavorite,
        refreshData,
        getHistoricalData,
        getPortfolioTotalValue,
        getPortfolioGainLoss,
        convertAmount,
        findRateByCode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
