import React, { useEffect, useRef, useState } from "react";
import { Text, type TextStyle, type StyleProp } from "react-native";

interface Props {
  value: number;
  formatter?: (n: number) => string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
}

const defaultFmt = (n: number) =>
  n.toLocaleString("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Sayıyı eski değerden yeniye yumuşak count-up ile geçirir.
 * JS thread üzerinde requestAnimationFrame ile çalışır; Reanimated worklet
 * kullanmaz çünkü `toLocaleString` Hermes UI runtime'ında yok ve worklet
 * içinden normal JS fonksiyonu çağrısı (formatter) "Object is not a function"
 * hatasına yol açar.
 */
export function AnimatedNumber({
  value,
  formatter = defaultFmt,
  duration = 600,
  prefix = "",
  suffix = "",
  style,
  accessibilityLabel,
  numberOfLines,
  adjustsFontSizeToFit,
  minimumFontScale,
}: Props) {
  const [display, setDisplay] = useState<number>(value);
  const fromRef = useRef<number>(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / Math.max(1, duration));
      const eased = easeOutCubic(t);
      const next = from + (to - from) * eased;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      fromRef.current = value;
    };
  }, [value, duration]);

  let text: string;
  try {
    text = `${prefix}${formatter(display)}${suffix}`;
  } catch {
    text = `${prefix}${display}${suffix}`;
  }

  return (
    <Text
      style={style}
      accessibilityLabel={accessibilityLabel}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
    >
      {text}
    </Text>
  );
}
