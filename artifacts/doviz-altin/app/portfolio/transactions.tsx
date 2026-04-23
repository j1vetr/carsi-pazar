import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/components/Icon";
import { AssetIcon } from "@/components/AssetIcon";
import { useColors } from "@/hooks/useColors";
import { useApp, type PortfolioItem } from "@/contexts/AppContext";
import { formatSymbolName } from "@/lib/utils/symbolDescriptions";
import { EmptyState } from "@/components/common/EmptyState";
import { PriceRowSkeleton } from "@/components/common/skeletons/PriceRowSkeleton";

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPrice = (v: number) =>
  v >= 100
    ? v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const fmtAmount = (v: number) =>
  Number.isInteger(v) ? v.toString() : v.toLocaleString("tr-TR", { maximumFractionDigits: 4 });

const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

type SideFilter = "all" | "buy" | "sell";

function groupByMonth<T extends { date: string }>(items: T[]): { key: string; label: string; items: T[] }[] {
  const map = new Map<string, { key: string; label: string; items: T[] }>();
  for (const it of items) {
    const d = new Date(it.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`;
    const g = map.get(key) ?? { key, label, items: [] };
    g.items.push(it);
    map.set(key, g);
  }
  return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
}

export default function TransactionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { portfolio, removeFromPortfolio, hydrated } = useApp();

  const [sideFilter, setSideFilter] = useState<SideFilter>("all");
  const [codeFilter, setCodeFilter] = useState<string | null>(null);

  const uniqueCodes = useMemo(() => {
    const set = new Set<string>();
    for (const p of portfolio) set.add(p.code);
    return Array.from(set).sort();
  }, [portfolio]);

  const filtered = useMemo<PortfolioItem[]>(() => {
    return portfolio
      .filter((p) => {
        if (sideFilter === "buy" && p.side === "sell") return false;
        if (sideFilter === "sell" && p.side !== "sell") return false;
        if (codeFilter && p.code !== codeFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [portfolio, sideFilter, codeFilter]);

  const grouped = useMemo(
    () => groupByMonth(filtered.map((p) => ({ ...p, date: p.purchaseDate }))),
    [filtered],
  );

  const handleDelete = (id: string) => {
    Alert.alert("İşlemi Sil", "Bu işlemi portföyden kaldırmak istiyor musun?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          void removeFromPortfolio(id);
        },
      },
    ]);
  };

  const totals = useMemo(() => {
    let buys = 0;
    let sells = 0;
    for (const p of filtered) {
      const v = p.amount * p.purchasePrice;
      if (p.side === "sell") sells += v;
      else buys += v;
    }
    return { buys, sells, count: filtered.length };
  }, [filtered]);

  const sideChips: { k: SideFilter; label: string }[] = [
    { k: "all", label: "Tümü" },
    { k: "buy", label: "Alım" },
    { k: "sell", label: "Satış" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 8,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => ({
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1, paddingLeft: 4 }}>
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Inter_700Bold",
              color: colors.mutedForeground,
              letterSpacing: 1.4,
            }}
          >
            PORTFÖY
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "PlayfairDisplay_700Bold",
              fontStyle: "italic",
              color: colors.foreground,
              letterSpacing: -0.5,
              marginTop: 1,
            }}
          >
            Geçmiş İşlemler
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 14,
            marginTop: 4,
          }}
        >
          <SummaryCell label="TOPLAM İŞLEM" value={String(totals.count)} color={colors.foreground} />
          <SummaryCell label="ALIM TUTARI" value={`₺${fmtTL(totals.buys)}`} color={colors.rise} />
          <SummaryCell label="SATIŞ TUTARI" value={`₺${fmtTL(totals.sells)}`} color={colors.fall} />
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 6,
            padding: 4,
            backgroundColor: colors.secondary,
            borderRadius: 12,
            marginBottom: 10,
          }}
        >
          {sideChips.map((c) => {
            const active = sideFilter === c.k;
            return (
              <Pressable
                key={c.k}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 9,
                  backgroundColor: active ? colors.card : "transparent",
                  alignItems: "center",
                }}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSideFilter(c.k);
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter_700Bold",
                    color: active ? colors.foreground : colors.mutedForeground,
                    letterSpacing: -0.1,
                  }}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {uniqueCodes.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, paddingRight: 10, paddingBottom: 2 }}
            style={{ marginBottom: 16 }}
          >
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setCodeFilter(null);
              }}
              style={{
                paddingHorizontal: 13,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: codeFilter === null ? colors.primary : colors.card,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: codeFilter === null ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_700Bold",
                  color: codeFilter === null ? colors.primaryForeground : colors.foreground,
                  letterSpacing: -0.1,
                }}
              >
                Tüm Varlıklar
              </Text>
            </Pressable>
            {uniqueCodes.map((code) => {
              const active = codeFilter === code;
              return (
                <Pressable
                  key={code}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setCodeFilter(active ? null : code);
                  }}
                  style={{
                    paddingHorizontal: 13,
                    paddingVertical: 7,
                    borderRadius: 999,
                    backgroundColor: active ? colors.primary : colors.card,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: active ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_700Bold",
                      color: active ? colors.primaryForeground : colors.foreground,
                      letterSpacing: -0.1,
                    }}
                  >
                    {formatSymbolName(code)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {grouped.length === 0 ? (
          !hydrated ? (
            <PriceRowSkeleton count={5} withIcon />
          ) : (
            <EmptyState
              icon={portfolio.length === 0 ? "briefcase-outline" : "search"}
              title={portfolio.length === 0 ? "Henüz İşlem Yok" : "Eşleşen İşlem Yok"}
              description={
                portfolio.length === 0
                  ? "Portföyünde alım veya satım kaydettiğinde geçmiş işlemlerin burada listelenir."
                  : "Seçili filtreyle eşleşen bir işlem bulunamadı. Farklı bir sembol veya tarih aralığı deneyebilirsin."
              }
              compact
            />
          )
        ) : (
          grouped.map((group, gi) => (
            <View key={group.key} style={{ marginBottom: 18 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_700Bold",
                  color: colors.mutedForeground,
                  letterSpacing: 1.1,
                  marginBottom: 10,
                }}
              >
                {group.label.toUpperCase()} · {group.items.length}
              </Text>
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.border,
                  overflow: "hidden",
                }}
              >
                {group.items.map((tx, i) => {
                  const isSell = tx.side === "sell";
                  const accent = isSell ? colors.fall : colors.rise;
                  const d = new Date(tx.purchaseDate);
                  return (
                    <Animated.View
                      key={tx.id}
                      entering={FadeInDown.delay(gi * 60 + i * 30).duration(240)}
                    >
                      <Pressable
                        onLongPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                          handleDelete(tx.id);
                        }}
                        delayLongPress={320}
                        style={({ pressed }) => ({
                          paddingVertical: 12,
                          paddingHorizontal: 14,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                          borderTopColor: colors.border,
                          backgroundColor: pressed ? colors.secondary : "transparent",
                        })}
                      >
                        <AssetIcon code={tx.code} type={tx.type} size={34} />
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: "Inter_700Bold",
                                color: colors.foreground,
                                letterSpacing: -0.2,
                              }}
                            >
                              {formatSymbolName(tx.code)}
                            </Text>
                            <View
                              style={{
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                                backgroundColor: accent + "18",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontFamily: "Inter_700Bold",
                                  color: accent,
                                }}
                              >
                                {isSell ? "SATIŞ" : "ALIM"}
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={{
                              fontSize: 11.5,
                              fontFamily: "Inter_500Medium",
                              color: colors.mutedForeground,
                              marginTop: 2,
                              letterSpacing: -0.1,
                            }}
                          >
                            {fmtAmount(tx.amount)} · ₺{fmtPrice(tx.purchasePrice)} · {d.getDate()} {(MONTHS_TR[d.getMonth()] ?? "").slice(0, 3)}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "Inter_700Bold",
                            color: accent,
                            letterSpacing: -0.2,
                          }}
                        >
                          {isSell ? "−" : "+"}₺{fmtTL(tx.amount * tx.purchasePrice)}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          ))
        )}

        {grouped.length > 0 ? (
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Inter_500Medium",
              color: colors.mutedForeground,
              textAlign: "center",
              marginTop: 10,
              letterSpacing: -0.1,
            }}
          >
            Silmek için işleme uzun bas.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SummaryCell({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingVertical: 11,
        paddingHorizontal: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 9.5,
          fontFamily: "Inter_700Bold",
          color: colors.mutedForeground,
          letterSpacing: 0.7,
        }}
      >
        {label}
      </Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={{
          fontSize: 14,
          fontFamily: "Inter_700Bold",
          color,
          marginTop: 4,
          letterSpacing: -0.3,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
