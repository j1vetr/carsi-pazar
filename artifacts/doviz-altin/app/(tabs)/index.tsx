import React, { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, CurrencyRate } from "@/contexts/AppContext";
import { PriceCard } from "@/components/PriceCard";
import { AssetIcon } from "@/components/AssetIcon";

function TickerItem({ item, colors }: { item: CurrencyRate; colors: any }) {
  const isPositive = item.changePercent >= 0;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginRight: 24 }}>
      <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginRight: 4 }}>
        {item.code}
      </Text>
      <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.foreground, marginRight: 3 }}>
        {item.buy >= 10 ? item.buy.toFixed(4) : item.buy.toFixed(4)}
      </Text>
      <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: isPositive ? colors.rise : colors.fall }}>
        {isPositive ? "▲" : "▼"} {Math.abs(item.changePercent).toFixed(2)}%
      </Text>
    </View>
  );
}

export default function MarketScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currencies, favorites, toggleFavorite, isLoading, refreshData, lastUpdated } = useApp();
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [searchQuery] = useState("");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 84 : 60 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  const displayCurrencies = activeTab === "favorites"
    ? currencies.filter((c) => favorites.includes(c.code))
    : currencies.filter((c) =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nameTR.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPadding + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    lastUpdated: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    tickerContainer: {
      height: 36,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      overflow: "hidden",
    },
    tabRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 12,
      backgroundColor: colors.secondary,
      borderRadius: 10,
      padding: 3,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 8,
    },
    tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    listContainer: { paddingHorizontal: 16, gap: 8, paddingBottom: bottomPadding + 16 },
    headerGoldBanner: {
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: colors.radius,
      overflow: "hidden",
    },
    goldBannerInner: { padding: 16 },
    goldBannerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    goldLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
    goldPrice: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 2 },
    goldChange: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.9)" },
    goldSubText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", marginTop: 4 },
  });

  const formatTime = (date: Date | null) => {
    if (!date) return "—";
    return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Piyasa</Text>
        <Text style={styles.lastUpdated}>Son güncelleme: {formatTime(lastUpdated)}</Text>
      </View>

      <View style={styles.tickerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, alignItems: "center" }}>
          {currencies.slice(0, 6).map((c) => <TickerItem key={c.code} item={c} colors={colors} />)}
        </ScrollView>
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
            compact={false}
          />
        )}
        ListHeaderComponent={
          <>
            <Pressable
              style={styles.headerGoldBanner}
              onPress={() => router.push({ pathname: "/detail/[code]", params: { code: "ALTIN", type: "gold" } })}
            >
              <LinearGradient
                colors={["#8B6914", "#C9A84C", "#D4AF5A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.goldBannerInner}
              >
                <View style={styles.goldBannerRow}>
                  <View>
                    <Text style={styles.goldLabel}>HAS ALTIN (GRAM)</Text>
                    <Text style={styles.goldPrice}>₺4.124,50</Text>
                    <Text style={styles.goldSubText}>Alış / Satış: 4.124,50 / 4.138,20</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Ionicons name="trending-up" size={32} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.goldChange}>+0.60%</Text>
                    <Text style={styles.goldSubText}>+24,80 ₺</Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>

            <View style={styles.tabRow}>
              <Pressable
                style={[styles.tabBtn, activeTab === "all" && { backgroundColor: colors.card }]}
                onPress={() => setActiveTab("all")}
              >
                <Text style={[styles.tabText, { color: activeTab === "all" ? colors.foreground : colors.mutedForeground }]}>
                  Tümü
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tabBtn, activeTab === "favorites" && { backgroundColor: colors.card }]}
                onPress={() => setActiveTab("favorites")}
              >
                <Text style={[styles.tabText, { color: activeTab === "favorites" ? colors.foreground : colors.mutedForeground }]}>
                  Favoriler
                </Text>
              </Pressable>
            </View>
          </>
        }
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshData}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
