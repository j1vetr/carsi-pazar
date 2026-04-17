import React, { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, GoldRate } from "@/contexts/AppContext";
import { PriceCard } from "@/components/PriceCard";

function GoldHero({
  ons,
  gram,
  ceyrek,
  colors,
}: {
  ons: GoldRate | undefined;
  gram: GoldRate | undefined;
  ceyrek: GoldRate | undefined;
  colors: any;
}) {
  const fmt = (n: number, frac = 2) =>
    n.toLocaleString("tr-TR", { minimumFractionDigits: frac, maximumFractionDigits: frac });
  const gramBuy = gram?.buy ?? 0;
  const gramChange = gram?.change ?? 0;
  const gramPct = gram?.changePercent ?? 0;
  const isPos = gramChange >= 0;
  const hasChange = Math.abs(gramPct) >= 0.005;

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark, "#04173B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />
          <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 1.4 }}>
            ALTIN PİYASASI
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/alerts")}
          style={{
            width: 34, height: 34, borderRadius: 17,
            backgroundColor: "rgba(255,255,255,0.1)",
            alignItems: "center", justifyContent: "center",
          }}
          hitSlop={6}
        >
          <Icon name="notifications-outline" size={17} color="#FFFFFF" />
        </Pressable>
      </View>

      <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.55)", letterSpacing: 1.5, marginBottom: 4 }}>
        GRAM ALTIN · TL
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 38, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -1, fontVariant: ["tabular-nums"] }}>
            {fmt(gramBuy)}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 }}>
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
              backgroundColor: hasChange ? (isPos ? "rgba(94,234,168,0.15)" : "rgba(255,133,133,0.15)") : "rgba(255,255,255,0.1)",
            }}>
              {hasChange && (
                <Icon name={isPos ? "caret-up" : "caret-down"} size={11} color={isPos ? "#5EEAA8" : "#FF8585"} />
              )}
              <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: hasChange ? (isPos ? "#5EEAA8" : "#FF8585") : "rgba(255,255,255,0.7)" }}>
                {hasChange ? `${isPos ? "+" : ""}${gramPct.toFixed(2)}%` : "—"}
              </Text>
            </View>
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)" }}>
              {hasChange ? `${isPos ? "+" : ""}${fmt(gramChange)} ₺` : "Baseline alınıyor"}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.55)", letterSpacing: 1.5 }}>
            SATIŞ
          </Text>
          <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 4, fontVariant: ["tabular-nums"] }}>
            {fmt(gram?.sell ?? 0)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        {[
          { label: "ONS · USD", item: ons, prefix: "$" },
          { label: "ÇEYREK · TL", item: ceyrek, prefix: "₺" },
          { label: "GRAM SATIŞ", item: gram, prefix: "₺", useSell: true },
        ].map((mini) => {
          const val = mini.useSell ? mini.item?.sell ?? 0 : mini.item?.buy ?? 0;
          const pct = mini.item?.changePercent ?? 0;
          const up = pct >= 0;
          return (
            <View key={mini.label} style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
            }}>
              <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.55)", letterSpacing: 1 }}>
                {mini.label}
              </Text>
              <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 2, fontVariant: ["tabular-nums"] }}>
                {mini.prefix}{fmt(val)}
              </Text>
              <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", marginTop: 2, color: up ? "#5EEAA8" : "#FF8585" }}>
                {up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
              </Text>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );
}

interface Section {
  title: string;
  subtitle?: string;
  data: GoldRate[];
}

export default function GoldScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    goldGram, goldCoinsYeni, goldCoinsEski, goldBars, goldBracelets,
    metals, silvers, goldParities, ratios, favorites, toggleFavorite,
    refreshData,
  } = useApp();
  const [emission, setEmission] = useState<"yeni" | "eski">("yeni");
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const onManualRefresh = useCallback(async () => {
    setManualRefreshing(true);
    try { await refreshData(); } finally { setManualRefreshing(false); }
  }, [refreshData]);

  const topPadding = Platform.OS === "web" ? 14 : insets.top;
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 84 : 60 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  const sections: Section[] = useMemo(() => {
    const list: Section[] = [];
    if (goldGram.length) list.push({ title: "Gram Altın & Ons", subtitle: `${goldGram.length} varlık`, data: goldGram });
    const coins = emission === "yeni" ? goldCoinsYeni : goldCoinsEski;
    if (coins.length) {
      list.push({
        title: "Sarrafiye Altın",
        subtitle: emission === "yeni" ? "Yeni Emisyon" : "Eski Emisyon",
        data: coins,
      });
    }
    if (goldBars.length) list.push({ title: "Külçe Altın", subtitle: "Boyutlar", data: goldBars });
    if (goldBracelets.length) list.push({ title: "Bilezik & Ayar", data: goldBracelets });
    if (metals.length) list.push({ title: "Platin & Paladyum", data: metals });
    if (silvers.length) list.push({ title: "Gümüş", data: silvers });
    if (goldParities.length) list.push({ title: "Altın Pariteleri", subtitle: "1 oz altın paritesi", data: goldParities });
    if (ratios.length) list.push({ title: "Altın / Gümüş Oranı", data: ratios });
    return list;
  }, [emission, goldGram, goldCoinsYeni, goldCoinsEski, goldBars, goldBracelets, metals, silvers, goldParities, ratios]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    heroWrap: { paddingTop: topPadding },
    sectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 8,
      backgroundColor: colors.background,
    },
    sectionLeft: { flexDirection: "row", alignItems: "baseline", gap: 8 },
    sectionTitle: {
      fontSize: 16, fontFamily: "Inter_700Bold",
      color: colors.foreground, letterSpacing: -0.2,
    },
    sectionSubtitle: {
      fontSize: 11, fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    emissionPill: {
      flexDirection: "row", backgroundColor: colors.secondary,
      borderRadius: 8, padding: 2,
    },
    emissionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
    emissionBtnActive: { backgroundColor: colors.card },
    emissionText: { fontSize: 11, fontFamily: "Inter_700Bold" },
    list: { paddingBottom: bottomPadding + 16 },
  });

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, idx) => `${item.code}_${idx}`}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.heroWrap}>
            <GoldHero
              ons={goldGram.find((g) => g.code === "ONS")}
              gram={goldGram.find((g) => g.code === "ALTIN")}
              ceyrek={goldCoinsYeni.find((g) => g.code === "CEYREK")}
              colors={colors}
            />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.subtitle ? (
                <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
              ) : null}
            </View>
            {section.title === "Sarrafiye Altın" ? (
              <View style={styles.emissionPill}>
                <Pressable
                  onPress={() => setEmission("yeni")}
                  style={[styles.emissionBtn, emission === "yeni" && styles.emissionBtnActive]}
                >
                  <Text style={[styles.emissionText, { color: emission === "yeni" ? colors.foreground : colors.mutedForeground }]}>
                    Yeni
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setEmission("eski")}
                  style={[styles.emissionBtn, emission === "eski" && styles.emissionBtnActive]}
                >
                  <Text style={[styles.emissionText, { color: emission === "eski" ? colors.foreground : colors.mutedForeground }]}>
                    Eski
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
        renderItem={({ item }) => (
          <PriceCard
            item={item}
            type="gold"
            hideIcon
            nameFirst
            isFavorite={favorites.includes(item.code)}
            onFavoriteToggle={() => toggleFavorite(item.code)}
            onPress={() => router.push({ pathname: "/detail/[code]", params: { code: item.code, type: "gold" } })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={manualRefreshing} onRefresh={onManualRefresh} tintColor={colors.primary} />}
      />
    </View>
  );
}
