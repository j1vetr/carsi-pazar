import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MenuDrawer } from "@/components/MenuDrawer";
import { AppProvider } from "@/contexts/AppContext";
import { DrawerProvider } from "@/contexts/DrawerContext";
import { scheduleReviewPrompt } from "@/lib/reviewPrompt";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="detail/[code]" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="alerts" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="news" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="parities" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="about" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="settings/index" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="settings/theme" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="tools/converter" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="tools/gold-calc" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="tools/compare" options={{ headerShown: false, animation: "slide_from_right" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [lottieDone, setLottieDone] = useState(false);
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    void scheduleReviewPrompt();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <DrawerProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                  <MenuDrawer />
                  {!lottieDone && (
                    <View style={styles.splash} pointerEvents="none">
                      <LottieView
                        ref={lottieRef}
                        source={require("../assets/lottie/splash.json")}
                        autoPlay
                        loop={false}
                        resizeMode="contain"
                        style={styles.lottie}
                        onAnimationFinish={() => setLottieDone(true)}
                        {...(Platform.OS === "web" ? { renderMode: "SOFTWARE" as const } : {})}
                      />
                    </View>
                  )}
                </KeyboardProvider>
              </GestureHandlerRootView>
            </DrawerProvider>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  lottie: {
    width: "85%",
    height: "60%",
  },
});
