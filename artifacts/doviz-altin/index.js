import "./widgets";
import notifee from "@notifee/react-native";
import { Platform } from "react-native";

// Notifee headless task / background event handler.
// Notifee Android'de log warning verir: "no background event handler has been
// set". Headless task (foreground service tick, action press, vs.) için JS
// runtime'da bir handler bulunması gerekir; aksi halde bazı event'ler düşer.
if (Platform.OS === "android") {
  notifee.onBackgroundEvent(async () => {
    // No-op: foreground service'in periyodik tick'i lib/ongoingNotification.ts
    // içindeki registerForegroundService callback'inde yönetiliyor. Burada
    // sadece notifee'nin handler kontrolünü tatmin ediyoruz.
    return;
  });
}

// require (yerine import) → ESM hoist davranışını bypass eder; handler kaydı
// expo-router bootstrap'inden ÖNCE kesin olarak çalışmış olur.
require("expo-router/entry");
