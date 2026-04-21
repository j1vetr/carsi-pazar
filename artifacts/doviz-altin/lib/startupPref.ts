import AsyncStorage from "@react-native-async-storage/async-storage";

export type StartupTab = "index" | "gold" | "portfolio" | "favorites";

const KEY = "@carsi/startup-tab-v1";
const DEFAULT_TAB: StartupTab = "index";

const ROUTE_BY_TAB: Record<StartupTab, string> = {
  index: "/(tabs)",
  gold: "/(tabs)/gold",
  portfolio: "/(tabs)/portfolio",
  favorites: "/(tabs)/favorites",
};

export const STARTUP_TABS: { value: StartupTab; label: string }[] = [
  { value: "index", label: "Döviz" },
  { value: "gold", label: "Altın" },
  { value: "portfolio", label: "Portföy" },
  { value: "favorites", label: "Favoriler" },
];

export async function loadStartupTab(): Promise<StartupTab> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === "index" || raw === "gold" || raw === "portfolio" || raw === "favorites") {
      return raw;
    }
  } catch {}
  return DEFAULT_TAB;
}

export async function saveStartupTab(tab: StartupTab): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, tab);
  } catch {}
}

export function routeForStartupTab(tab: StartupTab): string {
  return ROUTE_BY_TAB[tab] ?? ROUTE_BY_TAB[DEFAULT_TAB];
}
