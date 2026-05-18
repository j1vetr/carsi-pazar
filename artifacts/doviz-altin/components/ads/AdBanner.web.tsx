import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

export function AdBanner({ style }: { style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          height: 50,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 9,
          fontFamily: "Inter_700Bold",
          color: colors.mutedForeground,
          letterSpacing: 1.2,
        }}
      >
        REKLAM
      </Text>
    </View>
  );
}
