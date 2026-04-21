import React from "react";
import { StyleSheet, Text, View } from "react-native";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  CHF: "Fr",
  JPY: "\u00A5",
  SAR: "SR",
  AED: "AE",
  CAD: "C$",
  AUD: "A$",
  CNY: "\u00A5",
  RUB: "\u20BD",
  DKK: "kr",
  SEK: "kr",
  NOK: "kr",
  TRY: "\u20BA",
  BANKAUSD: "B$",
};

// Sade, metal tipine göre gruplanmış simge (boyut/birim kodları kaldırıldı).
function getGoldLabel(code: string): string {
  if (code.startsWith("GUMUS") || code.includes("GUMUS") || code === "ONS_GUMUS" || code === "KG_GUMUS") {
    return "Ag";
  }
  if (code.startsWith("PLATIN")) return "Pt";
  if (code.startsWith("PALADYUM")) return "Pd";
  return "Au";
}

const PARITY_LABELS: Record<string, string> = {
  EURUSD: "€$",
  GBPUSD: "£$",
  AUDUSD: "A$",
  USDCHF: "$₣",
  USDCAD: "$C",
  USDJPY: "$¥",
  USDSAR: "$SR",
  USDDKK: "$kr",
  USDNOK: "$kr",
  USDSEK: "$kr",
  USDRUB: "$₽",
  EURGBP: "€£",
  EURCHF: "€₣",
  EURUSDS: "€$",
  XUSDTRY: "$₺",
  FARKEUR: "F€",
};

interface AssetIconProps {
  code: string;
  type: "currency" | "gold" | "country";
  size?: number;
  variant?: "soft" | "solid" | "line";
  tone?: "primary" | "gold" | "neutral";
}

export function AssetIcon({ code, type, size = 40, variant = "soft", tone }: AssetIconProps) {
  const isGold = type === "gold";
  const palette = tone ?? (isGold ? "gold" : "primary");

  const colorMap = {
    primary: { soft: "#EEF3FA", solid: "#0B3D91", line: "#1E5BC6", text: "#0B3D91" },
    gold: { soft: "#FBF3D5", solid: "#C9A227", line: "#C9A227", text: "#8A6E14" },
    neutral: { soft: "#F4F7FB", solid: "#6B7B95", line: "#6B7B95", text: "#0B1F3A" },
  } as const;
  const c = colorMap[palette];

  const containerStyle =
    variant === "solid"
      ? { backgroundColor: c.solid, borderWidth: 0 }
      : variant === "line"
      ? { backgroundColor: "transparent", borderWidth: 1.5, borderColor: c.line }
      : { backgroundColor: c.soft, borderWidth: 0 };

  const fgColor = variant === "solid" ? "#FFFFFF" : c.text;

  if (type === "currency") {
    const symbol = CURRENCY_SYMBOLS[code] ?? code.slice(0, 1);
    const fontSize = symbol.length > 1 ? size * 0.36 : size * 0.5;
    return (
      <View style={[styles.box, { width: size, height: size, borderRadius: size / 2 }, containerStyle]}>
        <Text
          style={{
            fontSize,
            lineHeight: size,
            fontFamily: "Inter_700Bold",
            color: fgColor,
            includeFontPadding: false,
            textAlignVertical: "center",
          }}
        >
          {symbol}
        </Text>
      </View>
    );
  }

  if (type === "gold") {
    const label = PARITY_LABELS[code] ?? getGoldLabel(code);
    const fontSize = label.length > 2 ? size * 0.32 : size * 0.4;
    return (
      <View style={[styles.box, { width: size, height: size, borderRadius: size / 2 }, containerStyle]}>
        <Text
          style={{
            fontSize,
            lineHeight: size,
            fontFamily: "Inter_700Bold",
            color: fgColor,
            includeFontPadding: false,
            textAlignVertical: "center",
          }}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size / 2 }, containerStyle]}>
      <Text
        style={{
          fontSize: size * 0.5,
          lineHeight: size,
          color: fgColor,
          includeFontPadding: false,
          textAlignVertical: "center",
        }}
      >
        {"\uD83C\uDFF3"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center" },
});
