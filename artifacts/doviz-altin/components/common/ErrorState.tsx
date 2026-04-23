import React from "react";
import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Icon, type IconName } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";

type Props = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  /**
   * Geliştiricilere yönelik, sessiz teknik detay (örn. HTTP 503, "ECONNRESET", vb).
   * Production'da __DEV__ false ise de görünür ama çok soluk renkte ve küçük
   * yazı ile render edilir; kullanıcı metni ile karışmaması için monospace
   * tercih edilir. Boş/undefined verilirse hiç render edilmez.
   */
  technicalDetail?: string;
};

export function ErrorState({
  title = "Bir Sorun Oluştu",
  description = "Veriler alınamadı. İnternet bağlantını kontrol edip tekrar dene.",
  onRetry,
  retryLabel = "Tekrar Dene",
  icon = "alert-circle",
  style,
  compact = false,
  technicalDetail,
}: Props) {
  const colors = useColors();
  const circleSize = compact ? 56 : 80;
  const iconSize = compact ? 26 : 36;
  return (
    <Animated.View
      entering={FadeIn.duration(240)}
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 36,
          paddingVertical: compact ? 32 : 56,
        },
        style,
      ]}
    >
      <View
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: colors.fall + "1A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={iconSize} color={colors.fall} />
      </View>
      <Text
        style={{
          fontSize: compact ? 16 : 19,
          fontFamily: "Inter_700Bold",
          color: colors.foreground,
          marginTop: 16,
          textAlign: "center",
          letterSpacing: -0.3,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: compact ? 12.5 : 13.5,
          fontFamily: "Inter_400Regular",
          color: colors.mutedForeground,
          marginTop: 6,
          textAlign: "center",
          lineHeight: 19,
          maxWidth: 300,
        }}
      >
        {description}
      </Text>
      {technicalDetail ? (
        <Text
          selectable
          numberOfLines={3}
          style={{
            fontFamily: "monospace",
            fontSize: 10.5,
            color: colors.mutedForeground,
            opacity: 0.55,
            marginTop: 10,
            textAlign: "center",
            maxWidth: 320,
            letterSpacing: 0,
          }}
        >
          {technicalDetail}
        </Text>
      ) : null}
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          style={({ pressed }) => ({
            marginTop: 20,
            backgroundColor: colors.foreground,
            paddingHorizontal: 24,
            paddingVertical: 11,
            borderRadius: 26,
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon name="refresh" size={14} color={colors.background} />
          <Text
            style={{
              fontSize: 13.5,
              fontFamily: "Inter_700Bold",
              color: colors.background,
              letterSpacing: -0.1,
            }}
          >
            {retryLabel}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
