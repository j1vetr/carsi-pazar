import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useColors } from "@/hooks/useColors";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type Props = {
  width?: number | `${number}%` | "auto";
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Shimmer tabanlı iskelet bileşeni.
 * Taban rengi üzerinde ~1.2 sn'lik döngüsel hareketli bir ışık bandı geçer.
 * Tüm app boyunca tek ritim kullanması için bu bileşenin üstüne ek varyant eklemeyin.
 */
export function Skeleton({ width = "100%", height = 14, radius = 8, style }: Props) {
  const colors = useColors();
  const progress = useSharedValue(0);
  const [measured, setMeasured] = useState<number>(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [progress]);

  const highlightWidth = Math.max(measured * 0.65, 60);

  const shimmerStyle = useAnimatedStyle(() => {
    const w = measured || 120;
    const tx = interpolate(progress.value, [0, 1], [-highlightWidth, w + highlightWidth]);
    return { transform: [{ translateX: tx }] };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - measured) > 0.5) setMeasured(w);
  };

  const base = colors.secondary;
  const highlight = colors.background === "#ffffff" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.08)";

  // Çoklu iskelet satırları için ekran okuyucuda spam olmaması adına tek tek
  // satırlar sessiz kalır; duyuru, üstteki <SkeletonGroup> konteynerinden gelir.
  // Tek başına kullanımda (grup dışında) importCeyizdeSkeletonStandalone bileşeni
  // tercih edilmelidir — bu tercih ek karmaşa getirmesin diye bu temel bileşen
  // varsayılan olarak accessible={false} bırakıldı.
  return (
    <View
      accessible={false}
      importantForAccessibility="no"
      onLayout={onLayout}
      style={[
        { width, height, borderRadius: radius, overflow: "hidden", backgroundColor: base },
        style,
      ]}
    >
      <AnimatedLinearGradient
        pointerEvents="none"
        colors={["transparent", highlight, "transparent"] as unknown as readonly [string, string, string]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            width: highlightWidth,
          },
          shimmerStyle,
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
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      style={style}
    >
      {children}
    </View>
  );
}
