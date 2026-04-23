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
  findMetaByCode,
} from "@/lib/haremApi";
import {
  apiListAlerts,
  apiSaveAlert,
  apiDeleteAlert,
  apiGetNews,
  apiGetPrefs,
  apiSetPrefs,
  apiGetPortfolio,
  apiSetPortfolio,
  type ServerPortfolioItem,
  type ServerAlert,
  type ServerNewsItem,
  type UserPrefs,
} from "@/lib/api";
import { setupPushAndRegister } from "@/lib/notifications";
import { isOnboardingSeen, ONBOARDING_DONE_EVENT } from "@/lib/onboardingPref";
import { DeviceEventEmitter, type EmitterSubscription } from "react-native";
import * as Notifications from "expo-notifications";
import { addInboxItem, subscribeInbox, unreadCount as inboxUnreadCount } from "@/lib/inbox";
import { scheduleWeeklyPortfolioReminder } from "@/lib/weeklyReminder";
import {
  loadSnapshots,
  saveSnapshots,
  upsertTodaySnapshot,
  type DailySnapshot,
} from "@/lib/portfolioSnapshots";
import {
  aggregateHoldings,
  availableToSell,
  bucketForCode,
  summarizePortfolio,
} from "@/lib/portfolioCalc";

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
  side?: "buy" | "sell";
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
  imageUrl: string | null;
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
  banks: GoldRate[];
  portfolio: PortfolioItem[];
  alerts: PriceAlert[];
  news: NewsItem[];
  newsLoading: boolean;
  refreshNews: () => Promise<void>;
  prefs: UserPrefs;
  setNewsEnabled: (enabled: boolean) => Promise<void>;
  setNewsCategories: (cats: string[]) => Promise<void>;
  setBriefingEnabled: (enabled: boolean) => Promise<void>;
  setMovesEnabled: (enabled: boolean) => Promise<void>;
  setWeeklyEnabled: (enabled: boolean) => Promise<void>;
  inboxUnread: number;
  isLoading: boolean;
  isStale: boolean;
  lastUpdated: Date | null;
  favorites: string[];
  addToPortfolio: (item: Omit<PortfolioItem, "id">) => Promise<void>;
  sellFromPortfolio: (input: {
    code: string;
    type: "currency" | "gold";
    name: string;
    nameTR: string;
    amount: number;
    price: number;
    date?: string;
  }) => Promise<{ ok: true } | { ok: false; reason: "insufficient" }>;
  removeFromPortfolio: (id: string) => Promise<void>;
  removeAllByAsset: (code: string, type: "currency" | "gold") => Promise<void>;
  portfolioSnapshots: DailySnapshot[];
  getPriceHistory: (code: string) => { t: number; buy: number; sell: number }[];
  availableAmount: (code: string, type: "currency" | "gold") => number;
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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [prefs, setPrefs] = useState<UserPrefs>({
    newsEnabled: false,
    newsCategories: [],
    briefingEnabled: true,
    movesEnabled: true,
    weeklyEnabled: true,
    favorites: [],
    favoritesUpdatedAt: 0,
  });
  const [inboxUnread, setInboxUnread] = useState<number>(0);
  const [portfolioSnapshots, setPortfolioSnapshots] = useState<DailySnapshot[]>([]);
  const snapshotPersistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historicalCache = useRef<Map<string, HistoricalPoint[]>>(new Map());
  const priceHistoryRef = useRef<Record<string, { t: number; buy: number; sell: number }[]>>({});
  const lastSnapshotPersistRef = useRef<number>(0);
  const isFetching = useRef<boolean>(false);
  const isHydrated = useRef<boolean>(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const newsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  // Bulut senkronu için son değişiklik zaman damgaları (cihaz saati, ms).
  // Açılışta sunucu vs lokal karşılaştırması ve last-write-wins çözümü için kullanılır.
  const portfolioUpdatedAtRef = useRef<number>(0);
  const favoritesUpdatedAtRef = useRef<number>(0);
  // Portföy push için debounce timer
  const portfolioPushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Onboarding bittiğinde push akışını başlatan event listener
  const onboardingSubRef = useRef<EmitterSubscription | null>(null);

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

  const lastFetchAt = useRef(0);
  const REFRESH_THROTTLE_MS = 3000;
  const refreshData = useCallback(async () => {
    if (isFetching.current) return;
    const now = Date.now();
    if (now - lastFetchAt.current < REFRESH_THROTTLE_MS) {
      return;
    }
    lastFetchAt.current = now;
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
    let respSub: Notifications.EventSubscription | null = null;
    let foregroundSub: Notifications.EventSubscription | null = null;
    let inboxSub: (() => void) | null = null;
    (async () => {
      await loadStoredData();
      isHydrated.current = true;
      if (!mounted) return;
      await refreshData();

      // Push + alarm sync (non-blocking).
      // ÖNEMLİ: Bu çağrı bildirim izin diyaloğunu tetikler. Onboarding görülene
      // kadar erteliyoruz; aksi halde kullanıcıya 1. slide'da hemen sistem
      // izin pop-up'ı çıkıyor (ki istediğimiz şey 3. slide'daki kontrollü
      // istek). setOnboardingSeen() çağrılınca DeviceEventEmitter event yayar
      // ve aşağıdaki listener push akışını başlatır.
      const runPushAndSync = () => {
      setupPushAndRegister()
        .then(({ deviceId }) => {
          deviceIdRef.current = deviceId;
          // Tercihleri yükle + favoriler için last-write-wins sync (paralel)
          apiGetPrefs(deviceId)
            .then(async (p) => {
              if (!mounted) return;
              setPrefs(p);
              // Haftalık hatırlatıcıyı sunucu tercihine göre kur
              void scheduleWeeklyPortfolioReminder(p.weeklyEnabled !== false);

              // Favoriler için zaman damgası karşılaştırması:
              // Sunucu daha yeni → lokali sunucu ile değiştir.
              // Lokal daha yeni (ya da sunucu hiç yazmamış ama lokal varsa) → push'la.
              const localFavTs = favoritesUpdatedAtRef.current;
              const serverFavTs = p.favoritesUpdatedAt || 0;
              if (
                serverFavTs > 0 &&
                serverFavTs > localFavTs &&
                Array.isArray(p.favorites)
              ) {
                setFavorites(p.favorites);
                favoritesUpdatedAtRef.current = serverFavTs;
                await AsyncStorage.multiSet([
                  ["favorites", JSON.stringify(p.favorites)],
                  ["favorites_updatedAt", String(serverFavTs)],
                ]);
              } else if (localFavTs > 0) {
                // Lokal'de KULLANICI değişikliği var (timestamp > 0) ve sunucudan
                // daha yeni → push'la. Aksi halde dokunma: timestamp 0 = ilk
                // kurulumdaki varsayılan liste, sunucudaki gerçek veriyi ezmesin.
                try {
                  const raw = await AsyncStorage.getItem("favorites");
                  if (raw) {
                    const list = JSON.parse(raw) as string[];
                    if (Array.isArray(list)) {
                      void apiSetPrefs({
                        deviceId,
                        favorites: list,
                        favoritesUpdatedAt: localFavTs,
                      });
                    }
                  }
                } catch {}
              }
            })
            .catch(() => {});

          // Portföy için last-write-wins sync (paralel)
          apiGetPortfolio(deviceId)
            .then(async ({ items: serverItems, clientUpdatedAt: serverTs }) => {
              if (!mounted) return;
              const localTs = portfolioUpdatedAtRef.current;
              if (serverTs > 0 && serverTs > localTs) {
                // Sunucu daha yeni → lokali değiştir
                const next = fromServerPortfolio(serverItems);
                setPortfolio(next);
                portfolioUpdatedAtRef.current = serverTs;
                await AsyncStorage.multiSet([
                  ["portfolio", JSON.stringify(next)],
                  ["portfolio_updatedAt", String(serverTs)],
                ]);
              } else if (localTs > serverTs) {
                // Lokal yeni → sunucuya push'la (debounce gerek yok, tek seferlik)
                try {
                  const raw = await AsyncStorage.getItem("portfolio");
                  const list = raw ? (JSON.parse(raw) as PortfolioItem[]) : [];
                  await apiSetPortfolio({
                    deviceId,
                    items: toServerPortfolio(list),
                    clientUpdatedAt: localTs,
                  });
                } catch (err) {
                  console.warn("[portfolio] ilk push hatası:", err);
                }
              }
            })
            .catch((err) => console.warn("[portfolio] sync hatası:", err));

          return apiListAlerts(deviceId);
        })
        .then((server) => {
          if (!mounted) return;
          setAlerts(server.map(serverAlertToLocal));
        })
        .catch((err) => console.warn("[alerts] sync hatası:", err));
      };

      const seenOnboarding = await isOnboardingSeen();
      if (seenOnboarding) {
        runPushAndSync();
      } else {
        const sub = DeviceEventEmitter.addListener(
          ONBOARDING_DONE_EVENT,
          () => {
            sub.remove();
            if (mounted) runPushAndSync();
          },
        );
        // cleanup için referansı tut
        onboardingSubRef.current = sub;
      }

      // İlk haber çekme + 10dk'da bir yenile (backend zaten 30dk'da bir RSS poll ediyor)
      void refreshNews();
      newsIntervalRef.current = setInterval(() => void refreshNews(), 10 * 60 * 1000);

      // Notification tap → yönlendirme
      respSub = Notifications.addNotificationResponseReceivedListener((resp) => {
        const data = resp.notification.request.content.data as
          | { type?: string; route?: string }
          | undefined;
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { router } = require("expo-router");
          if (data?.route) {
            router.push(data.route);
            return;
          }
          if (data?.type === "news") router.push("/(tabs)/more");
          else if (data?.type === "briefing") router.push("/(tabs)/index");
          else if (data?.type === "move") router.push("/(tabs)/index");
          else if (data?.type === "weekly_portfolio") router.push("/(tabs)/portfolio");
          else router.push("/inbox");
        } catch (err) {
          console.warn("[push] routing error", err);
        }
      });

      // Foreground'da gelen bildirimleri inbox'a yaz (widget_refresh hariç).
      foregroundSub = Notifications.addNotificationReceivedListener((notif) => {
        const c = notif.request.content;
        const data = (c.data ?? {}) as { type?: string };
        if (data.type === "widget_refresh") return;
        void addInboxItem({
          id: notif.request.identifier ?? `${data.type ?? "push"}-${Date.now()}`,
          title: c.title ?? "",
          body: c.body ?? "",
          type: data.type ?? "push",
          data,
          ts: Date.now(),
        });
      });

      // Inbox değişimlerini takip et (badge sayısı)
      inboxSub = subscribeInbox(() => {
        inboxUnreadCount().then((n) => mounted && setInboxUnread(n));
      });
      void inboxUnreadCount().then((n) => mounted && setInboxUnread(n));

      // Polling 5sn — backend zaten 8sn cache'li
      pollIntervalRef.current = setInterval(() => refreshData(), 5000);
    })();
    return () => {
      mounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (newsIntervalRef.current) clearInterval(newsIntervalRef.current);
      if (portfolioPushTimer.current) clearTimeout(portfolioPushTimer.current);
      if (respSub) respSub.remove();
      if (foregroundSub) foregroundSub.remove();
      if (inboxSub) inboxSub();
      if (onboardingSubRef.current) {
        onboardingSubRef.current.remove();
        onboardingSubRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function serverAlertToLocal(s: ServerAlert): PriceAlert {
    const meta = findMetaByCode(s.code);
    const isGold =
      meta?.group?.startsWith("gold") ||
      meta?.group === "metal" ||
      meta?.group === "silver" ||
      meta?.category === "MADEN" ||
      meta?.category === "SARRAFIYE" ||
      meta?.category === "GRAM ALTIN";
    return {
      id: s.id,
      type: isGold ? "gold" : "currency",
      code: s.code,
      name: s.name,
      nameTR: s.nameTR,
      targetPrice: s.target,
      direction: s.type,
      active: s.active,
      triggered: !s.active && Boolean(s.triggeredAt),
    };
  }

  const loadStoredData = async () => {
    try {
      const [
        storedPortfolio,
        storedFavorites,
        storedHistory,
        storedPortfolioTs,
        storedFavoritesTs,
      ] = await Promise.all([
        AsyncStorage.getItem("portfolio"),
        AsyncStorage.getItem("favorites"),
        AsyncStorage.getItem("priceHistory_v1"),
        AsyncStorage.getItem("portfolio_updatedAt"),
        AsyncStorage.getItem("favorites_updatedAt"),
      ]);
      if (storedPortfolio) {
        try {
          const parsed = JSON.parse(storedPortfolio) as PortfolioItem[];
          if (Array.isArray(parsed)) {
            setPortfolio(
              parsed.map((it) => ({
                ...it,
                side: it.side === "sell" ? "sell" : "buy",
              })),
            );
          }
        } catch {}
      }
      try {
        const snaps = await loadSnapshots();
        setPortfolioSnapshots(snaps);
      } catch {}
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      if (storedHistory) {
        try {
          const parsed = JSON.parse(storedHistory);
          if (parsed && typeof parsed === "object") {
            priceHistoryRef.current = parsed;
          }
        } catch {}
      }
      const pTs = storedPortfolioTs ? Number(storedPortfolioTs) : 0;
      const fTs = storedFavoritesTs ? Number(storedFavoritesTs) : 0;
      portfolioUpdatedAtRef.current = Number.isFinite(pTs) ? pTs : 0;
      favoritesUpdatedAtRef.current = Number.isFinite(fTs) ? fTs : 0;
    } catch {}
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Bulut senkronu yardımcıları
  // ──────────────────────────────────────────────────────────────────────────

  // Lokal portföyü ServerPortfolioItem formatına çevir (alanları sterilize et).
  const toServerPortfolio = (items: PortfolioItem[]): ServerPortfolioItem[] =>
    items.map((it) => ({
      id: it.id,
      type: it.type,
      code: it.code,
      name: it.name,
      nameTR: it.nameTR,
      amount: it.amount,
      purchasePrice: it.purchasePrice,
      purchaseDate: it.purchaseDate,
      side: it.side === "sell" ? "sell" : "buy",
    }));

  // Sunucudaki portföyü lokal PortfolioItem'a güvenle dönüştür.
  // Bozuk veya eksik item'ları sessizce atar (runtime hata olmasın).
  const fromServerPortfolio = (raw: unknown): PortfolioItem[] => {
    if (!Array.isArray(raw)) return [];
    const out: PortfolioItem[] = [];
    for (const it of raw) {
      if (!it || typeof it !== "object") continue;
      const o = it as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : null;
      const code = typeof o.code === "string" ? o.code : null;
      const amount =
        typeof o.amount === "number" && Number.isFinite(o.amount) ? o.amount : null;
      const purchasePrice =
        typeof o.purchasePrice === "number" && Number.isFinite(o.purchasePrice)
          ? o.purchasePrice
          : null;
      if (!id || !code || amount === null || purchasePrice === null) continue;
      out.push({
        id,
        type: o.type === "gold" ? "gold" : "currency",
        code,
        name: typeof o.name === "string" ? o.name : code,
        nameTR: typeof o.nameTR === "string" ? o.nameTR : code,
        amount,
        purchasePrice,
        purchaseDate:
          typeof o.purchaseDate === "string" && o.purchaseDate
            ? o.purchaseDate
            : new Date().toISOString(),
        side: o.side === "sell" ? "sell" : "buy",
      });
    }
    return out;
  };

  // Portföy push'unu debounce eder; arka arkaya değişimlerde tek bir POST yapılır.
  const schedulePortfolioPush = useCallback(
    (items: PortfolioItem[], ts: number) => {
      if (portfolioPushTimer.current) clearTimeout(portfolioPushTimer.current);
      portfolioPushTimer.current = setTimeout(() => {
        const deviceId = deviceIdRef.current;
        if (!deviceId) return;
        apiSetPortfolio({
          deviceId,
          items: toServerPortfolio(items),
          clientUpdatedAt: ts,
        }).catch((err) => console.warn("[portfolio] sync hatası:", err));
      }, 3000);
    },
    []
  );

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
    const banks: GoldRate[] = [];

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
      } else if (g === "bank") {
        banks.push(toGoldRate(r));
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
      banks,
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
        ...buckets.banks,
      ];
      return all.find((r) => r.code === code);
    },
    [buckets]
  );

  const addToPortfolio = useCallback(
    async (item: Omit<PortfolioItem, "id">) => {
      const newItem: PortfolioItem = {
        ...item,
        side: item.side === "sell" ? "sell" : "buy",
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      const updated = [...portfolio, newItem];
      const ts = Date.now();
      setPortfolio(updated);
      portfolioUpdatedAtRef.current = ts;
      await AsyncStorage.multiSet([
        ["portfolio", JSON.stringify(updated)],
        ["portfolio_updatedAt", String(ts)],
      ]);
      schedulePortfolioPush(updated, ts);
    },
    [portfolio, schedulePortfolioPush]
  );

  const sellFromPortfolio = useCallback(
    async (input: {
      code: string;
      type: "currency" | "gold";
      name: string;
      nameTR: string;
      amount: number;
      price: number;
      date?: string;
    }): Promise<{ ok: true } | { ok: false; reason: "insufficient" }> => {
      const have = availableToSell(portfolio, input.code, input.type);
      if (input.amount <= 0 || input.amount > have + 1e-9) {
        return { ok: false, reason: "insufficient" };
      }
      const newItem: PortfolioItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: input.type,
        code: input.code,
        name: input.name,
        nameTR: input.nameTR,
        amount: input.amount,
        purchasePrice: input.price,
        purchaseDate: input.date ?? new Date().toISOString(),
        side: "sell",
      };
      const updated = [...portfolio, newItem];
      const ts = Date.now();
      setPortfolio(updated);
      portfolioUpdatedAtRef.current = ts;
      await AsyncStorage.multiSet([
        ["portfolio", JSON.stringify(updated)],
        ["portfolio_updatedAt", String(ts)],
      ]);
      schedulePortfolioPush(updated, ts);
      return { ok: true };
    },
    [portfolio, schedulePortfolioPush],
  );

  const getPriceHistory = useCallback(
    (code: string) => priceHistoryRef.current[code] ?? [],
    [],
  );

  const availableAmount = useCallback(
    (code: string, type: "currency" | "gold") => availableToSell(portfolio, code, type),
    [portfolio],
  );

  const removeManyFromPortfolio = useCallback(
    async (predicate: (p: PortfolioItem) => boolean) => {
      let updated: PortfolioItem[] = [];
      setPortfolio((prev) => {
        updated = prev.filter((p) => !predicate(p));
        return updated;
      });
      const ts = Date.now();
      portfolioUpdatedAtRef.current = ts;
      await AsyncStorage.multiSet([
        ["portfolio", JSON.stringify(updated)],
        ["portfolio_updatedAt", String(ts)],
      ]);
      schedulePortfolioPush(updated, ts);
    },
    [schedulePortfolioPush],
  );

  const removeFromPortfolio = useCallback(
    (id: string) => removeManyFromPortfolio((p) => p.id === id),
    [removeManyFromPortfolio],
  );

  const removeAllByAsset = useCallback(
    (code: string, type: "currency" | "gold") =>
      removeManyFromPortfolio((p) => p.code === code && p.type === type),
    [removeManyFromPortfolio],
  );

  const addAlert = useCallback(
    async (alert: Omit<PriceAlert, "id">) => {
      const deviceId = deviceIdRef.current;
      if (!deviceId) {
        console.warn("[alerts] deviceId hazır değil, alarm eklenemedi");
        return;
      }
      try {
        const { id } = await apiSaveAlert({
          deviceId,
          code: alert.code,
          type: alert.direction,
          target: alert.targetPrice,
          currency: "TRY",
          name: alert.name,
          nameTR: alert.nameTR,
        });
        setAlerts((prev) => [...prev, { ...alert, id }]);
      } catch (err) {
        console.warn("[alerts] eklenemedi:", err);
      }
    },
    []
  );

  const removeAlert = useCallback(
    async (id: string) => {
      const deviceId = deviceIdRef.current;
      // Optimistic remove
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      if (!deviceId) return;
      try {
        await apiDeleteAlert({ deviceId, id });
      } catch (err) {
        console.warn("[alerts] silinemedi:", err);
      }
    },
    []
  );

  const toggleFavorite = useCallback(
    async (code: string) => {
      const updated = favorites.includes(code)
        ? favorites.filter((f) => f !== code)
        : [...favorites, code];
      const ts = Date.now();
      setFavorites(updated);
      favoritesUpdatedAtRef.current = ts;
      await AsyncStorage.multiSet([
        ["favorites", JSON.stringify(updated)],
        ["favorites_updatedAt", String(ts)],
      ]);
      // Brifing + önemli hareket scheduler'ları için sunucuya senkronize et
      const deviceId = deviceIdRef.current;
      if (deviceId) {
        try {
          await apiSetPrefs({
            deviceId,
            favorites: updated,
            favoritesUpdatedAt: ts,
          });
        } catch (err) {
          console.warn("[favs] sync hatası:", err);
        }
      }
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

  const portfolioStats = useMemo(() => {
    const holdings = aggregateHoldings(portfolio, (code) => {
      const r = findRateByCode(code);
      if (!r) return undefined;
      return { buy: r.buy, prevClose: (r as GoldRate).prevClose };
    });
    return summarizePortfolio(holdings, (h) => {
      const r = findRateByCode(h.code);
      return bucketForCode(h.code, h.type, r?.group);
    });
  }, [portfolio, findRateByCode]);

  const getPortfolioTotalValue = useCallback(
    () => portfolioStats.totalValue,
    [portfolioStats],
  );

  const getPortfolioGainLoss = useCallback(() => {
    return {
      value: portfolioStats.totalReturn,
      percent: portfolioStats.totalReturnPercent,
    };
  }, [portfolioStats]);

  useEffect(() => {
    const { totalValue, totalCost } = portfolioStats;
    if (!isHydrated.current) return;
    setPortfolioSnapshots((prev) => {
      const { snapshots, changed } = upsertTodaySnapshot(prev, totalValue, totalCost);
      if (!changed) return prev;
      if (snapshotPersistTimer.current) clearTimeout(snapshotPersistTimer.current);
      snapshotPersistTimer.current = setTimeout(() => {
        void saveSnapshots(snapshots);
      }, 1500);
      return snapshots;
    });
  }, [portfolioStats]);

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

  const refreshNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const items = await apiGetNews();
      setNews(
        items.map((it: ServerNewsItem) => ({
          id: it.hashId,
          title: it.title,
          summary: it.summary,
          source: it.source,
          publishedAt: new Date(it.publishedAt).toISOString(),
          url: it.url,
          category: it.category,
          imageUrl: it.imageUrl,
        }))
      );
    } catch (err) {
      console.warn("[news] fetch hatası:", err);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const setNewsEnabled = useCallback(async (enabled: boolean) => {
    setPrefs((p) => ({ ...p, newsEnabled: enabled }));
    const deviceId = deviceIdRef.current;
    if (deviceId) {
      try { await apiSetPrefs({ deviceId, newsEnabled: enabled }); }
      catch (err) { console.warn("[prefs] kaydedilemedi:", err); }
    }
  }, []);

  const setNewsCategories = useCallback(async (cats: string[]) => {
    setPrefs((p) => ({ ...p, newsCategories: cats }));
    const deviceId = deviceIdRef.current;
    if (deviceId) {
      try { await apiSetPrefs({ deviceId, newsCategories: cats }); }
      catch (err) { console.warn("[prefs] kaydedilemedi:", err); }
    }
  }, []);

  const setBriefingEnabled = useCallback(async (enabled: boolean) => {
    setPrefs((p) => ({ ...p, briefingEnabled: enabled }));
    const deviceId = deviceIdRef.current;
    if (deviceId) {
      try { await apiSetPrefs({ deviceId, briefingEnabled: enabled }); }
      catch (err) { console.warn("[prefs] kaydedilemedi:", err); }
    }
  }, []);

  const setMovesEnabled = useCallback(async (enabled: boolean) => {
    setPrefs((p) => ({ ...p, movesEnabled: enabled }));
    const deviceId = deviceIdRef.current;
    if (deviceId) {
      try { await apiSetPrefs({ deviceId, movesEnabled: enabled }); }
      catch (err) { console.warn("[prefs] kaydedilemedi:", err); }
    }
  }, []);

  const setWeeklyEnabled = useCallback(async (enabled: boolean) => {
    setPrefs((p) => ({ ...p, weeklyEnabled: enabled }));
    // Local notification → cihazda schedule/cancel et
    void scheduleWeeklyPortfolioReminder(enabled);
    const deviceId = deviceIdRef.current;
    if (deviceId) {
      try { await apiSetPrefs({ deviceId, weeklyEnabled: enabled }); }
      catch (err) { console.warn("[prefs] kaydedilemedi:", err); }
    }
  }, []);

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
        banks: buckets.banks,
        portfolio,
        portfolioSnapshots,
        getPriceHistory,
        availableAmount,
        sellFromPortfolio,
        removeAllByAsset,
        alerts,
        news,
        newsLoading,
        refreshNews,
        prefs,
        setNewsEnabled,
        setNewsCategories,
        setBriefingEnabled,
        setMovesEnabled,
        setWeeklyEnabled,
        inboxUnread,
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
