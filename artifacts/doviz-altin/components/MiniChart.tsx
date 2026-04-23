import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { HistoricalPoint } from "@/contexts/AppContext";

interface MiniChartProps {
  data: HistoricalPoint[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export function MiniChart({ data, width = 80, height = 36, positive }: MiniChartProps) {
  const colors = useColors();

  const { path, fillPath } = useMemo(() => {
    if (!data || data.length < 2) return { path: "", fillPath: "" };

    const prices = data.map((d) => d.close);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;

    const xStep = width / (prices.length - 1);
    const toY = (p: number) => height - ((p - minP) / range) * height * 0.85 - height * 0.075;

    let d = `M 0 ${toY(prices[0]!)}`;
    for (let i = 1; i < prices.length; i++) {
      const x = i * xStep;
      const y = toY(prices[i]!);
      const prevX = (i - 1) * xStep;
      const prevY = toY(prices[i - 1]!);
      const cpX = (prevX + x) / 2;
      d += ` C ${cpX} ${prevY} ${cpX} ${y} ${x} ${y}`;
    }

    const fillD = d + ` L ${width} ${height} L 0 ${height} Z`;
    return { path: d, fillPath: fillD };
  }, [data, width, height]);

  const isPositive = positive ?? (data.length > 1 && data[data.length - 1]!.close >= data[0]!.close);
  const color = isPositive ? colors.rise : colors.fall;
  const gradientId = `grad_${Math.random().toString(36).substr(2, 6)}`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>
        {fillPath ? (
          <Path d={fillPath} fill={`url(#${gradientId})`} />
        ) : null}
        {path ? (
          <Path d={path} stroke={color} strokeWidth={1.5} fill="none" />
        ) : null}
      </Svg>
    </View>
  );
}
