import { Platform } from "react-native";
import { AppOpenAd, AdEventType, TestIds } from "react-native-google-mobile-ads";
import { canShowAppOpen, recordAppOpenShown } from "./adCoordinator";

const UNIT_ID = "ca-app-pub-9881615856860784/1244260481";
const unitId  = __DEV__ ? TestIds.APP_OPEN : UNIT_ID;

export function initAppOpenAd(): void {
  if (Platform.OS !== "android") return;

  try {
    const ad = AppOpenAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    ad.addAdEventListener(AdEventType.LOADED, () => {
      void (async () => {
        const allowed = await canShowAppOpen();
        if (!allowed) return;
        try {
          ad.show();
          await recordAppOpenShown();
        } catch {}
      })();
    });

    ad.addAdEventListener(AdEventType.ERROR, () => {
      // Sessizce geç — bir sonraki açılışta tekrar denenecek
    });

    ad.load();
  } catch {}
}
