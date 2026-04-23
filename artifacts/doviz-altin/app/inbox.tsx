import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { haptics } from "@/lib/utils/haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { ScreenHeader } from "@/components/ScreenHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PriceRowSkeleton } from "@/components/common/skeletons/PriceRowSkeleton";
import {
  type InboxItem,
  clearInbox,
  listInbox,
  markAllRead,
  markRead,
  removeInboxItem,
  subscribeInbox,
} from "@/lib/notifications/inbox";

function iconForType(type: string): { name: IconName; color: string } {
  switch (type) {
    case "briefing":
      return { name: "sunny-outline", color: "#0B3D91" };
    case "move":
      return { name: "trending-up", color: "#F59E0B" };
    case "weekly_portfolio":
      return { name: "bar-chart-outline", color: "#10B981" };
    case "news":
      return { name: "newspaper-outline", color: "#8B5CF6" };
    case "alarm":
    case "alert":
      return { name: "notifications-outline", color: "#EF4444" };
    default:
      return { name: "notifications-outline", color: "#6B7280" };
  }
}

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "şimdi";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün önce`;
  return new Date(ts).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

function routeForItem(item: InboxItem): string | null {
  const r = (item.data?.route as string | undefined) ?? null;
  if (r) return r;
  switch (item.type) {
    case "weekly_portfolio":
      return "/(tabs)/portfolio";
    case "news":
      return "/news";
    case "alarm":
    case "alert":
      return "/alerts";
    case "briefing":
    case "move":
      return "/(tabs)/";
    default:
      return null;
  }
}

export default function InboxScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  // İlk AsyncStorage okuması bitmeden boş-durum yerine iskelet göster.
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const list = await listInbox();
    setItems([...list]);
    setLoaded(true);
  }, []);

  useEffect(() => {
    void reload();
    void markAllRead(); // Ekran açıldığında badge'i sıfırla
    const off = subscribeInbox(() => void reload());
    return () => off();
  }, [reload]);

  const onRefresh = useCallback(async () => {
    haptics.tap();
    setRefreshing(true);
    try {
      await reload();
      haptics.success();
    } catch {
      haptics.error();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  const onItemPress = useCallback((item: InboxItem) => {
    haptics.select();
    void markRead(item.id);
    const r = routeForItem(item);
    if (r) router.push(r as never);
  }, []);

  const onItemLongPress = useCallback((item: InboxItem) => {
    haptics.tap();
    void removeInboxItem(item.id);
  }, []);

  const onClearAll = useCallback(async () => {
    haptics.longPress();
    await clearInbox();
  }, []);

  const bottomPadding =
    Platform.OS === "web" ? 40 : (Platform.OS === "android" ? Math.max(insets.bottom, 16) : insets.bottom) + 24;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        eyebrow="Bildirimler"
        title="Gelen Kutusu"
        rightSlot={
          items.length > 0 ? (
            <Pressable
              onPress={onClearAll}
              hitSlop={12}
              style={({ pressed }) => [{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: colors.card,
                borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
                alignItems: "center", justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              }]}
            >
              <Icon name="trash-outline" size={18} color="#EF4444" />
            </Pressable>
          ) : undefined
        }
      />
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          flexGrow: 1,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.foreground} />}
        ListEmptyComponent={
          loaded ? (
            <EmptyState
              icon="notifications-outline"
              title="Henüz Bildirim Yok"
              description="Açılış/kapanış brifingleri, önemli fiyat hareketleri ve haftalık portföy özetin burada görünecek."
            />
          ) : (
            <PriceRowSkeleton count={4} withIcon />
          )
        }
        renderItem={({ item }) => {
          const ico = iconForType(item.type);
          return (
            <Pressable
              onPress={() => onItemPress(item)}
              onLongPress={() => onItemLongPress(item)}
              style={({ pressed }) => [{
                flexDirection: "row", gap: 12, padding: 14,
                backgroundColor: colors.card,
                borderRadius: 14,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
                marginBottom: 10,
                opacity: pressed ? 0.7 : 1,
              }]}
            >
              {!item.read ? (
                <View style={{
                  position: "absolute", top: 14, right: 14,
                  width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444",
                }} />
              ) : null}
              <View
                style={{
                  width: 40, height: 40, borderRadius: 11,
                  backgroundColor: ico.color + "1A",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon name={ico.name} size={20} color={ico.color} />
              </View>
              <View style={{ flex: 1, paddingRight: 16 }}>
                {item.title ? (
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}
                  >
                    {item.title}
                  </Text>
                ) : null}
                {item.body ? (
                  <Text
                    numberOfLines={3}
                    style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2, lineHeight: 18 }}
                  >
                    {item.body}
                  </Text>
                ) : null}
                <Text
                  style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 6, opacity: 0.7 }}
                >
                  {relTime(item.ts)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
