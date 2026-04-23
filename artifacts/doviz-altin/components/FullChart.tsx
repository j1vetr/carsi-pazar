import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Line, Text as SvgText } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { HistoricalPoint } from "@/contexts/AppContext";

interface FullChartProps {
  data: HistoricalPoint[];
  period: string;
  onPeriodChange: (p: "1D" | "1W" | "1M" | "3M" | "1Y") => void;
  currentPrice: number;
}

const PERIODS = ["1D", "1W", "1M", "3M", "1Y"] as const;

export function FullChart({ data, period, onPeriodChange, currentPrice }: FullChartProps) {
  const colors = useColors();
  const W = 320;
  const H = 180;
  const PAD = { top: 10, right: 8, bottom: 32, left: 54 };

  const chartData = useMemo(() => {
    if (!data || data.length < 2) return { path: "", fillPath: "", gridLines: [], labels: [] };

    const prices = data.map((d) => d.close);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;

    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;
    const xStep = cW / (prices.length - 1);
    const toX = (i: number) => PAD.left + i * xStep;
    const toY = (p: number) => PAD.top + cH - ((p - minP) / range) * cH;

    let pathD = `M ${toX(0)} ${toY(prices[0]!)}`;
    for (let i = 1; i < prices.length; i++) {
      const x = toX(i);
      const y = toY(prices[i]!);
      const prevX = toX(i - 1);
      const prevY = toY(prices[i - 1]!);
      const cpX = (prevX + x) / 2;
      pathD += ` C ${cpX} ${prevY} ${cpX} ${y} ${x} ${y}`;
    }

    const lastX = toX(prices.length - 1);
    const fillPathD =
      pathD + ` L ${lastX} ${PAD.top + cH} L ${PAD.left} ${PAD.top + cH} Z`;

    const gridCount = 4;
    const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
      const p = minP + (i / gridCount) * range;
      const y = toY(p);
      const label = p >= 1000 ? p.toFixed(0) : p >= 10 ? p.toFixed(2) : p.toFixed(4);
      return { y, label };
    });

    const labelIndices = [0, Math.floor(prices.length / 4), Math.floor(prices.length / 2), Math.floor((3 * prices.length) / 4), prices.length - 1];
    const labels = labelIndices.map((idx) => {
      const d = data[idx]!;
      const date = new Date(d.time);
      let label = "";
      if (period === "1D") label = date.getHours() + ":00";
      else if (period === "1W") label = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][date.getDay()] ?? "";
      else label = date.getDate() + "/" + (date.getMonth() + 1);
      return { x: toX(idx), label };
    });

    return { path: pathD, fillPath: fillPathD, gridLines, labels };
  }, [data, period]);

  const isPositive = data.length > 1 && data[data.length - 1]!.close >= data[0]!.close;
  const color = isPositive ? colors.rise : colors.fall;
  const changePercent =
    data.length > 1
      ? ((data[data.length - 1]!.close - data[0]!.close) / data[0]!.close) * 100
      : 0;

  const styles = StyleSheet.create({
    container: { width: "100%" },
    periodRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      marginBottom: 12,
    },
    periodBtn: {
      paddingHorizontal: 14,
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
      marginTop: 8,
    },
    statItem: { alignItems: "center" },
    statLabel: {
      fontSize: 10,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    statValue: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodBtn,
              {
                backgroundColor:
                  period === p ? color + "20" : colors.secondary,
              },
            ]}
            onPress={() => onPeriodChange(p)}
          >
            <Text
              style={[
                styles.periodText,
                { color: period === p ? color : colors.mutedForeground },
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ alignSelf: "center" }}>
        <Defs>
          <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {chartData.gridLines.map((gl, i) => (
          <React.Fragment key={i}>
            <Line
              x1={PAD.left}
              y1={gl.y}
              x2={W - PAD.right}
              y2={gl.y}
              stroke={colors.border}
              strokeWidth={0.5}
              strokeDasharray="3,3"
            />
            <SvgText
              x={PAD.left - 4}
              y={gl.y + 4}
              fontSize={9}
              fill={colors.mutedForeground}
              textAnchor="end"
            >
              {gl.label}
            </SvgText>
          </React.Fragment>
        ))}

        {chartData.labels.map((l, i) => (
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

        {chartData.fillPath && (
          <Path d={chartData.fillPath} fill="url(#chartGrad)" />
        )}
        {chartData.path && (
          <Path d={chartData.path} stroke={color} strokeWidth={2} fill="none" />
        )}
      </Svg>

      <View style={styles.statsRow}>
        {data.length > 0 && (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>AÇILIŞ</Text>
              <Text style={styles.statValue}>
                {data[0]!.close >= 1000
                  ? data[0]!.close.toFixed(0)
                  : data[0]!.close >= 10
                  ? data[0]!.close.toFixed(2)
                  : data[0]!.close.toFixed(4)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>EN YÜKSEK</Text>
              <Text style={[styles.statValue, { color: colors.rise }]}>
                {Math.max(...data.map((d) => d.high)) >= 1000
                  ? Math.max(...data.map((d) => d.high)).toFixed(0)
                  : Math.max(...data.map((d) => d.high)) >= 10
                  ? Math.max(...data.map((d) => d.high)).toFixed(2)
                  : Math.max(...data.map((d) => d.high)).toFixed(4)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>EN DÜŞÜK</Text>
              <Text style={[styles.statValue, { color: colors.fall }]}>
                {Math.min(...data.map((d) => d.low)) >= 1000
                  ? Math.min(...data.map((d) => d.low)).toFixed(0)
                  : Math.min(...data.map((d) => d.low)) >= 10
                  ? Math.min(...data.map((d) => d.low)).toFixed(2)
                  : Math.min(...data.map((d) => d.low)).toFixed(4)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DEĞİŞİM</Text>
              <Text style={[styles.statValue, { color: isPositive ? colors.rise : colors.fall }]}>
                {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
