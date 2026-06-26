import MobileAds from "react-native-google-mobile-ads";

// index.js'de başlatılan init varsa aynı promise'i döndür, tekrar başlatma.
// MobileAds().initialize() zaten singleton davranır ama bunu garanti altına alıyoruz.
let initPromise: Promise<void> | null = null;

export function initAds(): Promise<void> {
  if (!initPromise) {
    initPromise = MobileAds()
      .initialize()
      .then(() => {})
      .catch(() => {});
  }
  return initPromise;
}
