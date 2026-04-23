export type AlertKind = "price" | "percent" | "trend" | "volatility";

export interface AlertWindow {
  start: string;
  end: string;
}

export interface AlertBase {
  id: string;
  type: "currency" | "gold";
  code: string;
  name: string;
  nameTR: string;
  active: boolean;
  triggered: boolean;
  lastTriggeredAt?: number;
  groupId?: string;
  mutedUntil?: number;
  window?: AlertWindow;
}

/** Far-future sentinel (>> reasonable time) → used for "permanent mute". */
export const PERMANENT_MUTE_UNTIL = 4102444800000; // 2100-01-01

export function isPermanentMute(mutedUntil: number | undefined): boolean {
  return !!mutedUntil && mutedUntil >= PERMANENT_MUTE_UNTIL;
}

/**
 * Patch shape allowed for updateAlert. Only shared (kind-agnostic) fields can
 * be changed post-creation — kind-specific rule params are immutable by design.
 */
export type AlertPatch = Partial<
  Pick<
    AlertBase,
    "active" | "triggered" | "lastTriggeredAt" | "groupId" | "mutedUntil" | "window"
  >
>;

/** Apply a shared-field patch to any SmartAlert variant preserving its kind. */
export function applyAlertPatch<T extends { kind: string }>(alert: T, patch: AlertPatch): T {
  return { ...alert, ...patch };
}

export interface PriceAlertRule extends AlertBase {
  kind: "price";
  direction: "above" | "below";
  targetPrice: number;
}

export interface PercentAlertRule extends AlertBase {
  kind: "percent";
  direction: "up" | "down" | "any";
  thresholdPct: number;
  windowHours: number;
}

export interface TrendAlertRule extends AlertBase {
  kind: "trend";
  direction: "up" | "down";
  days: number;
}

export interface VolatilityAlertRule extends AlertBase {
  kind: "volatility";
  multiplier: number;
  lookbackDays: number;
}

export type SmartAlert =
  | PriceAlertRule
  | PercentAlertRule
  | TrendAlertRule
  | VolatilityAlertRule;

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type NewAlertInput = DistributiveOmit<SmartAlert, "id">;

export interface AlertGroup {
  id: string;
  name: string;
  muted: boolean;
}

export function alertKindLabel(k: AlertKind): string {
  switch (k) {
    case "price": return "Sabit Fiyat";
    case "percent": return "Yüzde Değişim";
    case "trend": return "Trend Takibi";
    case "volatility": return "Volatilite Uyarısı";
  }
}

export function alertKindShort(k: AlertKind): string {
  switch (k) {
    case "price": return "Sabit";
    case "percent": return "Yüzde";
    case "trend": return "Trend";
    case "volatility": return "Volatilite";
  }
}

export function alertKindBadge(k: AlertKind): { glyph: string; color: string } {
  switch (k) {
    case "price": return { glyph: "■", color: "#64748B" };
    case "percent": return { glyph: "●", color: "#3B82F6" };
    case "trend": return { glyph: "◆", color: "#A855F7" };
    case "volatility": return { glyph: "▲", color: "#F59E0B" };
  }
}
