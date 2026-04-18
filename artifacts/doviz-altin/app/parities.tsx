import React, { useMemo } from "react";
import { ActivityIndicator, Platform, SectionList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, CurrencyRate } from "@/contexts/AppContext";
import { PriceCard } from "@/components/PriceCard";
import { ScreenHeader } from "@/components/ScreenHeader";

interface PaSection { title: string; subtitle?: string; data: CurrencyRate[]; }

export default function ParitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { parities, currencyParities, favorites, toggleFavorite } = useApp();

  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 40 : (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom) + 24;

  const sections: PaSection[] = useMemo(() => {
    const list: PaSection[] = [];
    if (parities.length) list.push({ title: "Uluslararası Pariteler", subtitle: `${parities.length} parite`, data: parities });
    if (currencyParities.length) list.push({ title: "Döviz Çapraz Pariteler", subtitle: `${currencyParities.length} parite`, data: currencyParities });
    return list;
  }, [parities, currencyParities]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader eyebrow="Çapraz Kurlar" title="Pariteler" />
      <SectionList
        sections={sections}
        keyExtractor={(item, idx) => `${item.code}_${idx}`}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8, flexDirection: "row", alignItems: "baseline", gap: 8 }}>
            <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>{section.title}</Text>
            {section.subtitle ? (
              <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>{section.subtitle}</Text>
            ) : null}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <PriceCard
              item={item}
              type="currency"
              isFavorite={favorites.includes(item.code)}
              onFavoriteToggle={() => toggleFavorite(item.code)}
              onPress={() => router.push({ pathname: "/detail/[code]", params: { code: item.code, type: "currency" } })}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: bottomPadding }}
        ListEmptyComponent={
          <View style={{ padding: 50, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>
              Parite verisi bekleniyor…
            </Text>
          </View>
        }
      />
    </View>
  );
}
