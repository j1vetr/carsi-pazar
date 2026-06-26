import AsyncStorage from "@react-native-async-storage/async-storage";

const APP_OPEN_KEY = "ad:app_open_last_shown";
const APP_OPEN_COOLDOWN_MS  = 4 * 60 * 60 * 1000; // 4 saat
const INTERSTITIAL_GAP_MS   = 5 * 60 * 1000;       // 5 dakika (herhangi iki tam ekran arası)
const APP_OPEN_GRACE_MS     = 2 * 60 * 1000;        // App Open sonrası 2 dk grace
const MAX_INTERSTITIALS     = 2;                    // Oturum başına max

// In-memory session state
let sessionInterstitialCount = 0;
let lastFullScreenAt = 0;
let lastAppOpenAt    = 0;

export async function canShowAppOpen(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(APP_OPEN_KEY);
    const lastShown = raw ? parseInt(raw, 10) : 0;
    return Date.now() - lastShown >= APP_OPEN_COOLDOWN_MS;
  } catch {
    return true;
  }
}

export function canShowInterstitial(): boolean {
  const now = Date.now();
  if (sessionInterstitialCount >= MAX_INTERSTITIALS) return false;
  if (now - lastFullScreenAt  < INTERSTITIAL_GAP_MS)  return false;
  if (now - lastAppOpenAt     < APP_OPEN_GRACE_MS)     return false;
  return true;
}

export async function recordAppOpenShown(): Promise<void> {
  const now = Date.now();
  lastFullScreenAt = now;
  lastAppOpenAt    = now;
  try {
    await AsyncStorage.setItem(APP_OPEN_KEY, String(now));
  } catch {}
}

export function recordInterstitialShown(): void {
  lastFullScreenAt = Date.now();
  sessionInterstitialCount++;
}
