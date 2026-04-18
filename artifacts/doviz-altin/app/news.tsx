import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, NewsItem } from "@/contexts/AppContext";
import { ScreenHeader } from "@/components/ScreenHeader";

// ─── Helpers ──────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "şimdi";
  if (d < 3600) return `${Math.floor(d / 60)} dk önce`;
  if (d < 86400) return `${Math.floor(d / 3600)} saat önce`;
  if (d < 7 * 86400) return `${Math.floor(d / 86400)} gün önce`;
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function isFresh(iso: string): boolean {
  return (Date.now() - new Date(iso).getTime()) / 1000 < 3600;
}

function cleanSummary(s?: string): string {
  if (!s) return "";
  // Strip HTML tags + collapse whitespace
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Stable color per source (for the source initial badge)
const SOURCE_PALETTE = [
  "#0B3D91", "#7C3AED", "#0891B2", "#059669",
  "#DC2626", "#D97706", "#DB2777", "#475569",
];
function colorForSource(src: string): string {
  let h = 0;
  for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) | 0;
  return SOURCE_PALETTE[Math.abs(h) % SOURCE_PALETTE.length];
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

// ─── Featured (hero) — typography-driven editorial style ─────────────────
function FeaturedNewsCard({ item, colors }: { item: NewsItem; colors: any }) {
  const summary = cleanSummary(item.summary);
  const fresh = isFresh(item.publishedAt);
  return (
    <Animated.View entering={FadeInDown.duration(360)}>
      <Pressable
        onPress={() => openUrl(item.url)}
        style={({ pressed }) => [{
          borderRadius: 22, overflow: "hidden",
          transform: [{ scale: pressed ? 0.99 : 1 }],
        }]}
      >
        <LinearGradient
          colors={["#0B1A33", "#0B3D91"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 22 }}
        >
          {/* Top chip row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              backgroundColor: "rgba(255,255,255,0.14)",
              paddingHorizontal: 10, paddingVertical: 5,
              borderRadius: 999,
            }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#FCD34D" }} />
              <Text style={{ color: "#FCD34D", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 }}>
                ÖNE ÇIKAN
              </Text>
            </View>
            {fresh ? (
              <View style={{
                flexDirection: "row", alignItems: "center", gap: 5,
                backgroundColor: "rgba(34,197,94,0.22)",
                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
              }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" }} />
                <Text style={{ color: "#86EFAC", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 }}>
                  YENİ
                </Text>
              </View>
            ) : null}
          </View>

          {/* Title */}
          <Text
            numberOfLines={4}
            style={{
              color: "#fff",
              fontSize: 24,
              fontFamily: "Inter_700Bold",
              lineHeight: 30,
              letterSpacing: -0.6,
            }}
          >
            {item.title}
          </Text>

          {/* Summary */}
          {summary ? (
            <Text
              numberOfLines={3}
              style={{
                color: "rgba(255,255,255,0.78)",
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                lineHeight: 21,
                marginTop: 12,
                letterSpacing: -0.1,
              }}
            >
              {summary}
            </Text>
          ) : null}

          {/* Footer */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 18,
              paddingTop: 14,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: "rgba(255,255,255,0.18)",
            }}
          >
            <Text style={{ color: "#FCD34D", fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.4 }}>
              {item.source.toUpperCase()}
            </Text>
            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.45)", marginHorizontal: 8 }} />
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_500Medium" }}>
              {timeAgo(item.publishedAt)}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Inter_700Bold", marginRight: 4 }}>
              Oku
            </Text>
            <Icon name="chevron-forward" size={14} color="rgba(255,255,255,0.85)" />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ─── List row — editorial typography, no image ───────────────────────────
function NewsRow({ item, colors, index }: { item: NewsItem; colors: any; index: number }) {
  const summary = cleanSummary(item.summary);
  const fresh = isFresh(item.publishedAt);
  const sourceColor = colorForSource(item.source);
  const sourceInitial = (item.source?.[0] ?? "•").toUpperCase();

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 30).duration(260)}>
      <Pressable
        onPress={() => openUrl(item.url)}
        style={({ pressed }) => [{
          paddingVertical: 16,
          paddingHorizontal: 4,
          opacity: pressed ? 0.7 : 1,
        }]}
      >
        {/* Meta row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <View
            style={{
              width: 22, height: 22, borderRadius: 6,
              backgroundColor: sourceColor,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: -0.2 }}>
              {sourceInitial}
            </Text>
          </View>
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: 0.2 }}>
            {item.source}
          </Text>
          <View style={{ width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: colors.mutedForeground, opacity: 0.6 }} />
          <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
            {timeAgo(item.publishedAt)}
          </Text>
          {fresh ? (
            <View style={{
              marginLeft: 4,
              paddingHorizontal: 6, paddingVertical: 2,
              borderRadius: 6,
              backgroundColor: "#22C55E1F",
            }}>
              <Text style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: "#16A34A", letterSpacing: 0.4 }}>
                YENİ
              </Text>
            </View>
          ) : null}
        </View>

        {/* Title */}
        <Text
          numberOfLines={3}
          style={{
            fontSize: 16,
            fontFamily: "Inter_700Bold",
            color: colors.foreground,
            lineHeight: 22,
            letterSpacing: -0.3,
          }}
        >
          {item.title}
        </Text>

        {/* Summary */}
        {summary ? (
          <Text
            numberOfLines={2}
            style={{
              fontSize: 13,
              fontFamily: "Inter_400Regular",
              color: colors.mutedForeground,
              lineHeight: 19,
              marginTop: 6,
              letterSpacing: -0.1,
            }}
          >
            {summary}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export default function NewsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { news, newsLoading, refreshNews } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 40 : (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom) + 24;

  const featured = news[0];
  const rest = news.slice(1);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNews();
    setRefreshing(false);
  }, [refreshNews]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader eyebrow="Piyasa & Finans" title="Haberler" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
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
                <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 26, marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: colors.primary }} />
                    <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
                      Son Haberler
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.4 }}>
                    {rest.length} HABER
                  </Text>
                </View>
                {rest.map((item, idx) => (
                  <View key={item.id}>
                    <NewsRow item={item} colors={colors} index={idx} />
                    {idx < rest.length - 1 && (
                      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
