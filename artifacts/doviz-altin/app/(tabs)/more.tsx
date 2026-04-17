import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, NewsItem, CurrencyRate } from "@/contexts/AppContext";
import { PriceCard } from "@/components/PriceCard";

function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "şimdi";
  if (d < 3600) return `${Math.floor(d / 60)} dk`;
  if (d < 86400) return `${Math.floor(d / 3600)} sa`;
  if (d < 7 * 86400) return `${Math.floor(d / 86400)} gün`;
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function openUrl(url: string) {
  if (!url || url === "#") return;
  Haptics.selectionAsync().catch(() => {});
  WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: "#0B3D91",
    enableBarCollapsing: true,
  }).catch(() => {});
}

// ── Featured (hero) news card ────────────────────────────────────────────────
function FeaturedNewsCard({ item, colors }: { item: NewsItem; colors: any }) {
  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Pressable
        onPress={() => openUrl(item.url)}
        style={({ pressed }) => [
          {
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: colors.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          },
        ]}
      >
        <View style={{ height: 200, backgroundColor: colors.secondary }}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
              <Icon name="newspaper-outline" size={48} color={colors.mutedForeground} />
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={[StyleSheet.absoluteFill, { top: "40%" }]}
          />
          <View style={{ position: "absolute", top: 14, left: 14, flexDirection: "row", gap: 8 }}>
            <View style={{ backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" }} />
              <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_500Medium" }}>ÖNE ÇIKAN</Text>
            </View>
          </View>
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16 }}>
            <Text numberOfLines={3} style={{ color: "#fff", fontSize: 19, fontFamily: "Inter_700Bold", lineHeight: 25, letterSpacing: -0.3 }}>
              {item.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 }}>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Inter_600SemiBold" }}>{item.source}</Text>
              <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.5)" }} />
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" }}>{timeAgo(item.publishedAt)}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Compact news row ────────────────────────────────────────────────────────
function NewsRow({ item, colors, index }: { item: NewsItem; colors: any; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(280)}>
      <Pressable
        onPress={() => openUrl(item.url)}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            paddingVertical: 14,
            paddingHorizontal: 4,
            opacity: pressed ? 0.6 : 1,
          },
        ]}
      >
        <View style={{ width: 84, height: 84, borderRadius: 12, backgroundColor: colors.secondary, overflow: "hidden", marginRight: 12 }}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
              <Icon name="newspaper-outline" size={22} color={colors.mutedForeground} />
            </View>
          )}
        </View>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View>
            <Text numberOfLines={3} style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, lineHeight: 19, letterSpacing: -0.1 }}>
              {item.title}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>{item.source}</Text>
            <View style={{ width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: colors.mutedForeground, opacity: 0.5 }} />
            <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{timeAgo(item.publishedAt)}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Notification preference card ────────────────────────────────────────────
function NewsPrefCard({ colors, enabled, onToggle }: { colors: any; enabled: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    }}>
      <LinearGradient
        colors={enabled ? ["#0B3D91", "#1E40AF"] : [colors.secondary, colors.secondary]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
      >
        <Icon name="notifications" size={22} color={enabled ? "#fff" : colors.mutedForeground} />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
          Haber Bildirimleri
        </Text>
        <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>
          {enabled ? "Yeni finans haberleri geldiğinde bildirim alacaksın." : "Bildirimleri açarak son dakika gelişmelerini kaçırma."}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={(v) => { Haptics.selectionAsync().catch(() => {}); onToggle(v); }}
        trackColor={{ false: colors.secondary, true: "#0B3D91" }}
        thumbColor="#fff"
        ios_backgroundColor={colors.secondary}
      />
    </View>
  );
}

// ── Quick action tile ───────────────────────────────────────────────────────
function ActionTile({ colors, icon, label, sublabel, color, onPress }: {
  colors: any; icon: any; label: string; sublabel?: string; color: string; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress(); }}
      style={({ pressed }) => [{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      }]}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: color + "18", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.1 }}>
        {label}
      </Text>
      {sublabel ? (
        <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>
          {sublabel}
        </Text>
      ) : null}
    </Pressable>
  );
}

interface PaSection { title: string; subtitle?: string; data: CurrencyRate[]; }

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    news, newsLoading, refreshNews, prefs, setNewsEnabled,
    parities, currencyParities, favorites, toggleFavorite, alerts,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"news" | "parities">("news");
  const [refreshing, setRefreshing] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 100 : 76 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  const featured = news[0];
  const rest = news.slice(1);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNews();
    setRefreshing(false);
  }, [refreshNews]);

  const paritySections: PaSection[] = useMemo(() => {
    const list: PaSection[] = [];
    if (parities.length) list.push({ title: "Uluslararası Pariteler", subtitle: `${parities.length} parite`, data: parities });
    if (currencyParities.length) list.push({ title: "Döviz Çapraz Pariteler", subtitle: `${currencyParities.length} parite`, data: currencyParities });
    return list;
  }, [parities, currencyParities]);

  const activeAlertCount = alerts.filter((a) => a.active && !a.triggered).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* HEADER */}
      <View style={{ paddingTop: topPadding + 12, paddingHorizontal: 20, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: 0.6, textTransform: "uppercase" }}>
              {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
            </Text>
            <Text style={{ fontSize: 32, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.8, marginTop: 2 }}>
              Daha Fazla
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/alerts")}
            style={({ pressed }) => [{
              width: 42, height: 42, borderRadius: 21,
              backgroundColor: colors.card,
              borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
              alignItems: "center", justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
            }]}
          >
            <Icon name="notifications-outline" size={20} color={colors.foreground} />
            {activeAlertCount > 0 ? (
              <View style={{ position: "absolute", top: 6, right: 6, width: 9, height: 9, borderRadius: 4.5, backgroundColor: "#EF4444", borderWidth: 2, borderColor: colors.background }} />
            ) : null}
          </Pressable>
        </View>
      </View>

      {/* TAB SWITCHER */}
      <View style={{ flexDirection: "row", marginHorizontal: 20, marginTop: 14, marginBottom: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
        {(["news", "parities"] as const).map((t) => {
          const active = activeTab === t;
          return (
            <Pressable
              key={t}
              onPress={() => { Haptics.selectionAsync().catch(() => {}); setActiveTab(t); }}
              style={{ paddingVertical: 12, marginRight: 24, position: "relative" }}
            >
              <Text style={{
                fontSize: 15,
                fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                color: active ? colors.foreground : colors.mutedForeground,
                letterSpacing: -0.2,
              }}>
                {t === "news" ? "Haberler" : "Pariteler"}
              </Text>
              {active && (
                <View style={{
                  position: "absolute", left: 0, right: 0, bottom: -1, height: 2,
                  backgroundColor: colors.primary, borderRadius: 2,
                }} />
              )}
            </Pressable>
          );
        })}
      </View>

      {activeTab === "news" ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 20, paddingBottom: bottomPadding }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
          }
        >
          {/* News notification preference */}
          <NewsPrefCard colors={colors} enabled={prefs.newsEnabled} onToggle={setNewsEnabled} />

          {/* Quick actions */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <ActionTile
              colors={colors} icon="notifications" label="Alarmlar"
              sublabel={activeAlertCount > 0 ? `${activeAlertCount} aktif` : "Hedef Belirle"}
              color="#0B3D91"
              onPress={() => router.push("/alerts")}
            />
            <ActionTile
              colors={colors} icon="briefcase-outline" label="Portföyüm"
              sublabel="Yatırımlarını Takip Et!" color="#10B981"
              onPress={() => router.push("/portfolio")}
            />
          </View>

          {/* News content */}
          <View style={{ height: 18 }} />
          {newsLoading && news.length === 0 ? (
            <View style={{ paddingVertical: 60, alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={{ marginTop: 12, fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                Haberler yükleniyor…
              </Text>
            </View>
          ) : news.length === 0 ? (
            <View style={{ paddingVertical: 50, paddingHorizontal: 20, alignItems: "center" }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Icon name="newspaper-outline" size={26} color={colors.mutedForeground} />
              </View>
              <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
                Henüz haber yok
              </Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 4, textAlign: "center" }}>
                Şu an haber bulunmuyor.{"\n"}Aşağı çekerek yenile.
              </Text>
            </View>
          ) : (
            <>
              {featured && <FeaturedNewsCard item={featured} colors={colors} />}
              {rest.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 22, marginBottom: 4 }}>
                    <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
                      Son Haberler
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                      {rest.length} haber
                    </Text>
                  </View>
                  {rest.map((item, idx) => (
                    <View key={item.id}>
                      <NewsRow item={item} colors={colors} index={idx} />
                      {idx < rest.length - 1 && (
                        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 96 }} />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      ) : (
        <SectionList
          sections={paritySections}
          keyExtractor={(item, idx) => `${item.code}_${idx}`}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Animated.View entering={FadeInRight.duration(280)} style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 10, flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>{section.title}</Text>
              {section.subtitle ? (
                <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>{section.subtitle}</Text>
              ) : null}
            </Animated.View>
          )}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 20).duration(260)} style={{ paddingHorizontal: 16 }}>
              <PriceCard
                item={item}
                type="currency"
                isFavorite={favorites.includes(item.code)}
                onFavoriteToggle={() => toggleFavorite(item.code)}
                onPress={() => router.push({ pathname: "/detail/[code]", params: { code: item.code, type: "currency" } })}
              />
            </Animated.View>
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
      )}
    </View>
  );
}
