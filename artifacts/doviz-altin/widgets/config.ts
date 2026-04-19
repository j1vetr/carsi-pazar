"use no memo";

import AsyncStorage from "@react-native-async-storage/async-storage";

export type WidgetTemplate = "list" | "strip";
export type PriceField = "buy" | "sell" | "both";
export type WidgetTheme = "auto" | "dark" | "light";

export interface WidgetConfig {
  template: WidgetTemplate;
  /** Symbol codes from SYMBOL_REGISTRY. Always exactly 4. */
  codes: string[];
  /** Strip layout shows only one price; list can show both. */
  priceField: PriceField;
  theme: WidgetTheme;
}

export const WIDGET_CONFIG_KEY = "@carsi/widget-config-v1";

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  template: "list",
  codes: ["USD", "EUR", "ALTIN", "CEYREK"],
  priceField: "both",
  theme: "auto",
};

function sanitize(raw: unknown): WidgetConfig {
  const def = DEFAULT_WIDGET_CONFIG;
  if (!raw || typeof raw !== "object") return def;
  const obj = raw as Partial<WidgetConfig>;
  const template: WidgetTemplate =
    obj.template === "strip" ? "strip" : "list";
  const priceField: PriceField =
    obj.priceField === "buy"
      ? "buy"
      : obj.priceField === "sell"
        ? "sell"
        : "both";
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
  // Strip layout requires single price field (default to sell if "both").
  const finalPriceField: PriceField =
    template === "strip" && priceField === "both" ? "sell" : priceField;
  return { template, codes, priceField: finalPriceField, theme };
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
