import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";
import * as Haptics from "expo-haptics";
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

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, startA: number, endA: number) {
  const largeArc = endA - startA > 180 ? 1 : 0;
  const p1 = polarToCartesian(cx, cy, rOuter, startA);
  const p2 = polarToCartesian(cx, cy, rOuter, endA);
  const p3 = polarToCartesian(cx, cy, rInner, endA);
  const p4 = polarToCartesian(cx, cy, rInner, startA);
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

export function AllocationDonut({
  buckets,
  totalValue,
}: {
  buckets: Record<AllocationBucket, number>;
  totalValue: number;
}) {
  const colors = useColors();
  const [selected, setSelected] = useState<AllocationBucket | null>(null);

  const size = 148;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 65;
  const rInner = 47;

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
      const startA = acc * 360;
      acc += frac;
      const endA = acc * 360;
      return {
        key: e.key,
        value: e.value,
        pct: frac * 100,
        startA,
        endA: endA >= 360 ? 359.999 : endA,
      };
    });
  }, [buckets]);

  const hasData = segs.length > 0;
  const dominant = hasData ? segs.reduce((a, b) => (b.pct > a.pct ? b : a)) : null;
  const active = selected && segs.find((s) => s.key === selected) ? segs.find((s) => s.key === selected)! : dominant;

  if (!hasData) return null;

  const handleSelect = (k: AllocationBucket) => {
    Haptics.selectionAsync().catch(() => {});
    setSelected((cur) => (cur === k ? null : k));
  };

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
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Text
          style={{
            fontSize: 11,
            fontFamily: "Inter_700Bold",
            color: colors.mutedForeground,
            letterSpacing: 1.1,
          }}
        >
          VARLIK DAĞILIMI
        </Text>
        {selected ? (
          <Pressable onPress={() => setSelected(null)} hitSlop={8}>
            <Text
              style={{
                fontSize: 10.5,
                fontFamily: "Inter_700Bold",
                color: colors.primary,
                letterSpacing: 0.3,
              }}
            >
              SIFIRLA
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
        <Svg width={size} height={size}>
          {segs.map((s) => {
            const isActive = !selected || selected === s.key;
            return (
              <Path
                key={s.key}
                d={arcPath(cx, cy, rOuter, rInner, s.startA, s.endA)}
                fill={palette[s.key]}
                opacity={isActive ? 1 : 0.28}
                onPress={() => handleSelect(s.key)}
              />
            );
          })}
          <Circle cx={cx} cy={cy} r={rInner - 1} fill={colors.card} />
          <SvgText
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fontSize={10}
            fontFamily="Inter_700Bold"
            fill={colors.mutedForeground}
            letterSpacing={0.8}
          >
            {active ? BUCKET_LABELS[active.key].toUpperCase() : "AĞIRLIK"}
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
            %{active ? Math.round(active.pct) : 0}
          </SvgText>
        </Svg>

        <View style={{ flex: 1, gap: 9 }}>
          {segs.map((s) => {
            const isSelected = selected === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => handleSelect(s.key)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 9,
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  marginHorizontal: -6,
                  borderRadius: 8,
                  backgroundColor: isSelected
                    ? palette[s.key] + "22"
                    : pressed
                    ? colors.secondary
                    : "transparent",
                })}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    backgroundColor: palette[s.key],
                    opacity: !selected || isSelected ? 1 : 0.4,
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
                    color: isSelected ? palette[s.key] : colors.foreground,
                    letterSpacing: -0.2,
                  }}
                >
                  %{s.pct.toFixed(0)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
