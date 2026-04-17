import type { CurrencyRate, GoldRate } from "@/contexts/AppContext";

const API_URL = "https://api.finansveri.com/v1/fiyatlar";
const API_KEY = process.env.EXPO_PUBLIC_FINANSVERI_API_KEY ?? "";

export interface RawPrice {
  bid: number;
  ask: number;
  timestamp?: number;
}

export interface RawPricesResponse {
  fiyatlar: Record<string, Record<string, RawPrice>>;
  guncellendi: number;
}

const CURRENCY_MAP: Array<{
  code: string;
  symbol: string;
  name: string;
  nameTR: string;
  flag: string;
}> = [
  { code: "USD", symbol: "USDTRY", name: "US Dollar", nameTR: "Amerikan Doları", flag: "US" },
  { code: "EUR", symbol: "EURTRY", name: "Euro", nameTR: "Euro", flag: "EU" },
  { code: "GBP", symbol: "GBPTRY", name: "British Pound", nameTR: "İngiliz Sterlini", flag: "GB" },
  { code: "CHF", symbol: "CHFTRY", name: "Swiss Franc", nameTR: "İsviçre Frangı", flag: "CH" },
  { code: "JPY", symbol: "JPYTRY", name: "Japanese Yen", nameTR: "Japon Yeni", flag: "JP" },
  { code: "SAR", symbol: "SARTRY", name: "Saudi Riyal", nameTR: "Suudi Arabistan Riyali", flag: "SA" },
  { code: "AED", symbol: "AEDTRY", name: "UAE Dirham", nameTR: "Birleşik Arap Emirlikleri Dirhemi", flag: "AE" },
  { code: "CAD", symbol: "CADTRY", name: "Canadian Dollar", nameTR: "Kanada Doları", flag: "CA" },
  { code: "AUD", symbol: "AUDTRY", name: "Australian Dollar", nameTR: "Avustralya Doları", flag: "AU" },
  { code: "CNY", symbol: "CNYTRY", name: "Chinese Yuan", nameTR: "Çin Yuanı", flag: "CN" },
  { code: "RUB", symbol: "RUBTRY", name: "Russian Ruble", nameTR: "Rus Rublesi", flag: "RU" },
  { code: "DKK", symbol: "DKKTRY", name: "Danish Krone", nameTR: "Danimarka Kronu", flag: "DK" },
  { code: "SEK", symbol: "SEKTRY", name: "Swedish Krona", nameTR: "İsveç Kronu", flag: "SE" },
  { code: "NOK", symbol: "NOKTRY", name: "Norwegian Krone", nameTR: "Norveç Kronu", flag: "NO" },
];

interface GoldMapEntry {
  code: string;
  category: "MADEN" | "GRAM ALTIN" | "SARRAFIYE" | "SARAFIYE";
  symbols: string[];
  name: string;
  nameTR: string;
  unit: string;
  icon: string;
}

const GOLD_MAP: GoldMapEntry[] = [
  { code: "ALTIN", category: "MADEN", symbols: ["ALTIN", "GRAMALTIN", "GA"], name: "Gram Altın", nameTR: "Gram Altın (Has)", unit: "gr", icon: "ALTIN" },
  { code: "ONS", category: "MADEN", symbols: ["XAUUSD", "ONS"], name: "Ons Altın", nameTR: "Ons Altın (USD)", unit: "ons", icon: "ALTIN" },
  { code: "CEYREK", category: "SARRAFIYE", symbols: ["CEYREK_YENI", "YENI_CEYREK", "CEYREK"], name: "Çeyrek Altın", nameTR: "Çeyrek Altın (Yeni)", unit: "adet", icon: "CEYREK" },
  { code: "YARIM", category: "SARRAFIYE", symbols: ["YARIM_YENI", "YENI_YARIM", "YARIM"], name: "Yarım Altın", nameTR: "Yarım Altın (Yeni)", unit: "adet", icon: "YARIM" },
  { code: "TAM", category: "SARRAFIYE", symbols: ["TEK_YENI", "YENI_TAM", "TAM_YENI", "TAM"], name: "Tam Altın", nameTR: "Tam Altın (Yeni)", unit: "adet", icon: "TAM" },
  { code: "ATA", category: "SARRAFIYE", symbols: ["ATA_YENI", "ATA"], name: "Ata Altın", nameTR: "Atatürk Altını (Yeni)", unit: "adet", icon: "ATA" },
  { code: "ATA5", category: "SARRAFIYE", symbols: ["ATA5_YENI", "ATA5", "BES_ATA"], name: "Ata 5'li", nameTR: "5'li Ata (Yeni)", unit: "adet", icon: "ATA5" },
  { code: "GRAM22", category: "MADEN", symbols: ["AYAR22", "22AYAR", "BILEZIK22"], name: "22 Ayar Bilezik", nameTR: "22 Ayar Altın (gram)", unit: "gr", icon: "GRAM22" },
  { code: "AYAR14", category: "SARRAFIYE", symbols: ["AYAR14", "14AYAR"], name: "14 Ayar Altın", nameTR: "14 Ayar Altın (gram)", unit: "gr", icon: "GRAM22" },
  { code: "KULCE", category: "SARRAFIYE", symbols: ["KULCEALTIN", "KULCE"], name: "Külçe Altın", nameTR: "Külçe Altın", unit: "kg", icon: "ALTIN" },
  { code: "GUMUS", category: "MADEN", symbols: ["GUMTRY", "GUMUS", "XAGUSD"], name: "Gümüş", nameTR: "Gümüş (gram TL)", unit: "gr", icon: "GUMUS" },
];

function findInCategory(
  data: RawPricesResponse["fiyatlar"],
  categoryNames: string[],
  symbolCandidates: string[]
): RawPrice | null {
  for (const cat of categoryNames) {
    const group = data[cat];
    if (!group) continue;
    for (const sym of symbolCandidates) {
      if (group[sym]) return group[sym];
    }
    for (const key of Object.keys(group)) {
      const upper = key.toUpperCase().replace(/[_\s]/g, "");
      for (const sym of symbolCandidates) {
        if (upper === sym.toUpperCase().replace(/[_\s]/g, "")) {
          return group[key];
        }
      }
    }
  }
  return null;
}

export interface PreviousPriceCache {
  [code: string]: { buy: number; sell: number };
}

export async function fetchAllPrices(): Promise<RawPricesResponse> {
  if (!API_KEY) {
    throw new Error("FINANSVERI_API_KEY tanımlı değil");
  }
  const res = await fetch(API_URL, {
    headers: { "X-API-Key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`API hatası: ${res.status}`);
  }
  return (await res.json()) as RawPricesResponse;
}

export function mapToCurrencies(
  data: RawPricesResponse,
  prevCache: PreviousPriceCache
): CurrencyRate[] {
  const doviz = data.fiyatlar?.DOVIZ ?? data.fiyatlar?.["DÖVİZ"] ?? {};
  const out: CurrencyRate[] = [];
  for (const m of CURRENCY_MAP) {
    const raw = doviz[m.symbol];
    if (!raw) continue;
    const prev = prevCache[m.code];
    const prevClose = prev?.buy ?? raw.bid;
    const change = raw.bid - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
    out.push({
      code: m.code,
      name: m.name,
      nameTR: m.nameTR,
      buy: raw.bid,
      sell: raw.ask,
      change,
      changePercent,
      prevClose,
      flag: m.flag,
    });
  }
  return out;
}

export function mapToGold(
  data: RawPricesResponse,
  prevCache: PreviousPriceCache
): GoldRate[] {
  const out: GoldRate[] = [];
  for (const m of GOLD_MAP) {
    const categoryAliases =
      m.category === "SARRAFIYE"
        ? ["SARRAFIYE", "SARAFIYE", "SARRAFİYE"]
        : m.category === "GRAM ALTIN"
        ? ["GRAM ALTIN", "GRAMALTIN", "MADEN"]
        : [m.category, "GRAM ALTIN", "GRAMALTIN"];
    const raw = findInCategory(data.fiyatlar ?? {}, categoryAliases, m.symbols);
    if (!raw) continue;
    const prev = prevCache[m.code];
    const prevClose = prev?.buy ?? raw.bid;
    const change = raw.bid - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
    out.push({
      code: m.code,
      name: m.name,
      nameTR: m.nameTR,
      buy: raw.bid,
      sell: raw.ask,
      change,
      changePercent,
      unit: m.unit,
      icon: m.icon,
    });
  }
  return out;
}

export function inspectCategories(data: RawPricesResponse) {
  return Object.fromEntries(
    Object.entries(data.fiyatlar ?? {}).map(([cat, syms]) => [cat, Object.keys(syms)])
  );
}
