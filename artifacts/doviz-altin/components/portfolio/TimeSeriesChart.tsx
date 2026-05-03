import React, { useMemo } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useCollapsiblePref } from "@/hooks/useCollapsiblePref";
import {
  sliceForRange,
  type DailySnapshot,
  type SnapshotRange,
} from "@/lib/storage/portfolioSnapshots";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Aralık başına en az kaç snapshot noktası varsa o sekmenin gösterileceği eşik.
// Kullanıcı yalnızca birkaç günlük veriye sahipken "1Y" veya "Tümü" sunmak
// boş "yeterli veri yok" mesajına yol açıyordu; bu tabloyla bunu engelliyoruz.
const ALL_RANGES: { key: SnapshotRange; label: string; minPoints: number }[] = [
  { key: "1H", label: "1H", minPoints: 2 },
  { key: "1A", label: "1A", minPoints: 5 },
  { key: "3A", label: "3AY", minPoints: 14 },
  { key: "1Y", label: "1Y", minPoints: 45 },
  { key: "ALL", label: "Tümü", minPoints: 2 },
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
  defaultOpen = true,
  persistId,
}: {
  snapshots: DailySnapshot[];
  range: SnapshotRange;
  onRangeChange: (r: SnapshotRange) => void;
  currentValue: number;
  defaultOpen?: boolean;
  persistId?: string;
}) {
  const colors = useColors();
  const { open, toggle } = useCollapsiblePref(persistId, defaultOpen);

  const visibleRanges = useMemo(() => {
    const n = snapshots.length;
    if (n < 2) return [] as typeof ALL_RANGES;
    return ALL_RANGES.filter((r) => n >= r.minPoints);
  }, [snapshots.length]);

  // Portföy state'inde tutulan range artık seçilemez bir aralığı gösterebilir
  // (örn. 1A varken kullanıcı çok az veri ile geri döndü). Bu durumda en
  // uzun mevcut aralığa düşeriz; kullanıcı state'i değiştirmeden çalışırız.
  const effectiveRange: SnapshotRange = useMemo(() => {
    if (visibleRanges.find((r) => r.key === range)) return range;
    const last = visibleRanges[visibleRanges.length - 1];
    return last?.key ?? "ALL";
  }, [range, visibleRanges]);

  const series = useMemo(() => {
    const base = sliceForRange(snapshots, effectiveRange);
    if (base.length === 0) return [];
    const last = base[base.length - 1]!;
    const today = new Date().toISOString().slice(0, 10);
    if (last.d !== today) {
      return [...base, { d: today, v: currentValue, c: last.c }];
    }
    return base;
  }, [snapshots, effectiveRange, currentValue]);

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

    let d = `M ${toX(0)} ${toY(values[0]!)}`;
    for (let i = 1; i < values.length; i++) {
      const x = toX(i);
      const y = toY(values[i]!);
      const prevX = toX(i - 1);
      const prevY = toY(values[i - 1]!);
      const cpX = (prevX + x) / 2;
      d += ` C ${cpX} ${prevY} ${cpX} ${y} ${x} ${y}`;
    }
    const lastX = toX(values.length - 1);
    const fillD = d + ` L ${lastX} ${PAD.top + cH} L ${PAD.left} ${PAD.top + cH} Z`;

    return {
      path: d,
      fill: fillD,
      first: values[0]!,
      last: values[values.length - 1]!,
      lastX,
      lastY: toY(values[values.length - 1]!),
      firstDate: series[0]!.d,
      lastDate: series[series.length - 1]!.d,
    };
  }, [series]);

  const isPos = chart ? chart.last >= chart.first : true;
  const lineColor = isPos ? colors.rise : colors.fall;
  const change = chart ? chart.last - chart.first : 0;
  const changePct = chart && chart.first > 0 ? (change / chart.first) * 100 : 0;

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync().catch(() => {});
    toggle();
  };

  const summaryText = chart
    ? `${isPos ? "+" : "−"}%${Math.abs(changePct).toFixed(2)} · son ${series.length} gün`
    : snapshots.length < 2
      ? "Henüz yeterli veri yok"
      : "Bu aralık için yeterli veri yok";

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 12,
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel="Değer Geçmişi"
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View style={{ flex: 1 }}>
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
          <Text
            style={{
              fontFamily: chart ? MONO : "Inter_500Medium",
              fontSize: 12,
              fontWeight: chart ? "700" : "500",
              color: chart ? lineColor : colors.mutedForeground,
              marginTop: 3,
              letterSpacing: -0.1,
            }}
            numberOfLines={1}
          >
            {summaryText}
          </Text>
        </View>
        <Icon
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedForeground}
        />
      </Pressable>

      {open ? (
        <Animated.View
          entering={FadeInDown.duration(260).springify().damping(18).mass(0.6)}
          exiting={FadeOutDown.duration(160)}
          style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 }}
        >
          {chart ? (
            <>
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
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 10.5,
                  fontFamily: "Inter_500Medium",
                  color: colors.mutedForeground,
                  textAlign: "right",
                }}
              >
                {isPos ? "+" : "−"}₺{fmtTL(Math.abs(change))} bu pencerede
              </Text>
            </>
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
                  paddingHorizontal: 20,
                }}
              >
                {snapshots.length < 2
                  ? "Birkaç gün sonra burada portföy değişimini göreceksin"
                  : "Bu aralık için yeterli veri yok"}
              </Text>
            </View>
          )}

          {visibleRanges.length > 1 ? (
            <View
              style={{
                flexDirection: "row",
                marginTop: 14,
                gap: 6,
              }}
            >
              {visibleRanges.map((r) => {
                const active = r.key === effectiveRange;
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
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
}
