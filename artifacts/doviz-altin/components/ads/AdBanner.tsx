import React, { useState } from "react";
import { Platform, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

const UNIT_ID = "ca-app-pub-9881615856860784/8138801893";
const unitId = __DEV__ ? TestIds.BANNER : UNIT_ID;

export function AdBanner({ style }: { style?: StyleProp<ViewStyle> }) {
  const [failed, setFailed] = useState(false);

  if (Platform.OS !== "android") return null;
  if (failed) return null;

  return (
    <View style={[{ alignItems: "center", overflow: "hidden" }, style]}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
