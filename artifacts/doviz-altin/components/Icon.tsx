import React from "react";
import { Platform, Text, TextStyle } from "react-native";

export type IconName =
  | "notifications"
  | "notifications-outline"
  | "notifications-off-outline"
  | "star"
  | "star-outline"
  | "trash-outline"
  | "checkmark-circle"
  | "arrow-back"
  | "arrow-forward"
  | "chevron-down"
  | "chevron-up"
  | "chevron-forward"
  | "chevron-back"
  | "close"
  | "trending-up"
  | "trending-down"
  | "swap-vertical"
  | "swap-horizontal"
  | "briefcase"
  | "briefcase-outline"
  | "diamond"
  | "add"
  | "ellipsis-horizontal"
  | "flag"
  | "alert-circle"
  | "caret-up"
  | "caret-down"
  | "x";

const GLYPHS: Record<IconName, string> = {
  "notifications": "\uD83D\uDD14",
  "notifications-outline": "\uD83D\uDD14",
  "notifications-off-outline": "\uD83D\uDD15",
  "star": "★",
  "star-outline": "☆",
  "trash-outline": "\uD83D\uDDD1",
  "checkmark-circle": "✓",
  "arrow-back": "‹",
  "arrow-forward": "›",
  "chevron-down": "▾",
  "chevron-up": "▴",
  "chevron-forward": "›",
  "chevron-back": "‹",
  "close": "✕",
  "trending-up": "▲",
  "trending-down": "▼",
  "swap-vertical": "⇅",
  "swap-horizontal": "⇄",
  "briefcase": "\uD83D\uDCBC",
  "briefcase-outline": "\uD83D\uDCBC",
  "diamond": "◆",
  "add": "＋",
  "ellipsis-horizontal": "•••",
  "flag": "\uD83C\uDFF3",
  "alert-circle": "!",
  "caret-up": "▲",
  "caret-down": "▼",
  "x": "✕",
};

const SIZE_MULTIPLIER: Partial<Record<IconName, number>> = {
  "arrow-back": 1.6,
  "arrow-forward": 1.6,
  "chevron-back": 1.6,
  "chevron-forward": 1.6,
  "chevron-down": 1.1,
  "chevron-up": 1.1,
  "ellipsis-horizontal": 0.7,
  "trending-up": 0.85,
  "trending-down": 0.85,
  "swap-vertical": 1.2,
  "swap-horizontal": 1.2,
  "star": 1.05,
  "star-outline": 1.05,
  "close": 0.95,
  "x": 0.95,
  "checkmark-circle": 1.1,
  "add": 1.0,
  "diamond": 1.0,
};

const VERTICAL_NUDGE: Partial<Record<IconName, number>> = {
  "arrow-back": -2,
  "arrow-forward": -2,
  "chevron-back": -2,
  "chevron-forward": -2,
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export function Icon({ name, size = 18, color = "#000", style }: IconProps) {
  const glyph = GLYPHS[name] ?? "?";
  const fontSize = Math.round(size * (SIZE_MULTIPLIER[name] ?? 1));
  const lineHeight = Math.round(fontSize * 1.05);
  const marginTop = VERTICAL_NUDGE[name] ?? 0;
  return (
    <Text
      allowFontScaling={false}
      style={[
        {
          fontSize,
          lineHeight,
          color,
          textAlign: "center",
          includeFontPadding: false,
          marginTop,
          ...Platform.select({
            android: { fontFamily: undefined },
            default: {},
          }),
        },
        style,
      ]}
    >
      {glyph}
    </Text>
  );
}
