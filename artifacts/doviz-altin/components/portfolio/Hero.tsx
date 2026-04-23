import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import type { PortfolioStats } from "@/lib/portfolioCalc";

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function PortfolioHero({ stats }: { stats: PortfolioStats }) {
  const colors = useColors();
  const totalPos = stats.totalReturn >= 0;
  const dayPos = stats.dayChange >= 0;

  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.gold }} />
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
      </View>

      <Animated.View entering={FadeInUp.duration(360)}>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          minimumFontScale={0.4}
          style={{
            fontSize: 54,
            fontFamily: "Inter_700Bold",
            color: colors.foreground,
            letterSpacing: -1.9,
            marginTop: 10,
            includeFontPadding: false,
          }}
        >
          ₺{fmtTL(stats.totalValue)}
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(80).duration(320)}
        style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: (dayPos ? colors.rise : colors.fall) + "1A",
            paddingHorizontal: 11,
            paddingVertical: 6,
            borderRadius: 999,
          }}
        >
          <Icon
            name={dayPos ? "arrow-up" : "arrow-down"}
            size={12}
            color={dayPos ? colors.rise : colors.fall}
          />
          <Text
            style={{
              fontSize: 12.5,
              fontFamily: "Inter_700Bold",
              color: dayPos ? colors.rise : colors.fall,
              letterSpacing: -0.1,
            }}
          >
            {dayPos ? "+" : "−"}₺{fmtTL(Math.abs(stats.dayChange))} · %{Math.abs(stats.dayChangePercent).toFixed(2)}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Inter_500Medium",
            color: colors.mutedForeground,
          }}
        >
          bugün
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(160).duration(320)}
        style={{
          flexDirection: "row",
          marginTop: 18,
          gap: 10,
        }}
      >
        <StatCard
          label="MALİYET"
          value={`₺${fmtTL(stats.totalCost)}`}
          valueColor={colors.foreground}
        />
        <StatCard
          label="TOPLAM GETİRİ"
          value={`${totalPos ? "+" : "−"}₺${fmtTL(Math.abs(stats.totalReturn))}`}
          sub={`${totalPos ? "+" : ""}${stats.totalReturnPercent.toFixed(2)}%`}
          valueColor={totalPos ? colors.rise : colors.fall}
        />
      </Animated.View>

      {Math.abs(stats.realized) > 0.01 ? (
        <Animated.View
          entering={FadeInDown.delay(220).duration(320)}
          style={{
            marginTop: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            alignSelf: "flex-start",
            paddingHorizontal: 11,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: colors.secondary,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
          }}
        >
          <Icon
            name="checkmark-circle"
            size={13}
            color={stats.realized >= 0 ? colors.rise : colors.fall}
          />
          <Text
            style={{
              fontSize: 11.5,
              fontFamily: "Inter_600SemiBold",
              color: colors.mutedForeground,
              letterSpacing: -0.1,
            }}
          >
            Gerçekleşmiş kâr/zarar:{" "}
            <Text style={{ color: stats.realized >= 0 ? colors.rise : colors.fall, fontFamily: "Inter_700Bold" }}>
              {stats.realized >= 0 ? "+" : "−"}₺{fmtTL(Math.abs(stats.realized))}
            </Text>
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

function StatCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor: string;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 10,
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
          fontSize: 17,
          fontFamily: "Inter_700Bold",
          color: valueColor,
          marginTop: 5,
          letterSpacing: -0.4,
        }}
      >
        {value}
      </Text>
      {sub ? (
        <Text
          style={{
            fontSize: 11.5,
            fontFamily: "Inter_600SemiBold",
            color: valueColor,
            marginTop: 2,
          }}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  );
}
