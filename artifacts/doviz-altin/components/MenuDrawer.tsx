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
import { useDrawer } from "@/contexts/DrawerContext";
import { useApp } from "@/contexts/AppContext";

const LOGO = require("../assets/images/news-placeholder.png");
const SCREEN_W = Dimensions.get("window").width;
const DRAWER_W = Math.min(Math.round(SCREEN_W * 0.84), 340);

const SPRING = { damping: 26, stiffness: 220, mass: 0.9 };
const TIMING = { duration: 240, easing: Easing.out(Easing.cubic) };

interface ItemDef {
  key: string;
  label: string;
  icon: IconName;
  color: string;
  route?: string;
  badge?: string;
  soon?: boolean;
}

interface SectionDef {
  title: string;
  items: ItemDef[];
}

function buildSections(activeAlertCount: number): SectionDef[] {
  return [
    {
      title: "ARAÇLAR",
      items: [
        { key: "converter", label: "Çevirici", icon: "swap-horizontal", color: "#3B82F6", route: "/tools/converter" },
        { key: "gold-calc", label: "Saf Altın Hesaplayıcı", icon: "diamond", color: "#F59E0B", route: "/tools/gold-calc" },
        { key: "compare", label: "Karşılaştırma", icon: "swap-vertical", color: "#06B6D4", route: "/tools/compare", soon: true },
      ],
    },
    {
      title: "İÇERİK",
      items: [
        { key: "news", label: "Haberler", icon: "newspaper-outline", color: "#8B5CF6", route: "/news" },
        { key: "parities", label: "Pariteler", icon: "trending-up", color: "#0EA5E9", route: "/parities" },
      ],
    },
    {
      title: "BİLDİRİMLER",
      items: [
        {
          key: "alerts",
          label: "Alarmlar",
          icon: "notifications-outline",
          color: "#EF4444",
          route: "/alerts",
          badge: activeAlertCount > 0 ? String(activeAlertCount) : undefined,
        },
      ],
    },
    {
      title: "AYARLAR",
      items: [
        { key: "settings", label: "Bildirimler & Tercihler", icon: "grid-outline", color: "#10B981", route: "/settings" },
        { key: "theme", label: "Tema", icon: "flame-outline", color: "#EC4899", route: "/settings/theme", soon: true },
      ],
    },
    {
      title: "HAKKINDA",
      items: [
        { key: "about", label: "Hakkında", icon: "alert-circle", color: "#64748B", route: "/about" },
      ],
    },
  ];
}

export function MenuDrawer() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isOpen, close } = useDrawer();
  const { alerts } = useApp();
  const pathname = usePathname();

  // 0 = closed (off-screen left), 1 = fully open
  const progress = useSharedValue(0);
  // Drag offset while dragging (negative values = pulled left)
  const dragX = useSharedValue(0);

  // Drive animation when isOpen changes
  useEffect(() => {
    if (isOpen) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      dragX.value = 0;
      progress.value = withSpring(1, SPRING);
    } else {
      progress.value = withTiming(0, TIMING);
    }
  }, [isOpen, progress, dragX]);

  // Android hardware back closes drawer first
  useEffect(() => {
    if (Platform.OS !== "android" || !isOpen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [isOpen, close]);

  // Compose progress + drag → effective open value [0..1]
  const effective = useAnimatedStyle(() => {
    const dragProgress = dragX.value / DRAWER_W; // negative when dragging to close
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

  // Pan gesture: drag drawer left to close
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .failOffsetY([-20, 20])
        .onUpdate((e) => {
          if (e.translationX < 0) {
            dragX.value = e.translationX;
          } else {
            dragX.value = e.translationX * 0.15; // resist over-pull right
          }
        })
        .onEnd((e) => {
          const fast = e.velocityX < -700;
          const past = e.translationX < -DRAWER_W * 0.3;
          if (fast || past) {
            // close
            progress.value = withTiming(0, TIMING, (finished) => {
              if (finished) runOnJS(close)();
            });
            dragX.value = 0;
          } else {
            // snap back
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
  const sections = buildSections(activeAlertCount);

  return (
    <View
      pointerEvents={isOpen ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, { zIndex: 999 }]}
    >
      {/* Backdrop — blur on iOS, solid dim on Android */}
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]} />
        )}
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* Drawer panel — gesture wrapped */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: DRAWER_W,
              backgroundColor: colors.background,
              shadowColor: "#000",
              shadowOpacity: 0.28,
              shadowRadius: 28,
              shadowOffset: { width: 6, height: 0 },
              elevation: 24,
            },
            effective,
          ]}
        >
          {/* Brand header — premium gradient hero */}
          <LinearGradient
            colors={["#0B1A33", "#0B3D91"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: insets.top + 18,
              paddingBottom: 22,
              paddingHorizontal: 22,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                <Image source={LOGO} style={{ width: 32, height: 32 }} resizeMode="contain" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.4 }}>
                  Çarşı Piyasa
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2, letterSpacing: -0.1 }}>
                  Anlık Piyasa Takibi
                </Text>
              </View>
            </View>

            {/* Subtle drag handle hint */}
            <View
              style={{
                position: "absolute",
                right: 6,
                top: insets.top + 36,
                width: 3,
                height: 28,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.22)",
              }}
            />
          </LinearGradient>

          {/* Items — staggered fade-in */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((section, sIdx) => (
              <Animated.View
                key={section.title}
                entering={isOpen ? FadeInLeft.delay(80 + sIdx * 40).duration(280) : undefined}
                style={{ marginBottom: 6 }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_700Bold",
                    color: colors.mutedForeground,
                    letterSpacing: 1.3,
                    paddingHorizontal: 22,
                    paddingTop: 14,
                    paddingBottom: 8,
                  }}
                >
                  {section.title}
                </Text>
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
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          marginHorizontal: 8,
                          borderRadius: 12,
                          backgroundColor: isActive
                            ? item.color + "14"
                            : pressed
                            ? colors.secondary
                            : "transparent",
                          overflow: "hidden",
                        },
                      ]}
                    >
                      {/* Active vertical accent bar */}
                      {isActive ? (
                        <View
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 8,
                            bottom: 8,
                            width: 3,
                            borderTopRightRadius: 2,
                            borderBottomRightRadius: 2,
                            backgroundColor: item.color,
                          }}
                        />
                      ) : null}
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: item.color + "1A",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Icon name={item.icon} size={18} color={item.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontFamily: isActive ? "Inter_700Bold" : "Inter_600SemiBold",
                            color: colors.foreground,
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
                            height: 22,
                            borderRadius: 11,
                            paddingHorizontal: 7,
                            backgroundColor: "#EF4444",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 6,
                          }}
                        >
                          <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" }}>
                            {item.badge}
                          </Text>
                        </View>
                      ) : null}
                      {item.soon ? (
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 8,
                            backgroundColor: colors.secondary,
                            marginRight: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontFamily: "Inter_700Bold",
                              color: colors.mutedForeground,
                              letterSpacing: 0.4,
                            }}
                          >
                            YAKINDA
                          </Text>
                        </View>
                      ) : null}
                      <Icon name="chevron-forward" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  );
                })}
              </Animated.View>
            ))}

            {/* Footer signature */}
            <View
              style={{
                paddingHorizontal: 22,
                paddingTop: 22,
                paddingBottom: 6,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: StyleSheet.hairlineWidth * 2,
                  backgroundColor: colors.border,
                  marginBottom: 14,
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_600SemiBold",
                  color: colors.mutedForeground,
                  letterSpacing: 0.2,
                }}
              >
                Çarşı Piyasa
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Inter_500Medium",
                  color: colors.mutedForeground,
                  marginTop: 2,
                  opacity: 0.7,
                }}
              >
                Anlık piyasa takibinde Türkiye'nin tercihi
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
