import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
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
import { AdBanner } from "@/components/ads/AdBanner";
import { ModernPriceRow, ModernTableHeader } from "@/components/ModernPriceRow";
import { PriceRowSkeleton } from "@/components/common/skeletons/PriceRowSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

export default function MarketScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currencies, banks, favorites, toggleFavorite, refreshData, lastUpdated, lastRefreshFailed } = useApp();
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

  const displayCurrencies = useMemo(() => currencies, [currencies]);

  const isLive = !!lastUpdated;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 10,
    },
    titleText: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    liveBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: isLive ? "#22C55E" : colors.mutedForeground,
    },
    liveBadgeText: {
      fontSize: 11,
      fontFamily: "Inter_700Bold",
      color: isLive ? "#22C55E" : colors.mutedForeground,
      letterSpacing: 0.6,
    },

    sectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 4,
    },
    sectionTitle: {
      fontSize: 15,
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

    list: { paddingBottom: bottomPadding + 16 },
  });

  const renderHeader = () => (
    <>
      <AdBanner />
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>Döviz Kurları</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>{isLive ? "CANLI" : "BAĞLANIYOR"}</Text>
        </View>
      </View>

      <ModernTableHeader currencyLayout />
    </>
  );

  const renderFooter = () =>
    banks.length > 0 ? (
      <View>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Banka Fiyatları</Text>
          <Text style={styles.sectionMeta}>BANKA ORT.</Text>
        </View>
        <ModernTableHeader currencyLayout />
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
                currencyLayout={!isGold}
                isFavorite={favorites.includes(b.code)}
                onFavoriteToggle={() => toggleFavorite(b.code)}
                onLongPress={() => openMenu(b, t)}
                onPress={() =>
                  router.push({
                    pathname: "/detail/[code]",
                    params: { code: b.code, type: t },
                  })
                }
              />
            </SwipeableRow>
          );
        })}
        <AdBanner style={{ marginTop: 8 }} />
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
              currencyLayout
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
          lastRefreshFailed ? (
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
