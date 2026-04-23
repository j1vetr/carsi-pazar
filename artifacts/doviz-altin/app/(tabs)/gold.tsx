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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { haptics } from "@/lib/haptics";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useApp, GoldRate } from "@/contexts/AppContext";
import { PriceRowMenu } from "@/components/common/PriceRowMenu";
import { MinimalTopBar } from "@/components/MinimalTopBar";
import { ModernPriceRow, ModernTableHeader } from "@/components/ModernPriceRow";
import { SwipeableRow } from "@/components/common/SwipeableRow";
import { symbolLeftActions } from "@/lib/swipeActions";
import { PriceRowSkeleton } from "@/components/common/skeletons/PriceRowSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

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
    refreshData, lastUpdated, lastRefreshFailed,
  } = useApp();
  const [emission, setEmission] = useState<"yeni" | "eski">("yeni");
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "favorites">("all");
  const sectionListRef = useRef<SectionList<GoldRate, Section>>(null);

  const onManualRefresh = useCallback(async () => {
    haptics.tap();
    setManualRefreshing(true);
    try {
      const r = await refreshData();
      if (r.ok) haptics.success();
      else haptics.error();
    } catch {
      haptics.error();
    } finally {
      setManualRefreshing(false);
    }
  }, [refreshData]);

  const [menuItem, setMenuItem] = useState<GoldRate | null>(null);

  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 84 : 60 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  const allSections: Section[] = useMemo(() => {
    const list: Section[] = [];
    if (goldGram.length) list.push({ title: "Gram & Ons Altın", subtitle: "Saf altın fiyatları", data: goldGram });
    const coins = emission === "yeni" ? goldCoinsYeni : goldCoinsEski;
    if (coins.length) {
      list.push({
        title: "Sarrafiye Altın",
        subtitle: emission === "yeni" ? "Yeni basım" : "Eski basım (1980 öncesi)",
        data: coins,
      });
    }
    if (goldBars.length) list.push({ title: "Külçe Altın", subtitle: "Gram bazlı külçeler", data: goldBars });
    if (goldBracelets.length) list.push({ title: "Bilezik & Ziynet", subtitle: "Ayar bazlı bilezikler", data: goldBracelets });
    if (metals.length) list.push({ title: "Platin & Paladyum", subtitle: "Değerli madenler", data: metals });
    if (silvers.length) list.push({ title: "Gümüş", subtitle: "Gram, ons ve kg", data: silvers });
    if (goldParities.length) list.push({ title: "Altın Pariteleri", subtitle: "1 ons altın karşılığı", data: goldParities });
    if (ratios.length) list.push({ title: "Altın / Gümüş Oranı", subtitle: "1 ons altın = kaç ons gümüş", data: ratios });
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
    const items: { key: string; label: string; icon?: "star" | "star-outline" }[] = [{ key: "all", label: "Tümü" }];
    allSections.forEach((s, idx) => items.push({ key: `s-${idx}`, label: shortenTitle(s.title) }));
    items.push({ key: "favorites", label: "Favoriler", icon: "star" });
    return items;
  }, [allSections]);

  const onChipPress = useCallback((key: string) => {
    haptics.select();
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

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18, paddingTop: 16, paddingBottom: 4,
      backgroundColor: colors.background,
    },
    titleText: {
      fontSize: 16, fontFamily: "Inter_700Bold",
      color: colors.foreground, letterSpacing: -0.3,
    },
    titleMeta: {
      fontSize: 9.5, fontFamily: "Inter_700Bold",
      color: colors.mutedForeground, letterSpacing: 1.4,
    },

    chipScrollContent: {
      paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8, gap: 8,
    },
    chip: {
      flexDirection: "row", alignItems: "center", gap: 5,
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
      backgroundColor: colors.surface,
    },
    chipActive: { backgroundColor: colors.foreground },
    chipText: {
      fontSize: 12.5, fontFamily: "Inter_700Bold",
      color: colors.mutedForeground, letterSpacing: -0.1,
    },
    chipTextActive: { color: colors.background },

    sectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8,
      backgroundColor: colors.background,
    },
    sectionLeft: { flexDirection: "row", alignItems: "baseline", gap: 8, flexShrink: 1 },
    sectionTitle: {
      fontSize: 15, fontFamily: "Inter_700Bold",
      color: colors.foreground, letterSpacing: -0.2,
    },
    sectionSubtitle: {
      fontSize: 11, fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    emissionPill: {
      flexDirection: "row", backgroundColor: colors.surface,
      borderRadius: 8, padding: 2,
    },
    emissionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
    emissionBtnActive: { backgroundColor: colors.background },
    emissionText: { fontSize: 11, fontFamily: "Inter_700Bold" },

    list: { paddingBottom: bottomPadding + 16 },

    emptyWrap: { paddingVertical: 60, alignItems: "center", paddingHorizontal: 32 },
  });

  return (
    <View style={styles.container}>
      <MinimalTopBar lastUpdated={lastUpdated} />
      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item, idx) => `${item.code}_${idx}`}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>Altın / Madenler</Text>
              <Text style={styles.titleMeta}>{lastUpdated ? "KAPALIÇARŞI" : "BAĞLANIYOR"}</Text>
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
                      <Icon
                        name={active ? "star" : "star-outline"}
                        size={11}
                        color={active ? colors.background : colors.mutedForeground}
                      />
                    ) : null}
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        renderSectionHeader={({ section }) => {
          const isSarrafiye = section.title === "Sarrafiye Altın";
          return (
            <View>
              <View style={styles.sectionRow}>
                <View style={styles.sectionLeft}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.subtitle ? (
                    <Text style={styles.sectionSubtitle} numberOfLines={1}>{section.subtitle}</Text>
                  ) : null}
                </View>
                {isSarrafiye ? (
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
              <ModernTableHeader withIcon={false} />
            </View>
          );
        }}
        renderItem={({ item, section }) => {
          const isSarrafiye = section.title === "Sarrafiye Altın";
          const badge = isSarrafiye ? (emission === "yeni" ? "YENİ" : "ESKİ") : undefined;
          return (
            <SwipeableRow
              leftActions={symbolLeftActions({
                item,
                type: "gold",
                isFavorite: favorites.includes(item.code),
                toggleFavorite,
                colors,
              })}
            >
              <ModernPriceRow
                item={item}
                type="gold"
                badge={badge}
                nameFirst
                isFavorite={favorites.includes(item.code)}
                onFavoriteToggle={() => toggleFavorite(item.code)}
                onLongPress={() => setMenuItem(item)}
                onPress={() => router.push({ pathname: "/detail/[code]", params: { code: item.code, type: "gold" } })}
              />
            </SwipeableRow>
          );
        }}
        ListEmptyComponent={
          viewMode === "favorites" ? (
            <EmptyState
              icon="star-outline"
              title="Henüz Favori Altın Yok"
              description="Bir altın satırının yıldızına dokunarak favorilerine ekleyebilirsin."
              compact
            />
          ) : lastRefreshFailed ? (
            <ErrorState
              title="Altın Fiyatları Yüklenemedi"
              description="Bağlantını kontrol edip tekrar dene."
              onRetry={() => void refreshData()}
              compact
            />
          ) : (
            <PriceRowSkeleton count={10} withIcon={false} />
          )
        }
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          const offset = index * (averageItemLength || 80);
          sectionListRef.current?.getScrollResponder()?.scrollTo({ y: offset, animated: true });
        }}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={manualRefreshing} onRefresh={onManualRefresh} tintColor={colors.primary} />}
      />
      <PriceRowMenu
        item={menuItem}
        type="gold"
        visible={!!menuItem}
        onClose={() => setMenuItem(null)}
      />
    </View>
  );
}
