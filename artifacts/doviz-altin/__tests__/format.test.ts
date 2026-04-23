import {
  formatPrice,
  formatPercent,
  formatTimeAgo,
  formatDate,
  formatChange,
} from "@/lib/utils/format";
import {
  formatSymbolName,
  getCategoryTitle,
  getCategorySubtitle,
  getSymbolDescription,
} from "@/lib/utils/symbolDescriptions";

describe("formatPrice", () => {
  it("binlik üstü değerleri 0 ondalıkla TR lokalinde döker", () => {
    expect(formatPrice(2855.4)).toBe("2.855");
    expect(formatPrice(45100.5)).toBe("45.101");
  });
  it("10 ile 1000 arası 2 ondalık", () => {
    expect(formatPrice(34.218)).toBe("34,22");
  });
  it("1 ile 10 arası 4 ondalık", () => {
    expect(formatPrice(1.2345)).toBe("1,2345");
  });
  it("1 altı 6 ondalık (parite/kripto için)", () => {
    expect(formatPrice(0.123456789)).toBe("0,123457");
  });
  it("geçersiz girdiler em-dash döner", () => {
    expect(formatPrice(NaN)).toBe("—");
    expect(formatPrice(Infinity)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("0 ve geçersiz değerlerde sıfır metni döner", () => {
    expect(formatPercent(0)).toBe("0,00%");
    expect(formatPercent(NaN)).toBe("0,00%");
  });
  it("pozitifte ▲, negatifte ▼ kullanır ve abs alır", () => {
    expect(formatPercent(0.42)).toBe("▲ 0,42%");
    expect(formatPercent(-1.567)).toBe("▼ 1,57%");
  });
});

describe("formatTimeAgo", () => {
  const now = new Date("2026-04-23T12:00:00Z").getTime();
  it("30 sn altı 'şimdi'", () => {
    expect(formatTimeAgo(now - 5_000, now)).toBe("şimdi");
  });
  it("dakika/saat/gün/ay/yıl ölçeklenir", () => {
    expect(formatTimeAgo(now - 5 * 60 * 1000, now)).toBe("5 dk önce");
    expect(formatTimeAgo(now - 2 * 60 * 60 * 1000, now)).toBe("2 sa önce");
    expect(formatTimeAgo(now - 3 * 24 * 60 * 60 * 1000, now)).toBe("3 g önce");
    expect(formatTimeAgo(now - 60 * 24 * 60 * 60 * 1000, now)).toBe("2 ay önce");
    expect(formatTimeAgo(now - 800 * 24 * 60 * 60 * 1000, now)).toBe("2 yıl önce");
  });
  it("0/negatif/NaN için em-dash", () => {
    expect(formatTimeAgo(0, now)).toBe("—");
    expect(formatTimeAgo(NaN, now)).toBe("—");
  });
});

describe("formatDate", () => {
  it("yıl dahil tarih (TR ay kısaltmaları)", () => {
    expect(formatDate(new Date("2026-04-23T12:00:00Z"))).toBe("23 Nis 2026");
  });
  it("withTime=true saat ekler, yıl atar", () => {
    const d = new Date(2026, 3, 23, 14, 5);
    expect(formatDate(d, true)).toBe("23 Nis 14:05");
  });
  it("geçersiz girdide em-dash", () => {
    expect(formatDate(NaN)).toBe("—");
  });
});

describe("formatChange", () => {
  it("pozitifte +, negatifte − ve 2 ondalık", () => {
    expect(formatChange(12.345)).toBe("+12,35");
    expect(formatChange(-3.4)).toBe("−3,40");
    expect(formatChange(0)).toBe("0,00");
  });
});

describe("formatSymbolName", () => {
  it("kısa kodlar değişmez", () => {
    expect(formatSymbolName("USD")).toBe("USD");
    expect(formatSymbolName("EUR")).toBe("EUR");
  });
  it("underscore'lu kodlar bilinmiyorsa nokta-ayraç ile bölünür", () => {
    expect(formatSymbolName("FOO_BAR_BAZ")).toBe("FOO · BAR · BAZ");
  });
  it("boş kod kendini döner", () => {
    expect(formatSymbolName("")).toBe("");
  });
});

describe("getCategoryTitle / getCategorySubtitle / getSymbolDescription", () => {
  it("bilinen kategorilere TR başlık döner", () => {
    expect(getCategoryTitle("DOVIZ")).toBe("Döviz Kurları");
    expect(getCategoryTitle("MADEN")).toBe("Değerli Madenler");
    expect(getCategorySubtitle("PARITE")).toBe("Çapraz döviz kurları");
  });
  it("bilinmeyen kategori orijinal döner, alt başlık undefined", () => {
    expect(getCategoryTitle("UNKNOWN")).toBe("UNKNOWN");
    expect(getCategorySubtitle("UNKNOWN")).toBeUndefined();
  });
  it("bilinmeyen koda null açıklama döner", () => {
    expect(getSymbolDescription("ZZZ_NOPE")).toBeNull();
  });
});
