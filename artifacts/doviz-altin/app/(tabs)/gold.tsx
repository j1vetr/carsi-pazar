import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, GoldRate } from "@/contexts/AppContext";
import { PriceCard } from "@/components/PriceCard";

function GoldSummaryCard({ ons, gram }: { ons: GoldRate | undefined; gram: GoldRate | undefined }) {
  const fmt = (n: number, frac = 2) =>
    n.toLocaleString("tr-TR", { minimumFractionDigits: frac, maximumFractionDigits: frac });
  const onsBuy = ons?.buy ?? 0;
  const onsChange = ons?.change ?? 0;
  const onsChangePct = ons?.changePercent ?? 0;
  const isPos = onsChange >= 0;
  const spread = (ons?.sell ?? 0) - (ons?.buy ?? 0);
  const spreadPct = onsBuy > 0 ? (spread / onsBuy) * 100 : 0;
  return (
    <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
      <LinearGradient
        colors={["#1A0F00", "#3D2A00", "#6B4A00"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 20 }}
      >
        <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,215,0,0.6)", letterSpacing: 1.5, marginBottom: 8 }}>
          ONS ALTIN (USD)
        </Text>
        <Text style={{ fontSize: 32, fontFamily: "Inter_700Bold", color: "#FFD700", letterSpacing: -0.5 }}>
          ${fmt(onsBuy)}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <Ionicons name={isPos ? "trending-up" : "trending-down"} size={14} color={isPos ? "#22C55E" : "#EF4444"} />
          <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: isPos ? "#22C55E" : "#EF4444", marginLeft: 4 }}>
            {isPos ? "+" : ""}{fmt(onsChange)} ({isPos ? "+" : ""}{onsChangePct.toFixed(2)}%)
          </Text>
          <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,215,0,0.5)", marginLeft: 12 }}>
            Bugün
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,215,0,0.15)" }}>
          {[
            { label: "GRAM ALTIN", value: `₺${fmt(gram?.buy ?? 0)}` },
            { label: "ONS SATIŞ", value: `$${fmt(ons?.sell ?? 0)}` },
            { label: "ONS SPREAD", value: `${spreadPct.toFixed(2)}%` },
          ].map((stat) => (
            <View key={stat.label} style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 9, fontFamily: "Inter_400Regular", color: "rgba(255,215,0,0.5)", letterSpacing: 0.5 }}>
                {stat.label}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,215,0,0.9)", marginTop: 3 }}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

export default function GoldScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { goldRates, favorites, toggleFavorite, isLoading, refreshData } = useApp();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 84 : 60 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPadding + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    listContent: { paddingHorizontal: 16, gap: 8, paddingBottom: bottomPadding + 16 },
    sectionLabel: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 1.0,
      marginTop: 8,
      marginBottom: 4,
      marginHorizontal: 4,
    },
  });

  const goldItems = goldRates.filter((g) => !["GUMUS"].includes(g.code));
  const silverItems = goldRates.filter((g) => ["GUMUS"].includes(g.code));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Altın & Gümüş</Text>
        <Pressable onPress={() => router.push("/alerts")} style={{ padding: 6 }}>
          <Ionicons name="notifications-outline" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <FlatList
        data={goldItems}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <PriceCard
            item={item}
            type="gold"
            isFavorite={favorites.includes(item.code)}
            onFavoriteToggle={() => toggleFavorite(item.code)}
            onPress={() =>
              router.push({
                pathname: "/detail/[code]",
                params: { code: item.code, type: "gold" },
              })
            }
            compact={false}
          />
        )}
        ListHeaderComponent={
          <>
            <GoldSummaryCard
              ons={goldRates.find((g) => g.code === "ONS")}
              gram={goldRates.find((g) => g.code === "ALTIN")}
            />
            <Text style={styles.sectionLabel}>ALTIN ÇEŞİTLERİ</Text>
          </>
        }
        ListFooterComponent={
          silverItems.length > 0 ? (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 16 }]}>GÜMÜŞ</Text>
              {silverItems.map((item) => (
                <View key={item.code} style={{ marginBottom: 8 }}>
                  <PriceCard
                    item={item}
                    type="gold"
                    isFavorite={favorites.includes(item.code)}
                    onFavoriteToggle={() => toggleFavorite(item.code)}
                    onPress={() =>
                      router.push({
                        pathname: "/detail/[code]",
                        params: { code: item.code, type: "gold" },
                      })
                    }
                    compact={false}
                  />
                </View>
              ))}
            </>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshData}
            tintColor={colors.gold}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
