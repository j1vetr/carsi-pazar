import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

const UNIT_ID = "ca-app-pub-9881615856860784/8138801893";
const unitId  = __DEV__ ? TestIds.BANNER : UNIT_ID;

// ANCHORED_ADAPTIVE_BANNER genellikle 50-90dp — layout sıçramasını önlemek
// için daima bu alanı rezerve ediyoruz.
const BANNER_HEIGHT = 60;

const RETRY_DELAY_MS = 30_000;

function AdBannerComponent({ style }: { style?: StyleProp<ViewStyle> }) {
  const [failed,   setFailed]   = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Yükleme başarısız → 30 sn sonra yeniden dene (key değişince BannerAd remount olur)
  useEffect(() => {
    if (!failed) return;
    const t = setTimeout(() => {
      setFailed(false);
      setRetryKey((k) => k + 1);
    }, RETRY_DELAY_MS);
    return () => clearTimeout(t);
  }, [failed]);

  if (Platform.OS !== "android") return null;

  return (
    // Sabit yükseklik: reklam yüklenene kadar boş alan tutar, liste zıplamaz
    <View
      style={[
        { height: BANNER_HEIGHT, alignItems: "center", justifyContent: "center", overflow: "hidden" },
        style,
      ]}
    >
      {!failed && (
        <BannerAd
          key={retryKey}
          unitId={unitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: false }}
          onAdFailedToLoad={() => setFailed(true)}
          onAdLoaded={() => setFailed(false)}
        />
      )}
    </View>
  );
}

// Parent (index/gold/portfolio) fiyat güncellemesiyle sürekli re-render olur.
// AdBannerComponent'in kendi state'i dışında hiçbir şey değişmediğinden
// parent re-render'larını tamamen görmezden geliyoruz → BannerAd remount olmaz.
export const AdBanner = React.memo(AdBannerComponent, () => true);
