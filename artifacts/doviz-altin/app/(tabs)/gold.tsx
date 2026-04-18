import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp, GoldRate } from "@/contexts/AppContext";
import { PriceCard } from "@/components/PriceCard";
import { AssetPickerModal, PickerSection } from "@/components/AssetPickerModal";
import { GOLD_DEFAULT, loadGoldMiniCodes, saveGoldMiniCodes } from "@/lib/miniCardPrefs";

function GoldHero({
  gram,
  miniItems,
  onEditMini,
  colors,
  lastUpdated,
}: {
  gram: GoldRate | undefined;
  miniItems: (GoldRate | undefined)[];
  onEditMini: (idx: number) => void;
  colors: any;
  lastUpdated: Date | null;
}) {
  const formatTime = (date: Date | null) => {
    if (!date) return "BAĞLANIYOR";
    return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };
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
        <View>
          <Image
            source={require("@/assets/images/logo-dark.png")}
            style={{ width: 140, height: 38 }}
            contentFit="contain"
          />
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.7)", letterSpacing: 1.4, marginTop: 2 }}>
            ALTIN PİYASASI
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{
            paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.1)",
          }}>
            <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.9)", letterSpacing: 1 }}>
              {formatTime(lastUpdated)}
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
        {miniItems.map((item, idx) => {
          const prefix = item?.code === "ONS" ? "$" : "₺";
          const val = item?.buy ?? 0;
          const pct = item?.changePercent ?? 0;
          const up = pct >= 0;
          const hasChange = Math.abs(pct) >= 0.005;
          const valStr = `${prefix}${fmt(val)}`;
          const miniFontSize = valStr.length <= 7 ? 16 : valStr.length <= 9 ? 14 : valStr.length <= 10 ? 13 : 12;
          return (
            <Pressable
              key={`mini-${idx}`}
              onPress={() => {
                if (item) router.push({ pathname: "/detail/[code]", params: { code: item.code, type: "gold" } });
              }}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                onEditMini(idx);
              }}
              delayLongPress={350}
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text numberOfLines={1} style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.55)", letterSpacing: 1 }}>
                  {item?.code ?? "—"}
                </Text>
                <Icon name="ellipsis-horizontal" size={11} color="rgba(255,255,255,0.4)" />
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="clip"
                style={{ fontSize: miniFontSize, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 2, fontVariant: ["tabular-nums"] }}
              >
                {valStr}
              </Text>
              <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", marginTop: 2, color: hasChange ? (up ? "#5EEAA8" : "#FF8585") : "rgba(255,255,255,0.45)" }}>
                {hasChange ? `${up ? "▲" : "▼"} ${Math.abs(pct).toFixed(2)}%` : "—"}
              </Text>
            </Pressable>
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
    refreshData, lastUpdated,
  } = useApp();
  const [emission, setEmission] = useState<"yeni" | "eski">("yeni");
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [miniCodes, setMiniCodes] = useState<string[]>(GOLD_DEFAULT);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "favorites">("all");
  const sectionListRef = useRef<SectionList<GoldRate, Section>>(null);

  useEffect(() => {
    loadGoldMiniCodes().then(setMiniCodes);
  }, []);

  const updateMiniCode = useCallback((idx: number, code: string) => {
    setMiniCodes((prev) => {
      const next = [...prev];
      next[idx] = code;
      void saveGoldMiniCodes(next);
      return next;
    });
  }, []);

  const onManualRefresh = useCallback(async () => {
    setManualRefreshing(true);
    try { await refreshData(); } finally { setManualRefreshing(false); }
  }, [refreshData]);

  const topPadding = Platform.OS === "web" ? 14 : insets.top;
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 84 : 60 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  const allGold = useMemo(() => [
    ...goldGram, ...goldCoinsYeni, ...goldCoinsEski, ...goldBars, ...goldBracelets,
    ...metals, ...silvers, ...goldParities, ...ratios,
  ], [goldGram, goldCoinsYeni, goldCoinsEski, goldBars, goldBracelets, metals, silvers, goldParities, ratios]);

  const lookupGold = useCallback(
    (code: string) => allGold.find((g) => g.code === code),
    [allGold]
  );

  const goldPickerSections = useMemo<PickerSection[]>(() => {
    const buildSec = (title: string, arr: GoldRate[]): PickerSection | null =>
      arr.length ? {
        title,
        items: arr.map((g) => ({ code: g.code, label: g.nameTR, sub: g.code, type: "gold" as const })),
      } : null;
    return [
      buildSec("Gram & Ons", goldGram),
      buildSec("Sarrafiye Yeni", goldCoinsYeni),
      buildSec("Külçe", goldBars),
      buildSec("Bilezik & Ayar", goldBracelets),
      buildSec("Platin & Paladyum", metals),
      buildSec("Gümüş", silvers),
    ].filter((s): s is PickerSection => s !== null);
  }, [goldGram, goldCoinsYeni, goldBars, goldBracelets, metals, silvers]);

  const allSections: Section[] = useMemo(() => {
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

  const sections: Section[] = useMemo(() => {
    if (viewMode === "all") return allSections;
    return allSections
      .map((s) => ({ ...s, data: s.data.filter((d) => favorites.includes(d.code)) }))
      .filter((s) => s.data.length > 0);
  }, [allSections, viewMode, favorites]);

  const shortenTitle = (t: string) => {
    if (t === "Gram Altın & Ons") return "Gram & Ons";
    if (t === "Sarrafiye Altın") return "Sarrafiye";
    if (t === "Külçe Altın") return "Külçe";
    if (t === "Bilezik & Ayar") return "Bilezik";
    if (t === "Platin & Paladyum") return "Platin";
    if (t === "Altın Pariteleri") return "Pariteler";
    if (t === "Altın / Gümüş Oranı") return "Oran";
    return t;
  };

  const chips = useMemo(() => {
    const items: { key: string; label: string; icon?: "star" }[] = [{ key: "all", label: "Tümü" }];
    allSections.forEach((s, idx) => items.push({ key: `s-${idx}`, label: shortenTitle(s.title) }));
    items.push({ key: "favorites", label: "Favoriler", icon: "star" });
    return items;
  }, [allSections]);

  const onChipPress = useCallback((key: string) => {
    Haptics.selectionAsync().catch(() => {});
    if (key === "all") {
      setViewMode("all");
      requestAnimationFrame(() => {
        sectionListRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewOffset: 200 });
      });
    } else if (key === "favorites") {
      setViewMode("favorites");
    } else {
      const sectionIndex = parseInt(key.slice(2), 10);
      setViewMode("all");
      requestAnimationFrame(() => {
        try {
          sectionListRef.current?.scrollToLocation({ sectionIndex, itemIndex: 0, animated: true, viewOffset: 80 });
        } catch {}
      });
    }
  }, []);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    heroWrap: { paddingTop: topPadding },
    titleRow: {
      paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6,
      backgroundColor: colors.background,
    },
    titleText: {
      fontSize: 18, fontFamily: "Inter_700Bold",
      color: colors.foreground, letterSpacing: -0.4,
    },
    chipScrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, gap: 8 },
    chip: {
      flexDirection: "row", alignItems: "center", gap: 5,
      paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
      borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: {
      fontSize: 12, fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground, letterSpacing: -0.1,
    },
    chipTextActive: { color: "#FFFFFF" },
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
    emptyWrap: {
      paddingVertical: 60, alignItems: "center", paddingHorizontal: 32,
    },
  });

  return (
    <View style={styles.container}>
      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item, idx) => `${item.code}_${idx}`}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View>
            <View style={styles.heroWrap}>
              <GoldHero
                gram={goldGram.find((g) => g.code === "ALTIN")}
                miniItems={miniCodes.map((c) => lookupGold(c))}
                onEditMini={setEditingIdx}
                colors={colors}
                lastUpdated={lastUpdated}
              />
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>Altın / Madenler</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScrollContent}
            >
              {chips.map((c) => {
                const active =
                  (c.key === "all" && viewMode === "all") ||
                  (c.key === "favorites" && viewMode === "favorites");
                return (
                  <Pressable key={c.key} onPress={() => onChipPress(c.key)} style={[styles.chip, active && styles.chipActive]}>
                    {c.icon ? (
                      <Icon name={c.icon} size={11} color={active ? "#FFFFFF" : colors.mutedForeground} />
                    ) : null}
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
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
        ListEmptyComponent={
          viewMode === "favorites" ? (
            <View style={styles.emptyWrap}>
              <Icon name="star-outline" size={32} color={colors.mutedForeground} />
              <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 12, textAlign: "center" }}>
                Henüz Favori Altın Yok
              </Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 6, textAlign: "center", lineHeight: 18 }}>
                Bir altın kartının yıldızına dokunarak favorilerine ekleyebilirsin.
              </Text>
            </View>
          ) : null
        }
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          const offset = index * (averageItemLength || 80);
          sectionListRef.current?.getScrollResponder()?.scrollTo({ y: offset, animated: true });
        }}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={manualRefreshing} onRefresh={onManualRefresh} tintColor={colors.primary} />}
      />

      <AssetPickerModal
        visible={editingIdx !== null}
        title="Mini Kartı Seç"
        sections={goldPickerSections}
        selectedCode={editingIdx !== null ? miniCodes[editingIdx] : undefined}
        onSelect={(code) => editingIdx !== null && updateMiniCode(editingIdx, code)}
        onClose={() => setEditingIdx(null)}
      />
    </View>
  );
}
