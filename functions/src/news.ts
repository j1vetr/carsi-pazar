import { logger } from "firebase-functions";

export type NewsCategory = "Altın" | "Döviz" | "Merkez Bankası" | "Emtia" | "Ekonomi" | "Parite";

export interface RssSource {
  name: string;
  url: string;
  defaultCategory?: NewsCategory;
}

export const RSS_SOURCES: RssSource[] = [
  // Yüksek sinyalli kaynaklar (altın/döviz odaklı yayın yapıyor)
  { name: "Bloomberg HT", url: "https://www.bloomberght.com/rss/ekonomi" },
  { name: "Dünya Gazetesi", url: "https://www.dunya.com/rss?dunya=ekonomi" },
  { name: "NTV Ekonomi", url: "https://www.ntv.com.tr/ekonomi.rss" },
  { name: "Habertürk Ekonomi", url: "https://www.haberturk.com/rss/kategori/ekonomi.xml" },
  { name: "Ekonomim", url: "https://www.ekonomim.com/rss" },
  { name: "ParaAnaliz", url: "https://www.paraanaliz.com/feed/" },
  // Investing.com kategori-spesifik beslemeler (zaten döviz/emtia ön etiketli)
  { name: "Investing.com Emtia", url: "https://tr.investing.com/rss/news_11.rss", defaultCategory: "Emtia" },
  { name: "Investing.com Döviz", url: "https://tr.investing.com/rss/news_301.rss", defaultCategory: "Döviz" },
];

// Pozitif anahtar kelime listesi — başlık veya özette en az biri geçmeli.
// Türkçe ek/çekim için \b yerine kelime kökü bazlı sınır kullanıyoruz.
const POSITIVE_KEYWORDS = [
  // Altın ve metaller
  "altın", "altin", "ons", "çeyrek", "ceyrek", "yarım altın", "yarim altin", "tam altın", "tam altin",
  "cumhuriyet altın", "cumhuriyet altin", "ata altın", "ata altin", "reşat altın", "resat altin",
  "gremese", "bilezik", "gram altın", "gram altin", "külçe altın", "kulce altin", "sarrafiye",
  "kapalıçarşı", "kapalicarsi", "gümüş", "gumus", "platin", "paladyum",
  // Döviz / parite
  "dolar", "usd", "euro", " eur ", "eur/", "eur ", "sterlin", "gbp", "frank", "chf", "yen", "jpy",
  "riyal", "sar", "rubl", "rub", "yuan", "kur ", "döviz", "doviz", "parite", "çapraz kur",
  "capraz kur", "dxy", "swap",
  // Merkez bankası / faiz
  "fed", "powell", "tcmb", "merkez bankası", "merkez bankasi", "ecb", "lagarde", "boj", "boe",
  "faiz karar", "faiz indirim", "faiz artır", "faiz artir", "ppk", "fomc", "para politika",
  "enflasyon", "tüfe", "tufe", "üfe", "ufe", "swap puan",
];

// Negatif anahtar kelime listesi — bu kelimeleri içeren ve aynı zamanda altın/döviz
// kelimesi GEÇMEYEN haberler atılır. (Eşleşen kelime varsa zaten düşer; bu blok
// borsa/şirket gürültüsünü temizler.)
const NEGATIVE_HARD = [
  "bist", "borsa istanbul", " hisse ", " hisseler", "ipo", "halka arz", "kâr payı", "kar payi",
  "temettü", "temettu", "perakende sat", "otomotiv sat", "konut sat", "kira artış",
  "asgari ücret", "asgari ucret", "emekli maaş", "emekli maas", "futbol", "spor", "transfer",
  "magazin", "diziler", "sinema", "iphone", "samsung", "android", "yapay zeka",
];

function lower(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/[İI]/g, "i")
    .replace(/[Ğğ]/g, "g")
    .replace(/[Üü]/g, "u")
    .replace(/[Şş]/g, "s")
    .replace(/[Öö]/g, "o")
    .replace(/[Çç]/g, "c");
}

export function isRelevantToFinance(title: string, summary: string): boolean {
  const text = ` ${title} ${summary} `;
  const lc = lower(text);
  // Eski ASCII'siz kontrolü için iki versiyona da bakıyoruz
  const orig = text.toLocaleLowerCase("tr-TR");
  const matchesPositive = POSITIVE_KEYWORDS.some((kw) => orig.includes(kw) || lc.includes(lower(kw)));
  if (!matchesPositive) return false;
  const matchesNegativeHard = NEGATIVE_HARD.some((kw) => orig.includes(kw) || lc.includes(lower(kw)));
  if (matchesNegativeHard) {
    // Negatif kelime + altın/döviz beraber geçiyorsa yine de kabul; ama negatif
    // baskınsa (mesela "BIST 100 günü değişimle kapattı" → kapanış yok; ama
    // "Borsa İstanbul'da dolar yükseldi" → kabul) → pozitif eşleşme yeterli.
    // Yine de "bist" başlığın ilk 30 karakterinde geçiyorsa borsa odaklı say ve at.
    const firstPart = orig.slice(0, 60);
    if (firstPart.includes("bist") || firstPart.includes("borsa istanbul")) return false;
  }
  return true;
}

export interface ParsedItem {
  title: string;
  url: string;
  summary: string;
  publishedAt: number;
  imageUrl: string | null;
  source: string;
  category: NewsCategory;
  hashId: string;
}

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&#39;": "'",
  "&nbsp;": " ", "&ouml;": "ö", "&uuml;": "ü", "&auml;": "ä",
  "&Ouml;": "Ö", "&Uuml;": "Ü", "&ccedil;": "ç", "&Ccedil;": "Ç",
  "&scaron;": "š", "&Scaron;": "Š",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&[a-zA-Z]+;/g, (m) => ENTITY_MAP[m] ?? m);
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function unwrapCdata(s: string): string {
  const m = s.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return m ? m[1] : s;
}

function takeTag(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  if (!m) return null;
  return decodeEntities(unwrapCdata(m[1])).trim();
}

function takeAttr(xml: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}\\b[^>]*\\b${attr}="([^"]+)"`, "i");
  const m = xml.match(re);
  return m ? m[1] : null;
}

function findFirstImage(xml: string): string | null {
  const enclosure = takeAttr(xml, "enclosure", "url");
  if (enclosure && /\.(jpg|jpeg|png|webp|gif)/i.test(enclosure)) return enclosure;
  const media = takeAttr(xml, "media:content", "url");
  if (media) return media;
  const mediaThumb = takeAttr(xml, "media:thumbnail", "url");
  if (mediaThumb) return mediaThumb;
  const desc = takeTag(xml, "description") ?? takeTag(xml, "content:encoded") ?? "";
  const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];
  return null;
}

function parsePubDate(s: string | null): number {
  if (!s) return Date.now();
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : Date.now();
}

function categorize(title: string, summary: string, def?: NewsCategory): NewsCategory {
  const text = `${title} ${summary}`.toLowerCase();
  if (/(gram\s*alt[ıi]n|ons\s*alt[ıi]n|alt[ıi]n|çeyrek|cumhuriyet alt[ıi]n[ıi]|gümüş|platin|paladyum|sarrafiye|kapal[ıi]çarş[ıi]|bilezik)/.test(text)) {
    return "Altın";
  }
  if (/(fed\b|powell|tcmb|merkez bankası|ecb|lagarde|boj|boe|faiz karar[ıi]|faiz indir|faiz art[ıi]r|ppk|fomc|para politika)/.test(text)) {
    return "Merkez Bankası";
  }
  if (/(parite|eur\/?usd|usd\/?try|eur\/?try|gbp\/?usd|usd\/?jpy|capraz|çapraz|dxy)/.test(text)) {
    return "Parite";
  }
  if (/(dolar\b|euro\b|sterlin|yen\b|kur\b|döviz|d[oö]viz|usd\b|eur\b|gbp\b|chf\b|jpy\b)/.test(text)) {
    return "Döviz";
  }
  if (/(petrol|brent|doğalgaz|do[gğ]al gaz|emtia|bak[ıi]r|nikel)/.test(text)) {
    return "Emtia";
  }
  return def ?? "Ekonomi";
}

function hashCode(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function normalizeKey(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9çğıöşü ]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export async function fetchAndParseRss(source: RssSource): Promise<ParsedItem[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(source.url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "CarsiPazar/1.0 (+https://carsipazar.app) NewsAggregator",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    if (!r.ok) {
      logger.warn(`[news] ${source.name} HTTP ${r.status}`);
      return [];
    }
    const xml = await r.text();
    const items: ParsedItem[] = [];
    const itemRe = /<item\b[\s\S]*?<\/item>/gi;
    const matches = xml.match(itemRe) ?? [];
    for (const block of matches) {
      const title = stripHtml(takeTag(block, "title") ?? "");
      const link = (takeTag(block, "link") ?? takeAttr(block, "link", "href") ?? "").trim();
      if (!title || !link) continue;
      const rawDesc = takeTag(block, "description") ?? takeTag(block, "summary") ?? "";
      const summary = stripHtml(rawDesc).slice(0, 280);
      const pubDate = parsePubDate(takeTag(block, "pubDate") ?? takeTag(block, "dc:date") ?? takeTag(block, "published"));
      const image = findFirstImage(block);
      if (!image) continue;
      // Sert konu filtresi: altın/döviz/merkez bankası dışı haberleri at
      if (!isRelevantToFinance(title, summary)) continue;
      const category = categorize(title, summary, source.defaultCategory);
      // "Ekonomi" katch-all kategorisi artık kabul edilmiyor — tema alakasızsa düş
      if (category === "Ekonomi") continue;
      const key = normalizeKey(title);
      items.push({
        title, url: link, summary, publishedAt: pubDate,
        imageUrl: image, source: source.name, category, hashId: hashCode(`${source.name}|${key}`),
      });
    }
    return items;
  } catch (err) {
    logger.warn(`[news] ${source.name} error: ${(err as Error).message}`);
    return [];
  } finally {
    clearTimeout(t);
  }
}

export function dedupeByTitle(items: ParsedItem[]): ParsedItem[] {
  const withImage = items.filter((it) => !!it.imageUrl && it.imageUrl.length > 0);
  const seen = new Map<string, ParsedItem>();
  for (const it of withImage.sort((a, b) => b.publishedAt - a.publishedAt)) {
    const k = normalizeKey(it.title);
    if (!seen.has(k)) seen.set(k, it);
  }
  return Array.from(seen.values()).sort((a, b) => b.publishedAt - a.publishedAt);
}
