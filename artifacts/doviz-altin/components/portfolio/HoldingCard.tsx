import React, { useMemo } from "react";
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { AssetIcon } from "@/components/AssetIcon";
import { useColors } from "@/hooks/useColors";
import { formatSymbolName } from "@/lib/utils/symbolDescriptions";
import type { Holding } from "@/lib/utils/portfolioCalc";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtTL0 = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtPrice = (v: number) =>
  v >= 100
    ? v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const fmtAmount = (v: number) =>
  Number.isInteger(v) ? v.toString() : v.toLocaleString("tr-TR", { maximumFractionDigits: 4 });

const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()!]} ${d.getFullYear()}`;
};

function Sparkline({
  data,
  width = 44,
  height = 18,
  positive,
}: {
  data: { buy: number }[];
  width?: number;
  height?: number;
  positive: boolean;
}) {
  const colors = useColors();
  const { path } = useMemo(() => {
    if (!data || data.length < 2) return { path: "" };
    const prices = data.map((d) => d.buy);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;
    const xStep = width / (prices.length - 1);
    const toY = (p: number) => height - ((p - minP) / range) * height * 0.88 - height * 0.06;
    let d = `M 0 ${toY(prices[0]!)}`;
    for (let i = 1; i < prices.length; i++) {
      const x = i * xStep;
      const y = toY(prices[i]!);
      const prevX = (i - 1) * xStep;
      const prevY = toY(prices[i - 1]!);
      const cpX = (prevX + x) / 2;
      d += ` C ${cpX} ${prevY} ${cpX} ${y} ${x} ${y}`;
    }
    return { path: d };
  }, [data, width, height]);
  const color = positive ? colors.rise : colors.fall;
  if (!path) return <View style={{ width, height }} />;
  return (
    <Svg width={width} height={height}>
      <Path d={path} stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function HoldingCard({
  holding,
  expanded,
  onToggle,
  onLongPress,
  onRemoveTx,
  sparklineData,
  index,
  isLast,
}: {
  holding: Holding;
  expanded: boolean;
  onToggle: () => void;
  onLongPress: () => void;
  onRemoveTx: (txId: string) => void;
  sparklineData: { buy: number }[];
  index: number;
  isLast: boolean;
}) {
  const colors = useColors();
  const pos = holding.unrealized >= 0;

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync().catch(() => {});
    onToggle();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(280)}>
      <Pressable
        onPress={handleToggle}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          onLongPress();
        }}
        delayLongPress={320}
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.secondary : colors.card,
          borderBottomWidth: isLast && !expanded ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          overflow: "hidden",
        })}
      >
        {/* Altın sol çizgisi */}
        {holding.type === "gold" ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              top: 10,
              bottom: 10,
              width: 3,
              borderRadius: 2,
              backgroundColor: colors.gold,
            }}
          />
        ) : null}

        {/* Ana satır */}
        <View
          style={{
            paddingVertical: 13,
            paddingLeft: holding.type === "gold" ? 18 : 14,
            paddingRight: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 11,
          }}
        >
          <AssetIcon code={holding.code} type={holding.type} size={38} />

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 14,
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
                letterSpacing: -0.2,
              }}
            >
              {formatSymbolName(holding.code)}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter_500Medium",
                color: colors.mutedForeground,
                marginTop: 2,
                letterSpacing: -0.1,
              }}
            >
              {fmtAmount(holding.amount)}{" "}
              {holding.type === "gold"
                ? holding.code === "GA"
                  ? "Gram"
                  : "Adet"
                : "Birim"}{" "}
              · Ort ₺{fmtPrice(holding.avgPrice)}
            </Text>
          </View>

          {/* Değer + sparkline + % */}
          <View style={{ alignItems: "flex-end", gap: 3, flexShrink: 0, maxWidth: 120 }}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={{
                fontSize: 14,
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
                letterSpacing: -0.2,
                maxWidth: 116,
              }}
            >
              ₺{fmtTL0(holding.currentValue)}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Sparkline data={sparklineData} positive={pos} />
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_700Bold",
                  color: pos ? colors.rise : colors.fall,
                }}
              >
                {pos ? "+" : "−"}%{Math.abs(holding.unrealizedPercent).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Chevron */}
          <Icon
            name={expanded ? "chevron-up" : "chevron-down"}
            size={15}
            color={colors.mutedForeground}
          />
        </View>
      </Pressable>

      {/* Genişletilmiş bölüm */}
      {expanded ? (
        <Animated.View entering={FadeIn.duration(180)}>
          {/* 3-sütun metrik tablo — baloncuk yok */}
          <View
            style={{
              flexDirection: "row",
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            {[
              { label: "MEVCUT DEĞER", value: `₺${fmtTL0(holding.currentValue)}`, color: colors.foreground },
              { label: "MALİYET", value: `₺${fmtTL0(holding.costBasis)}`, color: colors.foreground },
              {
                label: "KÂR / ZARAR",
                value: `${pos ? "+" : "−"}₺${fmtTL0(Math.abs(holding.unrealized))}`,
                color: pos ? colors.rise : colors.fall,
              },
            ].map((m, i) => (
              <View
                key={m.label}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  borderRightWidth: i < 2 ? StyleSheet.hairlineWidth : 0,
                  borderRightColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 8.5,
                    fontFamily: "Inter_700Bold",
                    color: colors.mutedForeground,
                    letterSpacing: 0.6,
                    marginBottom: 3,
                  }}
                >
                  {m.label}
                </Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                  style={{
                    fontSize: 12.5,
                    fontFamily: "Inter_700Bold",
                    color: m.color,
                    letterSpacing: -0.2,
                  }}
                >
                  {m.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Gerçekleşmiş k/z satırı */}
          {Math.abs(holding.realized) > 0.01 ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
                backgroundColor: colors.background,
              }}
            >
              <Icon
                name="checkmark-circle"
                size={13}
                color={holding.realized >= 0 ? colors.rise : colors.fall}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 11.5,
                  fontFamily: "Inter_600SemiBold",
                  color: colors.mutedForeground,
                }}
              >
                Gerçekleşmiş k/z:{" "}
                <Text
                  style={{
                    color: holding.realized >= 0 ? colors.rise : colors.fall,
                    fontFamily: "Inter_700Bold",
                  }}
                >
                  {holding.realized >= 0 ? "+" : "−"}₺{fmtTL(Math.abs(holding.realized))}
                </Text>
              </Text>
            </View>
          ) : null}

          {/* İşlem geçmişi */}
          <View
            style={{
              paddingHorizontal: 14,
              paddingTop: 10,
              paddingBottom: 14,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Inter_700Bold",
                color: colors.mutedForeground,
                letterSpacing: 1.1,
                marginBottom: 8,
              }}
            >
              İŞLEM GEÇMİŞİ · {holding.transactions.length}
            </Text>

            {holding.transactions.map((tx, i) => {
              const isSell = tx.side === "sell";
              const accent = isSell ? colors.fall : colors.rise;
              return (
                <Pressable
                  key={tx.id}
                  onPress={() => onRemoveTx(tx.id)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 7,
                    borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0,
                    borderTopColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: accent,
                      flexShrink: 0,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12.5,
                        fontFamily: "Inter_700Bold",
                        color: colors.foreground,
                        letterSpacing: -0.1,
                      }}
                    >
                      {isSell ? "Satış" : "Alım"} · {fmtAmount(tx.amount)}
                      <Text
                        style={{
                          color: colors.mutedForeground,
                          fontFamily: "Inter_500Medium",
                        }}
                      >
                        {" · "}₺{fmtPrice(tx.price)}
                      </Text>
                    </Text>
                    <Text
                      style={{
                        fontSize: 10.5,
                        fontFamily: "Inter_500Medium",
                        color: colors.mutedForeground,
                        marginTop: 1,
                      }}
                    >
                      {fmtDate(tx.date)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_700Bold",
                      color: accent,
                      letterSpacing: -0.1,
                    }}
                  >
                    {isSell ? "−" : "+"}₺{fmtTL(tx.amount * tx.price)}
                  </Text>
                  <Icon name="close" size={15} color={colors.mutedForeground} />
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
