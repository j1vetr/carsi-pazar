import React, { useEffect, useRef } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { haptics } from "@/lib/haptics";

export interface ActionSheetItem {
  key: string;
  label: string;
  icon?: IconName;
  destructive?: boolean;
  disabled?: boolean;
  hint?: string;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  title?: string;
  subtitle?: string;
  items: ActionSheetItem[];
  onClose: () => void;
}

/**
 * Uzun bas bağlam menüsü — alttan kayan eylem listesi.
 * Tek bir noktadan tüm "context menu" deneyimi sağlanır.
 */
export function ActionSheet({ visible, title, subtitle, items, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  // Açılan onPress timer'ı unmount sırasında iptal et: aksi halde kapanan
  // sheet'in üst componenti çoktan unmount olduysa setState/route push hatası
  // oluşabilir.
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (pendingTimer.current) {
        clearTimeout(pendingTimer.current);
        pendingTimer.current = null;
      }
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(160)}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Menüyü kapat"
        />
        <Animated.View
          entering={SlideInDown.duration(220)}
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
              }}
            />
          </View>

          {title || subtitle ? (
            <View style={{ paddingHorizontal: 22, paddingVertical: 8 }}>
              {title ? (
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: "Inter_700Bold",
                    color: colors.foreground,
                    letterSpacing: -0.3,
                  }}
                >
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text
                  style={{
                    fontSize: 12.5,
                    fontFamily: "Inter_500Medium",
                    color: colors.mutedForeground,
                    marginTop: 3,
                  }}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={{ paddingHorizontal: 12, paddingTop: 4 }}>
            {items.map((item) => {
              const tint = item.destructive ? colors.fall : colors.foreground;
              return (
                <Pressable
                  key={item.key}
                  disabled={item.disabled}
                  onPress={() => {
                    haptics.select();
                    onClose();
                    // Kapanış animasyonuna nefes ver. Timer ref'te tutulur,
                    // unmount cleanup'ı sahipsiz callback'i temizler.
                    if (pendingTimer.current) clearTimeout(pendingTimer.current);
                    pendingTimer.current = setTimeout(() => {
                      pendingTimer.current = null;
                      item.onPress();
                    }, 60);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityHint={item.hint}
                  accessibilityState={{ disabled: !!item.disabled }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    paddingVertical: 13,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    opacity: item.disabled ? 0.4 : 1,
                    backgroundColor: pressed ? colors.secondary : "transparent",
                  })}
                >
                  {item.icon ? (
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor:
                          (item.destructive ? colors.fall : colors.foreground) + "12",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name={item.icon} size={18} color={tint} />
                    </View>
                  ) : null}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "Inter_600SemiBold",
                        color: tint,
                        letterSpacing: -0.2,
                      }}
                    >
                      {item.label}
                    </Text>
                    {item.hint ? (
                      <Text
                        style={{
                          fontSize: 11.5,
                          fontFamily: "Inter_500Medium",
                          color: colors.mutedForeground,
                          marginTop: 2,
                        }}
                      >
                        {item.hint}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={onClose}
            style={{
              marginTop: 8,
              marginHorizontal: 12,
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: colors.secondary,
              alignItems: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel="Kapat"
          >
            <Text
              style={{
                fontSize: 14.5,
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
              }}
            >
              Kapat
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
