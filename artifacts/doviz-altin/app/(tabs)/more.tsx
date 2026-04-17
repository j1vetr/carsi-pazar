import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, NewsItem, EconomicEvent } from "@/contexts/AppContext";
import { AssetIcon } from "@/components/AssetIcon";

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

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { news, economicEvents } = useApp();
  const [activeTab, setActiveTab] = useState<"news" | "calendar">("news");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 84 : 60 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topPadding + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.5 },
    tabRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.secondary, borderRadius: 10, padding: 3 },
    tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
    tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    listContent: { paddingHorizontal: 16, gap: 10, paddingBottom: bottomPadding + 16 },
    alertBanner: {
      flexDirection: "row", alignItems: "center",
      marginHorizontal: 20, marginBottom: 16,
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
        <Text style={styles.headerTitle}>Haberler & Takvim</Text>
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
        <Pressable
          style={[styles.tabBtn, activeTab === "news" && { backgroundColor: colors.card }]}
          onPress={() => setActiveTab("news")}
        >
          <Text style={[styles.tabText, { color: activeTab === "news" ? colors.foreground : colors.mutedForeground }]}>
            Haberler
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeTab === "calendar" && { backgroundColor: colors.card }]}
          onPress={() => setActiveTab("calendar")}
        >
          <Text style={[styles.tabText, { color: activeTab === "calendar" ? colors.foreground : colors.mutedForeground }]}>
            Ekonomik Takvim
          </Text>
        </Pressable>
      </View>

      {activeTab === "news" ? (
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
