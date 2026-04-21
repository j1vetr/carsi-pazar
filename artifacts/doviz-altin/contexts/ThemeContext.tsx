import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "system" | "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  effective: "light" | "dark";
  setMode: (mode: ThemeMode) => Promise<void>;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "themeMode_v1";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [ready, setReady] = useState(false);

  // Load persisted mode
  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY);
        if (v === "light" || v === "dark" || v === "system") setModeState(v);
      } catch {}
      setReady(true);
    })();
  }, []);

  // Listen to system changes
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const effective: "light" | "dark" =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  return (
    <ThemeContext.Provider value={{ mode, effective, setMode, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Tema değişince alt ağacı tamamen remount eder. Bu sayede StyleSheet.create
 * ile sabitlenmiş renkler ve closure'a yakalanmış colors değerleri kullanan
 * ekranlar da anında yeni temaya geçer (uygulamayı yeniden başlatma gerekmez).
 * Provider'ların state'i (AppContext, QueryClient vb.) etkilenmez.
 */
export function ThemedTreeRemount({ children }: { children: React.ReactNode }) {
  const { effective, ready } = useTheme();
  if (!ready) return <>{children}</>;
  return <React.Fragment key={effective}>{children}</React.Fragment>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback when accessed outside provider (e.g., during early bootstrap)
    return {
      mode: "system",
      effective: Appearance.getColorScheme() === "dark" ? "dark" : "light",
      setMode: async () => {},
      ready: true,
    };
  }
  return ctx;
}
