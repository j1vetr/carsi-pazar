import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import {
  aggregateHoldings,
  bucketForCode,
  summarizePortfolio,
} from "@/lib/portfolioCalc";
import type { SnapshotRange } from "@/lib/portfolioSnapshots";
import { PortfolioHero } from "@/components/portfolio/Hero";
import { AllocationDonut } from "@/components/portfolio/AllocationDonut";
import { PortfolioTimeChart } from "@/components/portfolio/TimeSeriesChart";
import { HoldingCard } from "@/components/portfolio/HoldingCard";
import { TxModal } from "@/components/portfolio/TxModal";
import { HoldingActionSheet } from "@/components/portfolio/HoldingActionSheet";

function EmptyPortfolio({
  colors,
  onAdd,
}: {
  colors: ReturnType<typeof useColors>;
  onAdd: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        paddingTop: 80,
      }}
    >
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.secondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="briefcase-outline" size={42} color={colors.mutedForeground} />
      </View>
      <Text
        style={{
          fontSize: 22,
          fontFamily: "Inter_700Bold",
          color: colors.foreground,
          marginTop: 24,
          textAlign: "center",
          letterSpacing: -0.5,
        }}
      >
        Portföyün Boş
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Inter_400Regular",
          color: colors.mutedForeground,
          marginTop: 10,
          textAlign: "center",
          lineHeight: 21,
        }}
      >
        Döviz ve altın yatırımlarını ekleyerek toplam değerini canlı kurla takip et.
      </Text>
      <Pressable
        onPress={onAdd}
        style={({ pressed }) => ({
          marginTop: 28,
          backgroundColor: colors.primary,
          paddingHorizontal: 32,
          paddingVertical: 14,
          borderRadius: 30,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            fontSize: 15,
            fontFamily: "Inter_700Bold",
            color: colors.primaryForeground,
            letterSpacing: -0.2,
          }}
        >
          İlk Varlığını Ekle
        </Text>
      </Pressable>
    </View>
  );
}

export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    portfolio,
    portfolioSnapshots,
    currencies,
    goldRates,
    banks,
    goldParities,
    silvers,
    metals,
    removeFromPortfolio,
    removeAllByAsset,
    findRateByCode,
    getPriceHistory,
    availableAmount,
  } = useApp();

  const [range, setRange] = useState<SnapshotRange>("1A");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [txVisible, setTxVisible] = useState(false);
  const [txInitial, setTxInitial] = useState<{
    side: "buy" | "sell";
    code?: string;
    type?: "currency" | "gold";
  }>({ side: "buy" });
  const [sheet, setSheet] = useState<{
    code: string;
    type: "currency" | "gold";
  } | null>(null);

  const allRates = useMemo(() => {
    const out: Record<string, { buy: number; prevClose?: number; group?: string }> = {};
    const pushList = (
      list: Array<{ code: string; buy: number; prevClose?: number; group?: string }>,
    ) => {
      for (const r of list) out[r.code] = { buy: r.buy, prevClose: r.prevClose, group: r.group };
    };
    pushList(currencies);
    pushList(goldRates);
    pushList(banks);
    pushList(goldParities);
    pushList(silvers);
    pushList(metals);
    return out;
  }, [currencies, goldRates, banks, goldParities, silvers, metals]);

  const holdings = useMemo(
    () => aggregateHoldings(portfolio, (code) => allRates[code]),
    [portfolio, allRates],
  );
  const stats = useMemo(
    () =>
      summarizePortfolio(holdings, (h) => {
        const r = allRates[h.code];
        return bucketForCode(h.code, h.type, r?.group);
      }),
    [holdings, allRates],
  );

  const handleRemoveTx = useCallback(
    (id: string) => {
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
    },
    [removeFromPortfolio],
  );

  const handleDeleteAll = useCallback(
    (code: string, type: "currency" | "gold") => {
      Alert.alert(
        "Varlığı Temizle",
        `Tüm ${code} işlemlerini silmek istiyor musun? Bu işlem geri alınamaz.`,
        [
          { text: "Vazgeç", style: "cancel" },
          {
            text: "Tümünü Sil",
            style: "destructive",
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
              void removeAllByAsset(code, type);
            },
          },
        ],
      );
    },
    [removeAllByAsset],
  );

  const openSheet = useCallback((code: string, type: "currency" | "gold") => {
    setSheet({ code, type });
  }, []);

  const isEmpty = holdings.length === 0 && portfolio.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingBottom: 6,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
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
              fontSize: 28,
              fontFamily: "PlayfairDisplay_700Bold",
              fontStyle: "italic",
              color: colors.foreground,
              letterSpacing: -0.6,
              marginTop: 2,
            }}
          >
            Varlıklarım
          </Text>
        </View>
        {!isEmpty ? (
          <Pressable
            hitSlop={10}
            onPress={() => router.push("/portfolio/transactions")}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.secondary,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Icon name="time-outline" size={20} color={colors.foreground} />
          </Pressable>
        ) : null}
        {!isEmpty ? (
          <Pressable
            hitSlop={10}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setTxInitial({ side: "buy" });
              setTxVisible(true);
            }}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Icon name="add" size={22} color={colors.primaryForeground} />
          </Pressable>
        ) : null}
      </View>

      {isEmpty ? (
        <EmptyPortfolio
          colors={colors}
          onAdd={() => {
            setTxInitial({ side: "buy" });
            setTxVisible(true);
          }}
        />
      ) : (
        <Animated.ScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom + 120,
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}
        >
          <PortfolioHero stats={stats} snapshots={portfolioSnapshots} />
          <PortfolioTimeChart
            snapshots={portfolioSnapshots}
            range={range}
            onRangeChange={setRange}
            currentValue={stats.totalValue}
          />
          <AllocationDonut
            buckets={stats.buckets}
            totalValue={stats.totalValue}
          />

          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_700Bold",
                  color: colors.mutedForeground,
                  letterSpacing: 1.1,
                }}
              >
                VARLIKLARIM · {holdings.length}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_500Medium",
                  color: colors.mutedForeground,
                  letterSpacing: -0.1,
                }}
              >
                uzun bas → işlem
              </Text>
            </View>
            {holdings.map((h, i) => (
              <HoldingCard
                key={`${h.type}:${h.code}`}
                holding={h}
                index={i}
                expanded={expanded === `${h.type}:${h.code}`}
                onToggle={() =>
                  setExpanded((cur) =>
                    cur === `${h.type}:${h.code}` ? null : `${h.type}:${h.code}`,
                  )
                }
                onLongPress={() => openSheet(h.code, h.type)}
                onRemoveTx={handleRemoveTx}
                sparklineData={getPriceHistory(h.code)}
              />
            ))}
          </View>
        </Animated.ScrollView>
      )}

      <TxModal
        visible={txVisible}
        onClose={() => setTxVisible(false)}
        initialSide={txInitial.side}
        lockedCode={txInitial.code}
        lockedType={txInitial.type}
      />

      <HoldingActionSheet
        visible={!!sheet}
        code={sheet?.code ?? null}
        canSell={sheet ? availableAmount(sheet.code, sheet.type) > 0 : false}
        onClose={() => setSheet(null)}
        onBuy={() => {
          if (!sheet) return;
          const s = sheet;
          setSheet(null);
          setTxInitial({ side: "buy", code: s.code, type: s.type });
          setTxVisible(true);
        }}
        onSell={() => {
          if (!sheet) return;
          const s = sheet;
          setSheet(null);
          setTxInitial({ side: "sell", code: s.code, type: s.type });
          setTxVisible(true);
        }}
        onDeleteAll={() => {
          if (!sheet) return;
          const s = sheet;
          setSheet(null);
          handleDeleteAll(s.code, s.type);
        }}
      />
    </View>
  );
}
