import { Platform } from "react-native";
import { InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads";
import { canShowInterstitial, recordInterstitialShown } from "./adCoordinator";
import { initAds } from "./initAds";

const UNIT_ID = "ca-app-pub-9881615856860784/2084523267";
const unitId  = __DEV__ ? TestIds.INTERSTITIAL : UNIT_ID;

let currentAd: InterstitialAd | null = null;
let adReady = false;

function load(): void {
  if (Platform.OS !== "android") return;

  // SDK init'i bekle, tamamlanır tamamlanmaz yüklemeye başla
  void initAds().then(() => {
    try {
      const ad = InterstitialAd.createForAdRequest(unitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      ad.addAdEventListener(AdEventType.LOADED, () => {
        currentAd = ad;
        adReady   = true;
      });

      ad.addAdEventListener(AdEventType.CLOSED, () => {
        adReady   = false;
        currentAd = null;
        // Bir sonraki gösterim için önceden yükle
        setTimeout(load, 2000);
      });

      ad.addAdEventListener(AdEventType.ERROR, () => {
        adReady   = false;
        currentAd = null;
        // Hata durumunda 30 sn sonra tekrar dene
        setTimeout(load, 30_000);
      });

      ad.load();
    } catch {}
  });
}

/** Uygulama açılışında bir kez çağrılır */
export function preloadInterstitial(): void {
  if (Platform.OS !== "android") return;
  load();
}

/** Detail sayfası kapanırken çağrılır */
export function showInterstitialIfReady(): void {
  if (!adReady || !currentAd) return;
  if (!canShowInterstitial()) return;
  try {
    currentAd.show();
    recordInterstitialShown();
  } catch {}
}
