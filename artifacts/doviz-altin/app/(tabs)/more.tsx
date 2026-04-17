import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, NewsItem, EconomicEvent, CurrencyRate } from "@/contexts/AppContext";
import { AssetIcon } from "@/components/AssetIcon";
import { PriceCard } from "@/components/PriceCard";

function NewsCard({ item, colors }: { item: NewsItem; colors: any }) {
  const timeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    return `${Math.floor(diff / 86400)} gün önce`;
  };

  const categoryColors: Record<string, string> = {
    "Merkez Bankası": "#3B82F6",
    "Emtia": "#F59E0B",
    "TCMB": "#EF4444",
    "Döviz": "#10B981",
    "Ekonomi": "#8B5CF6",
    "Parite": "#06B6D4",
  };
  const catColor = categoryColors[item.category] ?? colors.primary;

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: colors.radius, padding: 16, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 }}>
        <View style={{ backgroundColor: catColor + "20", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
          <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: catColor }}>{item.category}</Text>
        </View>
        <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{item.source}</Text>
        <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginLeft: "auto" }}>{timeAgo(item.publishedAt)}</Text>
      </View>
      <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, lineHeight: 22 }}>{item.title}</Text>
      <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 6, lineHeight: 18 }} numberOfLines={2}>
        {item.summary}
      </Text>
    </View>
  );
}

function EventCard({ event, colors }: { event: EconomicEvent; colors: any }) {
  const impactColors = { low: "#22C55E", medium: "#F59E0B", high: "#EF4444" };
  const impactColor = impactColors[event.impact];
  const isToday = new Date(event.date).toDateString() === new Date().toDateString();
  const hasActual = event.actual !== undefined;

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: colors.radius, padding: 14, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 3, borderLeftColor: impactColor }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <View style={{ marginRight: 8 }}>
          <AssetIcon code={event.flag} type="country" size={28} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
            {event.country} • {event.time} {isToday ? "• Bugün" : ""}
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 2 }}>
            {event.event}
          </Text>
        </View>
        <View style={{ backgroundColor: impactColor + "20", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
          <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: impactColor }}>
            {event.impact === "high" ? "YÜKSEK" : event.impact === "medium" ? "ORTA" : "DÜŞÜK"}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
        {event.actual !== undefined && (
          <View>
            <Text style={{ fontSize: 10, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Gerçekleşen</Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: hasActual ? colors.rise : colors.foreground }}>{event.actual}</Text>
          </View>
        )}
        {event.forecast && (
          <View>
            <Text style={{ fontSize: 10, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Beklenti</Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground }}>{event.forecast}</Text>
          </View>
        )}
        {event.previous && (
          <View>
            <Text style={{ fontSize: 10, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Önceki</Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>{event.previous}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface PaSection { title: string; subtitle?: string; data: CurrencyRate[]; }

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { news, economicEvents, parities, currencyParities, favorites, toggleFavorite } = useApp();
  const [activeTab, setActiveTab] = useState<"parities" | "news" | "calendar">("parities");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 84 : 60 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  const paritySections: PaSection[] = useMemo(() => {
    const list: PaSection[] = [];
    if (parities.length) list.push({ title: "Uluslararası Pariteler", subtitle: `${parities.length} parite`, data: parities });
    if (currencyParities.length) list.push({ title: "Döviz Çapraz Pariteler", subtitle: `${currencyParities.length} parite`, data: currencyParities });
    return list;
  }, [parities, currencyParities]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topPadding + 16, paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.5 },
    tabRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 14, backgroundColor: colors.secondary, borderRadius: 10, padding: 3 },
    tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
    tabText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    listContent: { paddingHorizontal: 16, gap: 10, paddingBottom: bottomPadding + 16 },
    sectionHeader: {
      paddingHorizontal: 4, paddingTop: 18, paddingBottom: 8,
      flexDirection: "row", alignItems: "baseline", gap: 8,
    },
    sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 },
    sectionSubtitle: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    alertBanner: {
      flexDirection: "row", alignItems: "center",
      marginHorizontal: 20, marginBottom: 14,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: 14, padding: 14,
    },
  });

  const sortedEvents = [...economicEvents].sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`);
    const db = new Date(`${b.date}T${b.time}`);
    return da.getTime() - db.getTime();
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Diğer Varlıklar</Text>
        <Pressable onPress={() => router.push("/alerts")} style={{ padding: 6 }}>
          <Icon name="notifications-outline" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <Pressable style={styles.alertBanner} onPress={() => router.push("/alerts")}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }}>
          <Icon name="notifications" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground }}>Fiyat Alarmları</Text>
          <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 }}>
            İstediğin seviyeye ulaşınca anında bildirim al
          </Text>
        </View>
        <Icon name="chevron-forward" size={18} color={colors.mutedForeground} />
      </Pressable>

      <View style={styles.tabRow}>
        {(["parities", "news", "calendar"] as const).map((t) => (
          <Pressable
            key={t}
            style={[styles.tabBtn, activeTab === t && { backgroundColor: colors.card }]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, { color: activeTab === t ? colors.foreground : colors.mutedForeground }]}>
              {t === "parities" ? "Pariteler" : t === "news" ? "Haberler" : "Takvim"}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "parities" ? (
        <SectionList
          sections={paritySections}
          keyExtractor={(item, idx) => `${item.code}_${idx}`}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.subtitle ? <Text style={styles.sectionSubtitle}>{section.subtitle}</Text> : null}
            </View>
          )}
          renderItem={({ item }) => (
            <PriceCard
              item={item}
              type="currency"
              isFavorite={favorites.includes(item.code)}
              onFavoriteToggle={() => toggleFavorite(item.code)}
              onPress={() => router.push({ pathname: "/detail/[code]", params: { code: item.code, type: "currency" } })}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: bottomPadding + 16 }}
          ListEmptyComponent={
            <View style={{ padding: 30, alignItems: "center" }}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>Parite verisi bekleniyor…</Text>
            </View>
          }
        />
      ) : activeTab === "news" ? (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NewsCard item={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={sortedEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
