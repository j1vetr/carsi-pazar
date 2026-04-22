"use no memo";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";

import { buildData } from "@/widgets/buildData";
import { readWidgetConfig, type PriceField } from "@/widgets/config";
import type { PriceWidgetData } from "@/widgets/PriceWidget";
import { SYMBOL_REGISTRY } from "@/lib/haremApi";

const META_BY_CODE = new Map(SYMBOL_REGISTRY.map((m) => [m.code.toUpperCase(), m]));

function flagEmoji(iso?: string): string {
  if (!iso || iso.length !== 2) return "";
  const a = iso.toUpperCase().charCodeAt(0);
  const b = iso.toUpperCase().charCodeAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return "";
  return String.fromCodePoint(0x1f1e6 + (a - 65), 0x1f1e6 + (b - 65));
}

function iconFor(code: string): string {
  const meta = META_BY_CODE.get(code.toUpperCase());
  if (meta?.flag) return flagEmoji(meta.flag);
  const c = code.toUpperCase();
  if (c.startsWith("ALTIN") || c.includes("GRAM") || c === "ONS" || c === "ONS_SPOT") return "🟡";
  if (c.startsWith("GUMUS") || c === "XAG" || c.startsWith("AG")) return "⚪";
  if (c.startsWith("PLATIN") || c === "XPT") return "⚙️";
  if (c.startsWith("PALADYUM") || c === "XPD") return "⚙️";
  return "•";
}

function nameFor(code: string): string {
  const meta = META_BY_CODE.get(code.toUpperCase());
  return meta?.nameTR || code;
}

function unitFor(code: string): string {
  const meta = META_BY_CODE.get(code.toUpperCase());
  return meta?.unit || "";
}

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
// Eskiden 5 ardışık hatada bildirimi otomatik kapatıyorduk; ama bu kötü
// network koşullarında (≈7 dk fail) kullanıcının onayı olmadan bildirimi
// sessizce yok ediyordu. Artık sadece ÇOK uzun süreli arka arkaya hatada
// (≈3 saat = 120 × 90sn) loglayıp duruyoruz; bildirimi user kendisi kapatır.
const MAX_FAILURES_BEFORE_DISABLE = 120;

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

function fmtPct(p: number): string {
  return `%${Math.abs(p).toFixed(2).replace(".", ",")}`;
}

function arrow(p: number): string {
  return p > 0 ? "▲" : p < 0 ? "▼" : "·";
}

/** Açık (expanded) hâlde gösterilen INBOX satırları — her sembol bir satır. */
function buildInboxLines(data: PriceWidgetData, priceField: PriceField): string[] {
  if (!data.rows.length) return ["Veriler yükleniyor…"];
  return data.rows.map((r) => {
    const code = r.label;
    const price = priceField === "buy" ? r.buy : r.sell;
    const unit = unitFor(code);
    const flag = iconFor(code);
    const name = nameFor(code);
    const arr = arrow(r.changePercent);
    const pct = fmtPct(r.changePercent);
    // Format: "🇺🇸 Dolar · 44,93 ₺ · ▲ %0,02"
    return `${flag} ${name}  ·  ${price}${unit ? " " + unit : ""}  ·  ${arr} ${pct}`;
  });
}

/** Kapalı (collapsed) hâlde tek satırda 4 sembolün özeti. */
function buildCompactBody(data: PriceWidgetData, priceField: PriceField): string {
  if (data.error) return data.error;
  if (!data.rows.length) return "Veriler yükleniyor…";
  return data.rows
    .slice(0, 4)
    .map((r) => {
      const price = priceField === "buy" ? r.buy : r.sell;
      return `${r.label} ${price} ${arrow(r.changePercent)}`;
    })
    .join("   ");
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
  const title = "Çarşı Piyasa";
  const compactBody = buildCompactBody(data, config.priceField);
  const lines = buildInboxLines(data, config.priceField);
  const subText = stale || data.error
    ? `Bağlantı yok · son ${data.updatedAt}`
    : `Güncellendi · ${data.updatedAt}`;

  await notifee.default.displayNotification({
    id: NOTIFICATION_ID,
    title,
    body: compactBody,
    android: {
      channelId: CHANNEL_ID,
      ongoing: true,
      autoCancel: false,
      onlyAlertOnce: true,
      smallIcon: "notification_icon",
      color: "#0B3D91",
      colorized: true,
      asForegroundService: true,
      // Android 14+ kritik: type belirtilmezse notifee SHORT_SERVICE olarak
      // başlatır → 3 dk sonra "Short FGS procstate demoted" → JS thread donar
      // → bildirim güncellenmez ve sonunda OS process'i öldürebilir.
      // DATA_SYNC tipi, periyodik veri güncellemeleri için doğru semantik ve
      // 3 dk timeout'u olmaz.
      foregroundServiceTypes: [
        notifee.AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_DATA_SYNC,
      ],
      pressAction: { id: "default", launchActivity: "default" },
      style: {
        type: notifee.AndroidStyle.INBOX,
        lines,
        title,
        summary: subText,
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
