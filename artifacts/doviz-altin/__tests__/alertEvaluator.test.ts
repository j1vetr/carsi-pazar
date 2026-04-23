import {
  evaluatePriceAlert,
  evaluatePercentAlert,
  evaluateTrendAlert,
  evaluateVolatilityAlert,
  canFireAlert,
  type PricePoint,
} from "@/lib/utils/alertEvaluator";
import { PERMANENT_MUTE_UNTIL, type SmartAlert } from "@/lib/utils/alertTypes";

const baseAlert = (over: Partial<SmartAlert> = {}): SmartAlert =>
  ({
    id: "a1", type: "currency", code: "USD", name: "USD", nameTR: "Dolar",
    active: true, triggered: false, kind: "price", direction: "above", targetPrice: 40,
    ...over,
  } as SmartAlert);

const NOW = new Date("2025-04-15T12:00:00Z").getTime();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const history = (points: Array<[number, number]>): PricePoint[] =>
  points.map(([ageHrs, p]) => ({ t: NOW - ageHrs * HOUR, buy: p, sell: p }));

describe("evaluatePriceAlert", () => {
  it("hedefin üstüne çıkıldığında tetiklenir", () => {
    const a = baseAlert({ kind: "price", direction: "above", targetPrice: 40 }) as Extract<SmartAlert, { kind: "price" }>;
    expect(evaluatePriceAlert(a, { now: NOW, currentPrice: 41, history: [] }).trigger).toBe(true);
    expect(evaluatePriceAlert(a, { now: NOW, currentPrice: 39, history: [] }).trigger).toBe(false);
  });
});

describe("evaluatePercentAlert", () => {
  it("eşik aşıldığında ve veri taze değilse tetiklenir", () => {
    const a = baseAlert({ kind: "percent", direction: "up", thresholdPct: 2, windowHours: 24 }) as Extract<SmartAlert, { kind: "percent" }>;
    const h = history([[24, 30], [12, 30.3]]); // 24 saat önce 30
    const r = evaluatePercentAlert(a, { now: NOW, currentPrice: 30.9, history: h });
    expect(r.trigger).toBe(true); // %3 > %2
  });
  it("ters yöndeki harekette tetiklenmez", () => {
    const a = baseAlert({ kind: "percent", direction: "up", thresholdPct: 2, windowHours: 24 }) as Extract<SmartAlert, { kind: "percent" }>;
    const h = history([[24, 30]]);
    expect(evaluatePercentAlert(a, { now: NOW, currentPrice: 29, history: h }).trigger).toBe(false);
  });
  it("tarihte sadece çok yakın nokta varsa (yeterince eski değil) tetiklenmez", () => {
    const a = baseAlert({ kind: "percent", direction: "up", thresholdPct: 2, windowHours: 24 }) as Extract<SmartAlert, { kind: "percent" }>;
    const h = history([[1, 30]]); // sadece 1 saat eski
    expect(evaluatePercentAlert(a, { now: NOW, currentPrice: 31, history: h }).trigger).toBe(false);
  });
});

describe("evaluateTrendAlert", () => {
  it("3 gün üst üste yükselişte tetiklenir", () => {
    const a = baseAlert({ kind: "trend", direction: "up", days: 3 }) as Extract<SmartAlert, { kind: "trend" }>;
    const h: PricePoint[] = [3, 2, 1, 0].map((d) => ({ t: NOW - d * DAY, buy: 30 + (3 - d), sell: 30 }));
    expect(evaluateTrendAlert(a, { now: NOW, currentPrice: 33, history: h }).trigger).toBe(true);
  });
  it("kırılan trendde tetiklenmez", () => {
    const a = baseAlert({ kind: "trend", direction: "up", days: 3 }) as Extract<SmartAlert, { kind: "trend" }>;
    const h: PricePoint[] = [3, 2, 1, 0].map((d) => ({ t: NOW - d * DAY, buy: [30, 31, 30.5, 32][3 - d]!, sell: 30 }));
    expect(evaluateTrendAlert(a, { now: NOW, currentPrice: 32, history: h }).trigger).toBe(false);
  });
});

describe("evaluateVolatilityAlert", () => {
  it("ortalama hareketin katından büyük günlük hareket tetikler", () => {
    const a = baseAlert({ kind: "volatility", multiplier: 2, lookbackDays: 5 }) as Extract<SmartAlert, { kind: "volatility" }>;
    // Günlük kapanışlar: çok küçük hareketler (≈%0.1), bugün %3
    const closes = [30, 30.03, 30.06, 30.09, 30.12, 30.15];
    const h: PricePoint[] = closes.map((c, i) => ({ t: NOW - (closes.length - 1 - i) * DAY, buy: c, sell: c }));
    expect(evaluateVolatilityAlert(a, { now: NOW, currentPrice: 31, history: h }).trigger).toBe(true);
  });
});

describe("canFireAlert", () => {
  it("kalıcı sessize alınmışsa fire etmez", () => {
    const a = baseAlert({ mutedUntil: PERMANENT_MUTE_UNTIL });
    expect(canFireAlert(a, [], NOW)).toBe(false);
  });
  it("cooldown içinde fire etmez", () => {
    const a = baseAlert({ lastTriggeredAt: NOW - 5 * 60 * 1000 });
    expect(canFireAlert(a, [], NOW)).toBe(false);
  });
  it("sessizleştirilmiş gruptaysa fire etmez", () => {
    const a = baseAlert({ groupId: "g1" });
    expect(canFireAlert(a, [{ id: "g1", name: "G", muted: true }], NOW)).toBe(false);
  });
  it("price alarmı bir kez tetiklendiyse tekrar fire etmez", () => {
    const a = baseAlert({ triggered: true });
    expect(canFireAlert(a, [], NOW)).toBe(false);
  });
  it("aktif ve temiz alarm fire eder", () => {
    expect(canFireAlert(baseAlert(), [], NOW)).toBe(true);
  });
});
