import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";

/**
 * Fiyat verisi alınamıyorsa ekranın üstünde ince bir şerit gösterir.
 * Tıklanınca manuel yeniden deneme yapar. Veri başarıyla gelince otomatik kaybolur.
 */
export function OfflineBanner() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lastRefreshFailed, refreshData, isLoading } = useApp();

  if (!lastRefreshFailed) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      exiting={FadeOutUp.duration(180)}
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: Platform.OS === "web" ? 0 : insets.top,
        left: 0,
        right: 0,
        zIndex: 9998,
        alignItems: "center",
        paddingHorizontal: 12,
        paddingTop: 6,
      }}
    >
      <Pressable
        onPress={() => {
          if (!isLoading) void refreshData();
        }}
        accessibilityRole="button"
        accessibilityLabel="Bağlantı yok. Yeniden denemek için dokun."
        accessibilityLiveRegion="polite"
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: colors.fall,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 999,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 6,
          elevation: 4,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Icon name="cloud-offline-outline" size={14} color="#fff" />
        <Text
          style={{
            fontSize: 12.5,
            fontFamily: "Inter_700Bold",
            color: "#fff",
            letterSpacing: -0.1,
          }}
        >
          Bağlantı Yok
        </Text>
        <View style={{ width: StyleSheet.hairlineWidth, height: 12, backgroundColor: "rgba(255,255,255,0.5)" }} />
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Inter_600SemiBold",
            color: "rgba(255,255,255,0.95)",
            letterSpacing: -0.1,
          }}
        >
          {isLoading ? "Yeniden deneniyor…" : "Tekrar Dene"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
