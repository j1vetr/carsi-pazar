import React from "react";
import { Image, PixelRatio, StyleSheet, Text, View } from "react-native";

const FLAG_WIDTHS = [20, 40, 80, 160, 320] as const;
function flagCdnUri(flagCode: string, pointSize: number): string {
  const needed = pointSize * PixelRatio.get();
  const w = FLAG_WIDTHS.find((s) => s >= needed) ?? 320;
  return `https://flagcdn.com/w${w}/${flagCode.toLowerCase()}.png`;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CHF: "Fr",
  JPY: "¥",
  SAR: "SR",
  AED: "د.إ",
  CAD: "C$",
  AUD: "A$",
  CNY: "¥",
  RUB: "₽",
  DKK: "kr",
  SEK: "kr",
  NOK: "kr",
  TRY: "₺",
  BANKAUSD: "B$",
};

interface AssetIconProps {
  code: string;
  type: "currency" | "gold" | "country";
  size?: number;
  variant?: "soft" | "solid" | "line";
  tone?: "primary" | "gold" | "neutral";
  /** ISO 3166-1 alpha-2 country code for flag (e.g. "US", "EU", "GB") */
  flagCode?: string;
}

export function AssetIcon({ code, type, size = 40, variant = "soft", tone, flagCode }: AssetIconProps) {
  const isGold = type === "gold";
  const palette = tone ?? (isGold ? "gold" : "primary");

  const colorMap = {
    primary: { soft: "#EEF3FA", solid: "#0B3D91", line: "#1E5BC6", text: "#0B3D91" },
    gold:    { soft: "#FBF3D5", solid: "#C9A227", line: "#C9A227", text: "#8A6E14" },
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
    // Bayrak resmi: flagcdn.com'dan ülke kodu ile CDN bayrağı
    if (flagCode) {
      const uri = flagCdnUri(flagCode, size);
      return (
        <View
          style={[
            styles.box,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: "#F0F0F0",
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: "rgba(0,0,0,0.08)",
              overflow: "hidden",
            },
          ]}
        >
          <Image
            source={{ uri }}
            style={{ width: size, height: size }}
            resizeMode="cover"
          />
        </View>
      );
    }

    // Fallback: para birimi sembolü
    const symbol = CURRENCY_SYMBOLS[code] ?? code.slice(0, 2);
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
    return null;
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
