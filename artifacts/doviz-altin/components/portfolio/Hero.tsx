import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import type { PortfolioStats } from "@/lib/portfolioCalc";
import type { DailySnapshot } from "@/lib/portfolioSnapshots";

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function MiniSparkline({
  snapshots,
  color,
  width = 90,
  height = 30,
}: {
  snapshots: DailySnapshot[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (!snapshots || snapshots.length < 2) return null;
  const vals = snapshots.slice(-30).map((s) => s.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const step = width / (vals.length - 1);
  const points = vals.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / range) * (height - 2) - 1,
  }));
  const d = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");
  const area = `${d} L ${width} ${height} L 0 ${height} Z`;
  const gradId = "heroSparkGrad";
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill={`url(#${gradId})`} />
      <Path d={d} stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PortfolioHero({
  stats,
  snapshots = [],
}: {
  stats: PortfolioStats;
  snapshots?: DailySnapshot[];
}) {
  const colors = useColors();
  const totalPos = stats.totalReturn >= 0;
  const dayPos = stats.dayChange >= 0;
  const sparkColor = dayPos ? colors.rise : colors.fall;

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

      <Animated.View
        entering={FadeInUp.duration(360)}
        style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}
      >
        <View
          accessible
          accessibilityRole="text"
          accessibilityLabel={`Toplam portföy değeri ${fmtTL(stats.totalValue)} Türk Lirası`}
          style={{ flex: 1, marginTop: 10 }}
        >
          <AnimatedNumber
            value={stats.totalValue}
            formatter={fmtTL}
            prefix="₺"
            duration={700}
            style={{
              fontSize: 54,
              fontFamily: "Inter_700Bold",
              color: colors.foreground,
              letterSpacing: -1.9,
              includeFontPadding: false,
            }}
          />
        </View>
        {snapshots.length >= 2 ? (
          <View style={{ paddingBottom: 8 }}>
            <MiniSparkline snapshots={snapshots} color={sparkColor} />
          </View>
        ) : null}
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
