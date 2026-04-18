import React from "react";
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Icon, type IconName } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LOGO = require("../assets/images/logo-color.png");

function Row({
  icon, label, sublabel, onPress, color,
}: { icon: IconName; label: string; sublabel?: string; onPress?: () => void; color: string }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress?.(); }}
      style={({ pressed }) => [{
        flexDirection: "row", alignItems: "center", gap: 14,
        paddingVertical: 14, paddingHorizontal: 16,
        backgroundColor: colors.card,
        borderRadius: 14,
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
      {onPress ? <Icon name="chevron-forward" size={18} color={colors.mutedForeground} /> : null}
    </Pressable>
  );
}

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 40 : (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom) + 24;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader eyebrow="Uygulama" title="Hakkında" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPadding, paddingTop: 16 }}>
        <LinearGradient
          colors={["#0B1A33", "#0B3D91"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 22, padding: 22, alignItems: "center", marginBottom: 18 }}
        >
          <View style={{ width: 84, height: 84, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }}>
            <Image source={LOGO} style={{ width: 56, height: 56 }} resizeMode="contain" />
          </View>
          <Text style={{ color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 14, letterSpacing: -0.4 }}>
            Çarşı Piyasa
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.78)", fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 4, letterSpacing: -0.1, textAlign: "center" }}>
            Anlık döviz, altın ve piyasa takibi
          </Text>
        </LinearGradient>

        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, paddingHorizontal: 4, paddingBottom: 8 }}>
          DESTEK
        </Text>

        <Row
          icon="star"
          color="#FBBF24"
          label="Uygulamayı Puanla"
          sublabel="Mağazada bizi puanlayarak destekle"
          onPress={() => {
            const url = Platform.OS === "ios"
              ? "itms-apps://itunes.apple.com/app/idAPP_ID?action=write-review"
              : "market://details?id=com.carsipiyasa.app";
            Linking.openURL(url).catch(() => {});
          }}
        />
        <Row
          icon="newspaper-outline"
          color="#14B8A6"
          label="Arkadaşına Öner"
          sublabel="Uygulamayı paylaş"
          onPress={() => {
            // Share sheet placeholder
          }}
        />

        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, paddingHorizontal: 4, paddingTop: 18, paddingBottom: 8 }}>
          BİLGİ
        </Text>
        <Row icon="alert-circle" color="#64748B" label="Sürüm" sublabel="1.0.0" />
        <Row icon="time-outline" color="#0EA5E9" label="Veri Sağlayıcı" sublabel="HaremAltin · Anlık piyasa verileri" />

        <Text style={{ marginTop: 24, textAlign: "center", fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, lineHeight: 16 }}>
          © {new Date().getFullYear()} Çarşı Piyasa{"\n"}Sevgiyle yapıldı.
        </Text>
      </ScrollView>
    </View>
  );
}
