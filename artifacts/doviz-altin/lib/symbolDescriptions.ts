import { findMetaByCode } from "./haremApi";

/**
 * Insan diline çevrilmiş kısa sembol açıklamaları.
 * ModernPriceRow alt satırında ONS_EUR gibi kodlar yerine bunları gösterir.
 */
const DESCRIPTIONS: Record<string, string> = {
  // Gram & ons altın
  ALTIN: "1 gram saf altın",
  GRAM_ALTIN: "1 gram saf altın",
  ONS: "1 troy ons (USD)",
  ONS_USD: "1 troy ons (USD)",
  ONS_EUR: "1 troy ons (EUR)",
  ONS_SPOT: "Anlık ons fiyatı",

  // Sarrafiye altın
  CEYREK: "Çeyrek altın · yeni emisyon",
  CEYREK_YENI: "Çeyrek altın · yeni emisyon",
  CEYREK_ESKI: "Çeyrek altın · eski emisyon",
  YARIM: "Yarım altın · yeni emisyon",
  YARIM_YENI: "Yarım altın · yeni emisyon",
  YARIM_ESKI: "Yarım altın · eski emisyon",
  TAM: "Tam altın · yeni emisyon",
  TAM_YENI: "Tam altın · yeni emisyon",
  TAM_ESKI: "Tam altın · eski emisyon",
  ATA: "Ata altın · yeni emisyon",
  ATA_YENI: "Ata altın · yeni emisyon",
  ATA_ESKI: "Ata altın · eski emisyon",
  ATA5: "Beşli ata · yeni emisyon",
  ATA5_YENI: "Beşli ata · yeni emisyon",
  ATA5_ESKI: "Beşli ata · eski emisyon",
  RESAT: "Reşat altın",
  GREMESE: "Gremese altın",
  GREMESE_YENI: "Gremese · yeni emisyon",
  GREMESE_ESKI: "Gremese · eski emisyon",

  // Külçe
  KULCE: "Külçe altın",
  BAR5: "5 gram külçe altın",
  BAR10: "10 gram külçe altın",
  BAR20: "20 gram külçe altın",
  BAR50: "50 gram külçe altın",
  BAR100: "100 gram külçe altın",
  GRAM5: "5 gram külçe altın",
  GRAM10: "10 gram külçe altın",
  GRAM20: "20 gram külçe altın",
  GRAM50: "50 gram külçe altın",
  GRAM100: "100 gram külçe altın",

  // Diğer metaller
  GUMUS: "1 gram gümüş (TRY)",
  GUMUS_TRY: "1 gram gümüş (TRY)",
  GUMUS_USD_GR: "1 gram gümüş (USD)",
  ONS_GUMUS: "1 troy ons gümüş",
  KG_GUMUS: "1 kg gümüş",
  PLATIN: "1 gram platin (TRY)",
  PLATIN_USD: "1 troy ons platin (USD)",
  PALADYUM: "1 gram paladyum (TRY)",
  PALADYUM_USD: "1 troy ons paladyum (USD)",

  // Pariteler
  PAR_USD: "Ons altın / USD paritesi",
  PAR_EUR: "Ons altın / EUR paritesi",
  PAR_GBP: "Ons altın / GBP paritesi",
  PAR_CHF: "Ons altın / CHF paritesi",
  AU_AG: "Altın / gümüş oranı",
  FARK: "Spot ile yurtiçi farkı",
  VADE_FARK: "Vadeli ile spot farkı",

  // Banka altın
  BANKA_ALTIN: "Banka altın hesabı",
  BANKAUSD: "Banka USD hesabı",
};

/** Bir sembol kodu için kısa Türkçe açıklama. Yoksa null. */
export function getSymbolDescription(code: string): string | null {
  return DESCRIPTIONS[code] ?? null;
}

/**
 * Bir sembol kodunu ekranda gösterilecek sade Türkçe ada çevirir.
 * - Underscore içermeyen kısa kodlar (USD, EUR, GBP) olduğu gibi döner.
 * - Underscore'lu kodlar (ONS_EUR, BANKA_ALTIN) önce nameTR'ye, yoksa
 *   ayraçla bölünmüş forma düşer.
 */
export function formatSymbolName(code: string): string {
  if (!code) return code;
  if (!code.includes("_")) return code;
  const meta = findMetaByCode(code);
  if (meta?.nameTR) return meta.nameTR;
  return code.replace(/_/g, " · ");
}

/**
 * API kategori başlıklarını (DOVIZ, MADEN, PARITE, GRAM ALTIN, SARRAFIYE)
 * kullanıcıya gösterilecek anlaşılır Türkçe başlıklara çevirir.
 */
const CATEGORY_TITLES: Record<string, { title: string; subtitle?: string }> = {
  DOVIZ: { title: "Döviz Kurları", subtitle: "Türk Lirası karşılığı" },
  MADEN: { title: "Değerli Madenler", subtitle: "Altın, gümüş, platin, paladyum" },
  PARITE: { title: "Uluslararası Pariteler", subtitle: "Çapraz döviz kurları" },
  "GRAM ALTIN": { title: "Gram & Külçe Altın", subtitle: "5 gr – 100 gr arası" },
  SARRAFIYE: { title: "Sarrafiye Altın", subtitle: "Çeyrek, yarım, tam, ata" },
};

export function getCategoryTitle(category: string): string {
  return CATEGORY_TITLES[category]?.title ?? category;
}

export function getCategorySubtitle(category: string): string | undefined {
  return CATEGORY_TITLES[category]?.subtitle;
}
