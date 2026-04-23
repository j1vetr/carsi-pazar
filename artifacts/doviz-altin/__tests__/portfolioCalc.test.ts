import { aggregateHoldings, availableToSell, bucketForCode, summarizePortfolio } from "@/lib/utils/portfolioCalc";
import type { PortfolioItem } from "@/contexts/AppContext";

const item = (over: Partial<PortfolioItem>): PortfolioItem => ({
  id: "i" + Math.random().toString(36).slice(2),
  code: "USD",
  type: "currency",
  name: "USD",
  nameTR: "Dolar",
  side: "buy",
  amount: 1,
  purchasePrice: 30,
  purchaseDate: "2025-01-01T00:00:00.000Z",
  ...over,
});

describe("aggregateHoldings", () => {
  it("FIFO ile realized P/L hesaplar ve kalan miktarı korur", () => {
    const items: PortfolioItem[] = [
      item({ amount: 10, purchasePrice: 30, purchaseDate: "2025-01-01" }),
      item({ amount: 10, purchasePrice: 40, purchaseDate: "2025-02-01" }),
      item({ side: "sell", amount: 5, purchasePrice: 50, purchaseDate: "2025-03-01" }),
    ];
    const rate = () => ({ buy: 45, prevClose: 44 });
    const [h] = aggregateHoldings(items, rate);
    expect(h.amount).toBe(15);
    // ortalama maliyet 35; 5 birim 50'den satıldı → 75 realized
    expect(h.realized).toBeCloseTo(75, 5);
    expect(h.avgPrice).toBeCloseTo(35, 5);
    expect(h.currentValue).toBeCloseTo(15 * 45, 5);
    expect(h.dayChange).toBeCloseTo(15 * 1, 5);
  });

  it("eksiye sürmez: stoktan fazla satış sıfırlar", () => {
    const items: PortfolioItem[] = [
      item({ amount: 5, purchasePrice: 30 }),
      item({ side: "sell", amount: 10, purchasePrice: 40, purchaseDate: "2025-02-01" }),
    ];
    const [h] = aggregateHoldings(items, () => ({ buy: 35 }));
    expect(h.amount).toBe(0);
    expect(h.costBasis).toBe(0);
    // 5 birim 30 maliyetten 40'a satıldı → 50 realized
    expect(h.realized).toBeCloseTo(50, 5);
  });
});

describe("bucketForCode", () => {
  it("group öncelikle parity/metal'e gider", () => {
    expect(bucketForCode("EURUSD", "currency", "parity")).toBe("parity");
    expect(bucketForCode("XAU", "gold", "gold-parity")).toBe("parity");
    expect(bucketForCode("PLT", "gold", "metal")).toBe("metal");
    expect(bucketForCode("AGG", "gold", "silver")).toBe("metal");
  });
  it("group yoksa type'a düşer", () => {
    expect(bucketForCode("USD", "currency")).toBe("currency");
    expect(bucketForCode("ALTIN", "gold")).toBe("gold");
  });
});

describe("availableToSell", () => {
  it("alış − satış ile eldeki miktarı döner, asla negatif değil", () => {
    const items: PortfolioItem[] = [
      item({ amount: 10 }),
      item({ side: "sell", amount: 4 }),
      item({ side: "sell", amount: 100 }),
    ];
    expect(availableToSell(items, "USD", "currency")).toBe(0);
  });
});

describe("summarizePortfolio", () => {
  it("bucket'lara göre dağılım toplar", () => {
    const items: PortfolioItem[] = [
      item({ code: "USD", amount: 100, purchasePrice: 30 }),
      item({ code: "ALTIN", type: "gold", amount: 5, purchasePrice: 2000 }),
    ];
    const rate = (c: string) => ({ buy: c === "USD" ? 40 : 2500, prevClose: c === "USD" ? 39 : 2400 });
    const holdings = aggregateHoldings(items, rate);
    const stats = summarizePortfolio(holdings, (h) => bucketForCode(h.code, h.type));
    expect(stats.totalValue).toBeCloseTo(100 * 40 + 5 * 2500, 5);
    expect(stats.buckets.currency).toBeCloseTo(4000, 5);
    expect(stats.buckets.gold).toBeCloseTo(12500, 5);
  });
});
