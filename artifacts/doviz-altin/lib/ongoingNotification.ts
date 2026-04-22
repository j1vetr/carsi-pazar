"use no memo";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";

import { buildData } from "@/widgets/buildData";
import { readWidgetConfig, type PriceField } from "@/widgets/config";
import type { PriceWidgetData } from "@/widgets/PriceWidget";

let notifeeMod: typeof import("@notifee/react-native") | null = null;
function getNotifee() {
  if (Platform.OS !== "android") return null;
  if (!notifeeMod) {
    notifeeMod = require("@notifee/react-native");
  }
  return notifeeMod;
}

export const ONGOING_PREF_KEY = "@carsi/ongoing-notif-enabled-v1";
const CHANNEL_ID = "carsi-ongoing";
const NOTIFICATION_ID = "carsi-ongoing";
const REFRESH_INTERVAL_MS = 90_000;

export async function isOngoingEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(ONGOING_PREF_KEY);
    return raw === "1";
  } catch {
    return false;
  }
}

async function setEnabledFlag(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(ONGOING_PREF_KEY, enabled ? "1" : "0");
  } catch {}
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let appStateSub: { remove: () => void } | null = null;
let serviceRegistered = false;
let consecutiveFailures = 0;
let inFlight = false;
let lastSuccessData: PriceWidgetData | null = null;
let serviceLoopActive = false;
const MAX_FAILURES_BEFORE_DISABLE = 5;

async function safeDisplayOngoing(): Promise<boolean> {
  // Re-entrancy guard: aynı anda iki displayOngoing çalışmasın. Birbirinin
  // notification update'ini kesmesi crash'e (race) neden oluyordu.
  if (inFlight) {
    console.log("[CARSI-ONGOING] skip — previous update still in flight");
    return true;
  }
  inFlight = true;
  try {
    await displayOngoing();
    consecutiveFailures = 0;
    return true;
  } catch (err) {
    consecutiveFailures += 1;
    console.warn(
      `[CARSI-ONGOING] displayNotification failed (${consecutiveFailures}/${MAX_FAILURES_BEFORE_DISABLE})`,
      err,
    );
    // Hata durumunda son başarılı veriyle bildirimi koru (kullanıcı boş kalmasın).
    if (lastSuccessData) {
      try {
        await displayWithData(lastSuccessData, /* stale */ true);
      } catch {}
    }
    if (consecutiveFailures >= MAX_FAILURES_BEFORE_DISABLE) {
      console.warn("[CARSI-ONGOING] disabling toggle to prevent crash loop");
      try {
        await setEnabledFlag(false);
        stopRefreshLoop();
        detachAppStateListener();
        const notifee = getNotifee();
        if (notifee) {
          try { await notifee.default.stopForegroundService(); } catch {}
          try { await notifee.default.cancelNotification(NOTIFICATION_ID); } catch {}
        }
      } catch {}
    }
    return false;
  } finally {
    inFlight = false;
  }
}

function fmtPriceForLine(value: string): string {
  return value;
}

function buildBigText(data: PriceWidgetData, priceField: PriceField): string {
  if (data.error) return data.error;
  if (!data.rows.length) return "Veriler yükleniyor…";
  const lines = data.rows.map((r) => {
    const price = priceField === "buy" ? r.buy : r.sell;
    const sign = r.changePercent > 0 ? "▲" : r.changePercent < 0 ? "▼" : "·";
    const pct = `${sign} %${Math.abs(r.changePercent).toFixed(2).replace(".", ",")}`;
    return `${r.label.padEnd(8, " ")}  ${fmtPriceForLine(price)}  ${pct}`;
  });
  return lines.join("\n");
}

function buildTitle(data: PriceWidgetData, priceField: PriceField): string {
  if (!data.rows.length) return "Çarşı Piyasa";
  const head = data.rows.slice(0, 2).map((r) => {
    const price = priceField === "buy" ? r.buy : r.sell;
    return `${r.label} ${price}`;
  });
  return head.join("  ·  ");
}

async function ensureChannel(): Promise<void> {
  const notifee = getNotifee();
  if (!notifee) return;
  await notifee.default.createChannel({
    id: CHANNEL_ID,
    name: "Canlı fiyat bildirimi",
    description: "Bildirim çubuğunda canlı döviz ve altın fiyatlarını gösterir.",
    importance: notifee.AndroidImportance.LOW,
    vibration: false,
    sound: undefined,
  });
}

function ensureForegroundServiceRegistered(): void {
  const notifee = getNotifee();
  if (!notifee || serviceRegistered) return;
  serviceRegistered = true;
  // Foreground service callback'i bir Promise döndürür ve native taraf bu
  // promise resolve edilene kadar service'i (ve JS engine'i) ayakta tutar.
  // Recursive setTimeout loop'u BU callback'in içine koyuyoruz ki uygulama
  // arka plana atılsa bile JS task askıya alınmasın → bildirim gerçekten
  // periyodik güncellensin.
  notifee.default.registerForegroundService(() => {
    return new Promise<void>(() => {
      serviceLoopActive = true;
      const tick = async () => {
        if (!serviceLoopActive) return;
        try {
          await safeDisplayOngoing();
        } catch {}
        if (!serviceLoopActive) return;
        refreshTimer = setTimeout(tick, REFRESH_INTERVAL_MS);
      };
      // İlk tick anında değil, kısa bir gecikmeyle (display çağrıları üst üste
      // binmesin diye)
      refreshTimer = setTimeout(tick, REFRESH_INTERVAL_MS);
      // Promise asla resolve edilmez → service alive kalır.
    });
  });
}

async function displayWithData(
  data: PriceWidgetData,
  stale: boolean,
): Promise<void> {
  const notifee = getNotifee();
  if (!notifee) return;
  await ensureChannel();
  const config = await readWidgetConfig();
  const title = buildTitle(data, config.priceField);
  const bigText = buildBigText(data, config.priceField);
  const subText = stale || data.error
    ? `Bağlantı yok · son ${data.updatedAt}`
    : `Güncellendi · ${data.updatedAt}`;

  await notifee.default.displayNotification({
    id: NOTIFICATION_ID,
    title,
    body: bigText.split("\n")[0] ?? "Çarşı Piyasa",
    android: {
      channelId: CHANNEL_ID,
      ongoing: true,
      autoCancel: false,
      onlyAlertOnce: true,
      smallIcon: "notification_icon",
      color: "#0B3D91",
      colorized: true,
      asForegroundService: true,
      pressAction: { id: "default", launchActivity: "default" },
      style: {
        type: notifee.AndroidStyle.BIGTEXT,
        text: bigText,
      },
      showTimestamp: false,
      timestamp: Date.now(),
    },
    subtitle: subText,
  });
}

async function displayOngoing(): Promise<void> {
  const notifee = getNotifee();
  if (!notifee) return;
  ensureForegroundServiceRegistered();
  const config = await readWidgetConfig();
  // buildData kendi içinde 7sn + 6sn timeout uyguluyor → bu çağrı en geç ~13sn
  // içinde resolve olur, foreground service'i bloklamaz.
  const data = await buildData(config.codes);
  const ok = data.rows.length > 0 && !data.error;
  if (ok) {
    lastSuccessData = data;
    await displayWithData(data, false);
  } else if (lastSuccessData) {
    // Fetch fail oldu ama eldeki son veriyle bildirimi güncel tut.
    await displayWithData(lastSuccessData, true);
  } else {
    // Hiç veri yoksa "Bağlantı yok" göster.
    await displayWithData(data, true);
  }
}

function stopRefreshLoop(): void {
  serviceLoopActive = false;
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function attachAppStateListener(): void {
  if (appStateSub) return;
  appStateSub = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      void safeDisplayOngoing();
    }
  });
}

function detachAppStateListener(): void {
  if (appStateSub) {
    appStateSub.remove();
    appStateSub = null;
  }
}

export async function startOngoingNotification(): Promise<void> {
  if (Platform.OS !== "android") return;
  const notifee = getNotifee();
  if (!notifee) return;
  try {
    const settings = await notifee.default.requestPermission();
    if (
      settings.authorizationStatus === notifee.AuthorizationStatus.DENIED
    ) {
      return;
    }
  } catch {}
  await setEnabledFlag(true);
  consecutiveFailures = 0;
  // İlk displayOngoing çağrısı asForegroundService:true ile bildirimi
  // gösterir → notifee native taraf foreground service'i başlatır →
  // ensureForegroundServiceRegistered'da kayıtlı olan callback tetiklenir →
  // periyodik refresh loop callback içinden başlar (app arka plana atılsa
  // bile JS thread alive kalır).
  ensureForegroundServiceRegistered();
  const ok = await safeDisplayOngoing();
  if (!ok) return;
  attachAppStateListener();
}

export async function stopOngoingNotification(): Promise<void> {
  await setEnabledFlag(false);
  stopRefreshLoop();
  detachAppStateListener();
  const notifee = getNotifee();
  if (!notifee) return;
  try {
    await notifee.default.stopForegroundService();
  } catch {}
  try {
    await notifee.default.cancelNotification(NOTIFICATION_ID);
  } catch {}
}

/**
 * Called once at app startup. If the user previously enabled the ongoing
 * notification, restore the foreground service and refresh loop.
 */
export async function restoreOngoingNotificationIfEnabled(): Promise<void> {
  if (Platform.OS !== "android") return;
  const enabled = await isOngoingEnabled();
  if (!enabled) return;
  ensureForegroundServiceRegistered();
  consecutiveFailures = 0;
  const ok = await safeDisplayOngoing();
  if (!ok) return;
  attachAppStateListener();
}

/** Called from the widget settings screen after symbols/price field change. */
export async function refreshOngoingNotificationIfEnabled(): Promise<void> {
  if (Platform.OS !== "android") return;
  const enabled = await isOngoingEnabled();
  if (!enabled) return;
  await safeDisplayOngoing();
}
