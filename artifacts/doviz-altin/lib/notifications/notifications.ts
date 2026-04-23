import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { apiRegisterToken } from "../api/api";
import { getDeviceId } from "../storage/deviceId";

const LAST_TOKEN_KEY = "push.lastToken.v1";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Sessiz widget tick mesajları kullanıcıya gözükmesin
    const data = notification.request?.content?.data as { type?: string } | undefined;
    if (data?.type === "widget_refresh") {
      return {
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
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
  await Notifications.setNotificationChannelAsync("news", {
    name: "Finans Haberleri",
    description: "Yeni döviz, altın ve ekonomi haberleri",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 150, 200],
    lightColor: "#0B3D91",
    sound: "default",
    showBadge: false,
  });
  await Notifications.setNotificationChannelAsync("briefing", {
    name: "Açılış / Kapanış Brifingi",
    description: "Sabah 09:00 ve akşam 18:30 piyasa özeti",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150],
    lightColor: "#0B3D91",
    sound: "default",
    showBadge: false,
  });
  await Notifications.setNotificationChannelAsync("moves", {
    name: "Önemli Fiyat Hareketleri",
    description: "Favori sembollerinde 30dk'da %1+ hareketler",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 150, 200],
    lightColor: "#F59E0B",
    sound: "default",
    showBadge: false,
  });
  await Notifications.setNotificationChannelAsync("weekly", {
    name: "Haftalık Portföy",
    description: "Pazar 20:00 portföy performans özeti",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150],
    lightColor: "#10B981",
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

  if (Platform.OS === "web") return { deviceId, token };
  if (!Device.isDevice) return { deviceId, token };

  try {
    token = await registerForPushAsync();
    if (token) {
      try {
        await apiRegisterToken({ deviceId, expoPushToken: token, platform: Platform.OS });
        await AsyncStorage.setItem(LAST_TOKEN_KEY, token).catch(() => {});
      } catch (err) {
        console.warn("[push] Sunucuya kayıt başarısız:", err);
      }
    }
  } catch (err) {
    console.warn("[push] Setup hatası:", err);
  }

  return { deviceId, token };
}
