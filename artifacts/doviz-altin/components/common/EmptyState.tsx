import React from "react";
import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Icon, type IconName } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";

type Action = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: "primary" | "subtle";
};

type Props = {
  icon?: IconName;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description?: string;
  action?: Action;
  secondaryAction?: Action;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function EmptyState({
  icon = "sparkles-outline",
  iconColor,
  iconBg,
  title,
  description,
  action,
  secondaryAction,
  style,
  compact = false,
}: Props) {
  const colors = useColors();
  const resolvedIconColor = iconColor ?? colors.mutedForeground;
  const resolvedIconBg = iconBg ?? colors.secondary;
  const iconSize = compact ? 28 : 42;
  const circleSize = compact ? 64 : 96;

  return (
    <Animated.View
      entering={FadeIn.duration(240)}
      style={[
        {
          flex: 1,
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
          backgroundColor: resolvedIconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={iconSize} color={resolvedIconColor} />
      </View>
      <Text
        style={{
          fontSize: compact ? 17 : 21,
          fontFamily: "Inter_700Bold",
          color: colors.foreground,
          marginTop: compact ? 16 : 22,
          textAlign: "center",
          letterSpacing: -0.4,
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text
          style={{
            fontSize: compact ? 13 : 14,
            fontFamily: "Inter_400Regular",
            color: colors.mutedForeground,
            marginTop: 8,
            textAlign: "center",
            lineHeight: compact ? 19 : 21,
            maxWidth: 320,
          }}
        >
          {description}
        </Text>
      ) : null}
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => ({
            marginTop: 24,
            backgroundColor: action.variant === "subtle" ? colors.secondary : colors.primary,
            paddingHorizontal: 28,
            paddingVertical: 13,
            borderRadius: 30,
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          {action.icon ? (
            <Icon
              name={action.icon}
              size={15}
              color={action.variant === "subtle" ? colors.foreground : colors.primaryForeground}
            />
          ) : null}
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Inter_700Bold",
              color: action.variant === "subtle" ? colors.foreground : colors.primaryForeground,
              letterSpacing: -0.2,
            }}
          >
            {action.label}
          </Text>
        </Pressable>
      ) : null}
      {secondaryAction ? (
        <Pressable
          onPress={secondaryAction.onPress}
          accessibilityRole="button"
          accessibilityLabel={secondaryAction.label}
          hitSlop={8}
          style={({ pressed }) => ({
            marginTop: 12,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Inter_600SemiBold",
              color: colors.mutedForeground,
              letterSpacing: -0.1,
            }}
          >
            {secondaryAction.label}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
