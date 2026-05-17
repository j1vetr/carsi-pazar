import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import type { PortfolioStats } from "@/lib/utils/portfolioCalc";

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtTL0 = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function PortfolioHero({ stats }: { stats: PortfolioStats }) {
  const colors = useColors();
  const totalPos = stats.totalReturn >= 0;
  const dayPos = stats.dayChange >= 0;
  const realizedPos = stats.realized >= 0;

  const statCols = [
    {
      label: "BUGÜN",
      value: `${dayPos ? "+" : "−"}₺${fmtTL0(Math.abs(stats.dayChange))}`,
      sub: `${dayPos ? "+" : ""}%${stats.dayChangePercent.toFixed(2)}`,
      color: dayPos ? colors.rise : colors.fall,
    },
    {
      label: "MALİYET",
      value: `₺${fmtTL0(stats.totalCost)}`,
      sub: null,
      color: colors.foreground,
    },
    {
      label: "TOPLAM GETİRİ",
      value: `${totalPos ? "+" : "−"}₺${fmtTL0(Math.abs(stats.totalReturn))}`,
      sub: `${totalPos ? "+" : ""}%${stats.totalReturnPercent.toFixed(2)}`,
      color: totalPos ? colors.rise : colors.fall,
    },
  ] as const;

  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Inter_700Bold",
          color: colors.mutedForeground,
          letterSpacing: 1.4,
        }}
      >
        TOPLAM PORTFÖY DEĞERİ
      </Text>

      <Animated.View
        entering={FadeInUp.duration(360)}
        style={{ marginTop: 8 }}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`Toplam portföy değeri ${fmtTL(stats.totalValue)} Türk Lirası`}
      >
        <AnimatedNumber
          value={stats.totalValue}
          formatter={fmtTL}
          prefix="₺"
          duration={700}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          style={{
            fontSize: 48,
            fontFamily: "Inter_700Bold",
            color: colors.foreground,
            letterSpacing: -1.6,
            includeFontPadding: false,
          }}
        />
      </Animated.View>

      {/* 3-sütun stat kartı — pill yok */}
      <Animated.View
        entering={FadeInDown.delay(80).duration(320)}
        style={{
          flexDirection: "row",
          marginTop: 14,
          backgroundColor: colors.card,
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        {statCols.map((s, i) => (
          <View
            key={s.label}
            style={{
              flex: 1,
              paddingVertical: 11,
              paddingHorizontal: 9,
              borderRightWidth: i < 2 ? StyleSheet.hairlineWidth : 0,
              borderRightColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 8.5,
                fontFamily: "Inter_700Bold",
                color: colors.mutedForeground,
                letterSpacing: 0.7,
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {s.label}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              style={{
                fontSize: 12,
                fontFamily: "Inter_700Bold",
                color: s.color,
                letterSpacing: -0.2,
              }}
            >
              {s.value}
            </Text>
            {s.sub ? (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 10.5,
                  fontFamily: "Inter_600SemiBold",
                  color: s.color,
                  marginTop: 2,
                  opacity: 0.85,
                }}
              >
                {s.sub}
              </Text>
            ) : null}
          </View>
        ))}
      </Animated.View>

      {/* Gerçekleşmiş kâr/zarar — sade satır */}
      {Math.abs(stats.realized) > 0.01 ? (
        <Animated.View
          entering={FadeInDown.delay(160).duration(320)}
          style={{
            marginTop: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Text
            style={{
              fontSize: 11.5,
              fontFamily: "Inter_600SemiBold",
              color: colors.mutedForeground,
            }}
          >
            Gerçekleşmiş k/z:{"  "}
            <Text
              style={{
                color: realizedPos ? colors.rise : colors.fall,
                fontFamily: "Inter_700Bold",
              }}
            >
              {realizedPos ? "+" : "−"}₺{fmtTL(Math.abs(stats.realized))}
            </Text>
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
