import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon as NativeTabIcon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useDrawer } from "@/contexts/DrawerContext";

function NativeTabLayout({ openDrawer }: { openDrawer: () => void }) {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabIcon sf={{ default: "chart.line.uptrend.xyaxis", selected: "chart.line.uptrend.xyaxis" }} />
        <Label>Döviz</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="gold">
        <NativeTabIcon sf={{ default: "circle.hexagongrid", selected: "circle.hexagongrid.fill" }} />
        <Label>Altın</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="portfolio">
        <NativeTabIcon sf={{ default: "briefcase", selected: "briefcase.fill" }} />
        <Label>Portföy</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favorites">
        <NativeTabIcon sf={{ default: "star", selected: "star.fill" }} />
        <Label>Favoriler</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="menu"
        options={{}}
      >
        <NativeTabIcon sf={{ default: "line.3.horizontal", selected: "line.3.horizontal" }} />
        <Label>Menü</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout({ openDrawer }: { openDrawer: () => void }) {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const isAndroid = Platform.OS === "android";
  const insets = useSafeAreaInsets();

  const tabBarHeight = isWeb ? 84 : (60 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom));

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: tabBarHeight,
          paddingBottom: isWeb ? 24 : (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_500Medium",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Döviz",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="chart.line.uptrend.xyaxis" tintColor={color} size={size} />
            ) : (
              <Icon name="trending-up" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="gold"
        options={{
          title: "Altın",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="circle.hexagongrid.fill" tintColor={color} size={size} />
            ) : (
              <Icon name="diamond" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portföy",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="briefcase.fill" tintColor={color} size={size} />
            ) : (
              <Icon name="briefcase" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoriler",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="star.fill" tintColor={color} size={size} />
            ) : (
              <Icon name="star" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menü",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="line.3.horizontal" tintColor={color} size={size} />
            ) : (
              <Icon name="ellipsis-horizontal" size={size} color={color} />
            ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Haptics.selectionAsync().catch(() => {});
            openDrawer();
          },
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const { open } = useDrawer();
  if (Platform.OS !== "web" && isLiquidGlassAvailable()) {
    return <NativeTabLayout openDrawer={open} />;
  }
  return <ClassicTabLayout openDrawer={open} />;
}
