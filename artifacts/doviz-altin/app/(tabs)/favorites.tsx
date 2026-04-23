import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { PriceCard } from "@/components/PriceCard";
import { useColors } from "@/hooks/useColors";
import { useApp, CurrencyRate, GoldRate } from "@/contexts/AppContext";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PriceCardSkeleton } from "@/components/common/skeletons/PriceRowSkeleton";

// ── Types ──────────────────────────────────────────────────────────────────
type FavRow =
  | { kind: "header"; key: string; title: string; subtitle: string }
  | { kind: "card"; key: string; type: "currency" | "gold"; item: CurrencyRate | GoldRate };

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyFavorites(_: { colors: any }) {
  return (
    <EmptyState
      icon="star-outline"
      title="Henüz Favorin Yok"
      description="Bir varlığın detay sayfasında sağ üstteki yıldız simgesine dokunarak favorilerine ekleyebilirsin."
      action={{
        label: "Piyasayı Keşfet",
        icon: "trending-up",
        onPress: () => {
          Haptics.selectionAsync().catch(() => {});
          router.push("/");
        },
      }}
    />
  );
}

// ── Main screen ───────────────────────────────────────────────────────────
export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    favorites, toggleFavorite,
    currencies, parities, currencyParities, goldRates, banks,
    lastUpdated, lastRefreshFailed, refreshData,
  } = useApp();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 100 : 76 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  // ── Resolve & group favorites ────────────────────────────────────────
  const grouped = useMemo(() => {
    const fav = new Set(favorites);
    const bankUsd = banks.find((b) => b.code === "BANKAUSD" && fav.has(b.code));
    const dovizList: CurrencyRate[] = [
      ...currencies.filter((c) => fav.has(c.code)),
      ...(bankUsd ? [bankUsd as unknown as CurrencyRate] : []),
    ];
    const pariteList: CurrencyRate[] = [...parities, ...currencyParities].filter((c) => fav.has(c.code));
    const altinList: GoldRate[] = [
      ...goldRates.filter((g) => fav.has(g.code)),
      ...banks.filter((b) => b.code !== "BANKAUSD" && fav.has(b.code)),
    ];

    // Dedupe parities (in case of overlap)
    const seen = new Set<string>();
    const uniqueParites = pariteList.filter((p) => {
      if (seen.has(p.code)) return false;
      seen.add(p.code);
      return true;
    });

    return { dovizList, altinList, pariteList: uniqueParites };
  }, [favorites, currencies, parities, currencyParities, goldRates, banks]);

  const totalCount = grouped.dovizList.length + grouped.altinList.length + grouped.pariteList.length;
  const missingCount = favorites.length - totalCount;

  // ── Hero stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const all: (CurrencyRate | GoldRate)[] = [
      ...grouped.dovizList, ...grouped.altinList, ...grouped.pariteList,
    ];
    if (all.length === 0) {
      return { avgChange: 0, topGainer: null as (CurrencyRate | GoldRate) | null, topLoser: null as (CurrencyRate | GoldRate) | null };
    }
    let sum = 0;
    let topGainer = all[0];
    let topLoser = all[0];
    for (const r of all) {
      sum += r.changePercent;
      if (r.changePercent > topGainer.changePercent) topGainer = r;
      if (r.changePercent < topLoser.changePercent) topLoser = r;
    }
    return { avgChange: sum / all.length, topGainer, topLoser };
  }, [grouped]);

  const isAvgPos = stats.avgChange >= 0;

  // ── Build flat row list for FlatList ───────────────────────────────
  const rows = useMemo<FavRow[]>(() => {
    const list: FavRow[] = [];
    if (grouped.dovizList.length > 0) {
      list.push({ kind: "header", key: "h-doviz", title: "Döviz Kurları", subtitle: `${grouped.dovizList.length} varlık` });
      grouped.dovizList.forEach((c) => list.push({ kind: "card", key: `c-${c.code}`, type: "currency", item: c }));
    }
    if (grouped.altinList.length > 0) {
      list.push({ kind: "header", key: "h-altin", title: "Altın Ve Madenler", subtitle: `${grouped.altinList.length} varlık` });
      grouped.altinList.forEach((g) => list.push({ kind: "card", key: `g-${g.code}`, type: "gold", item: g }));
    }
    if (grouped.pariteList.length > 0) {
      list.push({ kind: "header", key: "h-parite", title: "Pariteler", subtitle: `${grouped.pariteList.length} varlık` });
      grouped.pariteList.forEach((p) => list.push({ kind: "card", key: `p-${p.code}`, type: "currency", item: p }));
    }
    return list;
  }, [grouped]);

  // ── Confirm remove ─────────────────────────────────────────────────
  const handleRemove = (code: string, name: string) => {
    Alert.alert(
      "Favorilerden Çıkar",
      `${name} favorilerinden çıkarılsın mı?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkar",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            toggleFavorite(code);
          },
        },
      ]
    );
  };

  // ── Hero ───────────────────────────────────────────────────────────
  const heroSection = (
    <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.gold }} />
        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.4 }}>
          TAKİP LİSTEM
        </Text>
      </View>

      {/* Big count */}
      <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 10 }}>
        <Text style={{ fontSize: 56, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -2, includeFontPadding: false }}>
          {totalCount}
        </Text>
        <Text style={{ fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginLeft: 10, letterSpacing: -0.4 }}>
          {totalCount === 1 ? "varlık" : "varlık"}
        </Text>
      </View>

      {/* Avg change pill */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 5,
          backgroundColor: (isAvgPos ? colors.rise : colors.fall) + "1A",
          paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
        }}>
          <Icon name={isAvgPos ? "trending-up" : "trending-down"} size={13} color={isAvgPos ? colors.rise : colors.fall} />
          <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: isAvgPos ? colors.rise : colors.fall, letterSpacing: -0.2 }}>
            {isAvgPos ? "+" : ""}{stats.avgChange.toFixed(2)}%
          </Text>
        </View>
        <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
          ortalama günlük değişim
        </Text>
      </View>

      {/* Top gainer / loser strip */}
      {stats.topGainer && stats.topLoser && stats.topGainer.code !== stats.topLoser.code ? (
        <View style={{ flexDirection: "row", marginTop: 22, gap: 10 }}>
          {/* Top gainer */}
          <View style={{
            flex: 1, backgroundColor: colors.card, borderRadius: 14,
            paddingHorizontal: 14, paddingVertical: 12,
            borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Icon name="arrow-up" size={10} color={colors.rise} />
              <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.rise, letterSpacing: 0.7 }}>
                EN ÇOK YÜKSELEN
              </Text>
            </View>
            <Text numberOfLines={1} style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 6, letterSpacing: -0.3 }}>
              {stats.topGainer.code}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.rise, marginTop: 2, letterSpacing: -0.2 }}>
              +{stats.topGainer.changePercent.toFixed(2)}%
            </Text>
          </View>
          {/* Top loser */}
          <View style={{
            flex: 1, backgroundColor: colors.card, borderRadius: 14,
            paddingHorizontal: 14, paddingVertical: 12,
            borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Icon name="arrow-down" size={10} color={colors.fall} />
              <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.fall, letterSpacing: 0.7 }}>
                EN ÇOK DÜŞEN
              </Text>
            </View>
            <Text numberOfLines={1} style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 6, letterSpacing: -0.3 }}>
              {stats.topLoser.code}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.fall, marginTop: 2, letterSpacing: -0.2 }}>
              {stats.topLoser.changePercent.toFixed(2)}%
            </Text>
          </View>
        </View>
      ) : null}

      {/* Distribution */}
      {totalCount > 1 ? (
        <View style={{ marginTop: 22 }}>
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.7, marginBottom: 10 }}>
            DAĞILIM
          </Text>
          <View style={{ flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: colors.secondary }}>
            {grouped.dovizList.length > 0 ? (
              <View style={{ flex: grouped.dovizList.length, backgroundColor: "#3B82F6" }} />
            ) : null}
            {grouped.altinList.length > 0 ? (
              <View style={{ flex: grouped.altinList.length, backgroundColor: colors.gold }} />
            ) : null}
            {grouped.pariteList.length > 0 ? (
              <View style={{ flex: grouped.pariteList.length, backgroundColor: "#A855F7" }} />
            ) : null}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 12 }}>
            {grouped.dovizList.length > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: "#3B82F6" }} />
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                  Döviz
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground }}>
                  {grouped.dovizList.length}
                </Text>
              </View>
            ) : null}
            {grouped.altinList.length > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.gold }} />
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                  Altın
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground }}>
                  {grouped.altinList.length}
                </Text>
              </View>
            ) : null}
            {grouped.pariteList.length > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: "#A855F7" }} />
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                  Parite
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground }}>
                  {grouped.pariteList.length}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Pending data hint */}
      {missingCount > 0 ? (
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 8,
          marginTop: 18, padding: 12, borderRadius: 12,
          backgroundColor: colors.secondary,
          borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
        }}>
          <Icon name="alert-circle" size={14} color={colors.mutedForeground} />
          <Text style={{ flex: 1, fontSize: 11.5, fontFamily: "Inter_500Medium", color: colors.mutedForeground, letterSpacing: -0.1 }}>
            {missingCount} favori için fiyat verisi henüz yüklenmedi.
          </Text>
        </View>
      ) : null}
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: topPadding + 12, paddingHorizontal: 20, paddingBottom: 18, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: 0.6, textTransform: "uppercase" }}>
            Daima Takipte
          </Text>
          <Text style={{ fontSize: 32, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 2, letterSpacing: -0.8 }}>
            Favorilerim
          </Text>
        </View>
        {totalCount > 0 ? (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: colors.gold + "1A",
            paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
            borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gold + "40",
          }}>
            <Icon name="star" size={13} color={colors.gold} />
            <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.goldDark ?? colors.gold, letterSpacing: -0.1 }}>
              {totalCount}
            </Text>
          </View>
        ) : null}
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        renderItem={({ item, index }) => {
          if (item.kind === "header") {
            return (
              <View
                style={{ paddingHorizontal: 20, paddingTop: index === 0 ? 0 : 22, paddingBottom: 10, flexDirection: "row", alignItems: "baseline", gap: 8 }}
              >
                <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                  {item.subtitle}
                </Text>
              </View>
            );
          }
          return (
            <View style={{ paddingHorizontal: 16 }}>
              <PriceCard
                item={item.item}
                type={item.type}
                isFavorite
                onFavoriteToggle={() => handleRemove(item.item.code, item.item.nameTR ?? item.item.code)}
                onPress={() =>
                  router.push({
                    pathname: "/detail/[code]",
                    params: { code: item.item.code, type: item.type },
                  })
                }
              />
            </View>
          );
        }}
        ListHeaderComponent={
          totalCount > 0 ? (
            <>
              {heroSection}
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: 20, marginBottom: 8 }} />
            </>
          ) : null
        }
        ListEmptyComponent={
          favorites.length === 0 ? (
            <EmptyFavorites colors={colors} />
          ) : currencies.length === 0 && goldRates.length === 0 && lastUpdated === null ? (
            // İlk açılış: hiç veri yok, hata da yok → iskelet.
            // İlk açılış başarısız olduysa (lastRefreshFailed) → ErrorState ile retry.
            lastRefreshFailed ? (
              <ErrorState
                title="Favoriler Yüklenemedi"
                description="Favori varlıkların için fiyat bilgisi alınamadı. İnternet bağlantını kontrol edip tekrar dene."
                icon="cloud-offline-outline"
                onRetry={() => { void refreshData(); }}
              />
            ) : (
              <View style={{ paddingTop: 8 }}><PriceCardSkeleton count={Math.min(favorites.length, 6)} /></View>
            )
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListFooterComponent={
          totalCount > 0 ? (
            <View style={{ alignItems: "center", marginTop: 22 }}>
              <View style={{
                flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: colors.secondary,
                paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
                borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
              }}>
                <Icon name="star-outline" size={11} color={colors.mutedForeground} />
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: -0.1 }}>
                  Çıkarmak için yıldıza dokun
                </Text>
              </View>
            </View>
          ) : null
        }
        contentContainerStyle={[
          { paddingBottom: bottomPadding, paddingTop: 4 },
          favorites.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
