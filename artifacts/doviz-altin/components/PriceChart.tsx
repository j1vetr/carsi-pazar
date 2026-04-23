import React, { useMemo } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import type { HistoryPoint, HistoryRange } from "@/lib/api/historyApi";

const W = 354;
const H = 200;
const PAD = { top: 14, right: 12, bottom: 26, left: 50 };

const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

const RANGE_TITLE: Record<HistoryRange, string> = {
  "1H": "SON 1 HAFTA",
  "1A": "SON 1 AY",
  "3A": "SON 3 AY",
  "1Y": "SON 1 YIL",
  "3Y": "SON 3 YIL",
  "5Y": "SON 5 YIL",
};

const MONO_FONT = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

function formatTick(value: number): string {
  if (value >= 10000) return Math.round(value).toLocaleString("tr-TR");
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(2);
  return value.toFixed(4);
}

function formatXLabel(iso: string, range: HistoryRange): string {
  const d = new Date(iso);
  if (range === "5Y" || range === "3Y" || range === "1Y") {
    return `${MONTHS_TR[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
  }
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]}`;
}

interface PriceChartProps {
  data: HistoryPoint[];
  range: HistoryRange;
  loading?: boolean;
  error?: string | null;
}

export function PriceChart({ data, range, loading, error }: PriceChartProps) {
  const colors = useColors();

  const chart = useMemo(() => {
    if (!data || data.length < 2) {
      return null;
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
      lastX,
      lastY: toY(prices[prices.length - 1]!),
    };
  }, [data, range]);

  const isPositive = chart ? chart.last >= chart.first : true;
  const lineColor = isPositive ? colors.rise : colors.fall;
  const changePct = chart && chart.first ? ((chart.last - chart.first) / chart.first) * 100 : 0;
  const changeAbs = chart ? chart.last - chart.first : 0;

  const styles = StyleSheet.create({
    container: { width: "100%" },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 10,
    },
    headerLabel: {
      fontSize: 10,
      fontFamily: "Inter_700Bold",
      letterSpacing: 1.4,
      color: colors.mutedForeground,
    },
    headerChange: {
      fontFamily: MONO_FONT,
      fontSize: 12,
      fontWeight: "700",
    },
    headerChangeMuted: {
      color: colors.mutedForeground,
      fontWeight: "500",
    },
    placeholder: {
      height: H,
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    statsRow: {
      flexDirection: "row",
      marginTop: 10,
    },
    statItem: { flex: 1 },
    statLabel: {
      fontSize: 9,
      color: colors.mutedForeground,
      fontFamily: "Inter_700Bold",
      letterSpacing: 1.1,
    },
    statValue: {
      fontFamily: MONO_FONT,
      fontSize: 13,
      fontWeight: "700",
      color: colors.foreground,
      marginTop: 4,
      letterSpacing: -0.3,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>{RANGE_TITLE[range]}</Text>
        {chart ? (
          <Text style={[styles.headerChange, { color: lineColor }]}>
            {isPositive ? "+" : "−"}%{Math.abs(changePct).toFixed(2)}{"  "}
            <Text style={styles.headerChangeMuted}>
              ({isPositive ? "+" : "−"}{formatTick(Math.abs(changeAbs))})
            </Text>
          </Text>
        ) : null}
      </View>

      {loading && (!chart) ? (
        <View style={styles.placeholder}>
          <ActivityIndicator color={colors.foreground} />
        </View>
      ) : error ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Veri yüklenemedi</Text>
        </View>
      ) : !chart ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Bu aralık için yeterli veri yok</Text>
        </View>
      ) : (
        <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          <Defs>
            <LinearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={lineColor} stopOpacity={0.18} />
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
                strokeWidth={0.6}
              />
              <SvgText
                x={PAD.left - 6}
                y={g.y + 3}
                fontSize={9}
                fill={colors.mutedForeground}
                textAnchor="end"
                fontFamily={MONO_FONT}
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
          <Path d={chart.path} stroke={lineColor} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={chart.lastX} cy={chart.lastY} r={3.8} fill={lineColor} stroke={colors.card} strokeWidth={1.6} />
        </Svg>
      )}

      {chart ? (
        <View style={styles.statsRow}>
          {[
            { label: "BAŞLANGIÇ", value: formatTick(chart.first), color: colors.foreground },
            { label: "EN YÜKSEK", value: formatTick(chart.hi), color: colors.rise },
            { label: "EN DÜŞÜK", value: formatTick(chart.lo), color: colors.fall },
            {
              label: "DEĞİŞİM",
              value: `${isPositive ? "+" : "−"}%${Math.abs(changePct).toFixed(2)}`,
              color: lineColor,
            },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
