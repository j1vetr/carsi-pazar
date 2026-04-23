import React, { useMemo } from "react";
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { AssetIcon } from "@/components/AssetIcon";
import { useColors } from "@/hooks/useColors";
import { formatSymbolName } from "@/lib/symbolDescriptions";
import type { Holding } from "@/lib/portfolioCalc";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPrice = (v: number) =>
  v >= 100
    ? v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const fmtAmount = (v: number) =>
  Number.isInteger(v) ? v.toString() : v.toLocaleString("tr-TR", { maximumFractionDigits: 4 });

const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`;
};

function Sparkline({
  data,
  width = 60,
  height = 22,
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
    let d = `M 0 ${toY(prices[0])}`;
    for (let i = 1; i < prices.length; i++) {
      const x = i * xStep;
      const y = toY(prices[i]);
      const prevX = (i - 1) * xStep;
      const prevY = toY(prices[i - 1]);
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
}: {
  holding: Holding;
  expanded: boolean;
  onToggle: () => void;
  onLongPress: () => void;
  onRemoveTx: (txId: string) => void;
  sparklineData: { buy: number }[];
  index: number;
}) {
  const colors = useColors();
  const pos = holding.unrealized >= 0;
  const dayPos = holding.dayChange >= 0;

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
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: expanded ? colors.primary : colors.border,
          opacity: pressed ? 0.92 : 1,
          overflow: "hidden",
        })}
      >
        <View
          style={{
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <AssetIcon code={holding.code} type={holding.type} size={40} />

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_700Bold",
                  color: colors.foreground,
                  letterSpacing: -0.2,
                }}
              >
                {formatSymbolName(holding.code)}
              </Text>
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: (dayPos ? colors.rise : colors.fall) + "18",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Inter_700Bold",
                    color: dayPos ? colors.rise : colors.fall,
                  }}
                >
                  {dayPos ? "+" : "−"}%{Math.abs(holding.dayChangePercent).toFixed(2)}
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: "Inter_500Medium",
                color: colors.mutedForeground,
                marginTop: 3,
                letterSpacing: -0.1,
              }}
            >
              {fmtAmount(holding.amount)} {holding.type === "gold" ? "adet/gr" : "birim"} · Ort ₺
              {fmtPrice(holding.avgPrice)}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
                letterSpacing: -0.2,
              }}
            >
              ₺{fmtTL(holding.currentValue)}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Sparkline data={sparklineData} positive={dayPos} />
              <Text
                style={{
                  fontSize: 11.5,
                  fontFamily: "Inter_700Bold",
                  color: pos ? colors.rise : colors.fall,
                }}
              >
                {pos ? "+" : "−"}%{Math.abs(holding.unrealizedPercent).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {expanded ? (
          <Animated.View entering={FadeIn.duration(180)}>
            <View
              style={{
                paddingHorizontal: 14,
                paddingTop: 2,
                paddingBottom: 14,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              }}
            >
              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <MetricBox label="MEVCUT" value={`₺${fmtTL(holding.currentValue)}`} />
                <MetricBox
                  label="MALİYET"
                  value={`₺${fmtTL(holding.costBasis)}`}
                />
                <MetricBox
                  label="K/Z"
                  value={`${pos ? "+" : "−"}₺${fmtTL(Math.abs(holding.unrealized))}`}
                  valueColor={pos ? colors.rise : colors.fall}
                />
              </View>

              {Math.abs(holding.realized) > 0.01 ? (
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: 10,
                    backgroundColor: colors.secondary,
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
                    Bu varlıktan gerçekleşmiş kâr/zarar:{" "}
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

              <Text
                style={{
                  fontSize: 10.5,
                  fontFamily: "Inter_700Bold",
                  color: colors.mutedForeground,
                  letterSpacing: 1.1,
                  marginTop: 14,
                  marginBottom: 8,
                }}
              >
                İŞLEM GEÇMİŞİ · {holding.transactions.length}
              </Text>

              <View style={{ gap: 0 }}>
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
                        paddingVertical: 8,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <View style={{ alignItems: "center", width: 16 }}>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: accent,
                          }}
                        />
                        {i < holding.transactions.length - 1 ? (
                          <View
                            style={{
                              width: 1,
                              flex: 1,
                              backgroundColor: colors.border,
                              marginTop: 2,
                            }}
                          />
                        ) : null}
                      </View>
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
            </View>
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function MetricBox({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.secondary,
        borderRadius: 11,
        paddingVertical: 9,
        paddingHorizontal: 10,
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
          fontSize: 13,
          fontFamily: "Inter_700Bold",
          color: valueColor ?? colors.foreground,
          marginTop: 3,
          letterSpacing: -0.2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
