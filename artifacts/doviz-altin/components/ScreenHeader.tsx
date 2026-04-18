import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";

interface Props {
  eyebrow?: string;
  title: string;
  rightSlot?: React.ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({ eyebrow, title, rightSlot, onBack }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 32 : insets.top;

  const handleBack = () => {
    Haptics.selectionAsync().catch(() => {});
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <View style={{ paddingTop: topPadding + 12, paddingHorizontal: 20, paddingBottom: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          style={({ pressed }) => [{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: colors.card,
            borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
            alignItems: "center", justifyContent: "center",
            opacity: pressed ? 0.6 : 1,
          }]}
        >
          <Icon name="chevron-back" size={20} color={colors.foreground} />
        </Pressable>
        {rightSlot ?? <View style={{ width: 40 }} />}
      </View>
      {eyebrow ? (
        <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: 0.6, textTransform: "uppercase" }}>
          {eyebrow}
        </Text>
      ) : null}
      <Text style={{ fontSize: 32, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.8, marginTop: eyebrow ? 2 : 0 }}>
        {title}
      </Text>
    </View>
  );
}
