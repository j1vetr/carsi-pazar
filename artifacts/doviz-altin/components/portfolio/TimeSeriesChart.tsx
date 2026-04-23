import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { sliceForRange, type DailySnapshot, type SnapshotRange } from "@/lib/portfolioSnapshots";

const RANGES: { key: SnapshotRange; label: string }[] = [
  { key: "1H", label: "1H" },
  { key: "1A", label: "1A" },
  { key: "3A", label: "3A" },
  { key: "1Y", label: "1Y" },
  { key: "ALL", label: "Tümü" },
];

const MONO = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

const W = 354;
const H = 150;
const PAD = { top: 10, right: 4, bottom: 20, left: 4 };

const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function fmtDate(ymd: string): string {
  const [, m, d] = ymd.split("-").map(Number);
  if (!m) return ymd;
  return `${d} ${MONTHS_TR[(m ?? 1) - 1]}`;
}

export function PortfolioTimeChart({
  snapshots,
  range,
  onRangeChange,
  currentValue,
}: {
  snapshots: DailySnapshot[];
  range: SnapshotRange;
  onRangeChange: (r: SnapshotRange) => void;
  currentValue: number;
}) {
  const colors = useColors();

  const series = useMemo(() => {
    const base = sliceForRange(snapshots, range);
    if (base.length === 0) return [];
    const last = base[base.length - 1];
    const today = new Date().toISOString().slice(0, 10);
    if (last.d !== today) {
      return [...base, { d: today, v: currentValue, c: last.c }];
    }
    return base;
  }, [snapshots, range, currentValue]);

  const chart = useMemo(() => {
    if (series.length < 2) return null;
    const values = series.map((s) => s.v);
    const minP = Math.min(...values);
    const maxP = Math.max(...values);
    const spread = maxP - minP || maxP * 0.001 || 1;
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;
    const xStep = cW / (values.length - 1);
    const toX = (i: number) => PAD.left + i * xStep;
    const toY = (p: number) => PAD.top + cH - ((p - minP) / spread) * cH;

    let d = `M ${toX(0)} ${toY(values[0])}`;
    for (let i = 1; i < values.length; i++) {
      const x = toX(i);
      const y = toY(values[i]);
      const prevX = toX(i - 1);
      const prevY = toY(values[i - 1]);
      const cpX = (prevX + x) / 2;
      d += ` C ${cpX} ${prevY} ${cpX} ${y} ${x} ${y}`;
    }
    const lastX = toX(values.length - 1);
    const fillD = d + ` L ${lastX} ${PAD.top + cH} L ${PAD.left} ${PAD.top + cH} Z`;

    return {
      path: d,
      fill: fillD,
      first: values[0],
      last: values[values.length - 1],
      hi: maxP,
      lo: minP,
      lastX,
      lastY: toY(values[values.length - 1]),
      firstDate: series[0].d,
      lastDate: series[series.length - 1].d,
    };
  }, [series]);

  const isPos = chart ? chart.last >= chart.first : true;
  const lineColor = isPos ? colors.rise : colors.fall;
  const change = chart ? chart.last - chart.first : 0;
  const changePct = chart && chart.first > 0 ? (change / chart.first) * 100 : 0;

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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
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
          DEĞER GEÇMİŞİ
        </Text>
        {chart ? (
          <Text
            style={{
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: "700",
              color: lineColor,
            }}
          >
            {isPos ? "+" : "−"}%{Math.abs(changePct).toFixed(2)}
            <Text
              style={{
                color: colors.mutedForeground,
                fontWeight: "500",
              }}
            >
              {"  "}({isPos ? "+" : "−"}₺{fmtTL(Math.abs(change))})
            </Text>
          </Text>
        ) : null}
      </View>

      {chart ? (
        <Svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs>
            <LinearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={lineColor} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={chart.fill} fill="url(#portGrad)" />
          <Path
            d={chart.path}
            stroke={lineColor}
            strokeWidth={1.9}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx={chart.lastX}
            cy={chart.lastY}
            r={3.8}
            fill={lineColor}
            stroke={colors.card}
            strokeWidth={1.6}
          />
        </Svg>
      ) : (
        <View
          style={{
            height: H,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_500Medium",
              color: colors.mutedForeground,
              textAlign: "center",
            }}
          >
            {snapshots.length === 0
              ? "Portföy değişimi burada zamanla çizilecek"
              : "Bu aralık için yeterli veri yok"}
          </Text>
        </View>
      )}

      {chart ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 4,
            paddingHorizontal: 2,
          }}
        >
          <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
            {fmtDate(chart.firstDate)}
          </Text>
          <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
            {fmtDate(chart.lastDate)}
          </Text>
        </View>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          marginTop: 14,
          gap: 6,
        }}
      >
        {RANGES.map((r) => {
          const active = r.key === range;
          return (
            <Pressable
              key={r.key}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onRangeChange(r.key);
              }}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? colors.primary : colors.secondary,
                alignItems: "center",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_700Bold",
                  color: active ? colors.primaryForeground : colors.mutedForeground,
                  letterSpacing: -0.1,
                }}
              >
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
