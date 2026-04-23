import { formatAlertRule, formatAlertTitle, formatAlertBody } from "@/lib/utils/alertFormat";
import type { SmartAlert } from "@/lib/utils/alertTypes";

const base = {
  id: "a", type: "currency" as const, code: "USD", name: "USD", nameTR: "Dolar",
  active: true, triggered: false,
};

describe("formatAlertRule", () => {
  it("price alarmı için yön kelimesi doğru", () => {
    const a: SmartAlert = { ...base, kind: "price", direction: "above", targetPrice: 40 };
    expect(formatAlertRule(a)).toContain("üzerine çıkınca");
    const b: SmartAlert = { ...base, kind: "price", direction: "below", targetPrice: 30 };
    expect(formatAlertRule(b)).toContain("altına düşünce");
  });
  it("percent alarmı saat ve % içerir", () => {
    const a: SmartAlert = { ...base, kind: "percent", direction: "up", thresholdPct: 2.5, windowHours: 12 };
    const s = formatAlertRule(a);
    expect(s).toContain("12 saatte");
    expect(s).toContain("%2,50");
    expect(s).toContain("yükselirse");
  });
  it("trend alarmı gün sayısını içerir", () => {
    const a: SmartAlert = { ...base, kind: "trend", direction: "down", days: 5 };
    expect(formatAlertRule(a)).toContain("5 gün");
    expect(formatAlertRule(a)).toContain("düşerse");
  });
});

describe("formatAlertTitle", () => {
  it("trend yönüne göre başlık", () => {
    const up: SmartAlert = { ...base, kind: "trend", direction: "up", days: 3 };
    expect(formatAlertTitle(up)).toMatch(/yükseliyor/);
    const down: SmartAlert = { ...base, kind: "trend", direction: "down", days: 3 };
    expect(formatAlertTitle(down)).toMatch(/düşüyor/);
  });
});

describe("formatAlertBody", () => {
  it("price alarmında gözlenen fiyat varsa onu kullanır", () => {
    const a: SmartAlert = { ...base, kind: "price", direction: "above", targetPrice: 40 };
    const body = formatAlertBody(a, { trigger: true, observed: 41.23 });
    expect(body).toContain("41.2300");
    expect(body).toContain("40.0000");
  });
});
