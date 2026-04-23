import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { formatSymbolName } from "@/lib/symbolDescriptions";

export function HoldingActionSheet({
  visible,
  onClose,
  code,
  onBuy,
  onSell,
  onDeleteAll,
  canSell,
}: {
  visible: boolean;
  onClose: () => void;
  code: string | null;
  onBuy: () => void;
  onSell: () => void;
  onDeleteAll: () => void;
  canSell: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  if (!code) return null;

  const actions: {
    key: string;
    label: string;
    icon: string;
    color: string;
    onPress: () => void;
    disabled?: boolean;
    subtitle?: string;
  }[] = [
    {
      key: "buy",
      label: "Alım Ekle",
      icon: "add-circle",
      color: colors.rise,
      onPress: onBuy,
      subtitle: "Yeni lot ekle, ortalama maliyet güncellensin",
    },
    {
      key: "sell",
      label: "Satış Kaydet",
      icon: "remove-circle",
      color: colors.fall,
      onPress: onSell,
      disabled: !canSell,
      subtitle: canSell
        ? "Gerçekleşmiş kâr/zarar hesaplanır"
        : "Satılacak mevcut bakiye yok",
    },
    {
      key: "delete",
      label: "Varlığı Temizle",
      icon: "trash",
      color: colors.mutedForeground,
      onPress: onDeleteAll,
      subtitle: "Bu varlığa ait tüm işlemleri sil",
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(180)}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
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
          <View style={{ alignItems: "center", marginBottom: 6 }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
              }}
            />
          </View>
          <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter_700Bold",
                color: colors.mutedForeground,
                letterSpacing: 1.1,
              }}
            >
              İŞLEM
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
                letterSpacing: -0.4,
                marginTop: 2,
              }}
            >
              {formatSymbolName(code)}
            </Text>
          </View>

          <View style={{ paddingHorizontal: 12, paddingBottom: 6, gap: 4 }}>
            {actions.map((a) => (
              <Pressable
                key={a.key}
                disabled={a.disabled}
                onPress={() => {
                  a.onPress();
                }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  backgroundColor: pressed ? colors.secondary : "transparent",
                  opacity: a.disabled ? 0.45 : 1,
                })}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: a.color + "18",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={a.icon as any} size={20} color={a.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "Inter_700Bold",
                      color: colors.foreground,
                      letterSpacing: -0.2,
                    }}
                  >
                    {a.label}
                  </Text>
                  {a.subtitle ? (
                    <Text
                      style={{
                        fontSize: 11.5,
                        fontFamily: "Inter_500Medium",
                        color: colors.mutedForeground,
                        marginTop: 2,
                      }}
                    >
                      {a.subtitle}
                    </Text>
                  ) : null}
                </View>
                <Icon name="chevron-forward" size={18} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
