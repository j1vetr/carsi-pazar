import React, { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

const UNIT_ID = "ca-app-pub-6688478170415368/7184819045";

function getNativeAds() {
  if (Platform.OS === "web") return null;
  try {
    return require("react-native-google-mobile-ads") as typeof import("react-native-google-mobile-ads");
  } catch {
    return null;
  }
}

const nativeAds = getNativeAds();

export function AdBanner({ style }: { style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const [failed, setFailed] = useState(false);

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          {
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
          },
          style,
        ]}
      >
        <Text
          style={{
            fontSize: 9,
            fontFamily: "Inter_700Bold",
            color: colors.mutedForeground,
            letterSpacing: 1.2,
          }}
        >
          REKLAM
        </Text>
      </View>
    );
  }

  if (!nativeAds || failed) return null;

  const { BannerAd, BannerAdSize, TestIds } = nativeAds;
  const unitId = __DEV__ ? TestIds.BANNER : UNIT_ID;

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
