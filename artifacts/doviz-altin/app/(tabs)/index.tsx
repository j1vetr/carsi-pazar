import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  LayoutChangeEvent,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, CurrencyRate } from "@/contexts/AppContext";
import { PriceCard } from "@/components/PriceCard";

const TickerItem = React.memo(
  function TickerItem({ item }: { item: CurrencyRate }) {
    const isPositive = item.changePercent >= 0;
    const hasChange = Math.abs(item.changePercent) >= 0.005;
    return (
      <View style={{ flexDirection: "row", alignItems: "center", marginRight: 22 }}>
        <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.6)", marginRight: 6 }}>
          {item.code}
        </Text>
        <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginRight: 5, fontVariant: ["tabular-nums"] }}>
          {item.buy.toFixed(4)}
        </Text>
        <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: hasChange ? (isPositive ? "#5EEAA8" : "#FF8585") : "rgba(255,255,255,0.45)", fontVariant: ["tabular-nums"] }}>
          {hasChange ? `${isPositive ? "▲" : "▼"} ${Math.abs(item.changePercent).toFixed(2)}%` : "—"}
        </Text>
      </View>
    );
  },
  (prev, next) =>
    prev.item.code === next.item.code &&
    prev.item.buy === next.item.buy &&
    prev.item.changePercent === next.item.changePercent
);

const MarqueeTicker = React.memo(function MarqueeTicker({
  items,
  bgColor,
}: {
  items: CurrencyRate[];
  bgColor: string;
}) {
  const [contentWidth, setContentWidth] = useState(0);
  const translateX = useSharedValue(0);
  const measuredRef = useRef(false);

  useEffect(() => {
    if (contentWidth <= 0) return;
    const pxPerSecond = 40;
    const durationMs = (contentWidth / pxPerSecond) * 1000;
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-contentWidth, { duration: durationMs, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(translateX);
  }, [contentWidth, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onContentLayout = (e: LayoutChangeEvent) => {
    if (measuredRef.current) return;
    const w = e.nativeEvent.layout.width;
    if (w > 0) {
      measuredRef.current = true;
      setContentWidth(w);
    }
  };

  if (items.length === 0) {
    return <View style={{ backgroundColor: bgColor, height: 32 }} />;
  }

  return (
    <View style={{ backgroundColor: bgColor, paddingVertical: 8, overflow: "hidden" }}>
      <Animated.View style={[{ flexDirection: "row" }, animatedStyle]}>
        <View style={{ flexDirection: "row", paddingLeft: 16 }} onLayout={onContentLayout}>
          {items.map((c) => <TickerItem key={`a-${c.code}`} item={c} />)}
        </View>
        <View style={{ flexDirection: "row", paddingLeft: 16 }}>
          {items.map((c) => <TickerItem key={`b-${c.code}`} item={c} />)}
        </View>
      </Animated.View>
    </View>
  );
});

export default function MarketScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currencies, goldRates, favorites, toggleFavorite, isLoading, refreshData, lastUpdated } = useApp();
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

  const featuredGold = goldRates.find((g) => g.code === "ALTIN") ?? goldRates[0];
  const featuredUsd = currencies.find((c) => c.code === "USD");
  const featuredEur = currencies.find((c) => c.code === "EUR");

  const topPadding = Platform.OS === "web" ? 14 : insets.top;
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 84 : 60 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  const displayCurrencies = useMemo(
    () =>
      activeTab === "favorites"
        ? currencies.filter((c) => favorites.includes(c.code))
        : currencies,
    [activeTab, currencies, favorites]
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    heroWrap: { paddingTop: topPadding },
    hero: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 18,
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    brand: { flexDirection: "row", alignItems: "center" },
    brandLogo: { width: 180, height: 64 },
    brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
    brandText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 1.4 },
    heroIconBtn: {
      width: 34, height: 34, borderRadius: 17,
      backgroundColor: "rgba(255,255,255,0.1)",
      alignItems: "center", justifyContent: "center",
    },
    heroBigRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
    heroLabel: {
      fontSize: 11, fontFamily: "Inter_500Medium",
      color: "rgba(255,255,255,0.55)", letterSpacing: 1.5,
      marginBottom: 4,
    },
    heroPrice: {
      fontSize: 38, fontFamily: "Inter_700Bold",
      color: "#FFFFFF", letterSpacing: -1,
      fontVariant: ["tabular-nums"],
    },
    heroSubRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 },
    heroSubText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)" },
    heroChangePill: {
      flexDirection: "row", alignItems: "center", gap: 4,
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    },
    heroChangeText: { fontSize: 11, fontFamily: "Inter_700Bold" },

    miniRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 16,
    },
    miniCard: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    miniLabel: {
      fontSize: 10, fontFamily: "Inter_500Medium",
      color: "rgba(255,255,255,0.55)", letterSpacing: 1,
    },
    miniValue: {
      fontSize: 17, fontFamily: "Inter_700Bold",
      color: "#FFFFFF", marginTop: 2,
      fontVariant: ["tabular-nums"],
    },
    miniDelta: { fontSize: 10, fontFamily: "Inter_600SemiBold", marginTop: 2 },

    tickerStrip: {
      backgroundColor: colors.primaryDark,
      paddingVertical: 8,
    },

    sectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 16, fontFamily: "Inter_700Bold",
      color: colors.foreground, letterSpacing: -0.2,
    },
    sectionMeta: {
      fontSize: 10, fontFamily: "Inter_500Medium",
      color: colors.mutedForeground, letterSpacing: 1,
    },

    segmentRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 8,
      marginBottom: 6,
    },
    segment: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    segmentActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    segmentText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
    },
    segmentTextActive: { color: "#FFFFFF" },

    tableHead: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    th: {
      fontSize: 10, fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground, letterSpacing: 1,
    },

    list: { paddingBottom: bottomPadding + 16 },

    statusDot: {
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: colors.rise, marginRight: 6,
    },
    liveBadge: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.1)",
      paddingHorizontal: 8, paddingVertical: 4,
      borderRadius: 999,
    },
    liveText: {
      fontSize: 10, fontFamily: "Inter_600SemiBold",
      color: "rgba(255,255,255,0.9)", letterSpacing: 1,
    },
  });

  const formatTime = (date: Date | null) => {
    if (!date) return "—";
    return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const goldChange = featuredGold?.change ?? 0;
  const goldChangePct = featuredGold?.changePercent ?? 0;
  const goldUp = goldChange >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark, "#04173B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.brand}>
              <Image
                source={require("@/assets/images/logo-dark.png")}
                style={styles.brandLogo}
                contentFit="contain"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={styles.liveBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.liveText}>{lastUpdated ? formatTime(lastUpdated) : "BAĞLANIYOR"}</Text>
              </View>
              <Pressable
                style={styles.heroIconBtn}
                onPress={() => router.push("/alerts")}
                hitSlop={6}
              >
                <Icon name="notifications-outline" size={17} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <Pressable onPress={() => router.push({ pathname: "/detail/[code]", params: { code: "ALTIN", type: "gold" } })}>
            <Text style={styles.heroLabel}>GRAM ALTIN · TL</Text>
            <View style={styles.heroBigRow}>
              <View>
                <Text style={styles.heroPrice}>
                  {(featuredGold?.buy ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <View style={styles.heroSubRow}>
                  <View style={[styles.heroChangePill, { backgroundColor: goldUp ? "rgba(94,234,168,0.15)" : "rgba(255,133,133,0.15)" }]}>
                    <Icon
                      name={goldUp ? "caret-up" : "caret-down"}
                      size={11}
                      color={goldUp ? "#5EEAA8" : "#FF8585"}
                    />
                    <Text style={[styles.heroChangeText, { color: goldUp ? "#5EEAA8" : "#FF8585" }]}>
                      {goldUp ? "+" : ""}{goldChangePct.toFixed(2)}%
                    </Text>
                  </View>
                  <Text style={styles.heroSubText}>
                    {goldUp ? "+" : ""}{goldChange.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.heroLabel}>SATIŞ</Text>
                <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF", fontVariant: ["tabular-nums"] }}>
                  {(featuredGold?.sell ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.heroSubText, { marginTop: 4 }]}>
                  Fark {(((featuredGold?.sell ?? 0) - (featuredGold?.buy ?? 0))).toFixed(2)} ₺
                </Text>
              </View>
            </View>
          </Pressable>

          <View style={styles.miniRow}>
            <Pressable
              style={styles.miniCard}
              onPress={() => router.push({ pathname: "/detail/[code]", params: { code: "USD", type: "currency" } })}
            >
              <Text style={styles.miniLabel}>USD/TRY</Text>
              <Text style={styles.miniValue}>
                {(featuredUsd?.buy ?? 0).toFixed(4)}
              </Text>
              <Text style={[styles.miniDelta, { color: (featuredUsd?.changePercent ?? 0) >= 0 ? "#5EEAA8" : "#FF8585" }]}>
                {(featuredUsd?.changePercent ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(featuredUsd?.changePercent ?? 0).toFixed(2)}%
              </Text>
            </Pressable>
            <Pressable
              style={styles.miniCard}
              onPress={() => router.push({ pathname: "/detail/[code]", params: { code: "EUR", type: "currency" } })}
            >
              <Text style={styles.miniLabel}>EUR/TRY</Text>
              <Text style={styles.miniValue}>
                {(featuredEur?.buy ?? 0).toFixed(4)}
              </Text>
              <Text style={[styles.miniDelta, { color: (featuredEur?.changePercent ?? 0) >= 0 ? "#5EEAA8" : "#FF8585" }]}>
                {(featuredEur?.changePercent ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(featuredEur?.changePercent ?? 0).toFixed(2)}%
              </Text>
            </Pressable>
            <Pressable
              style={styles.miniCard}
              onPress={() => router.push({ pathname: "/detail/[code]", params: { code: "ONS", type: "gold" } })}
            >
              <Text style={styles.miniLabel}>ONS · USD</Text>
              <Text style={styles.miniValue}>
                {(goldRates.find((g) => g.code === "ONS")?.buy ?? 0).toFixed(2)}
              </Text>
              <Text style={[styles.miniDelta, { color: (goldRates.find((g) => g.code === "ONS")?.changePercent ?? 0) >= 0 ? "#5EEAA8" : "#FF8585" }]}>
                {(goldRates.find((g) => g.code === "ONS")?.changePercent ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(goldRates.find((g) => g.code === "ONS")?.changePercent ?? 0).toFixed(2)}%
              </Text>
            </Pressable>
          </View>
        </LinearGradient>

        <MarqueeTicker items={currencies} bgColor={colors.primaryDark} />
      </View>

      <FlatList
        data={displayCurrencies}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <PriceCard
            item={item}
            type="currency"
            isFavorite={favorites.includes(item.code)}
            onFavoriteToggle={() => toggleFavorite(item.code)}
            onPress={() => router.push({ pathname: "/detail/[code]", params: { code: item.code, type: "currency" } })}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Döviz Kurları</Text>
            </View>
            <View style={styles.segmentRow}>
              <Pressable
                style={[styles.segment, activeTab === "all" && styles.segmentActive]}
                onPress={() => setActiveTab("all")}
              >
                <Text style={[styles.segmentText, activeTab === "all" && styles.segmentTextActive]}>
                  Tümü
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segment, activeTab === "favorites" && styles.segmentActive]}
                onPress={() => setActiveTab("favorites")}
              >
                <Icon name="star" size={11} color={activeTab === "favorites" ? "#FFFFFF" : colors.mutedForeground} />
                <Text style={[styles.segmentText, activeTab === "favorites" && styles.segmentTextActive]}>
                  Favoriler
                </Text>
              </Pressable>
            </View>
            <View style={styles.tableHead}>
              <Text style={styles.th}>BİRİM</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.th}>ALIŞ</Text>
              <Text style={[styles.th, { marginLeft: 16 }]}>SATIŞ</Text>
            </View>
          </>
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} tintColor={colors.primary} />
        }
      />
    </View>
  );
}
