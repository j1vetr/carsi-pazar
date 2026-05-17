import React, { useCallback, useEffect, useRef } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { haptics } from "@/lib/utils/haptics";
import { Icon } from "@/components/Icon";
import { AssetIcon } from "@/components/AssetIcon";
import { useColors } from "@/hooks/useColors";
import { CurrencyRate, GoldRate } from "@/contexts/AppContext";
import { getSymbolDescription } from "@/lib/utils/symbolDescriptions";
import { findMetaByCode } from "@/lib/api/haremApi";

interface Props {
  item: CurrencyRate | GoldRate;
  type: "currency" | "gold";
  isFavorite?: boolean;
  onPress: () => void;
  onFavoriteToggle?: () => void;
  onLongPress?: () => void;
  codeOverride?: string;
  badge?: string;
  nameFirst?: boolean;
  currencyLayout?: boolean;
}

const MONO = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

function fmt(n: number, decimals?: number): string {
  if (n >= 10_000) return n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const d = decimals ?? (n >= 100 ? 2 : 4);
  return n.toLocaleString("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtPct(pct: number): string {
  return Math.abs(pct).toFixed(2) + "%";
}

const COL_W = 78;

export function ModernPriceRow({
  item,
  type,
  isFavorite,
  onPress,
  onFavoriteToggle,
  onLongPress,
  codeOverride,
  badge,
  nameFirst,
  currencyLayout = false,
}: Props) {
  const colors = useColors();
  const flashOpacity = useSharedValue(0);
  const prevPrice = useRef(item.buy);

  const meta = findMetaByCode(item.code);
  const flagCode = meta?.flag;

  useEffect(() => {
    const delta = item.buy - prevPrice.current;
    if (delta !== 0) {
      const meaningful = Math.abs(delta / (prevPrice.current || 1)) > 0.0001;
      if (meaningful) {
        const dir = delta > 0 ? 1 : -1;
        flashOpacity.value = withTiming(dir * 0.12, { duration: 140 }, () => {
          flashOpacity.value = withTiming(0, { duration: 660 });
        });
      }
      prevPrice.current = item.buy;
    }
  }, [item.buy, flashOpacity]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: Math.abs(flashOpacity.value),
    backgroundColor: flashOpacity.value >= 0 ? colors.rise : colors.fall,
  }));

  const handlePress = useCallback(() => {
    haptics.tap();
    onPress();
  }, [onPress]);

  const handleLongPress = useCallback(() => {
    if (!onLongPress) return;
    haptics.longPress();
    onLongPress();
  }, [onLongPress]);

  const isPositive = item.changePercent >= 0;
  const hasChange = Math.abs(item.changePercent) >= 0.005;
  const changeColor = hasChange ? (isPositive ? colors.rise : colors.fall) : colors.mutedForeground;

  const displayCode = codeOverride ?? item.code;
  const decimals = meta?.decimals;
  const buyStr = fmt(item.buy, decimals);
  const sellStr = fmt(item.sell, decimals);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      delayLongPress={350}
      style={[
        styles.pressable,
        { backgroundColor: colors.background, borderBottomColor: colors.border },
      ]}
      android_ripple={{ color: colors.surface }}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, flashStyle]} pointerEvents="none" />

      {/* İkon — sadece döviz satırlarında */}
      {type === "currency" ? (
        <View style={styles.iconWrap}>
          <AssetIcon
            code={item.code}
            type={type}
            size={36}
            variant="soft"
            flagCode={flagCode ?? undefined}
          />
        </View>
      ) : null}

      {/* İsim / kod sütunu */}
      <View style={styles.nameCol}>
        {nameFirst ? (
          <Text
            style={[styles.labelTiny, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            BİRİM
          </Text>
        ) : null}
        <View style={styles.headRow}>
          <Text
            style={[styles.codeText, { color: colors.foreground }]}
            numberOfLines={nameFirst ? 2 : 1}
            ellipsizeMode="tail"
          >
            {nameFirst ? item.nameTR : displayCode}
          </Text>
          {badge ? (
            <Text style={[styles.badgeText, { color: colors.mutedForeground, backgroundColor: colors.surface }]}>
              {badge}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.nameText, { color: colors.mutedForeground }]} numberOfLines={1}>
          {nameFirst ? (getSymbolDescription(item.code) ?? item.nameTR) : item.nameTR}
        </Text>
      </View>

      {/* Fiyat alanı */}
      {currencyLayout ? (
        /* ── Döviz: ALIŞ + SATIŞ yan yana, ↗/↘ ok altında ── */
        <View style={styles.currencyPriceArea}>
          <View style={styles.currencyPriceCol}>
            <Text
              style={[styles.currencyPrice, styles.currencyPriceBuy, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {buyStr}
            </Text>
            <Text style={[styles.currencyChange, { color: changeColor }]} numberOfLines={1}>
              {hasChange ? `${isPositive ? "↗" : "↘"} ${fmtPct(item.changePercent)}` : "—"}
            </Text>
          </View>
          <View style={styles.currencyPriceCol}>
            <Text style={[styles.currencyPrice, { color: colors.foreground }]} numberOfLines={1}>
              {sellStr}
            </Text>
            <Text style={[styles.currencyChange, { color: changeColor }]} numberOfLines={1}>
              {hasChange ? `${isPositive ? "↗" : "↘"} ${fmtPct(item.changePercent)}` : "—"}
            </Text>
          </View>
        </View>
      ) : (
        /* ── Altın: ALIŞ (gri zemin) | SATIŞ — her sütunda etiket + fiyat + ▲/▼ ── */
        <View style={styles.goldPriceArea}>
          {/* ALIŞ — gri arka plan */}
          <View
            style={[
              styles.goldPriceCol,
              {
                backgroundColor: colors.buyColBg ?? "#F4F5F7",
                borderLeftWidth: StyleSheet.hairlineWidth,
                borderRightWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.colLabel, { color: colors.mutedForeground }]}>ALIŞ</Text>
            <Text
              style={[styles.goldBuyPrice, { color: colors.mutedForeground }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {buyStr}
            </Text>
            <Text style={[styles.goldChange, { color: changeColor }]} numberOfLines={1}>
              {hasChange ? `${isPositive ? "▲" : "▼"} ${fmtPct(item.changePercent)}` : "—"}
            </Text>
          </View>
          {/* SATIŞ */}
          <View style={styles.goldPriceCol}>
            <Text style={[styles.colLabel, { color: colors.mutedForeground }]}>SATIŞ</Text>
            <Text
              style={[styles.goldSellPrice, { color: colors.foreground }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {sellStr}
            </Text>
            <Text style={[styles.goldChange, { color: changeColor }]} numberOfLines={1}>
              {hasChange ? `${isPositive ? "▲" : "▼"} ${fmtPct(item.changePercent)}` : "—"}
            </Text>
          </View>
        </View>
      )}

      {onFavoriteToggle ? (
        <Pressable onPress={onFavoriteToggle} style={styles.starBtn} hitSlop={8}>
          <Icon
            name={isFavorite ? "star" : "star-outline"}
            size={16}
            color={isFavorite ? colors.gold : colors.mutedForeground}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  iconWrap: { marginRight: 10 },

  nameCol: { flex: 1, justifyContent: "center", minWidth: 0, paddingRight: 4, paddingVertical: 10 },
  labelTiny: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  headRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  codeText: {
    fontSize: 14.5,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: "hidden",
    flexShrink: 0,
  },
  nameText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },

  // ── Döviz layout ──
  currencyPriceArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  currencyPriceCol: {
    width: 72,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingVertical: 10,
  },
  currencyPrice: {
    fontSize: 13,
    fontFamily: MONO,
    fontVariant: ["tabular-nums"] as const,
    letterSpacing: -0.3,
  },
  currencyPriceBuy: {
    fontSize: 12.5,
  },
  currencyChange: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    fontVariant: ["tabular-nums"] as const,
    marginTop: 2,
  },

  // ── Altın layout ──
  goldPriceArea: {
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "stretch",
  },
  goldPriceCol: {
    width: COL_W,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  colLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  goldBuyPrice: {
    fontSize: 12.5,
    fontFamily: MONO,
    fontVariant: ["tabular-nums"] as const,
    letterSpacing: -0.3,
    maxWidth: COL_W - 16,
  },
  goldSellPrice: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    fontVariant: ["tabular-nums"] as const,
    letterSpacing: -0.3,
    maxWidth: COL_W - 16,
  },
  goldChange: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    fontVariant: ["tabular-nums"] as const,
    marginTop: 2,
  },

  starBtn: { marginLeft: 6, paddingHorizontal: 6, paddingVertical: 10 },
});

export function ModernTableHeader({
  cols = ["Birim", "Alış", "Satış"],
  withIcon = true,
  currencyLayout = false,
}: {
  cols?: [string, string, string] | string[];
  withIcon?: boolean;
  currencyLayout?: boolean;
}) {
  const colors = useColors();
  const hStyles = StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 16,
      paddingVertical: 7,
      backgroundColor: colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    label: {
      fontSize: 9.5,
      fontFamily: "Inter_700Bold",
      color: colors.mutedForeground,
      letterSpacing: 1.2,
    },
  });

  if (currencyLayout) {
    return (
      <View style={hStyles.wrap}>
        <Text style={[hStyles.label, { flex: 1, marginLeft: withIcon ? 46 : 0 }]}>
          {(cols[0] ?? "BİRİM").toUpperCase()}
        </Text>
        <Text style={[hStyles.label, { width: 72, textAlign: "right" }]}>
          {(cols[1] ?? "ALIŞ").toUpperCase()}
        </Text>
        <Text style={[hStyles.label, { width: 72, textAlign: "right" }]}>
          {(cols[2] ?? "SATIŞ").toUpperCase()}
        </Text>
        <View style={{ width: 30 }} />
      </View>
    );
  }

  // Altın layout: başlık sütunları yeni iki-sütun düzeniyle hizalı
  return (
    <View style={hStyles.wrap}>
      <Text style={[hStyles.label, { flex: 1, marginLeft: withIcon ? 46 : 0 }]}>
        {(cols[0] ?? "BİRİM").toUpperCase()}
      </Text>
      <Text style={[hStyles.label, { width: COL_W, textAlign: "right" }]}>
        {(cols[1] ?? "ALIŞ").toUpperCase()}
      </Text>
      <Text style={[hStyles.label, { width: COL_W, textAlign: "right" }]}>
        {(cols[2] ?? "SATIŞ").toUpperCase()}
      </Text>
      <View style={{ width: 30 }} />
    </View>
  );
}
