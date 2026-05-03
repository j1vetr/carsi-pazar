import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import type { PortfolioStats } from "@/lib/utils/portfolioCalc";

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function PortfolioHero({ stats }: { stats: PortfolioStats }) {
  const colors = useColors();
  const totalPos = stats.totalReturn >= 0;
  const dayPos = stats.dayChange >= 0;
  const realizedPos = stats.realized >= 0;

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

      <Animated.View
        entering={FadeInDown.delay(80).duration(320)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        <Pill
          icon={dayPos ? "arrow-up" : "arrow-down"}
          label={`${dayPos ? "+" : "−"}₺${fmtTL(Math.abs(stats.dayChange))} · %${Math.abs(stats.dayChangePercent).toFixed(2)}`}
          caption="Bugün"
          color={dayPos ? colors.rise : colors.fall}
        />
        <Pill
          label={`₺${fmtTL(stats.totalCost)}`}
          caption="Maliyet"
          color={colors.foreground}
          neutral
        />
        <Pill
          icon={totalPos ? "trending-up" : "trending-down"}
          label={`${totalPos ? "+" : "−"}₺${fmtTL(Math.abs(stats.totalReturn))} · ${totalPos ? "+" : ""}%${Math.abs(stats.totalReturnPercent).toFixed(2)}`}
          caption="Toplam Getiri"
          color={totalPos ? colors.rise : colors.fall}
        />
      </Animated.View>

      {Math.abs(stats.realized) > 0.01 ? (
        <Animated.View
          entering={FadeInDown.delay(160).duration(320)}
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
            color={realizedPos ? colors.rise : colors.fall}
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

function Pill({
  icon,
  label,
  caption,
  color,
  neutral,
}: {
  icon?: React.ComponentProps<typeof Icon>["name"];
  label: string;
  caption: string;
  color: string;
  neutral?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: neutral ? colors.secondary : color + "1A",
        borderWidth: neutral ? StyleSheet.hairlineWidth : 0,
        borderColor: colors.border,
      }}
    >
      {icon ? <Icon name={icon} size={12} color={color} /> : null}
      <Text
        style={{
          fontSize: 11.5,
          fontFamily: "Inter_700Bold",
          color: color,
          letterSpacing: -0.1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 10,
          fontFamily: "Inter_500Medium",
          color: colors.mutedForeground,
          letterSpacing: 0.2,
        }}
      >
        · {caption}
      </Text>
    </View>
  );
}
