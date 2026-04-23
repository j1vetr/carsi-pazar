import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { Icon, type IconName } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { haptics } from "@/lib/haptics";

export interface SwipeAction {
  label: string;
  icon: IconName;
  color: string;        // background
  textColor?: string;   // foreground (default white)
  onPress: () => void;
  destructive?: boolean;
}

interface Props {
  children: React.ReactNode;
  rightActions?: SwipeAction[];
  leftActions?: SwipeAction[];
}

/**
 * react-native-gesture-handler Swipeable üstüne ince bir wrapper.
 * Sağ/sol kaydırmada eylem çubukları çıkar; eylem dokunulduğunda
 * haptic verilir, satır tekrar kapanır.
 */
export function SwipeableRow({ children, rightActions, leftActions }: Props) {
  const ref = useRef<Swipeable>(null);

  const renderActions = (actions: SwipeAction[] | undefined, side: "left" | "right") => {
    if (!actions || actions.length === 0) return undefined;
    return () => (
      <View style={[styles.actionRow, side === "left" ? styles.leftRow : styles.rightRow]}>
        {actions.map((a) => (
          <ActionButton
            key={a.label}
            action={a}
            onTrigger={() => {
              if (a.destructive) haptics.warning();
              else haptics.tap();
              ref.current?.close();
              a.onPress();
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <Swipeable
      ref={ref}
      friction={1.6}
      overshootRight={false}
      overshootLeft={false}
      renderRightActions={renderActions(rightActions, "right")}
      renderLeftActions={renderActions(leftActions, "left")}
    >
      {children}
    </Swipeable>
  );
}

function ActionButton({ action, onTrigger }: { action: SwipeAction; onTrigger: (e: GestureResponderEvent) => void }) {
  const colors = useColors();
  return (
    <RectButton
      onPress={onTrigger as any}
      style={[styles.action, { backgroundColor: action.color }]}
      accessibilityLabel={action.label}
    >
      <Icon name={action.icon} size={18} color={action.textColor ?? "#fff"} />
      <Text style={[styles.actionLabel, { color: action.textColor ?? "#fff" }]} numberOfLines={1}>
        {action.label}
      </Text>
    </RectButton>
  );
}

// Web fallback — gesture-handler RectButton mevcut, ancak eski cihazlarda
// android_ripple çalışmaz. Pressable koşulsuz import ediliyor sadece tipler için.
void Pressable; void useColors;

const styles = StyleSheet.create({
  actionRow: { flexDirection: "row" },
  rightRow: { justifyContent: "flex-end" },
  leftRow: { justifyContent: "flex-start" },
  action: {
    width: 88,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.4,
  },
});
