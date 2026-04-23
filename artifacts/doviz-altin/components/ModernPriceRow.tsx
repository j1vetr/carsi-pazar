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

interface Props {
  item: CurrencyRate | GoldRate;
  type: "currency" | "gold";
  isFavorite?: boolean;
  onPress: () => void;
  onFavoriteToggle?: () => void;
  /** Long-press → bağlam menüsünü aç (üst ekran tarafından sağlanır). */
  onLongPress?: () => void;
  /** Override displayed code (e.g. shorten "GRAM_ALTIN" to "GRAM") */
  codeOverride?: string;
  /** Small badge after code, e.g. "YENİ" / "ESKİ" */
  badge?: string;
  /** Show item name first instead of code (used for gold sarrafiye where name is meaningful) */
  nameFirst?: boolean;
}

const MONO = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 10) return n.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

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
}: Props) {
  const colors = useColors();
  const flashOpacity = useSharedValue(0);
  const prevPrice = useRef(item.buy);

  useEffect(() => {
    const delta = item.buy - prevPrice.current;
    if (delta !== 0) {
      const meaningful = Math.abs(delta / (prevPrice.current || 1)) > 0.0001;
      if (meaningful) {
        // 800ms toplam: hızlı ramp-up + uzun decay → değişim göze çarpsın.
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
  const changeBg = hasChange ? (isPositive ? colors.riseSoft : colors.fallSoft) : colors.surface;

  const displayCode = codeOverride ?? item.code;
  const buyStr = fmt(item.buy);
  const sellStr = fmt(item.sell);

  const styles = StyleSheet.create({
    pressable: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      overflow: "hidden",
    },
    flash: { ...StyleSheet.absoluteFillObject },
    iconWrap: { marginRight: 12 },

    nameCol: { flex: 1, justifyContent: "center", minWidth: 0, paddingRight: 8 },
    headRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    codeText: {
      fontSize: 14.5,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.2,
      flexShrink: 1,
    },
    badge: {
      fontSize: 9,
      fontFamily: "Inter_700Bold",
      color: colors.mutedForeground,
      letterSpacing: 0.6,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
      backgroundColor: colors.surface,
      overflow: "hidden",
      flexShrink: 0,
    },
    name: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginTop: 2,
    },

    priceCol: {
      width: 158,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
    },
    buyText: {
      fontSize: 12.5,
      color: colors.mutedForeground,
      fontFamily: MONO,
      fontVariant: ["tabular-nums"],
      letterSpacing: -0.3,
    },
    sep: {
      fontSize: 11,
      color: colors.mutedForeground,
      opacity: 0.55,
      marginHorizontal: 1,
    },
    sellText: {
      fontSize: 14.5,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      fontVariant: ["tabular-nums"],
      letterSpacing: -0.3,
      lineHeight: 17,
    },
    changePill: {
      marginTop: 3,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 5,
      backgroundColor: changeBg,
    },
    changeText: {
      fontSize: 10.5,
      fontFamily: "Inter_700Bold",
      color: changeColor,
      fontVariant: ["tabular-nums"],
      letterSpacing: -0.1,
    },

    starBtn: { marginLeft: 8, padding: 4 },
  });

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      delayLongPress={350}
      style={styles.pressable}
      android_ripple={{ color: colors.surface }}
    >
      <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />

      {type === "gold" ? null : (
        <View style={styles.iconWrap}>
          <AssetIcon code={item.code} type={type} size={34} variant="soft" />
        </View>
      )}

      <View style={styles.nameCol}>
        <View style={styles.headRow}>
          <Text
            style={styles.codeText}
            numberOfLines={nameFirst ? 2 : 1}
            ellipsizeMode="tail"
          >
            {nameFirst ? item.nameTR : displayCode}
          </Text>
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {nameFirst ? (getSymbolDescription(item.code) ?? item.nameTR) : item.nameTR}
        </Text>
      </View>

      <View style={styles.priceCol}>
        <View style={styles.priceRow}>
          <Text style={styles.buyText} numberOfLines={1}>{buyStr}</Text>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.sellText} numberOfLines={1}>{sellStr}</Text>
        </View>
        <View style={styles.changePill}>
          <Text style={styles.changeText}>
            {hasChange ? `${isPositive ? "▲" : "▼"} ${Math.abs(item.changePercent).toFixed(2)}%` : "—"}
          </Text>
        </View>
      </View>

      {onFavoriteToggle ? (
        <Pressable onPress={onFavoriteToggle} style={styles.starBtn} hitSlop={8}>
          <Icon
            name={isFavorite ? "star" : "star-outline"}
            size={15}
            color={isFavorite ? colors.gold : colors.mutedForeground}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export function ModernTableHeader({
  cols = ["Birim", "Alış", "Satış"],
  withIcon = true,
}: { cols?: [string, string, string] | string[]; withIcon?: boolean }) {
  const colors = useColors();
  const styles = StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    label: {
      fontSize: 9.5,
      fontFamily: "Inter_700Bold",
      color: colors.mutedForeground,
      letterSpacing: 1.4,
    },
  });
  // Alış/Satış artık tek kolonda yan yana gösteriliyor → birleşik başlık.
  const priceLabel = `${cols[1]} · ${cols[2]}`.toUpperCase();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { flex: 1, marginLeft: withIcon ? 46 : 0 }]}>{cols[0].toUpperCase()}</Text>
      <Text style={[styles.label, { width: 158, textAlign: "right" }]}>{priceLabel}</Text>
      <View style={{ width: 31 }} />
    </View>
  );
}
