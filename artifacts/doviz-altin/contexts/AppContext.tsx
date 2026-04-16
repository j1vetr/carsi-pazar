import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CurrencyRate {
  code: string;
  name: string;
  nameTR: string;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
  prevClose: number;
  flag?: string;
}

export interface GoldRate {
  code: string;
  name: string;
  nameTR: string;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
  unit: string;
  icon?: string;
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
  goldRates: GoldRate[];
  portfolio: PortfolioItem[];
  alerts: PriceAlert[];
  news: NewsItem[];
  economicEvents: EconomicEvent[];
  isLoading: boolean;
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
}

const AppContext = createContext<AppContextType | null>(null);

const DEMO_CURRENCIES: CurrencyRate[] = [
  {
    code: "USD",
    name: "US Dollar",
    nameTR: "Amerikan Doları",
    buy: 38.2540,
    sell: 38.2980,
    change: 0.1240,
    changePercent: 0.325,
    prevClose: 38.1300,
    flag: "US",
  },
  {
    code: "EUR",
    name: "Euro",
    nameTR: "Euro",
    buy: 41.1820,
    sell: 41.2350,
    change: -0.0980,
    changePercent: -0.238,
    prevClose: 41.2800,
    flag: "EU",
  },
  {
    code: "GBP",
    name: "British Pound",
    nameTR: "İngiliz Sterlini",
    buy: 48.2960,
    sell: 48.3620,
    change: 0.2140,
    changePercent: 0.444,
    prevClose: 48.0820,
    flag: "GB",
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    nameTR: "İsviçre Frangı",
    buy: 42.8450,
    sell: 42.9100,
    change: -0.1560,
    changePercent: -0.363,
    prevClose: 43.0010,
    flag: "CH",
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    nameTR: "Japon Yeni",
    buy: 0.2482,
    sell: 0.2491,
    change: 0.0012,
    changePercent: 0.486,
    prevClose: 0.2470,
    flag: "JP",
  },
  {
    code: "SAR",
    name: "Saudi Riyal",
    nameTR: "Suudi Arabistan Riyali",
    buy: 10.1820,
    sell: 10.2140,
    change: 0.0320,
    changePercent: 0.315,
    prevClose: 10.1500,
    flag: "SA",
  },
  {
    code: "AED",
    name: "UAE Dirham",
    nameTR: "Birleşik Arap Emirlikleri Dirhemi",
    buy: 10.4120,
    sell: 10.4480,
    change: 0.0340,
    changePercent: 0.327,
    prevClose: 10.3780,
    flag: "AE",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    nameTR: "Kanada Doları",
    buy: 27.2840,
    sell: 27.3280,
    change: -0.0420,
    changePercent: -0.154,
    prevClose: 27.3260,
    flag: "CA",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    nameTR: "Avustralya Doları",
    buy: 24.0120,
    sell: 24.0580,
    change: 0.0890,
    changePercent: 0.372,
    prevClose: 23.9230,
    flag: "AU",
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    nameTR: "Çin Yuanı",
    buy: 5.2840,
    sell: 5.3020,
    change: 0.0140,
    changePercent: 0.265,
    prevClose: 5.2700,
    flag: "CN",
  },
];

const DEMO_GOLD: GoldRate[] = [
  {
    code: "ALTIN",
    name: "Has Altın",
    nameTR: "Has Altın (24 Ayar)",
    buy: 4124.50,
    sell: 4138.20,
    change: 24.80,
    changePercent: 0.604,
    unit: "gr",
    icon: "ALTIN",
  },
  {
    code: "CEYREK",
    name: "Çeyrek Altın",
    nameTR: "Çeyrek Altın",
    buy: 6852.40,
    sell: 6875.30,
    change: 38.20,
    changePercent: 0.559,
    unit: "adet",
    icon: "CEYREK",
  },
  {
    code: "YARIM",
    name: "Yarım Altın",
    nameTR: "Yarım Altın",
    buy: 13704.80,
    sell: 13750.60,
    change: 76.40,
    changePercent: 0.559,
    unit: "adet",
    icon: "YARIM",
  },
  {
    code: "TAM",
    name: "Tam Altın",
    nameTR: "Tam Altın (Cumhuriyet)",
    buy: 27409.60,
    sell: 27501.20,
    change: 152.80,
    changePercent: 0.559,
    unit: "adet",
    icon: "TAM",
  },
  {
    code: "ATA",
    name: "Ata Altın",
    nameTR: "Atatürk Altını",
    buy: 28960.40,
    sell: 29053.80,
    change: 161.20,
    changePercent: 0.558,
    unit: "adet",
    icon: "ATA",
  },
  {
    code: "ATA5",
    name: "Ata 5'li",
    nameTR: "5'li Atatürk Altını",
    buy: 144302.00,
    sell: 144780.00,
    change: 806.00,
    changePercent: 0.560,
    unit: "adet",
    icon: "ATA5",
  },
  {
    code: "GRAM22",
    name: "22 Ayar Bilezik",
    nameTR: "22 Ayar Altın (gram)",
    buy: 3780.20,
    sell: 3792.40,
    change: 21.60,
    changePercent: 0.574,
    unit: "gr",
    icon: "GRAM22",
  },
  {
    code: "RESAT",
    name: "Reşat Altını",
    nameTR: "Reşat Altını",
    buy: 29240.60,
    sell: 29334.00,
    change: 163.00,
    changePercent: 0.560,
    unit: "adet",
    icon: "RESAT",
  },
  {
    code: "GUMUS",
    name: "Gümüş",
    nameTR: "Gümüş (gram)",
    buy: 47.82,
    sell: 48.04,
    change: 0.28,
    changePercent: 0.588,
    unit: "gr",
    icon: "GUMUS",
  },
];

const DEMO_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Fed Başkanı Powell: Faiz kararlarında sabırlı olacağız",
    summary: "Federal Rezerv Başkanı Jerome Powell, yüksek enflasyonun geride kaldığını ancak faiz indirimlerinde aceleci olmayacaklarını belirtti.",
    source: "Bloomberg HT",
    publishedAt: "2026-04-16T09:30:00",
    url: "#",
    category: "Merkez Bankası",
  },
  {
    id: "2",
    title: "Altın fiyatları jeopolitik gerilimle rekor kırdı",
    summary: "Ons altın, küresel belirsizlik ortamında 3.250 dolar sınırını aşarak yeni rekor seviyesine ulaştı.",
    source: "Anadolu Ajansı",
    publishedAt: "2026-04-16T08:15:00",
    url: "#",
    category: "Emtia",
  },
  {
    id: "3",
    title: "TCMB faiz kararı açıklandı: Beklenmedik değişiklik yok",
    summary: "Türkiye Cumhuriyet Merkez Bankası Para Politikası Kurulu, politika faizini sabit tutmaya devam etti.",
    source: "TCMB",
    publishedAt: "2026-04-16T07:45:00",
    url: "#",
    category: "TCMB",
  },
  {
    id: "4",
    title: "Dolar/TL kurunda son durum: Piyasalar ne bekliyor?",
    summary: "ABD-Türkiye ticaret ilişkilerindeki gelişmeler ve yurt içi ekonomik veriler doların seyrine yön veriyor.",
    source: "Ekonomist",
    publishedAt: "2026-04-15T22:00:00",
    url: "#",
    category: "Döviz",
  },
  {
    id: "5",
    title: "Enflasyon verisi açıklandı: TÜİK rakamları",
    summary: "Mart 2026 enflasyon rakamları piyasa beklentilerinin altında kaldı. Analistler önümüzdeki dönem için tahminlerini revize ediyor.",
    source: "TÜİK",
    publishedAt: "2026-04-15T19:30:00",
    url: "#",
    category: "Ekonomi",
  },
  {
    id: "6",
    title: "Euro/Dolar paritesinde sert hareketler",
    summary: "ECB'nin açıkladığı politika kararları sonrasında Euro/Dolar paritesi gün içinde %0.8 değer kazandı.",
    source: "Reuters",
    publishedAt: "2026-04-15T17:20:00",
    url: "#",
    category: "Döviz",
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
    actual: undefined,
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
    actual: undefined,
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
    actual: undefined,
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
    actual: undefined,
    forecast: "215K",
    previous: "220K",
    impact: "medium",
  },
  {
    id: "7",
    date: "2026-04-20",
    time: "10:00",
    country: "TR",
    flag: "TR",
    event: "Turizm Gelirleri",
    actual: undefined,
    forecast: undefined,
    previous: "$4.2B",
    impact: "low",
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

  data[data.length - 1].close = basePrice;
  return data;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currencies] = useState<CurrencyRate[]>(DEMO_CURRENCIES);
  const [goldRates] = useState<GoldRate[]>(DEMO_GOLD);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [favorites, setFavorites] = useState<string[]>(["USD", "EUR", "GBP", "ALTIN", "CEYREK"]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const historicalCache = useRef<Map<string, HistoricalPoint[]>>(new Map());

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedPortfolio, storedAlerts, storedFavorites] = await Promise.all([
        AsyncStorage.getItem("portfolio"),
        AsyncStorage.getItem("alerts"),
        AsyncStorage.getItem("favorites"),
      ]);
      if (storedPortfolio) setPortfolio(JSON.parse(storedPortfolio));
      if (storedAlerts) setAlerts(JSON.parse(storedAlerts));
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    } catch {}
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLastUpdated(new Date());
    setIsLoading(false);
  }, []);

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

      const allRates = [...currencies, ...goldRates] as (CurrencyRate | GoldRate)[];
      const rate = allRates.find((r) => r.code === code);
      const basePrice = rate ? (rate as CurrencyRate).buy ?? (rate as GoldRate).buy : 100;

      const pointsMap = { "1D": 48, "1W": 84, "1M": 90, "3M": 180, "1Y": 365 };
      const volatilityMap = {
        "1D": basePrice * 0.002,
        "1W": basePrice * 0.006,
        "1M": basePrice * 0.02,
        "3M": basePrice * 0.04,
        "1Y": basePrice * 0.08,
      };

      const data = generateHistoricalData(
        basePrice,
        volatilityMap[period],
        pointsMap[period]
      );
      historicalCache.current.set(cacheKey, data);
      return data;
    },
    [currencies, goldRates]
  );

  const getPortfolioTotalValue = useCallback(() => {
    return portfolio.reduce((total, item) => {
      const allRates = [...currencies, ...goldRates] as (CurrencyRate | GoldRate)[];
      const rate = allRates.find((r) => r.code === item.code);
      const currentPrice = rate ? (rate as CurrencyRate).buy ?? (rate as GoldRate).buy : item.purchasePrice;
      return total + item.amount * currentPrice;
    }, 0);
  }, [portfolio, currencies, goldRates]);

  const getPortfolioGainLoss = useCallback(() => {
    const totalValue = getPortfolioTotalValue();
    const totalCost = portfolio.reduce((sum, item) => sum + item.amount * item.purchasePrice, 0);
    const gainLoss = totalValue - totalCost;
    const percent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
    return { value: gainLoss, percent };
  }, [portfolio, getPortfolioTotalValue]);

  const convertAmount = useCallback(
    (fromCode: string, toCode: string, amount: number): number => {
      const allRates = [...currencies, ...goldRates] as (CurrencyRate | GoldRate)[];

      if (fromCode === "TRY") {
        const toRate = allRates.find((r) => r.code === toCode);
        if (!toRate) return 0;
        const price = (toRate as CurrencyRate).sell ?? (toRate as GoldRate).sell;
        return amount / price;
      }

      if (toCode === "TRY") {
        const fromRate = allRates.find((r) => r.code === fromCode);
        if (!fromRate) return 0;
        const price = (fromRate as CurrencyRate).buy ?? (fromRate as GoldRate).buy;
        return amount * price;
      }

      const fromRate = allRates.find((r) => r.code === fromCode);
      const toRate = allRates.find((r) => r.code === toCode);
      if (!fromRate || !toRate) return 0;
      const fromPrice = (fromRate as CurrencyRate).buy ?? (fromRate as GoldRate).buy;
      const toPrice = (toRate as CurrencyRate).sell ?? (toRate as GoldRate).sell;
      return (amount * fromPrice) / toPrice;
    },
    [currencies, goldRates]
  );

  return (
    <AppContext.Provider
      value={{
        currencies,
        goldRates,
        portfolio,
        alerts,
        news: DEMO_NEWS,
        economicEvents: DEMO_EVENTS,
        isLoading,
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
