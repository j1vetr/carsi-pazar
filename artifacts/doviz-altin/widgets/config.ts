"use no memo";

import AsyncStorage from "@react-native-async-storage/async-storage";

export type PriceField = "buy" | "sell";
export type WidgetTheme = "auto" | "dark" | "light";

export interface WidgetConfig {
  /** Symbol codes from SYMBOL_REGISTRY. Always exactly 4. */
  codes: string[];
  priceField: PriceField;
  theme: WidgetTheme;
}

export const WIDGET_CONFIG_KEY = "@carsi/widget-config-v1";

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  codes: ["USD", "EUR", "ALTIN", "CEYREK"],
  priceField: "sell",
  theme: "auto",
};

function sanitize(raw: unknown): WidgetConfig {
  const def = DEFAULT_WIDGET_CONFIG;
  if (!raw || typeof raw !== "object") return def;
  const obj = raw as Partial<WidgetConfig> & { template?: unknown };
  const priceField: PriceField = obj.priceField === "buy" ? "buy" : "sell";
  const theme: WidgetTheme =
    obj.theme === "dark" ? "dark" : obj.theme === "light" ? "light" : "auto";
  let codes = Array.isArray(obj.codes)
    ? obj.codes.filter((c) => typeof c === "string")
    : def.codes;
  if (codes.length < 4) {
    codes = [...codes, ...def.codes].slice(0, 4);
  } else if (codes.length > 4) {
    codes = codes.slice(0, 4);
  }
  return { codes, priceField, theme };
}

export async function readWidgetConfig(): Promise<WidgetConfig> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_CONFIG_KEY);
    if (!raw) return DEFAULT_WIDGET_CONFIG;
    return sanitize(JSON.parse(raw));
  } catch {
    return DEFAULT_WIDGET_CONFIG;
  }
}

export async function writeWidgetConfig(config: WidgetConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(
      WIDGET_CONFIG_KEY,
      JSON.stringify(sanitize(config)),
    );
  } catch {
    /* no-op */
  }
}
