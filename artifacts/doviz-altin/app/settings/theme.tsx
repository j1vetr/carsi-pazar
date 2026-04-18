import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Icon, type IconName } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

interface Option {
  mode: ThemeMode;
  label: string;
  description: string;
  icon: IconName;
  preview: { bg: string; card: string; text: string; accent: string };
}

const OPTIONS: Option[] = [
  {
    mode: "system",
    label: "Sistem",
    description: "Cihazının ayarına göre otomatik",
    icon: "settings-outline",
    preview: { bg: "#0F1E36", card: "#152844", text: "#E8EEF7", accent: "#5B8DEF" },
  },
  {
    mode: "light",
    label: "Açık",
    description: "Klasik aydınlık tema",
    icon: "sunny-outline",
    preview: { bg: "#FFFFFF", card: "#F4F7FB", text: "#0B1F3A", accent: "#0B3D91" },
  },
  {
    mode: "dark",
    label: "Koyu",
    description: "Gece kullanımı, göz dostu",
    icon: "moon-outline",
    preview: { bg: "#0A1628", card: "#0F1E36", text: "#E8EEF7", accent: "#5B8DEF" },
  },
];

export default function ThemeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { mode, setMode, effective } = useTheme();
  const bottomPadding = Platform.OS === "web" ? 40 : Math.max(insets.bottom, 16) + 24;

  const handleSelect = async (next: ThemeMode) => {
    if (next === mode) return;
    Haptics.selectionAsync().catch(() => {});
    await setMode(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader eyebrow="Görünüm" title="Tema" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPadding, paddingHorizontal: 20, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 12 }}>
          GÖRÜNÜM MODU
        </Text>

        {OPTIONS.map((opt, idx) => {
          const isActive = mode === opt.mode;
          const isEffective =
            opt.mode === "system" ? false : opt.mode === effective && mode === "system";
          return (
            <Animated.View key={opt.mode} entering={FadeInUp.delay(idx * 60).duration(280)}>
              <Pressable
                onPress={() => handleSelect(opt.mode)}
                style={({ pressed }) => [
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    marginBottom: 10,
                    borderRadius: 18,
                    backgroundColor: colors.card,
                    borderWidth: 1.5,
                    borderColor: isActive ? colors.primary : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                {/* Mini preview swatch */}
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 14,
                    backgroundColor: opt.preview.bg,
                    padding: 8,
                    marginRight: 14,
                    overflow: "hidden",
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: colors.border,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 4 }}>
                    <View style={{ width: 14, height: 4, borderRadius: 2, backgroundColor: opt.preview.accent }} />
                    <View style={{ width: 8, height: 4, borderRadius: 2, backgroundColor: opt.preview.text, opacity: 0.6 }} />
                  </View>
                  <View style={{ height: 22, borderRadius: 6, backgroundColor: opt.preview.card, padding: 4, marginBottom: 4 }}>
                    <View style={{ width: 18, height: 3, borderRadius: 1.5, backgroundColor: opt.preview.text, opacity: 0.7 }} />
                    <View style={{ width: 28, height: 3, borderRadius: 1.5, backgroundColor: opt.preview.accent, marginTop: 3 }} />
                  </View>
                  <View style={{ height: 16, borderRadius: 6, backgroundColor: opt.preview.card, padding: 4 }}>
                    <View style={{ width: 24, height: 3, borderRadius: 1.5, backgroundColor: opt.preview.text, opacity: 0.5 }} />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Icon name={opt.icon} size={16} color={colors.foreground} />
                    <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
                      {opt.label}
                    </Text>
                    {isEffective ? (
                      <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.secondary }}>
                        <Text style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.4 }}>
                          ŞU AN
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4, lineHeight: 17 }}>
                    {opt.description}
                  </Text>
                </View>

                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: isActive ? colors.primary : "transparent",
                    borderWidth: isActive ? 0 : 1.5,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isActive ? <Icon name="checkmark" size={14} color="#fff" /> : null}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}

        {/* Info footer */}
        <Animated.View entering={FadeInUp.delay(220).duration(280)} style={{ marginTop: 14 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              padding: 14,
              backgroundColor: colors.card,
              borderRadius: 14,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            }}
          >
            <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "#0EA5E91A", alignItems: "center", justifyContent: "center" }}>
              <Icon name="alert-circle" size={16} color="#0EA5E9" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
                Tema Tercihiniz Kayıtlı
              </Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4, lineHeight: 17 }}>
                Seçim tüm uygulamada anında uygulanır ve sonraki açılışlarda hatırlanır.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
