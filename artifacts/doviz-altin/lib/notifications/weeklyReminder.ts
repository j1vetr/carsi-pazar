import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const IDENTIFIER = "carsi-weekly-portfolio-reminder";

/**
 * Pazar günü 20:00'da haftalık portföy hatırlatması.
 * Local notification — sunucudan bağımsız çalışır, uygulama açık olmasa bile.
 * Tekrarlı (weekly) — bir kez schedule edilir, kullanıcı kapatana kadar her hafta tetiklenir.
 */
export async function scheduleWeeklyPortfolioReminder(enabled: boolean): Promise<void> {
  if (Platform.OS === "web") return;
  // Önce eskisini kaldır
  try {
    await Notifications.cancelScheduledNotificationAsync(IDENTIFIER);
  } catch {}
  if (!enabled) return;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: IDENTIFIER,
      content: {
        title: "📊 Haftalık Portföy Özeti",
        body: "Bu haftaki portföy performansını gör — Çarşı Piyasa'yı aç.",
        sound: "default",
        data: { type: "weekly_portfolio", route: "/(tabs)/portfolio" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // Expo: 1=Sunday, 2=Monday … 7=Saturday
        hour: 20,
        minute: 0,
      },
    });
  } catch (e) {
    console.warn("[weekly] schedule failed", e);
  }
}
