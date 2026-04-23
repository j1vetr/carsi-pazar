import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import type { AllocationBucket } from "@/lib/portfolioCalc";

const BUCKET_LABELS: Record<AllocationBucket, string> = {
  currency: "Döviz",
  gold: "Altın",
  metal: "Gümüş & Maden",
  parity: "Parite",
};

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function AllocationDonut({
  buckets,
  totalValue,
}: {
  buckets: Record<AllocationBucket, number>;
  totalValue: number;
}) {
  const colors = useColors();
  const size = 148;
  const cx = size / 2;
  const cy = size / 2;
  const r = 56;
  const circ = 2 * Math.PI * r;

  const palette: Record<AllocationBucket, string> = {
    currency: "#3B82F6",
    gold: colors.gold,
    metal: "#8B95A7",
    parity: "#A78BFA",
  };

  const segs = useMemo(() => {
    const entries = (Object.keys(BUCKET_LABELS) as AllocationBucket[])
      .map((k) => ({ key: k, value: buckets[k] }))
      .filter((e) => e.value > 0);
    const sum = entries.reduce((s, e) => s + e.value, 0);
    if (sum <= 0) return [];
    let acc = 0;
    return entries.map((e) => {
      const frac = e.value / sum;
      const offset = acc;
      acc += frac;
      return {
        key: e.key,
        value: e.value,
        pct: frac * 100,
        strokeDasharray: `${frac * circ} ${circ}`,
        strokeDashoffset: -offset * circ,
      };
    });
  }, [buckets, circ]);

  const hasData = segs.length > 0;
  const dominant = hasData ? segs.reduce((a, b) => (b.pct > a.pct ? b : a)) : null;

  if (!hasData) return null;

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 18,
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Inter_700Bold",
          color: colors.mutedForeground,
          letterSpacing: 1.1,
          marginBottom: 14,
        }}
      >
        VARLIK DAĞILIMI
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
        <Svg width={size} height={size}>
          <G rotation={-90} origin={`${cx}, ${cy}`}>
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={colors.secondary}
              strokeWidth={18}
              fill="none"
            />
            {segs.map((s) => (
              <Circle
                key={s.key}
                cx={cx}
                cy={cy}
                r={r}
                stroke={palette[s.key]}
                strokeWidth={18}
                strokeLinecap="butt"
                strokeDasharray={s.strokeDasharray}
                strokeDashoffset={s.strokeDashoffset}
                fill="none"
              />
            ))}
          </G>
          <SvgText
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fontSize={11}
            fontFamily="Inter_700Bold"
            fill={colors.mutedForeground}
            letterSpacing={0.8}
          >
            AĞIRLIK
          </SvgText>
          <SvgText
            x={cx}
            y={cy + 15}
            textAnchor="middle"
            fontSize={20}
            fontFamily="Inter_700Bold"
            fill={colors.foreground}
            letterSpacing={-0.6}
          >
            %{dominant ? Math.round(dominant.pct) : 0}
          </SvgText>
        </Svg>

        <View style={{ flex: 1, gap: 9 }}>
          {segs.map((s) => (
            <View key={s.key} style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  backgroundColor: palette[s.key],
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_600SemiBold",
                    color: colors.foreground,
                    letterSpacing: -0.1,
                  }}
                >
                  {BUCKET_LABELS[s.key]}
                </Text>
                <Text
                  style={{
                    fontSize: 10.5,
                    fontFamily: "Inter_500Medium",
                    color: colors.mutedForeground,
                    marginTop: 1,
                  }}
                >
                  ₺{fmtTL(s.value)}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_700Bold",
                  color: colors.foreground,
                  letterSpacing: -0.2,
                }}
              >
                %{s.pct.toFixed(0)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
