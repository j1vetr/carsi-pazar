import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useDrawer } from "@/contexts/DrawerContext";
import { Icon } from "@/components/Icon";

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
});

function formatDateTR(d: Date) {
  return DATE_FORMATTER.format(d).toUpperCase().replace(".", "");
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function MinimalTopBar({ lastUpdated }: { lastUpdated: Date | null }) {
  const colors = useColors();
  const { effective } = useTheme();
  const insets = useSafeAreaInsets();
  const { open } = useDrawer();
  const isDark = effective === "dark";

  // Live ticking clock so the user sees it stays alive
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const topPadding = Platform.OS === "web" ? 14 : insets.top;
  const date = formatDateTR(now);
  const time = lastUpdated ? formatTime(lastUpdated) : formatTime(now);

  // Logo: in light theme show the dark version (so it reads), in dark theme show the light version.
  const logo = isDark
    ? require("@/assets/images/logo-dark.png")
    : require("@/assets/images/logo-light.png");

  const styles = StyleSheet.create({
    wrap: {
      paddingTop: topPadding,
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    bar: {
      height: 56,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
    },
    leftBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    centerWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
    },
    logo: { width: 138, height: 30 },
    rightWrap: {
      marginLeft: "auto",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    rightStack: { alignItems: "flex-end" },
    dateText: {
      fontSize: 9.5,
      fontFamily: "Inter_700Bold",
      color: colors.mutedForeground,
      letterSpacing: 1.2,
    },
    timeText: {
      fontSize: 12,
      color: colors.foreground,
      fontVariant: ["tabular-nums"],
      marginTop: 2,
      letterSpacing: -0.2,
      fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    },
    bellBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 6,
    },
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <Pressable onPress={open} style={styles.leftBtn} hitSlop={6}>
          <Icon name="menu" size={20} color={colors.foreground} />
        </Pressable>

        <View style={styles.centerWrap}>
          <Image source={logo} style={styles.logo} contentFit="contain" />
        </View>

        <View style={styles.rightWrap}>
          <View style={styles.rightStack}>
            <Text style={styles.dateText}>{date}</Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
