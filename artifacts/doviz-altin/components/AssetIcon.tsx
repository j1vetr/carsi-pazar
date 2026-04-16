import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CURRENCY_COLORS: Record<string, string> = {
  USD: "#1A5276",
  EUR: "#1A3C6D",
  GBP: "#7B241C",
  CHF: "#C0392B",
  JPY: "#BC002D",
  SAR: "#006C35",
  AED: "#C8102E",
  CAD: "#C8102E",
  AUD: "#002868",
  CNY: "#DE2910",
  TRY: "#E30A17",
};

const CURRENCY_LABELS: Record<string, string> = {
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
  TRY: "\u20BA",
};

const GOLD_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  ALTIN: { name: "diamond", color: "#D4AF37" },
  CEYREK: { name: "ellipse", color: "#C9A84C" },
  YARIM: { name: "ellipse", color: "#B8962E" },
  TAM: { name: "disc", color: "#DAA520" },
  ATA: { name: "medal", color: "#CFB53B" },
  ATA5: { name: "medal", color: "#CFB53B" },
  GRAM22: { name: "link", color: "#CD9B1D" },
  RESAT: { name: "medal", color: "#DAA520" },
  GUMUS: { name: "diamond", color: "#C0C0C0" },
};

const COUNTRY_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  US: { name: "flag", color: "#1A5276" },
  TR: { name: "flag", color: "#E30A17" },
  EU: { name: "flag", color: "#1A3C6D" },
  GB: { name: "flag", color: "#7B241C" },
  JP: { name: "flag", color: "#BC002D" },
};

interface AssetIconProps {
  code: string;
  type: "currency" | "gold" | "country";
  size?: number;
  bgColor?: string;
}

export function AssetIcon({ code, type, size = 44, bgColor }: AssetIconProps) {
  const iconSize = size * 0.45;
  const fontSize = size * 0.38;
  const borderRadius = size / 2;

  if (type === "currency") {
    const color = CURRENCY_COLORS[code] ?? "#555";
    const label = CURRENCY_LABELS[code] ?? code.slice(0, 2);
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius, backgroundColor: bgColor ?? color + "20" }]}>
        <Text style={{ fontSize, fontFamily: "Inter_700Bold", color: bgColor ? "#FFF" : color }}>
          {label}
        </Text>
      </View>
    );
  }

  if (type === "gold") {
    const goldIcon = GOLD_ICONS[code] ?? { name: "diamond" as keyof typeof Ionicons.glyphMap, color: "#D4AF37" };
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius, backgroundColor: bgColor ?? goldIcon.color + "20" }]}>
        <Ionicons name={goldIcon.name} size={iconSize} color={bgColor ? "#FFF" : goldIcon.color} />
      </View>
    );
  }

  const countryIcon = COUNTRY_ICONS[code] ?? { name: "flag" as keyof typeof Ionicons.glyphMap, color: "#555" };
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius, backgroundColor: bgColor ?? countryIcon.color + "20" }]}>
      <Ionicons name={countryIcon.name} size={iconSize} color={bgColor ? "#FFF" : countryIcon.color} />
    </View>
  );
}

export function getCountryCode(flag: string): string {
  const map: Record<string, string> = {
    US: "US", TR: "TR", EU: "EU", GB: "GB", JP: "JP",
    SA: "SA", AE: "AE", CA: "CA", AU: "AU", CN: "CN", AB: "EU",
    ABD: "US",
  };
  return map[flag] ?? flag;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
