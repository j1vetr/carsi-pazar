import AsyncStorage from "@react-native-async-storage/async-storage";

const HOME_KEY = "home.minicards.v1";
const GOLD_KEY = "gold.minicards.v1";

export const HOME_DEFAULT: string[] = ["USD", "EUR", "ONS"];
export const GOLD_DEFAULT: string[] = ["ONS", "CEYREK", "YARIM"];

async function loadCodes(key: string, fallback: string[]): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === fallback.length && parsed.every((x) => typeof x === "string")) {
      return parsed;
    }
  } catch {}
  return fallback;
}

async function saveCodes(key: string, codes: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(codes));
  } catch {}
}

export const loadHomeMiniCodes = () => loadCodes(HOME_KEY, HOME_DEFAULT);
export const saveHomeMiniCodes = (codes: string[]) => saveCodes(HOME_KEY, codes);
export const loadGoldMiniCodes = () => loadCodes(GOLD_KEY, GOLD_DEFAULT);
export const saveGoldMiniCodes = (codes: string[]) => saveCodes(GOLD_KEY, codes);
