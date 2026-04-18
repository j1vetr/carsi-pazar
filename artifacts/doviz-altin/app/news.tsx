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
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, NewsItem } from "@/contexts/AppContext";
import { ScreenHeader } from "@/components/ScreenHeader";

const NEWS_PLACEHOLDER = require("../assets/images/news-placeholder.png");

function NewsPlaceholder({ size }: { size: "hero" | "row" }) {
  const logoSize = size === "hero" ? 92 : 52;
  return (
    <LinearGradient
      colors={["#0B1A33", "#0B3D91"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}
    >
      <Image source={NEWS_PLACEHOLDER} style={{ width: logoSize, height: logoSize, opacity: 0.92 }} contentFit="contain" />
    </LinearGradient>
  );
}

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

function FeaturedNewsCard({ item, colors }: { item: NewsItem; colors: any }) {
  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Pressable
        onPress={() => openUrl(item.url)}
        style={({ pressed }) => [{
          borderRadius: 20, overflow: "hidden",
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        }]}
      >
        <View style={{ height: 200, backgroundColor: colors.secondary }}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <NewsPlaceholder size="hero" />
          )}
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={[StyleSheet.absoluteFill, { top: "40%" }]} />
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

function NewsRow({ item, colors, index }: { item: NewsItem; colors: any; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(280)}>
      <Pressable
        onPress={() => openUrl(item.url)}
        style={({ pressed }) => [{ flexDirection: "row", paddingVertical: 14, paddingHorizontal: 4, opacity: pressed ? 0.6 : 1 }]}
      >
        <View style={{ width: 84, height: 84, borderRadius: 12, backgroundColor: colors.secondary, overflow: "hidden", marginRight: 12 }}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <NewsPlaceholder size="row" />
          )}
        </View>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <Text numberOfLines={3} style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, lineHeight: 19, letterSpacing: -0.1 }}>
            {item.title}
          </Text>
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
    </View>
  );
}
