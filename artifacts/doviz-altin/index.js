import "./widgets";

// MobileAds SDK'yı React ağacı render olmadan önce başlat.
// Bu sayede _layout.tsx'teki useEffect tetiklendiğinde init çoktan tamamlanmış
// ya da tamamlanmaya çok yakın olur — reklam yükleme gecikmesi minimuma düşer.
import { Platform } from "react-native";
if (Platform.OS === "android") {
  const MobileAds = require("react-native-google-mobile-ads").default;
  MobileAds().initialize().catch(() => {});
}

require("expo-router/entry");
