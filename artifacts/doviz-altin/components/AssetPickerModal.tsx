import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";

export interface PickerItem {
  code: string;
  label: string;
  sub?: string;
  type: "currency" | "gold";
}

export interface PickerSection {
  title: string;
  items: PickerItem[];
}

interface AssetPickerModalProps {
  visible: boolean;
  title: string;
  sections: PickerSection[];
  selectedCode?: string;
  onSelect: (code: string, type: "currency" | "gold") => void;
  onClose: () => void;
}

export function AssetPickerModal({
  visible,
  title,
  sections,
  selectedCode,
  onSelect,
  onClose,
}: AssetPickerModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (it) =>
            it.code.toLowerCase().includes(q) ||
            it.label.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [sections, query]);

  const handlePick = (item: PickerItem) => {
    Haptics.selectionAsync().catch(() => {});
    onSelect(item.code, item.type);
    onClose();
  };

  const topPad = Platform.OS === "web" ? 24 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom + 18;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: topPad }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: 0.6, textTransform: "uppercase" }}>
              Kart Düzenle
            </Text>
            <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 2, letterSpacing: -0.5 }}>
              {title}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            style={({ pressed }) => [{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: colors.secondary,
              alignItems: "center", justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Icon name="close" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={{
          marginHorizontal: 20, marginBottom: 12,
          flexDirection: "row", alignItems: "center", gap: 8,
          backgroundColor: colors.secondary, borderRadius: 12,
          paddingHorizontal: 12, paddingVertical: Platform.OS === "ios" ? 11 : 4,
        }}>
          <Icon name="search" size={15} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ara..."
            placeholderTextColor={colors.mutedForeground}
            style={{ flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground }}
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Icon name="close" size={15} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                Sonuç bulunamadı.
              </Text>
            </View>
          ) : null}
          {filtered.map((section) => (
            <View key={section.title} style={{ marginBottom: 18 }}>
              <Text style={{
                fontSize: 11, fontFamily: "Inter_700Bold",
                color: colors.mutedForeground, letterSpacing: 0.8,
                paddingHorizontal: 20, marginBottom: 6,
              }}>
                {section.title.toUpperCase()}
              </Text>
              <View style={{
                marginHorizontal: 16, backgroundColor: colors.card, borderRadius: 14,
                borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
                overflow: "hidden",
              }}>
                {section.items.map((item, idx) => {
                  const isSelected = item.code === selectedCode;
                  return (
                    <Pressable
                      key={`${item.type}-${item.code}`}
                      onPress={() => handlePick(item)}
                      style={({ pressed }) => [{
                        flexDirection: "row", alignItems: "center", gap: 12,
                        paddingHorizontal: 14, paddingVertical: 12,
                        borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                        borderTopColor: colors.border,
                        backgroundColor: pressed ? colors.secondary : "transparent",
                      }]}
                    >
                      <View style={{
                        width: 32, height: 32, borderRadius: 8,
                        backgroundColor: isSelected ? colors.primary + "20" : colors.secondary,
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <Text style={{
                          fontSize: 10, fontFamily: "Inter_700Bold",
                          color: isSelected ? colors.primary : colors.mutedForeground,
                          letterSpacing: -0.2,
                        }}>
                          {item.code.slice(0, 4)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
                          {item.label}
                        </Text>
                        {item.sub ? (
                          <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 1 }}>
                            {item.sub}
                          </Text>
                        ) : null}
                      </View>
                      {isSelected ? (
                        <Icon name="checkmark-circle" size={20} color={colors.primary} />
                      ) : (
                        <Icon name="chevron-forward" size={16} color={colors.mutedForeground} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
