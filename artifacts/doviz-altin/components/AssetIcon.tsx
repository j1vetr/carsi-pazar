import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  CHF: "\u20A3",
  JPY: "\u00A5",
  SAR: "\uFDFC",
  AED: "\u062F.\u0625",
  CAD: "$",
  AUD: "$",
  CNY: "\u00A5",
  RUB: "\u20BD",
  DKK: "kr",
  SEK: "kr",
  NOK: "kr",
  TRY: "\u20BA",
};

const GOLD_GLYPHS: Record<string, keyof typeof Ionicons.glyphMap> = {
  ALTIN: "ellipse",
  ONS: "ellipse",
  CEYREK: "ellipse-outline",
  YARIM: "ellipse-outline",
  TAM: "disc",
  ATA: "ribbon",
  ATA5: "ribbon-outline",
  GRAM22: "link",
  AYAR14: "link-outline",
  KULCE: "cube",
  GUMUS: "ellipse",
  RESAT: "ribbon",
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
    const glyph = GOLD_GLYPHS[code] ?? "ellipse";
    return (
      <View style={[styles.box, { width: size, height: size, borderRadius: size / 2 }, containerStyle]}>
        <Ionicons name={glyph} size={size * 0.5} color={fgColor} />
      </View>
    );
  }

  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size / 2 }, containerStyle]}>
      <Ionicons name="flag" size={size * 0.5} color={fgColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center" },
});
