import React, { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { Icon, type IconName } from "@/components/Icon";
import { haptics } from "@/lib/utils/haptics";

export interface SwipeAction {
  label: string;
  icon: IconName;
  color: string;
  textColor?: string;
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
 * Sağ/sol kaydırmada eylem çubukları çıkar. Eylemler `accessibilityActions`
 * olarak Pressable'a da yansır → ekran okuyucu kullanıcıları VoiceOver/
 * TalkBack üzerinden de tetikleyebilir.
 */
export function SwipeableRow({ children, rightActions, leftActions }: Props) {
  const ref = useRef<Swipeable>(null);

  const trigger = (a: SwipeAction) => {
    if (a.destructive) haptics.warning();
    else haptics.tap();
    ref.current?.close();
    a.onPress();
  };

  const renderActions = (actions: SwipeAction[] | undefined, side: "left" | "right") => {
    if (!actions || actions.length === 0) return undefined;
    return () => (
      <View style={[styles.actionRow, side === "left" ? styles.leftRow : styles.rightRow]}>
        {actions.map((a) => (
          <ActionButton key={a.label} action={a} onTrigger={() => trigger(a)} />
        ))}
      </View>
    );
  };

  // Erişilebilirlik için tüm aksiyonları tek listede topla; ekran
  // okuyucu kullanıcısı kaydırma gestürünü yapamayabilir.
  const a11yActions = [...(leftActions ?? []), ...(rightActions ?? [])].map((a) => ({
    name: a.label,
    label: a.label,
  }));

  return (
    <Swipeable
      ref={ref}
      friction={1.6}
      overshootRight={false}
      overshootLeft={false}
      renderRightActions={renderActions(rightActions, "right")}
      renderLeftActions={renderActions(leftActions, "left")}
    >
      <View
        accessible
        accessibilityRole="button"
        accessibilityActions={a11yActions}
        onAccessibilityAction={(e) => {
          const all = [...(leftActions ?? []), ...(rightActions ?? [])];
          const target = all.find((a) => a.label === e.nativeEvent.actionName);
          if (target) trigger(target);
        }}
      >
        {children}
      </View>
    </Swipeable>
  );
}

function ActionButton({ action, onTrigger }: { action: SwipeAction; onTrigger: () => void }) {
  return (
    <RectButton
      onPress={onTrigger}
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
