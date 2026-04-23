import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { formatSymbolName } from "@/lib/utils/symbolDescriptions";

type Slot = "a" | "b";

interface Asset {
  code: string;
  name: string;
  symbol?: string;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
  prevClose?: number;
  category: string;
}

const fmtPrice = (v: number, decimals = 2): string => {
  if (!Number.isFinite(v) || v === 0) return "—";
  const d = v >= 1000 ? 2 : v >= 100 ? 2 : v >= 10 ? 3 : 4;
  return v.toLocaleString("tr-TR", {
    minimumFractionDigits: Math.min(d, decimals === 2 ? d : decimals),
    maximumFractionDigits: Math.min(d, decimals === 2 ? d : decimals),
  });
};

const fmtPct = (v: number): string => {
  if (!Number.isFinite(v)) return "0,00%";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
};

export default function CompareScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    currencies,
    parities,
    goldRates,
    goldGram,
    goldBars,
    goldBracelets,
    metals,
    silvers,
  } = useApp();

  const groups = useMemo(() => {
    const mk = (cat: string, list: any[]): Asset[] =>
      list.map((r) => ({
        code: r.code,
        name: r.nameTR ?? r.name,
        symbol: r.symbol,
        buy: r.buy,
        sell: r.sell,
        change: r.change,
        changePercent: r.changePercent,
        prevClose: r.prevClose,
        category: cat,
      }));
    return [
      { title: "Döviz", items: mk("Döviz", currencies) },
      { title: "Pariteler", items: mk("Parite", parities) },
      { title: "Sarrafiye Altın", items: mk("Sarrafiye", goldRates) },
      { title: "Gram Altın", items: mk("Gram", goldGram) },
      { title: "Külçe", items: mk("Külçe", goldBars) },
      { title: "Bilezik", items: mk("Bilezik", goldBracelets) },
      { title: "Değerli Metal", items: mk("Metal", metals) },
      { title: "Gümüş", items: mk("Gümüş", silvers) },
    ].filter((g) => g.items.length > 0);
  }, [currencies, parities, goldRates, goldGram, goldBars, goldBracelets, metals, silvers]);

  const allAssets = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  // Default selection: USD vs gram altın
  const [aCode, setACode] = useState<string | null>(() => {
    return allAssets.find((a) => a.code === "USD")?.code ?? allAssets[0]?.code ?? null;
  });
  const [bCode, setBCode] = useState<string | null>(() => {
    return (
      allAssets.find((a) => a.code === "ALTIN")?.code ??
      allAssets.find((a) => a.code === "EUR")?.code ??
      allAssets[1]?.code ??
      null
    );
  });
  const [picker, setPicker] = useState<Slot | null>(null);

  const a = aCode ? allAssets.find((x) => x.code === aCode) : null;
  const b = bCode ? allAssets.find((x) => x.code === bCode) : null;

  const handlePick = (asset: Asset) => {
    Haptics.selectionAsync().catch(() => {});
    if (picker === "a") setACode(asset.code);
    else if (picker === "b") setBCode(asset.code);
    setPicker(null);
  };

  const handleSwap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setACode(bCode);
    setBCode(aCode);
  };

  // Comparison metrics
  const winner: Slot | "tie" | null =
    a && b
      ? Math.abs(a.changePercent - b.changePercent) < 0.001
        ? "tie"
        : a.changePercent > b.changePercent
        ? "a"
        : "b"
      : null;

  const diff =
    a && b ? Math.abs(a.changePercent - b.changePercent).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00";

  const bottomPadding = Platform.OS === "web" ? 40 : Math.max(insets.bottom, 16) + 32;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader eyebrow="Karşılaştır" title="İki Varlık" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPadding, paddingHorizontal: 20, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Slot A */}
        <Animated.View entering={FadeIn.duration(280)}>
          <CompareCard
            slot="A"
            asset={a}
            colors={colors}
            onPress={() => setPicker("a")}
            isWinner={winner === "a"}
          />
        </Animated.View>

        {/* VS divider with swap button */}
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 14, gap: 12 }}>
          <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
          <Pressable
            onPress={handleSwap}
            style={({ pressed }) => [{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: colors.card,
              borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
              alignItems: "center", justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Icon name="swap-vertical" size={20} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
        </View>

        {/* Slot B */}
        <Animated.View entering={FadeIn.delay(80).duration(280)}>
          <CompareCard
            slot="B"
            asset={b}
            colors={colors}
            onPress={() => setPicker("b")}
            isWinner={winner === "b"}
          />
        </Animated.View>

        {/* Verdict strip */}
        {a && b ? (
          <Animated.View entering={FadeInUp.delay(140).duration(300)} style={{ marginTop: 18 }}>
            <LinearGradient
              colors={
                winner === "tie"
                  ? ["#475569", "#64748B"]
                  : winner === "a"
                  ? ["#065F46", "#10B981"]
                  : ["#92400E", "#F59E0B"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 18, padding: 18 }}
            >
              <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.85)", letterSpacing: 1.2, marginBottom: 6 }}>
                BUGÜNKÜ FARK
              </Text>
              {winner === "tie" ? (
                <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.5 }}>
                  Berabere · İkisi de aynı
                </Text>
              ) : (
                <>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <Text style={{ fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.8 }}>
                      {(winner === "a" ? a : b).code}
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.9)" }}>
                      önde
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.85)", marginTop: 6, lineHeight: 18 }}>
                    Bugün {a.code} ile {b.code} arasında{" "}
                    <Text style={{ fontFamily: "Inter_700Bold", color: "#fff" }}>%{diff}</Text> fark var.
                  </Text>
                </>
              )}
            </LinearGradient>
          </Animated.View>
        ) : null}

        {/* Quick swaps */}
        <View style={{ marginTop: 22 }}>
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10 }}>
            HIZLI KARŞILAŞTIRMALAR
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[
              ["USD", "EUR"],
              ["USD", "ALTIN"],
              ["EUR", "ALTIN"],
              ["ALTIN", "GUMUS"],
              ["CEYREK", "GRAM"],
              ["XAUUSD", "USD"],
            ].map(([x, y]) => {
              const xa = allAssets.find((it) => it.code === x);
              const ya = allAssets.find((it) => it.code === y);
              if (!xa || !ya) return null;
              return (
                <Pressable
                  key={`${x}-${y}`}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setACode(x);
                    setBCode(y);
                  }}
                  style={({ pressed }) => [{
                    paddingHorizontal: 12, paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: colors.card,
                    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
                    flexDirection: "row", alignItems: "center", gap: 6,
                    opacity: pressed ? 0.7 : 1,
                  }]}
                >
                  <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.1 }}>
                    {x}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>vs</Text>
                  <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.1 }}>
                    {y}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Picker modal */}
      <Modal
        visible={picker !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setPicker(null)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPicker(null)} />
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 12,
              maxHeight: "85%",
            }}
          >
            <View style={{ alignItems: "center", paddingVertical: 6 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10 }}>
              <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.4 }}>
                Varlık Seç
              </Text>
              <Pressable onPress={() => setPicker(null)} style={{ padding: 4 }} hitSlop={8}>
                <Icon name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16, paddingHorizontal: 12 }}>
              {groups.map((g) => (
                <View key={g.title} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, paddingHorizontal: 8, paddingTop: 10, paddingBottom: 6 }}>
                    {g.title.toUpperCase()}
                  </Text>
                  {g.items.map((it) => {
                    const positive = it.changePercent >= 0;
                    const selected = (picker === "a" ? aCode : bCode) === it.code;
                    return (
                      <Pressable
                        key={it.code}
                        onPress={() => handlePick(it)}
                        style={({ pressed }) => [{
                          flexDirection: "row", alignItems: "center",
                          paddingHorizontal: 12, paddingVertical: 11,
                          borderRadius: 12,
                          backgroundColor: selected ? colors.primary + "1A" : pressed ? colors.secondary : "transparent",
                        }]}
                      >
                        <View style={{ minWidth: 56, marginRight: 10 }}>
                          <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
                            {it.code}
                          </Text>
                        </View>
                        <Text style={{ flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground }} numberOfLines={1}>
                          {it.name}
                        </Text>
                        <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, marginRight: 10 }}>
                          {fmtPrice(it.sell)}
                        </Text>
                        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: positive ? "#22C55E" : "#EF4444", minWidth: 56, textAlign: "right" }}>
                          {fmtPct(it.changePercent)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CompareCard({
  slot, asset, colors, onPress, isWinner,
}: {
  slot: string;
  asset: Asset | null | undefined;
  colors: any;
  onPress: () => void;
  isWinner: boolean;
}) {
  if (!asset) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{
          padding: 22, borderRadius: 20,
          backgroundColor: colors.card,
          borderWidth: 2, borderStyle: "dashed", borderColor: colors.border,
          alignItems: "center",
          opacity: pressed ? 0.7 : 1,
        }]}
      >
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
          <Icon name="add" size={24} color={colors.mutedForeground} />
        </View>
        <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>
          {slot} · Varlık seç
        </Text>
      </Pressable>
    );
  }

  const positive = asset.changePercent >= 0;
  const accentColor = positive ? "#22C55E" : "#EF4444";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      <View
        style={{
          padding: 18, borderRadius: 20,
          backgroundColor: colors.card,
          borderWidth: 2,
          borderColor: isWinner ? accentColor : colors.border,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View
            style={{
              minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 8,
              backgroundColor: colors.secondary,
              alignItems: "center", justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.4 }}>
              {slot}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.4 }}>
              {formatSymbolName(asset.code)}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 2 }} numberOfLines={1}>
              {asset.name}
            </Text>
          </View>
          {isWinner ? (
            <View
              style={{
                paddingHorizontal: 8, paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: accentColor + "1F",
                flexDirection: "row", alignItems: "center", gap: 4,
              }}
            >
              <Icon name="trending-up" size={12} color={accentColor} />
              <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: accentColor, letterSpacing: 0.4 }}>
                ÖNDE
              </Text>
            </View>
          ) : null}
          <Icon name="chevron-forward" size={18} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
        </View>

        {/* Price */}
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
          <Text style={{ fontSize: 32, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -1 }}>
            {fmtPrice(asset.sell)}
          </Text>
          <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>
            {asset.code === "USD" || asset.code === "EUR" || asset.code === "GBP" ? "₺" : ""}
          </Text>
        </View>

        {/* Change row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
          <View
            style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              paddingHorizontal: 8, paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: accentColor + "1A",
            }}
          >
            <Icon name={positive ? "arrow-up" : "arrow-down"} size={12} color={accentColor} />
            <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: accentColor }}>
              {fmtPct(asset.changePercent)}
            </Text>
          </View>
          <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
            Önceki: {fmtPrice(asset.prevClose ?? 0)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
