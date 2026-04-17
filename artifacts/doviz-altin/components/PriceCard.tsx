import React, { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "@/components/Icon";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { CurrencyRate, GoldRate } from "@/contexts/AppContext";
import { AssetIcon } from "@/components/AssetIcon";

interface PriceCardProps {
  item: CurrencyRate | GoldRate;
  type: "currency" | "gold";
  isFavorite?: boolean;
  onPress: () => void;
  onFavoriteToggle?: () => void;
  compact?: boolean;
  hideIcon?: boolean;
}

function formatPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 10) return n.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export function PriceCard({
  item,
  type,
  isFavorite,
  onPress,
  onFavoriteToggle,
  hideIcon,
}: PriceCardProps) {
  const colors = useColors();
  const flashOpacity = useSharedValue(0);
  const prevPrice = useRef(item.buy);

  useEffect(() => {
    const delta = item.buy - prevPrice.current;
    if (delta !== 0) {
      const meaningful = Math.abs(delta / (prevPrice.current || 1)) > 0.0001;
      if (meaningful) {
        const direction = delta > 0 ? 1 : -1;
        flashOpacity.value = withTiming(direction * 0.06, { duration: 120 }, () => {
          flashOpacity.value = withTiming(0, { duration: 600 });
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
    if (typeof Haptics?.impactAsync === "function") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  }, [onPress]);

  const isPositive = item.changePercent >= 0;
  const hasChange = Math.abs(item.changePercent) >= 0.005;
  const changeColor = hasChange ? (isPositive ? colors.rise : colors.fall) : colors.mutedForeground;

  const styles = StyleSheet.create({
    pressable: {
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      overflow: "hidden",
    },
    flash: { ...StyleSheet.absoluteFillObject },
    iconWrap: { marginRight: 12 },
    nameCol: { flex: 1.6, justifyContent: "center" },
    code: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: 0.2,
    },
    name: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    priceCol: { flex: 1.4, alignItems: "flex-end", justifyContent: "center" },
    bidAsk: { flexDirection: "row", alignItems: "baseline", gap: 6 },
    bid: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      fontVariant: ["tabular-nums"],
    },
    ask: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      fontVariant: ["tabular-nums"],
    },
    changeWrap: { marginTop: 3, flexDirection: "row", alignItems: "center", gap: 3 },
    changeText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: changeColor,
      fontVariant: ["tabular-nums"],
    },
    starBtn: { marginLeft: 10, padding: 4 },
  });

  return (
    <Pressable onPress={handlePress} style={styles.pressable} android_ripple={{ color: colors.surface }}>
      <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />
      {!hideIcon && (
        <View style={styles.iconWrap}>
          <AssetIcon code={item.code} type={type} size={38} variant="soft" />
        </View>
      )}
      <View style={styles.nameCol}>
        <Text style={styles.code} numberOfLines={1}>{item.code}</Text>
        <Text style={styles.name} numberOfLines={1}>{item.nameTR}</Text>
      </View>
      <View style={styles.priceCol}>
        <View style={styles.bidAsk}>
          <Text style={styles.bid}>{formatPrice(item.buy)}</Text>
        </View>
        <View style={styles.changeWrap}>
          {hasChange && (
            <Icon
              name={isPositive ? "caret-up" : "caret-down"}
              size={9}
              color={changeColor}
            />
          )}
          <Text style={styles.changeText}>
            {hasChange ? `${isPositive ? "+" : ""}${item.changePercent.toFixed(2)}%` : "—"}
          </Text>
          <Text style={[styles.ask, { marginLeft: 6 }]}>{formatPrice(item.sell)}</Text>
        </View>
      </View>
      {onFavoriteToggle && (
        <Pressable onPress={onFavoriteToggle} style={styles.starBtn} hitSlop={8}>
          <Icon
            name={isFavorite ? "star" : "star-outline"}
            size={16}
            color={isFavorite ? colors.gold : colors.mutedForeground}
          />
        </Pressable>
      )}
    </Pressable>
  );
}
