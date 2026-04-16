import React, { useCallback, useEffect, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { CurrencyRate, GoldRate } from "@/contexts/AppContext";

interface PriceCardProps {
  item: CurrencyRate | GoldRate;
  type: "currency" | "gold";
  isFavorite?: boolean;
  onPress: () => void;
  onFavoriteToggle?: () => void;
  compact?: boolean;
}

function formatNumber(n: number): string {
  if (n >= 1000) return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 10) return n.toFixed(4);
  return n.toFixed(4);
}

export function PriceCard({
  item,
  type,
  isFavorite,
  onPress,
  onFavoriteToggle,
  compact = false,
}: PriceCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const prevPrice = useRef(item.buy);

  useEffect(() => {
    if (prevPrice.current !== item.buy) {
      flashOpacity.value = withTiming(0.25, { duration: 100 }, () => {
        flashOpacity.value = withTiming(0, { duration: 600 });
      });
      prevPrice.current = item.buy;
    }
  }, [item.buy, flashOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    backgroundColor: item.change >= 0 ? colors.rise : colors.fall,
  }));

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [scale, onPress]);

  const isPositive = item.changePercent >= 0;
  const changeColor = isPositive ? colors.rise : colors.fall;
  const spread = item.sell - item.buy;

  const styles = StyleSheet.create({
    wrapper: { marginHorizontal: 0 },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: compact ? 12 : 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    flash: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: colors.radius,
    },
    row: { flexDirection: "row", alignItems: "center" },
    iconContainer: {
      width: compact ? 36 : 44,
      height: compact ? 36 : 44,
      borderRadius: (compact ? 36 : 44) / 2,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    iconText: { fontSize: compact ? 18 : 22 },
    nameContainer: { flex: 1 },
    code: {
      fontSize: compact ? 15 : 17,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: 0.3,
    },
    name: {
      fontSize: compact ? 11 : 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 1,
    },
    priceContainer: { alignItems: "flex-end" },
    buyPrice: {
      fontSize: compact ? 14 : 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    changeRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
    changeText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: changeColor,
    },
    divider: { height: 1, backgroundColor: colors.border, marginTop: 10, marginBottom: 8 },
    detailsRow: { flexDirection: "row", justifyContent: "space-between" },
    detailLabel: { fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    detailValue: { fontSize: 11, color: colors.foreground, fontFamily: "Inter_500Medium" },
    detailItem: { alignItems: "center" },
    favoriteBtn: { padding: 4, marginLeft: 6 },
  });

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <Pressable onPress={handlePress} style={styles.card}>
        <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>
              {type === "currency"
                ? (item as CurrencyRate).flag ?? "💱"
                : (item as GoldRate).icon ?? "🪙"}
            </Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.name} numberOfLines={1}>{item.nameTR}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.buyPrice}>{formatNumber(item.buy)}</Text>
            <View style={styles.changeRow}>
              <Ionicons
                name={isPositive ? "caret-up" : "caret-down"}
                size={10}
                color={changeColor}
              />
              <Text style={styles.changeText}>
                {isPositive ? "+" : ""}
                {item.changePercent.toFixed(2)}%
              </Text>
            </View>
          </View>
          {onFavoriteToggle && (
            <Pressable onPress={onFavoriteToggle} style={styles.favoriteBtn}>
              <Ionicons
                name={isFavorite ? "star" : "star-outline"}
                size={18}
                color={isFavorite ? colors.gold : colors.mutedForeground}
              />
            </Pressable>
          )}
        </View>

        {!compact && (
          <>
            <View style={styles.divider} />
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>ALIŞ</Text>
                <Text style={[styles.detailValue, { color: colors.rise }]}>
                  {formatNumber(item.buy)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>SATIŞ</Text>
                <Text style={[styles.detailValue, { color: colors.fall }]}>
                  {formatNumber(item.sell)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>FARK</Text>
                <Text style={styles.detailValue}>{formatNumber(spread)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>DEĞİŞİM</Text>
                <Text style={[styles.detailValue, { color: changeColor }]}>
                  {isPositive ? "+" : ""}{item.change.toFixed(2)}
                </Text>
              </View>
            </View>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
