import { Alert, Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { apiRegisterToken } from "./api";
import { getDeviceId } from "./deviceId";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("price-alerts", {
    name: "Fiyat Alarmları",
    description: "Hedef fiyata ulaşan döviz/altın bildirimleri",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#0B3D91",
    sound: "default",
    showBadge: false,
  });
}

export async function registerForPushAsync(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  if (!Device.isDevice) {
    console.warn("[push] Emulator'de push token alınamaz");
    return null;
  }

  await ensureAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== "granted") {
    console.warn("[push] Bildirim izni verilmedi");
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return tokenData.data;
  } catch (err) {
    console.warn("[push] Token alınamadı:", err);
    return null;
  }
}

export async function setupPushAndRegister(): Promise<{ deviceId: string; token: string | null }> {
  const deviceId = await getDeviceId();
  let token: string | null = null;
  let debugMsg = `deviceId: ${deviceId.slice(0, 8)}...\n`;

  if (Platform.OS === "web") {
    debugMsg += "Platform: web (push yok)";
    return { deviceId, token };
  }
  if (!Device.isDevice) {
    debugMsg += "Emulator (push yok)";
    Alert.alert("Push Debug", debugMsg);
    return { deviceId, token };
  }

  try {
    await ensureAndroidChannel();
    const { status: existing } = await Notifications.getPermissionsAsync();
    let final = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      final = status;
    }
    debugMsg += `İzin: ${final}\n`;
    if (final !== "granted") {
      Alert.alert("Push Debug", debugMsg);
      return { deviceId, token };
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;
    debugMsg += `projectId: ${projectId ?? "YOK"}\n`;

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );
      token = tokenData.data;
      debugMsg += `Token: ${token.slice(0, 30)}...\n`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      debugMsg += `TOKEN HATASI: ${msg}\n`;
      Alert.alert("Push Debug", debugMsg);
      return { deviceId, token };
    }

    try {
      await apiRegisterToken({ deviceId, expoPushToken: token, platform: Platform.OS });
      debugMsg += "Sunucuya kaydedildi ✓";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      debugMsg += `KAYIT HATASI: ${msg}`;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    debugMsg += `GENEL HATA: ${msg}`;
  }

  Alert.alert("Push Debug", debugMsg);
  return { deviceId, token };
}
