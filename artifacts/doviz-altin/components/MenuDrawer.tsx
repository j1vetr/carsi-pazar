import React, { useEffect, useMemo } from "react";
import {
  BackHandler,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInLeft,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useDrawer } from "@/contexts/DrawerContext";
import { useApp } from "@/contexts/AppContext";

const LOGO_DARK = require("../assets/images/logo-dark.png");
const LOGO_LIGHT = require("../assets/images/logo-light.png");
const SCREEN_W = Dimensions.get("window").width;
const DRAWER_W = Math.min(Math.round(SCREEN_W * 0.84), 340);

const SPRING = { damping: 26, stiffness: 220, mass: 0.9 };
const TIMING = { duration: 240, easing: Easing.out(Easing.cubic) };

const GOLD_DARK = "#C9A227";
const GOLD_LIGHT = "#A4811C";

interface ItemDef {
  key: string;
  label: string;
  icon: IconName;
  route?: string;
  badge?: string;
  soon?: boolean;
}

interface SectionDef {
  title: string;
  items: ItemDef[];
}

function buildSections(activeAlertCount: number, inboxUnread: number): SectionDef[] {
  return [
    {
      title: "Araçlar",
      items: [
        { key: "converter", label: "Çevirici", icon: "swap-horizontal", route: "/tools/converter" },
        { key: "gold-calc", label: "Saf Altın Hesaplayıcı", icon: "diamond", route: "/tools/gold-calc" },
        { key: "compare", label: "Karşılaştırma", icon: "swap-vertical", route: "/tools/compare" },
      ],
    },
    {
      title: "İçerik",
      items: [
        { key: "news", label: "Haberler", icon: "newspaper-outline", route: "/news" },
        { key: "parities", label: "Pariteler", icon: "trending-up", route: "/parities" },
      ],
    },
    {
      title: "Bildirimler",
      items: [
        {
          key: "inbox",
          label: "Gelen Kutusu",
          icon: "mail-outline",
          route: "/inbox",
          badge: inboxUnread > 0 ? String(inboxUnread > 99 ? "99+" : inboxUnread) : undefined,
        },
        {
          key: "alerts",
          label: "Alarmlar",
          icon: "notifications-outline",
          route: "/alerts",
          badge: activeAlertCount > 0 ? String(activeAlertCount) : undefined,
        },
      ],
    },
    {
      title: "Ayarlar",
      items: [
        { key: "settings", label: "Bildirimler & Tercihler", icon: "grid-outline", route: "/settings" },
        ...(Platform.OS === "android"
          ? [{ key: "widget", label: "Widget Ayarları", icon: "apps-outline" as IconName, route: "/settings/widget" }]
          : []),
        { key: "theme", label: "Tema", icon: "flame-outline", route: "/settings/theme" },
      ],
    },
    {
      title: "Yasal",
      items: [
        { key: "disclaimer", label: "Yasal Uyarı", icon: "alert-circle", route: "/legal/disclaimer" },
        { key: "privacy", label: "KVKK Aydınlatma Metni", icon: "shield-outline", route: "/legal/privacy" },
      ],
    },
  ];
}

export function MenuDrawer() {
  const colors = useColors();
  const { effective } = useTheme();
  const isDark = effective === "dark";
  const insets = useSafeAreaInsets();
  const { isOpen, close } = useDrawer();
  const { alerts, inboxUnread } = useApp();
  const pathname = usePathname();

  // Editorial theme tokens
  const t = useMemo(() => {
    if (isDark) {
      return {
        bg: "#0B1322",
        headerGradient: ["#14223C", "#0B1322"] as const,
        headerBorder: "rgba(201,162,39,0.18)",
        text: "#F4ECD3",
        textMuted: "rgba(232,238,247,0.92)",
        textSubtle: "rgba(232,238,247,0.55)",
        iconBorder: "rgba(232,238,247,0.14)",
        iconColor: "rgba(232,238,247,0.78)",
        pressed: "rgba(255,255,255,0.04)",
        divider: "rgba(232,238,247,0.08)",
        chevron: "rgba(232,238,247,0.32)",
        gold: GOLD_DARK,
        goldTint: "rgba(201,162,39,0.06)",
        logo: LOGO_DARK,
      };
    }
    return {
      bg: "#FBF9F4",
      headerGradient: ["#FFFFFF", "#F2EBDB"] as const,
      headerBorder: "rgba(164,129,28,0.32)",
      text: "#0B1F3A",
      textMuted: "rgba(11,31,58,0.92)",
      textSubtle: "rgba(11,31,58,0.55)",
      iconBorder: "rgba(11,31,58,0.14)",
      iconColor: "rgba(11,31,58,0.72)",
      pressed: "rgba(11,31,58,0.05)",
      divider: "rgba(11,31,58,0.08)",
      chevron: "rgba(11,31,58,0.30)",
      gold: GOLD_LIGHT,
      goldTint: "rgba(164,129,28,0.08)",
      logo: LOGO_LIGHT,
    };
  }, [isDark]);

  // 0 = closed, 1 = fully open
  const progress = useSharedValue(0);
  const dragX = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      dragX.value = 0;
      progress.value = withSpring(1, SPRING);
    } else {
      progress.value = withTiming(0, TIMING);
    }
  }, [isOpen, progress, dragX]);

  useEffect(() => {
    if (Platform.OS !== "android" || !isOpen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [isOpen, close]);

  const effectiveStyle = useAnimatedStyle(() => {
    const dragProgress = dragX.value / DRAWER_W;
    const v = Math.max(0, Math.min(1, progress.value + dragProgress));
    return {
      transform: [{ translateX: interpolate(v, [0, 1], [-DRAWER_W - 24, 0]) }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    const dragProgress = dragX.value / DRAWER_W;
    const v = Math.max(0, Math.min(1, progress.value + dragProgress));
    return { opacity: v * 0.5 };
  });

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .failOffsetY([-20, 20])
        .onUpdate((e) => {
          if (e.translationX < 0) {
            dragX.value = e.translationX;
          } else {
            dragX.value = e.translationX * 0.15;
          }
        })
        .onEnd((e) => {
          const fast = e.velocityX < -700;
          const past = e.translationX < -DRAWER_W * 0.3;
          if (fast || past) {
            progress.value = withTiming(0, TIMING, (finished) => {
              if (finished) runOnJS(close)();
            });
            dragX.value = 0;
          } else {
            dragX.value = withSpring(0, SPRING);
          }
        }),
    [close, dragX, progress]
  );

  const handleNavigate = (route?: string) => {
    Haptics.selectionAsync().catch(() => {});
    if (!route) return;
    progress.value = withTiming(0, TIMING, (finished) => {
      if (finished) runOnJS(close)();
    });
    setTimeout(() => router.push(route as never), 70);
  };

  const activeAlertCount = alerts.filter((a) => a.active && !a.triggered).length;
  const sections = buildSections(activeAlertCount, inboxUnread);

  return (
    <View
      pointerEvents={isOpen ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, { zIndex: 999 }]}
    >
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]} />
        )}
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* Drawer panel */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: DRAWER_W,
              backgroundColor: t.bg,
              shadowColor: "#000",
              shadowOpacity: 0.28,
              shadowRadius: 28,
              shadowOffset: { width: 6, height: 0 },
              elevation: 24,
            },
            effectiveStyle,
          ]}
        >
          {/* Brand header — logo only, gold hairline rule */}
          <LinearGradient
            colors={t.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: insets.top + 18,
              paddingBottom: 22,
              paddingHorizontal: 22,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: t.headerBorder,
            }}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Image
                source={t.logo}
                style={{ width: 160, height: 44 }}
                resizeMode="contain"
              />
            </View>

            {/* Gold hairline rule */}
            <View
              style={{
                position: "absolute",
                left: 28,
                right: 28,
                bottom: 0,
                height: StyleSheet.hairlineWidth * 2,
                backgroundColor: t.gold,
                opacity: 0.6,
              }}
            />

            {/* Subtle drag handle hint */}
            <View
              style={{
                position: "absolute",
                right: 6,
                top: insets.top + 28,
                width: 3,
                height: 28,
                borderRadius: 2,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(11,31,58,0.18)",
              }}
            />
          </LinearGradient>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 6, paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((section, sIdx) => (
              <Animated.View
                key={section.title}
                entering={isOpen ? FadeInLeft.delay(80 + sIdx * 40).duration(280) : undefined}
                style={{ marginBottom: 4 }}
              >
                {/* Editorial section header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 22,
                    paddingTop: 18,
                    paddingBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Inter_700Bold",
                      color: t.gold,
                      letterSpacing: 3,
                      marginRight: 10,
                    }}
                  >
                    {String(sIdx + 1).padStart(2, "0")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "PlayfairDisplay_600SemiBold_Italic",
                      color: t.textSubtle,
                      letterSpacing: 2.6,
                      textTransform: "uppercase",
                      marginRight: 12,
                    }}
                  >
                    {section.title}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: t.divider,
                    }}
                  />
                </View>

                {section.items.map((item) => {
                  const isActive = !!item.route && pathname === item.route;
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => handleNavigate(item.route)}
                      style={({ pressed }) => [
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 22,
                          paddingVertical: 12,
                          backgroundColor: pressed ? t.pressed : "transparent",
                          overflow: "hidden",
                        },
                      ]}
                    >
                      {/* Active gold rule */}
                      {isActive ? (
                        <View
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 8,
                            bottom: 8,
                            width: 2,
                            backgroundColor: t.gold,
                          }}
                        />
                      ) : null}

                      {/* Hairline square icon frame */}
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          borderWidth: StyleSheet.hairlineWidth * 1.5,
                          borderColor: isActive ? t.gold : t.iconBorder,
                          backgroundColor: isActive ? t.goldTint : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 14,
                        }}
                      >
                        <Icon
                          name={item.icon}
                          size={18}
                          color={isActive ? t.gold : t.iconColor}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontFamily: isActive ? "Inter_700Bold" : "Inter_500Medium",
                            color: isActive ? t.text : t.textMuted,
                            letterSpacing: -0.2,
                          }}
                        >
                          {item.label}
                        </Text>
                      </View>

                      {item.badge ? (
                        <View
                          style={{
                            minWidth: 22,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 2,
                            borderWidth: StyleSheet.hairlineWidth * 1.5,
                            borderColor: t.gold,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: t.gold,
                              fontSize: 11,
                              fontFamily: "PlayfairDisplay_700Bold",
                              letterSpacing: 0.6,
                            }}
                          >
                            {item.badge}
                          </Text>
                        </View>
                      ) : null}

                      {item.soon ? (
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 2,
                            borderWidth: StyleSheet.hairlineWidth,
                            borderColor: t.iconBorder,
                            marginRight: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              fontFamily: "Inter_700Bold",
                              color: t.textSubtle,
                              letterSpacing: 1.2,
                            }}
                          >
                            YAKINDA
                          </Text>
                        </View>
                      ) : null}

                      <Icon name="chevron-forward" size={14} color={t.chevron} />
                    </Pressable>
                  );
                })}
              </Animated.View>
            ))}

            {/* Footer signature — gold rule + uppercase + serif italic */}
            <View
              style={{
                paddingHorizontal: 22,
                paddingTop: 26,
                paddingBottom: 6,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 32,
                  height: StyleSheet.hairlineWidth * 2,
                  backgroundColor: t.gold,
                  opacity: 0.55,
                  marginBottom: 14,
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Inter_700Bold",
                  color: t.textSubtle,
                  letterSpacing: 4,
                }}
              >
                ÇARŞI PİYASA
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "PlayfairDisplay_500Medium_Italic",
                  color: t.textSubtle,
                  marginTop: 4,
                  opacity: 0.85,
                  letterSpacing: 0.3,
                }}
              >
                Versiyon 1.0 · İstanbul
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </GestureDetector>

      {Platform.OS === "android" && isOpen ? (
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      ) : null}
    </View>
  );
}
