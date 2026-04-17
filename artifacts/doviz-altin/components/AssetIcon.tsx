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
};

const GOLD_LABELS: Record<string, string> = {
  ALTIN: "GR",
  ONS: "OZ",
  ONS_SPOT: "OZS",
  ONS_EUR: "€OZ",
  CEYREK: "¼",
  CEYREK_ESKI: "¼E",
  YARIM: "½",
  YARIM_ESKI: "½E",
  TAM: "1",
  TAM_ESKI: "1E",
  ATA: "A",
  ATA_ESKI: "AE",
  ATA5: "A5",
  ATA5_ESKI: "A5E",
  GREMESE: "GR",
  GREMESE_YENI: "GR",
  GREMESE_ESKI: "GRE",
  GRAM22: "22",
  AYAR22: "22",
  AYAR14: "14",
  KULCE: "KU",
  GUMUS: "Ag",
  GUMUS_TRY: "Ag",
  GUMUS_USD_GR: "Ag$",
  ONS_GUMUS: "AgZ",
  KG_GUMUS: "AgK",
  PLATIN: "Pt",
  PLATIN_USD: "Pt$",
  PALADYUM: "Pd",
  PALADYUM_USD: "Pd$",
  PAR_USD: "P$",
  PAR_EUR: "P€",
  PAR_GBP: "P£",
  PAR_CHF: "P₣",
  AU_AG: "Au/Ag",
  FARK: "F",
  VADE_FARK: "VF",
  RESAT: "R",
  BAR5: "5g",
  BAR10: "10g",
  BAR20: "20g",
  BAR50: "50g",
  BAR100: "100",
  GRAM5: "5g",
  GRAM10: "10g",
  GRAM20: "20g",
  GRAM50: "50g",
  GRAM100: "100",
};

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
    const label = GOLD_LABELS[code] ?? PARITY_LABELS[code] ?? "Au";
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
