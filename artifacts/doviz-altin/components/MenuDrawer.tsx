import React, { useEffect } from "react";
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
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
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
const ANIM = { duration: 260, easing: Easing.out(Easing.cubic) };

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

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, ANIM);
  }, [isOpen, progress]);

  // Android back button → close drawer
  useEffect(() => {
    if (Platform.OS !== "android" || !isOpen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [isOpen, close]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.55,
    pointerEvents: progress.value > 0.05 ? "auto" : "none",
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-DRAWER_W - 24, 0]) },
    ],
  }));

  const handleNavigate = (route?: string, soon?: boolean) => {
    Haptics.selectionAsync().catch(() => {});
    if (soon) {
      // gentle decline feedback; route still exists with placeholder
    }
    if (route) {
      // close first, then navigate after micro-delay so animation feels right
      progress.value = withTiming(0, ANIM, (finished) => {
        if (finished) runOnJS(close)();
      });
      setTimeout(() => {
        router.push(route as never);
      }, 60);
    }
  };

  const activeAlertCount = alerts.filter((a) => a.active && !a.triggered).length;
  const sections = buildSections(activeAlertCount);

  return (
    <View
      pointerEvents={isOpen ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, { zIndex: 999 }]}
    >
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* Drawer panel */}
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
            shadowOpacity: 0.25,
            shadowRadius: 24,
            shadowOffset: { width: 4, height: 0 },
            elevation: 20,
          },
          drawerStyle,
        ]}
      >
        {/* Brand header — gradient hero */}
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
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              <Image source={LOGO} style={{ width: 32, height: 32 }} resizeMode="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontFamily: "Inter_700Bold",
                  letterSpacing: -0.4,
                }}
              >
                Çarşı Piyasa
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.72)",
                  fontSize: 12,
                  fontFamily: "Inter_500Medium",
                  marginTop: 2,
                  letterSpacing: -0.1,
                }}
              >
                Anlık Piyasa Takibi
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Items */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <View key={section.title} style={{ marginBottom: 8 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_700Bold",
                  color: colors.mutedForeground,
                  letterSpacing: 1.2,
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
                    onPress={() => handleNavigate(item.route, item.soon)}
                    style={({ pressed }) => [
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        marginHorizontal: 8,
                        borderRadius: 12,
                        backgroundColor: isActive ? item.color + "14" : pressed ? colors.secondary : "transparent",
                      },
                    ]}
                  >
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
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {Platform.OS === "android" && isOpen ? (
        <StatusBar backgroundColor="rgba(0,0,0,0.55)" barStyle="light-content" />
      ) : null}
    </View>
  );
}
