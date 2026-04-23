import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  PlayfairDisplay_500Medium_Italic,
  PlayfairDisplay_600SemiBold_Italic,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import * as Notifications from "expo-notifications";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initSentry, reportError } from "@/lib/monitoring/sentry";
import { MenuDrawer } from "@/components/MenuDrawer";
import { OfflineBanner } from "@/components/common/OfflineBanner";
import { AppProvider } from "@/contexts/AppContext";
import { DrawerProvider } from "@/contexts/DrawerContext";
import { ThemeProvider, ThemedTreeRemount } from "@/contexts/ThemeContext";
import { scheduleReviewPrompt } from "@/lib/notifications/reviewPrompt";
import { isOnboardingSeen } from "@/lib/storage/onboardingPref";
import { loadStartupTab, routeForStartupTab } from "@/lib/storage/startupPref";
import { registerWidgetBackgroundTask } from "@/lib/widget/widgetBackgroundTask";
import { refreshPriceWidget } from "@/widgets/refresh";

initSentry();

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="detail/[code]" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="alerts" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="inbox" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="news" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="parities" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="portfolio/transactions" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="about" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="settings/index" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="settings/theme" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="settings/widget" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="tools/converter" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="tools/gold-calc" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="tools/compare" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="legal/disclaimer" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="legal/privacy" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, animation: "fade", gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_500Medium_Italic,
    PlayfairDisplay_600SemiBold_Italic,
    PlayfairDisplay_700Bold,
  });
  const [lottieDone, setLottieDone] = useState(false);
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Safety: hide lottie splash after 3.5s even if onAnimationFinish never fires
  // (e.g., when launched via widget click with cached process state).
  useEffect(() => {
    const t = setTimeout(() => setLottieDone(true), 3500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    void scheduleReviewPrompt();
  }, []);

  // First-launch onboarding takes precedence over startup-tab routing.
  // If never seen, redirect to /onboarding; otherwise honor user's preferred
  // startup tab (default = Döviz/index).
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const seen = await isOnboardingSeen();
        if (cancelled) return;
        if (!seen) {
          try {
            router.replace("/onboarding" as never);
          } catch {}
          return;
        }
        const tab = await loadStartupTab();
        if (cancelled || tab === "index") return;
        try {
          router.replace(routeForStartupTab(tab) as never);
        } catch {}
      } catch {}
    }, 50);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  // Refresh the home-screen price widget whenever the app opens or returns
  // to the foreground. This keeps the widget in sync with whatever the user
  // saw last in the app, on top of Android's 30-min auto-update.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void refreshPriceWidget();
    void registerWidgetBackgroundTask();
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") void refreshPriceWidget();
    });
    // Foreground'da gelen sessiz widget tick'lerini de yakala (background task
    // sadece app killed/background'da garantili tetiklenir).
    const recv = Notifications.addNotificationReceivedListener((notif) => {
      const data = notif.request?.content?.data as { type?: string } | undefined;
      if (data?.type === "widget_refresh") void refreshPriceWidget({ force: true });
    });
    return () => {
      sub.remove();
      recv.remove();
    };
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary onError={reportError}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
          <AppProvider>
            <DrawerProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <ThemedTreeRemount>
                    <RootLayoutNav />
                    <MenuDrawer />
                    <OfflineBanner />
                  </ThemedTreeRemount>
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
          </ThemeProvider>
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
