/**
 * Push token sağlık kontrolü ve self-healing.
 *
 * Akış:
 *  1. Cihaz son başarılı kayıt token'ını AsyncStorage'a yazar.
 *  2. Uygulama açılışında `validateAndRefreshToken` Expo'dan güncel
 *     token'ı ister; cache'lenmiş ile karşılaştırır.
 *  3. Token rotated → server'a yeni token yazılır, cache güncellenir.
 *  4. Token alınamadı (izin iptal / DeviceNotRegistered) → `apiDeleteToken`
 *     ile server kaydı silinir; bir sonraki izin verilişine kadar pasif.
 *
 * Server-side `cleanupStaleTokens` cron'u zaten 30g+ kayıtları siler;
 * bu istemci tarafı koridoru "kullanıcı uygulamayı açtı ama token
 * geçersizleşti" senaryosunu anında kapatır (cron'u beklemeden).
 */
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";

import { apiDeleteToken, apiRegisterToken } from "../api/api";
import { getDeviceId } from "../storage/deviceId";
import { registerForPushAsync } from "./notifications";

const LAST_TOKEN_KEY = "push.lastToken.v1";

export type TokenValidationResult =
  | { kind: "unchanged"; token: string }
  | { kind: "rotated"; token: string }
  | { kind: "registered"; token: string }
  | { kind: "deleted"; reason: string }
  | { kind: "skipped"; reason: string };

async function readCachedToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function writeCachedToken(token: string | null): Promise<void> {
  try {
    if (token) await AsyncStorage.setItem(LAST_TOKEN_KEY, token);
    else await AsyncStorage.removeItem(LAST_TOKEN_KEY);
  } catch {}
}

export async function validateAndRefreshToken(): Promise<TokenValidationResult> {
  if (Platform.OS === "web") return { kind: "skipped", reason: "web" };
  if (!Device.isDevice) return { kind: "skipped", reason: "emulator" };

  const deviceId = await getDeviceId();
  let current: string | null = null;
  try {
    current = await registerForPushAsync();
  } catch (err) {
    current = null;
    if (__DEV__) console.warn("[tokenValidator] getExpoPushTokenAsync failed", err);
  }

  const cached = await readCachedToken();

  if (!current) {
    if (cached) {
      try {
        await apiDeleteToken({ deviceId });
      } catch (err) {
        if (__DEV__) console.warn("[tokenValidator] delete failed", err);
      }
      await writeCachedToken(null);
      return { kind: "deleted", reason: "no current token" };
    }
    return { kind: "skipped", reason: "no token & no cache" };
  }

  if (cached === current) return { kind: "unchanged", token: current };

  try {
    await apiRegisterToken({
      deviceId,
      expoPushToken: current,
      platform: Platform.OS,
    });
    await writeCachedToken(current);
    return cached
      ? { kind: "rotated", token: current }
      : { kind: "registered", token: current };
  } catch (err) {
    if (__DEV__) console.warn("[tokenValidator] register failed", err);
    return { kind: "skipped", reason: "register failed" };
  }
}
