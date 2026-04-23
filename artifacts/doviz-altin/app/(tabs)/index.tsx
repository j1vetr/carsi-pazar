import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useApp, type CurrencyRate, type GoldRate } from "@/contexts/AppContext";
import { haptics } from "@/lib/utils/haptics";
import { PriceRowMenu } from "@/components/common/PriceRowMenu";
import { SwipeableRow } from "@/components/common/SwipeableRow";
import { symbolLeftActions } from "@/lib/utils/swipeActions";
import { MinimalTopBar } from "@/components/MinimalTopBar";
import { ModernPriceRow, ModernTableHeader } from "@/components/ModernPriceRow";
import { PriceRowSkeleton } from "@/components/common/skeletons/PriceRowSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

export default function MarketScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currencies, banks, favorites, toggleFavorite, refreshData, lastUpdated, lastRefreshFailed } = useApp();
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const onManualRefresh = useCallback(async () => {
    haptics.tap();
    setManualRefreshing(true);
    try {
      const r = await refreshData();
      if (r.ok) haptics.success();
      else haptics.error();
    } catch {
      haptics.error();
    } finally {
      setManualRefreshing(false);
    }
  }, [refreshData]);

  const [menuItem, setMenuItem] = useState<CurrencyRate | GoldRate | null>(null);
  const [menuType, setMenuType] = useState<"currency" | "gold">("currency");
  const openMenu = useCallback((it: CurrencyRate | GoldRate, t: "currency" | "gold") => {
    setMenuItem(it);
    setMenuType(t);
  }, []);

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

    sectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.3,
    },
    sectionMeta: {
      fontSize: 9.5,
      fontFamily: "Inter_700Bold",
      color: colors.mutedForeground,
      letterSpacing: 1.4,
    },

    segmentRow: {
      flexDirection: "row",
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 6,
      gap: 8,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: colors.surface,
    },
    chipActive: { backgroundColor: colors.foreground },
    chipText: {
      fontSize: 12.5,
      fontFamily: "Inter_700Bold",
      color: colors.mutedForeground,
      letterSpacing: -0.1,
    },
    chipTextActive: { color: colors.background },

    list: { paddingBottom: bottomPadding + 16 },

    emptyWrap: { paddingVertical: 60, alignItems: "center", paddingHorizontal: 32 },
    emptyTitle: {
      fontSize: 14, fontFamily: "Inter_700Bold",
      color: colors.foreground, marginTop: 12, textAlign: "center",
    },
    emptyText: {
      fontSize: 12, fontFamily: "Inter_500Medium",
      color: colors.mutedForeground, marginTop: 6, textAlign: "center", lineHeight: 18,
    },
  });

  const renderHeader = () => (
    <>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Döviz Kurları</Text>
        <Text style={styles.sectionMeta}>{lastUpdated ? "CANLI" : "BAĞLANIYOR"}</Text>
      </View>
      <View style={styles.segmentRow}>
        <Pressable
          style={[styles.chip, activeTab === "all" && styles.chipActive]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={[styles.chipText, activeTab === "all" && styles.chipTextActive]}>Tümü</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, activeTab === "favorites" && styles.chipActive]}
          onPress={() => setActiveTab("favorites")}
        >
          <Icon
            name={activeTab === "favorites" ? "star" : "star-outline"}
            size={11}
            color={activeTab === "favorites" ? colors.background : colors.mutedForeground}
          />
          <Text style={[styles.chipText, activeTab === "favorites" && styles.chipTextActive]}>
            Favoriler
          </Text>
        </Pressable>
      </View>
      <ModernTableHeader />
    </>
  );

  const renderFooter = () =>
    banks.length > 0 ? (
      <View>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Banka Fiyatları</Text>
          <Text style={styles.sectionMeta}>BANKA ORT.</Text>
        </View>
        <ModernTableHeader />
        {banks.map((b) => {
          const isGold = b.code === "BANKA_ALTIN";
          const t = isGold ? "gold" : "currency";
          return (
            <SwipeableRow
              key={b.code}
              leftActions={symbolLeftActions({
                item: b,
                type: t,
                isFavorite: favorites.includes(b.code),
                toggleFavorite,
                colors,
              })}
            >
              <ModernPriceRow
                item={b}
                type={t}
                isFavorite={favorites.includes(b.code)}
                onFavoriteToggle={() => toggleFavorite(b.code)}
                onLongPress={() => openMenu(b, t)}
                onPress={() => router.push({
                  pathname: "/detail/[code]",
                  params: { code: b.code, type: t },
                })}
              />
            </SwipeableRow>
          );
        })}
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <MinimalTopBar lastUpdated={lastUpdated} />
      <FlatList
        data={displayCurrencies}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <SwipeableRow
            leftActions={symbolLeftActions({
              item,
              type: "currency",
              isFavorite: favorites.includes(item.code),
              toggleFavorite,
              colors,
            })}
          >
            <ModernPriceRow
              item={item}
              type="currency"
              isFavorite={favorites.includes(item.code)}
              onFavoriteToggle={() => toggleFavorite(item.code)}
              onLongPress={() => openMenu(item, "currency")}
              onPress={() =>
                router.push({ pathname: "/detail/[code]", params: { code: item.code, type: "currency" } })
              }
            />
          </SwipeableRow>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          activeTab === "favorites" ? (
            <EmptyState
              icon="star-outline"
              title="Henüz Favori Döviz Yok"
              description="Bir döviz satırının yıldızına dokunarak favorilerine ekleyebilirsin."
              compact
            />
          ) : lastRefreshFailed ? (
            <ErrorState
              title="Kurlar Yüklenemedi"
              description="Bağlantını kontrol edip tekrar dene."
              onRetry={() => void refreshData()}
              compact
            />
          ) : (
            <PriceRowSkeleton count={8} withIcon />
          )
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={manualRefreshing}
            onRefresh={onManualRefresh}
            tintColor={colors.primary}
          />
        }
      />
      <PriceRowMenu
        item={menuItem}
        type={menuType}
        visible={!!menuItem}
        onClose={() => setMenuItem(null)}
      />
    </View>
  );
}
