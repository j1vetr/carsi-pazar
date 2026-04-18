import React from "react";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";

export default function GoldCalcScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 40 : Math.max(insets.bottom, 16) + 24;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader eyebrow="Hesaplayıcı" title="Saf Altın" />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingBottom: bottomPadding }}>
        <View style={{ width: 88, height: 88, borderRadius: 24, backgroundColor: "#F59E0B1A", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Icon name="diamond" size={42} color="#F59E0B" />
        </View>
        <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.4, textAlign: "center" }}>
          Saf Altın Hesaplayıcı
        </Text>
        <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textAlign: "center", marginTop: 10, lineHeight: 20 }}>
          Bilezik, künye ya da kolyenin saf altın değerini ve TL karşılığını anında hesapla. Yakında!
        </Text>
        <View style={{ marginTop: 18, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.secondary }}>
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.6 }}>
            ÇOK YAKINDA
          </Text>
        </View>
      </View>
    </View>
  );
}
