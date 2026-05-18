import MobileAds from "react-native-google-mobile-ads";

export async function initAds(): Promise<void> {
  try {
    await MobileAds().initialize();
  } catch {
    // SDK init başarısız olursa sessizce geç — reklamlar gösterilmez ama uygulama çökmez
  }
}
