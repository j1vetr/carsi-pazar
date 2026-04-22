import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, {
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import type { HistoryPoint, HistoryRange } from "@/lib/historyApi";

const PERIODS: { key: HistoryRange; label: string }[] = [
  { key: "1H", label: "1H" },
  { key: "1A", label: "1A" },
  { key: "1Y", label: "1Y" },
  { key: "5Y", label: "5Y" },
];

const W = 320;
const H = 200;
const PAD = { top: 12, right: 8, bottom: 28, left: 56 };

function formatTick(value: number): string {
  if (value >= 10000) return value.toFixed(0);
  if (value >= 100) return value.toFixed(1);
  if (value >= 10) return value.toFixed(2);
  return value.toFixed(4);
}

function formatXLabel(iso: string, range: HistoryRange): string {
  const d = new Date(iso);
  if (range === "5Y" || range === "1Y") {
    return `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
  }
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

interface PriceChartProps {
  data: HistoryPoint[];
  range: HistoryRange;
  onRangeChange: (r: HistoryRange) => void;
  loading?: boolean;
  error?: string | null;
}

export function PriceChart({
  data,
  range,
  onRangeChange,
  loading,
  error,
}: PriceChartProps) {
  const colors = useColors();

  const chart = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: "", fill: "", grid: [], xLabels: [], first: 0, last: 0, hi: 0, lo: 0 };
    }
    const prices = data.map((d) => d.c);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range_ = maxP - minP || maxP * 0.001 || 1;

    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;
    const xStep = cW / (prices.length - 1);
    const toX = (i: number) => PAD.left + i * xStep;
    const toY = (p: number) => PAD.top + cH - ((p - minP) / range_) * cH;

    let pathD = `M ${toX(0)} ${toY(prices[0])}`;
    for (let i = 1; i < prices.length; i++) {
      const x = toX(i);
      const y = toY(prices[i]);
      const prevX = toX(i - 1);
      const prevY = toY(prices[i - 1]);
      const cpX = (prevX + x) / 2;
      pathD += ` C ${cpX} ${prevY} ${cpX} ${y} ${x} ${y}`;
    }
    const lastX = toX(prices.length - 1);
    const fillD = pathD + ` L ${lastX} ${PAD.top + cH} L ${PAD.left} ${PAD.top + cH} Z`;

    const gridCount = 4;
    const grid = Array.from({ length: gridCount + 1 }, (_, i) => {
      const p = minP + (i / gridCount) * range_;
      return { y: toY(p), label: formatTick(p) };
    });

    const idxs = [
      0,
      Math.floor(prices.length / 4),
      Math.floor(prices.length / 2),
      Math.floor((3 * prices.length) / 4),
      prices.length - 1,
    ];
    const xLabels = idxs.map((i) => ({ x: toX(i), label: formatXLabel(data[i]!.t, range) }));

    return {
      path: pathD,
      fill: fillD,
      grid,
      xLabels,
      first: prices[0]!,
      last: prices[prices.length - 1]!,
      hi: maxP,
      lo: minP,
    };
  }, [data, range]);

  const isPositive = chart.last >= chart.first;
  const lineColor = isPositive ? colors.rise : colors.fall;
  const changePct = chart.first ? ((chart.last - chart.first) / chart.first) * 100 : 0;

  const styles = StyleSheet.create({
    container: { width: "100%" },
    periodRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      marginBottom: 12,
    },
    periodBtn: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
    },
    periodText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 12,
    },
    statItem: { alignItems: "center" },
    statLabel: {
      fontSize: 10,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      letterSpacing: 0.5,
    },
    statValue: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginTop: 2,
    },
    placeholder: {
      height: H,
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.periodRow}>
        {PERIODS.map((p) => {
          const active = range === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.periodBtn,
                { backgroundColor: active ? lineColor + "20" : colors.secondary },
              ]}
              onPress={() => onRangeChange(p.key)}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: active ? lineColor : colors.mutedForeground },
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && data.length === 0 ? (
        <View style={styles.placeholder}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Veri yüklenemedi</Text>
        </View>
      ) : data.length < 2 ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Bu aralık için yeterli veri yok</Text>
        </View>
      ) : (
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ alignSelf: "center" }}>
          <Defs>
            <LinearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={lineColor} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {chart.grid.map((g, i) => (
            <React.Fragment key={i}>
              <Line
                x1={PAD.left}
                y1={g.y}
                x2={W - PAD.right}
                y2={g.y}
                stroke={colors.border}
                strokeWidth={0.5}
                strokeDasharray="3,3"
              />
              <SvgText
                x={PAD.left - 4}
                y={g.y + 3}
                fontSize={9}
                fill={colors.mutedForeground}
                textAnchor="end"
              >
                {g.label}
              </SvgText>
            </React.Fragment>
          ))}

          {chart.xLabels.map((l, i) => (
            <SvgText
              key={i}
              x={l.x}
              y={H - 6}
              fontSize={9}
              fill={colors.mutedForeground}
              textAnchor="middle"
            >
              {l.label}
            </SvgText>
          ))}

          <Path d={chart.fill} fill="url(#pcGrad)" />
          <Path d={chart.path} stroke={lineColor} strokeWidth={2} fill="none" />
        </Svg>
      )}

      {data.length >= 2 && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>BAŞLANGIÇ</Text>
            <Text style={styles.statValue}>{formatTick(chart.first)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>EN YÜKSEK</Text>
            <Text style={[styles.statValue, { color: colors.rise }]}>{formatTick(chart.hi)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>EN DÜŞÜK</Text>
            <Text style={[styles.statValue, { color: colors.fall }]}>{formatTick(chart.lo)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>DEĞİŞİM</Text>
            <Text style={[styles.statValue, { color: lineColor }]}>
              {isPositive ? "+" : ""}
              {changePct.toFixed(2)}%
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
