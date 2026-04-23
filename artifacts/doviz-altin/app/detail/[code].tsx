import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { getSymbolDescription, formatSymbolName } from "@/lib/symbolDescriptions";
import { PriceChart } from "@/components/PriceChart";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { hasHistorySupport, type HistoryRange } from "@/lib/historyApi";
import { AddAlertModal } from "@/components/alerts/AddAlertModal";
import { DetailSkeleton } from "@/components/common/skeletons/DetailSkeleton";

const MONO_FONT = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

const RANGES: { key: HistoryRange; label: string }[] = [
  { key: "1H", label: "1 HAFTA" },
  { key: "1A", label: "1 AY" },
  { key: "1Y", label: "1 YIL" },
  { key: "3Y", label: "3 YIL" },
  { key: "5Y", label: "5 YIL" },
];

/** Türkçe Title Case — her kelimenin baş harfini büyütür. */
function toTitleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .split(" ")
    .map((w) => (w ? w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1) : w))
    .join(" ");
}

function formatPriceTR(p: number): string {
  if (p >= 10000)
    return p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 100)
    return p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return p.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export default function DetailScreen() {
  const { code, type } = useLocalSearchParams<{ code: string; type: "currency" | "gold" }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { findRateByCode, favorites, toggleFavorite } = useApp();
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [chartRange, setChartRange] = useState<HistoryRange>("1A");
  const showChart = !!code && hasHistorySupport(code);
  const history = usePriceHistory(code ?? "", chartRange);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const item = code ? (findRateByCode(code) as any) : undefined;

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            paddingTop: topPadding + 6,
            paddingHorizontal: 16,
            paddingBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 8,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Geri dön"
          >
            <Icon name="chevron-back" size={20} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
              {code ?? ""}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
        <DetailSkeleton />
      </View>
    );
  }

  const isPositive = item.changePercent >= 0;
  const changeColor = isPositive ? colors.rise : colors.fall;
  const isFav = favorites.includes(code!);
  const spread = item.sell - item.buy;
  const isGold = type === "gold";

  const description = toTitleCase(getSymbolDescription(code!) ?? formatSymbolName(code!));
  const sectionLabel = isGold ? "ALTIN" : "DÖVİZ";

  const symFmt = (v: number) =>
    isGold ? `${formatPriceTR(v)} ₺` : `₺${formatPriceTR(v)}`;

  const pillBg = isPositive ? colors.riseSoft : colors.fallSoft;

  // Helper for all-themes pressable pill button
  const pillStyle = {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top bar */}
      <View
        style={{
          paddingTop: topPadding + 6,
          paddingHorizontal: 16,
          paddingBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: 8,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={pillStyle}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
        >
          <Icon name="chevron-back" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 9.5,
              fontFamily: "Inter_700Bold",
              letterSpacing: 1.4,
              color: colors.mutedForeground,
            }}
          >
            {sectionLabel}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Inter_700Bold",
              color: colors.foreground,
              marginTop: 1,
              letterSpacing: -0.2,
            }}
          >
            {code}
          </Text>
        </View>
        <Pressable
          onPress={() => toggleFavorite(code!)}
          style={pillStyle}
          accessibilityRole="button"
          accessibilityLabel={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
        >
          <Icon
            name={isFav ? "star" : "star-outline"}
            size={18}
            color={isFav ? colors.gold : colors.foreground}
          />
        </Pressable>
        <Pressable
          onPress={() => setShowAlertModal(true)}
          style={pillStyle}
          accessibilityRole="button"
          accessibilityLabel="Fiyat alarmı kur"
        >
          <Icon name="notifications-outline" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPadding + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18 }}>
          <Text
            style={{
              fontSize: 22,
              fontFamily: "Inter_700Bold",
              color: colors.foreground,
              letterSpacing: -0.4,
              lineHeight: 26,
            }}
            numberOfLines={1}
          >
            {item.nameTR}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: colors.mutedForeground,
              marginTop: 4,
              letterSpacing: -0.05,
            }}
          >
            {description}
          </Text>
          <Text
            style={{
              fontFamily: MONO_FONT,
              fontSize: 38,
              fontWeight: "700",
              color: colors.foreground,
              marginTop: 18,
              letterSpacing: -1.2,
              lineHeight: 40,
            }}
          >
            {symFmt(item.buy)}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: pillBg,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11.5,
                  fontFamily: MONO_FONT,
                  fontWeight: "700",
                  color: changeColor,
                  letterSpacing: -0.1,
                }}
              >
                {isPositive ? "▲" : "▼"} %{Math.abs(item.changePercent).toFixed(2)}
                <Text style={{ color: changeColor, opacity: 0.7 }}>
                  {"  "}({isPositive ? "+" : "−"}{Math.abs(item.change).toFixed(2)})
                </Text>
              </Text>
            </View>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter_700Bold",
                color: colors.mutedForeground,
                letterSpacing: 0.6,
              }}
            >
              BUGÜN
            </Text>
          </View>
        </View>

        {showChart && (
          <>
            {/* Range picker */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: colors.secondary,
                  borderRadius: 10,
                  padding: 3,
                }}
              >
                {RANGES.map((r) => {
                  const on = chartRange === r.key;
                  return (
                    <Pressable
                      key={r.key}
                      onPress={() => setChartRange(r.key)}
                      style={{
                        flex: 1,
                        paddingVertical: 7,
                        alignItems: "center",
                        backgroundColor: on ? colors.card : "transparent",
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Inter_700Bold",
                          letterSpacing: 0.5,
                          color: on ? colors.foreground : colors.mutedForeground,
                        }}
                      >
                        {r.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Chart */}
            <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <PriceChart
                data={history.data}
                range={chartRange}
                loading={history.loading}
                error={history.error}
              />
            </View>
          </>
        )}

        {/* Price details */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
          <Text
            style={{
              fontSize: 9.5,
              fontFamily: "Inter_700Bold",
              letterSpacing: 1.4,
              color: colors.mutedForeground,
              marginBottom: 14,
            }}
          >
            FİYAT DETAYLARI
          </Text>
          {[
            { label: "Alış", value: symFmt(item.buy), color: colors.foreground },
            { label: "Satış", value: symFmt(item.sell), color: colors.foreground },
            { label: "Alış / Satış Farkı", value: symFmt(spread), color: colors.mutedForeground },
            { label: "Önceki Kapanış", value: symFmt(item.prevClose ?? item.buy - item.change), color: colors.mutedForeground },
            { label: "Günlük Değişim", value: `${isPositive ? "+" : "−"}${Math.abs(item.change).toFixed(2)}`, color: changeColor },
            { label: "Günlük Değişim (%)", value: `${isPositive ? "+" : "−"}%${Math.abs(item.changePercent).toFixed(2)}`, color: changeColor },
          ].map((row, i, a) => (
            <View
              key={row.label}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 11,
                borderBottomWidth: i === a.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, letterSpacing: -0.1 }}>
                {row.label}
              </Text>
              <Text
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 13,
                  fontWeight: "700",
                  color: row.color,
                  letterSpacing: -0.2,
                }}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Alarm CTA */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Pressable
            onPress={() => setShowAlertModal(true)}
            style={{
              backgroundColor: colors.foreground,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Icon name="notifications" size={18} color={colors.background} />
            <Text style={{ fontSize: 13.5, fontFamily: "Inter_700Bold", color: colors.background, letterSpacing: 0.2 }}>
              Fiyat Alarmı Kur
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <AddAlertModal
        visible={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        code={code!}
        nameTR={item.nameTR}
        currentPrice={item.buy}
        type={type ?? "currency"}
        colors={colors}
      />
    </View>
  );
}
