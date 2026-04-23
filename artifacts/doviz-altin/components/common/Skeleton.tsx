import React, { useEffect } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

type Props = {
  width?: number | `${number}%` | "auto";
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = "100%", height = 14, radius = 8, style }: Props) {
  const colors = useColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);

  const animated = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.55, 1]),
  }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Yükleniyor"
      accessibilityLiveRegion="polite"
      style={[{ width, height, borderRadius: radius, overflow: "hidden" }, style]}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: colors.secondary,
          },
          animated,
        ]}
      />
    </View>
  );
}

/** Non-animated container that groups several Skeleton rows with shared accessibility. */
export function SkeletonGroup({
  children,
  style,
  label = "Yükleniyor",
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      style={style}
    >
      {children}
    </View>
  );
}
