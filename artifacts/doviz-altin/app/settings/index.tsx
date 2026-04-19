import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { ScreenHeader } from "@/components/ScreenHeader";

function NewsPrefCard({ colors, enabled, onToggle }: { colors: any; enabled: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={{
      backgroundColor: colors.card, borderRadius: 16, padding: 16,
      borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
      flexDirection: "row", alignItems: "center", gap: 14,
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

function LinkRow({ icon, label, sublabel, color, onPress, badge }: {
  icon: IconName; label: string; sublabel?: string; color: string; onPress: () => void; badge?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress(); }}
      style={({ pressed }) => [{
        flexDirection: "row", alignItems: "center", gap: 14,
        paddingVertical: 14, paddingHorizontal: 16,
        backgroundColor: colors.card, borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
        marginBottom: 10,
        opacity: pressed ? 0.7 : 1,
      }]}
    >
      <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: color + "1A", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>{label}</Text>
        {sublabel ? (
          <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>{sublabel}</Text>
        ) : null}
      </View>
      {badge ? (
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: colors.secondary, marginRight: 4 }}>
          <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.4 }}>{badge}</Text>
        </View>
      ) : null}
      <Icon name="chevron-forward" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { prefs, setNewsEnabled } = useApp();
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 40 : (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom) + 24;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader eyebrow="Tercihler" title="Ayarlar" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, paddingHorizontal: 4, paddingBottom: 10 }}>
          BİLDİRİMLER
        </Text>
        <NewsPrefCard colors={colors} enabled={prefs.newsEnabled} onToggle={setNewsEnabled} />

        <View style={{ height: 18 }} />

        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, paddingHorizontal: 4, paddingBottom: 10 }}>
          GÖRÜNÜM & ARAÇLAR
        </Text>
        <LinkRow
          icon="flame-outline"
          color="#EC4899"
          label="Tema"
          sublabel="Açık · Koyu · OLED siyah"
          onPress={() => router.push("/settings/theme" as never)}
        />

        {Platform.OS === "android" ? (
          <LinkRow
            icon="grid-outline"
            color="#6366F1"
            label="Widget Ayarları"
            sublabel="Şablon, semboller, fiyat alanı ve tema"
            onPress={() => router.push("/settings/widget" as never)}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
