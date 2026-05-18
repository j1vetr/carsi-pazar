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
import { haptics } from "@/lib/utils/haptics";
import { Icon } from "@/components/Icon";
import { AssetIcon } from "@/components/AssetIcon";
import { SwipeableRow } from "@/components/common/SwipeableRow";
import { PriceRowMenu } from "@/components/common/PriceRowMenu";
import { useColors } from "@/hooks/useColors";
import { useApp, type CurrencyRate, type GoldRate } from "@/contexts/AppContext";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PriceCardSkeleton } from "@/components/common/skeletons/PriceRowSkeleton";
import { formatPercent } from "@/lib/utils/format";

// ── Types ──────────────────────────────────────────────────────────────────
type FavRow =
  | { kind: "header"; key: string }
  | { kind: "asset"; key: string; type: "currency" | "gold"; item: CurrencyRate | GoldRate };

// ── Category helpers ────────────────────────────────────────────────────────
const CAT_COLOR = {
  doviz:  { main: "#1246B5", soft: "#EEF3FF", label: "DÖVİZ"  },
  altin:  { main: "#C09020", soft: "#FEF7E6", label: "ALTIN"  },
  parite: { main: "#7B3FD4", soft: "#F3ECFF", label: "PARİTE" },
} as const;
type CatKey = keyof typeof CAT_COLOR;

function itemCatKey(item: CurrencyRate | GoldRate, type: "currency" | "gold"): CatKey {
  if (type === "gold") return "altin";
  const c = item as CurrencyRate;
  if (c.flag || c.code.length <= 4) {
    if (c.code.includes("/") || c.code.length > 4) return "parite";
  }
  return "doviz";
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyFavorites() {
  return (
    <EmptyState
      icon="star-outline"
      title="Henüz Favorin Yok"
      description="Bir varlığın satırına uzun basarak ya da detay sayfasındaki yıldıza dokunarak favorilerine ekleyebilirsin."
      action={{
        label: "Piyasayı Keşfet",
        icon: "trending-up",
        onPress: () => {
          haptics.select();
          router.push("/");
        },
      }}
    />
  );
}

// ── Mini direction bar ──────────────────────────────────────────────────────
function DirBar({ pct, colors }: { pct: number; colors: ReturnType<typeof useColors> }) {
  const pos = pct >= 0;
  const w = Math.min(Math.abs(pct) / 2, 1) * 18;
  return (
    <View style={{ width: 26, alignItems: pos ? "flex-start" : "flex-end", justifyContent: "center", position: "relative" }}>
      <View style={{ position: "absolute", left: "50%" as unknown as number, top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
      <View style={{
        height: 6, borderRadius: 3, width: w,
        backgroundColor: pos ? colors.rise : colors.fall, opacity: 0.75,
        marginLeft: pos ? 13 : undefined,
        marginRight: !pos ? 13 : undefined,
      }} />
    </View>
  );
}

// ── Category tag ────────────────────────────────────────────────────────────
function CatTag({ catKey, colors }: { catKey: CatKey; colors: ReturnType<typeof useColors> }) {
  const { main, soft, label } = CAT_COLOR[catKey];
  return (
    <View style={{
      backgroundColor: soft,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 2,
    }}>
      <Text style={{
        fontSize: 7.5,
        fontFamily: "Inter_700Bold",
        color: main,
        letterSpacing: 0.8,
      }}>{label}</Text>
    </View>
  );
}

// ── Summary stat card ───────────────────────────────────────────────────────
function StatCard({
  label, line1, line2, textColor, bgColor, colors,
}: {
  label: string; line1: string; line2?: string;
  textColor: string; bgColor: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: bgColor,
      borderRadius: 12,
      padding: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: textColor + "25",
    }}>
      <Text style={{ fontSize: 7.5, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: textColor, letterSpacing: -0.4, lineHeight: 16 }}>
        {line1}
      </Text>
      {line2 ? (
        <Text style={{ fontSize: 10.5, fontFamily: "Inter_700Bold", color: textColor, opacity: 0.75, letterSpacing: -0.2 }}>
          {line2}
        </Text>
      ) : null}
    </View>
  );
}

// ── Asset row ──────────────────────────────────────────────────────────────
function AssetRow({
  item, type, colors,
  onPress, onLongPress,
}: {
  item: CurrencyRate | GoldRate;
  type: "currency" | "gold";
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const isPos = item.changePercent >= 0;
  const hasChange = Math.abs(item.changePercent) >= 0.005;
  const changeColor = hasChange ? (isPos ? colors.rise : colors.fall) : colors.mutedForeground;
  const catKey = itemCatKey(item, type);
  const flagCode = type === "currency" ? (item as CurrencyRate).flag : undefined;

  const buyStr = item.buy >= 1000
    ? item.buy.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : item.buy.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

  return (
    <Pressable
      onPress={() => { haptics.tap(); onPress(); }}
      onLongPress={() => { haptics.longPress(); onLongPress(); }}
      delayLongPress={350}
      android_ripple={{ color: colors.surface }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 13,
        backgroundColor: colors.card,
        gap: 12,
      }}
    >
      {/* Flag / icon */}
      <AssetIcon
        code={item.code}
        type={type}
        size={40}
        variant="soft"
        flagCode={flagCode}
      />

      {/* Name column */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}
            numberOfLines={1}
          >
            {item.code}
          </Text>
          <CatTag catKey={catKey} colors={colors} />
        </View>
        <Text style={{ fontSize: 10.5, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}
          numberOfLines={1}
        >
          {item.nameTR}
        </Text>
      </View>

      {/* Direction bar */}
      <DirBar pct={item.changePercent} colors={colors} />

      {/* Price column */}
      <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
        <Text style={{
          fontSize: 15, fontFamily: "Inter_700Bold",
          color: colors.foreground, letterSpacing: -0.4,
          fontVariant: ["tabular-nums"],
        }}>
          {buyStr}
        </Text>
        {hasChange ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginTop: 3 }}>
            <Icon
              name={isPos ? "caret-up" : "caret-down"}
              size={9}
              color={changeColor}
            />
            <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: changeColor, letterSpacing: -0.1 }}>
              {formatPercent(item.changePercent)}
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 3 }}>—</Text>
        )}
      </View>
    </Pressable>
  );
}

// ── Main screen ─────────────────────────────────────────────────────────────
export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    favorites, toggleFavorite,
    currencies, parities, currencyParities, goldRates, banks,
    lastUpdated, lastRefreshFailed, refreshData,
  } = useApp();
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [menu, setMenu] = useState<{ item: CurrencyRate | GoldRate; type: "currency" | "gold" } | null>(null);

  const onManualRefresh = useCallback(async () => {
    haptics.tap();
    setManualRefreshing(true);
    try {
      const r = await refreshData();
      if (r.ok) haptics.success(); else haptics.error();
    } catch { haptics.error(); }
    finally { setManualRefreshing(false); }
  }, [refreshData]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 100 : 76 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  // ── Resolve & group ──────────────────────────────────────────────────────
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
    const seen = new Set<string>();
    const uniqueParites = pariteList.filter((p) => { if (seen.has(p.code)) return false; seen.add(p.code); return true; });
    return { dovizList, altinList, pariteList: uniqueParites };
  }, [favorites, currencies, parities, currencyParities, goldRates, banks]);

  const totalCount = grouped.dovizList.length + grouped.altinList.length + grouped.pariteList.length;
  const missingCount = favorites.length - totalCount;

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const all: (CurrencyRate | GoldRate)[] = [...grouped.dovizList, ...grouped.altinList, ...grouped.pariteList];
    if (all.length === 0) return { avgChange: 0, topGainer: null as (CurrencyRate | GoldRate) | null, topLoser: null as (CurrencyRate | GoldRate) | null };
    let sum = 0, topGainer = all[0]!, topLoser = all[0]!;
    for (const r of all) {
      sum += r.changePercent;
      if (r.changePercent > topGainer.changePercent) topGainer = r;
      if (r.changePercent < topLoser.changePercent) topLoser = r;
    }
    return { avgChange: sum / all.length, topGainer, topLoser };
  }, [grouped]);

  const isAvgPos = stats.avgChange >= 0;

  // ── Flat row list ─────────────────────────────────────────────────────────
  const rows = useMemo<FavRow[]>(() => {
    if (totalCount === 0) return [];
    const list: FavRow[] = [{ kind: "header", key: "header" }];
    grouped.dovizList.forEach((c) => list.push({ kind: "asset", key: `c-${c.code}`, type: "currency", item: c }));
    grouped.altinList.forEach((g) => list.push({ kind: "asset", key: `g-${g.code}`, type: "gold", item: g }));
    grouped.pariteList.forEach((p) => list.push({ kind: "asset", key: `p-${p.code}`, type: "currency", item: p }));
    return list;
  }, [grouped, totalCount]);

  // ── Header block ──────────────────────────────────────────────────────────
  const renderHeaderBlock = () => (
    <View>
      {/* Title row */}
      <View style={{
        paddingTop: topPadding + 12,
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}>
        <View>
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>
            Daima Takipte
          </Text>
          <Text style={{ fontSize: 34, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -1.2 }}>
            Favorilerim
          </Text>
        </View>
        {totalCount > 0 ? (
          <View style={{
            width: 52, height: 52,
            backgroundColor: colors.accentSoft,
            borderRadius: 14,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.gold + "50",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            marginTop: 4,
          }}>
            <Icon name="star" size={18} color={colors.gold} />
            <Text style={{ fontSize: 8, fontFamily: "Inter_700Bold", color: colors.gold, letterSpacing: 0.5 }}>
              {totalCount} VARLIK
            </Text>
          </View>
        ) : null}
      </View>

      {/* Stats strip */}
      {totalCount > 0 ? (
        <View style={{ flexDirection: "row", gap: 7, paddingHorizontal: 20, paddingBottom: 16 }}>
          <StatCard
            label="ORT. DEĞİŞİM"
            line1={`${isAvgPos ? "+" : ""}${stats.avgChange.toFixed(2)}%`}
            textColor={isAvgPos ? colors.rise : colors.fall}
            bgColor={isAvgPos ? colors.riseSoft : colors.fallSoft}
            colors={colors}
          />
          {stats.topGainer ? (
            <StatCard
              label="EN YÜKSELEN"
              line1={stats.topGainer.code}
              line2={`+${stats.topGainer.changePercent.toFixed(2)}%`}
              textColor={colors.primary}
              bgColor={colors.secondary}
              colors={colors}
            />
          ) : null}
          {stats.topLoser && stats.topLoser.code !== stats.topGainer?.code ? (
            <StatCard
              label="EN DÜŞEN"
              line1={stats.topLoser.code}
              line2={`${stats.topLoser.changePercent.toFixed(2)}%`}
              textColor={colors.fall}
              bgColor={colors.fallSoft}
              colors={colors}
            />
          ) : null}
        </View>
      ) : null}

      {/* Distribution bar */}
      {totalCount > 1 ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <View style={{ flexDirection: "row", height: 6, borderRadius: 3, overflow: "hidden", gap: 2 }}>
            {grouped.dovizList.length > 0 ? (
              <View style={{ flex: grouped.dovizList.length, backgroundColor: CAT_COLOR.doviz.main, opacity: 0.8, borderRadius: 3 }} />
            ) : null}
            {grouped.altinList.length > 0 ? (
              <View style={{ flex: grouped.altinList.length, backgroundColor: CAT_COLOR.altin.main, opacity: 0.8, borderRadius: 3 }} />
            ) : null}
            {grouped.pariteList.length > 0 ? (
              <View style={{ flex: grouped.pariteList.length, backgroundColor: CAT_COLOR.parite.main, opacity: 0.8, borderRadius: 3 }} />
            ) : null}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 9 }}>
            {grouped.dovizList.length > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: CAT_COLOR.doviz.main }} />
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Döviz</Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground }}>{grouped.dovizList.length}</Text>
              </View>
            ) : null}
            {grouped.altinList.length > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: CAT_COLOR.altin.main }} />
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Altın</Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground }}>{grouped.altinList.length}</Text>
              </View>
            ) : null}
            {grouped.pariteList.length > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: CAT_COLOR.parite.main }} />
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Parite</Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground }}>{grouped.pariteList.length}</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Missing data hint */}
      {missingCount > 0 ? (
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 8,
          marginHorizontal: 20, marginBottom: 12,
          padding: 12, borderRadius: 12,
          backgroundColor: colors.secondary,
          borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
        }}>
          <Icon name="alert-circle" size={14} color={colors.mutedForeground} />
          <Text style={{ flex: 1, fontSize: 11.5, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
            {missingCount} favori için fiyat verisi henüz yüklenmedi.
          </Text>
        </View>
      ) : null}

      {/* Divider section break */}
      <View style={{
        height: 8,
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      }} />
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        renderItem={({ item, index }) => {
          if (item.kind === "header") return renderHeaderBlock();

          const assetIndex = index - 1; // subtract header row
          const isLast = index === rows.length - 1;

          return (
            <View>
              <SwipeableRow
                rightActions={[{
                  label: "Çıkar",
                  icon: "trash-outline",
                  color: colors.fall,
                  destructive: true,
                  onPress: () => {
                    haptics.warning();
                    toggleFavorite(item.item.code);
                  },
                }]}
                leftActions={[
                  {
                    label: "Alarm",
                    icon: "notifications-outline",
                    color: colors.primary,
                    onPress: () => router.push({ pathname: "/alerts", params: { code: item.item.code, type: item.type } }),
                  },
                  {
                    label: "Portföye",
                    icon: "briefcase-outline",
                    color: colors.rise,
                    onPress: () => router.push({ pathname: "/(tabs)/portfolio", params: { addCode: item.item.code, addType: item.type } }),
                  },
                ]}
              >
                <AssetRow
                  item={item.item}
                  type={item.type}
                  colors={colors}
                  onPress={() => router.push({ pathname: "/detail/[code]", params: { code: item.item.code, type: item.type } })}
                  onLongPress={() => setMenu({ item: item.item, type: item.type })}
                />
              </SwipeableRow>
              {!isLast ? (
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 70 }} />
              ) : null}
            </View>
          );
        }}
        ListEmptyComponent={
          favorites.length === 0 ? (
            <View style={{ paddingTop: topPadding + 12 }}>
              <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>
                  Daima Takipte
                </Text>
                <Text style={{ fontSize: 34, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -1.2 }}>
                  Favorilerim
                </Text>
              </View>
              <EmptyFavorites />
            </View>
          ) : currencies.length === 0 && goldRates.length === 0 && lastUpdated === null ? (
            lastRefreshFailed ? (
              <ErrorState
                title="Favoriler Yüklenemedi"
                description="Favori varlıkların için fiyat bilgisi alınamadı."
                icon="cloud-offline-outline"
                onRetry={() => { void refreshData(); }}
              />
            ) : (
              <View style={{ paddingTop: 8 }}><PriceCardSkeleton count={Math.min(favorites.length, 6)} /></View>
            )
          ) : null
        }
        ListFooterComponent={
          totalCount > 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <View style={{
                flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: colors.surface,
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
              }}>
                <Icon name="star-outline" size={11} color={colors.mutedForeground} />
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>
                  Çıkarmak için sola kaydır
                </Text>
              </View>
            </View>
          ) : null
        }
        contentContainerStyle={[
          { paddingBottom: bottomPadding },
          favorites.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={manualRefreshing}
            onRefresh={onManualRefresh}
            tintColor={colors.primary}
          />
        }
      />
      <PriceRowMenu
        item={menu?.item ?? null}
        type={menu?.type ?? "currency"}
        visible={!!menu}
        onClose={() => setMenu(null)}
      />
    </View>
  );
}
