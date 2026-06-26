import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

const UNIT_ID = "ca-app-pub-9881615856860784/8138801893";
const unitId  = __DEV__ ? TestIds.BANNER : UNIT_ID;

const RETRY_DELAY_MS = 30_000; // Yükleme başarısız olursa 30 sn sonra tekrar dene

export function AdBanner({ style }: { style?: StyleProp<ViewStyle> }) {
  const [failed,    setFailed]    = useState(false);
  const [retryKey,  setRetryKey]  = useState(0);

  // Yüklenemediğinde 30 sn sonra otomatik retry
  useEffect(() => {
    if (!failed) return;
    const t = setTimeout(() => {
      setFailed(false);
      setRetryKey((k) => k + 1); // BannerAd'i yeniden mount et
    }, RETRY_DELAY_MS);
    return () => clearTimeout(t);
  }, [failed]);

  if (Platform.OS !== "android") return null;

  return (
    <View style={[{ alignItems: "center", overflow: "hidden" }, style]}>
      <BannerAd
        key={retryKey}
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setFailed(true)}
        onAdLoaded={() => setFailed(false)}
      />
    </View>
  );
}
