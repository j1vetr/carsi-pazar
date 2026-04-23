import React, { useEffect } from "react";
import { TextInput, type TextStyle, type StyleProp, type TextInputProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Reanimated pattern: Animated.Text yerine Animated.TextInput kullanılır,
// çünkü TextInput'un `text` prop'u native tarafta güncellenebilir;
// Text componentinin böyle bir prop'u yoktur. editable=false ile salt okunur.
type AnimatedTextProps = TextInputProps & { text?: string };
const AnimInput = Animated.createAnimatedComponent(TextInput);

interface Props {
  value: number;
  formatter?: (n: number) => string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

const defaultFmt = (n: number) =>
  n.toLocaleString("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

/**
 * Sayıyı eski değerden yeniye yumuşak count-up ile geçirir.
 * Reanimated worklet üzerinde animasyon koşar; ana thread bloklamaz.
 */
export function AnimatedNumber({
  value,
  formatter = defaultFmt,
  duration = 600,
  prefix = "",
  suffix = "",
  style,
  accessibilityLabel,
}: Props) {
  const v = useSharedValue(value);

  useEffect(() => {
    v.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, v]);

  const animatedProps = useAnimatedProps<AnimatedTextProps>(() => {
    const n = v.value;
    return { text: `${prefix}${formatter(n)}${suffix}`, defaultValue: "" };
  });

  return (
    <AnimInput
      editable={false}
      pointerEvents="none"
      underlineColorAndroid="transparent"
      style={[{ padding: 0, margin: 0 }, style]}
      // Fallback / ilk render
      defaultValue={`${prefix}${formatter(value)}${suffix}`}
      animatedProps={animatedProps}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
