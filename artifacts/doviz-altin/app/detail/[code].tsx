import React, { useState, useCallback } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { AssetIcon } from "@/components/AssetIcon";
import { FullChart } from "@/components/FullChart";

function AddAlertModal({
  visible,
  onClose,
  code,
  nameTR,
  currentPrice,
  type,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  code: string;
  nameTR: string;
  currentPrice: number;
  type: "currency" | "gold";
  colors: any;
}) {
  const { addAlert } = useApp();
  const [targetPrice, setTargetPrice] = useState(currentPrice.toFixed(2));
  const [direction, setDirection] = useState<"above" | "below">("above");
  const insets = useSafeAreaInsets();

  const handleAdd = () => {
    const price = parseFloat(targetPrice);
    if (!price) return;
    addAlert({ type, code, name: code, nameTR, targetPrice: price, direction, active: true, triggered: false });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }}>Fiyat Alarmı</Text>
          <Pressable onPress={onClose}><Ionicons name="close" size={24} color={colors.foreground} /></Pressable>
        </View>
        <View style={{ padding: 20, gap: 20 }}>
          <View>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>YÖN</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setDirection("above")}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: direction === "above" ? colors.rise + "20" : colors.secondary, borderWidth: 1, borderColor: direction === "above" ? colors.rise : colors.border, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
              >
                <Ionicons name="trending-up" size={16} color={direction === "above" ? colors.rise : colors.mutedForeground} />
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: direction === "above" ? colors.rise : colors.mutedForeground }}>Üzerine Çıkınca</Text>
              </Pressable>
              <Pressable
                onPress={() => setDirection("below")}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: direction === "below" ? colors.fall + "20" : colors.secondary, borderWidth: 1, borderColor: direction === "below" ? colors.fall : colors.border, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
              >
                <Ionicons name="trending-down" size={16} color={direction === "below" ? colors.fall : colors.mutedForeground} />
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: direction === "below" ? colors.fall : colors.mutedForeground }}>Altına Düşünce</Text>
              </Pressable>
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>HEDEF FİYAT (₺)</Text>
            <TextInput
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              style={{ backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 14, fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.foreground }}
            />
          </View>
          <View style={{ backgroundColor: colors.secondary, borderRadius: 10, padding: 14 }}>
            <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
              {code} fiyatı ₺{parseFloat(targetPrice || "0").toFixed(2)} seviyesinin {direction === "above" ? "üzerine çıktığında" : "altına düştüğünde"} bildirim alacaksınız.
            </Text>
          </View>
        </View>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }}>
          <Pressable onPress={handleAdd} style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground }}>Alarm Kur</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function DetailScreen() {
  const { code, type } = useLocalSearchParams<{ code: string; type: "currency" | "gold" }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currencies, goldRates, favorites, toggleFavorite, getHistoricalData } = useApp();
  const [period, setPeriod] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1M");
  const [showAlertModal, setShowAlertModal] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const allRates = [...currencies, ...goldRates] as any[];
  const item = allRates.find((r) => r.code === code);

  if (!item) return null;

  const isPositive = item.changePercent >= 0;
  const changeColor = isPositive ? colors.rise : colors.fall;
  const isFav = favorites.includes(code!);
  const histData = getHistoricalData(code!, period);
  const spread = item.sell - item.buy;

  const formatPrice = (p: number) => {
    if (p >= 10000) return p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 10) return p.toFixed(4);
    return p.toFixed(4);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={
          type === "gold"
            ? ["#1A0F00", "#2A1A00"]
            : [colors.background, colors.background]
        }
        style={{ paddingTop: topPadding + 8, paddingHorizontal: 20, paddingBottom: 16 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: -8, marginRight: 8 }}>
            <Ionicons name="arrow-back" size={22} color={type === "gold" ? "#FFD700" : colors.foreground} />
          </Pressable>
          <Text style={{ flex: 1 }} />
          <Pressable onPress={() => toggleFavorite(code!)} style={{ padding: 8 }}>
            <Ionicons
              name={isFav ? "star" : "star-outline"}
              size={22}
              color={isFav ? colors.gold : (type === "gold" ? "#FFD700" : colors.mutedForeground)}
            />
          </Pressable>
          <Pressable onPress={() => setShowAlertModal(true)} style={{ padding: 8 }}>
            <Ionicons name="notifications-outline" size={22} color={type === "gold" ? "#FFD700" : colors.foreground} />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ marginRight: 12 }}>
            <AssetIcon
              code={type === "currency" ? (item.flag ?? code!) : code!}
              type={type ?? "currency"}
              size={48}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: type === "gold" ? "#FFD700" : colors.foreground, letterSpacing: -0.3 }}>
              {code}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: type === "gold" ? "rgba(255,215,0,0.6)" : colors.mutedForeground }}>
              {item.nameTR}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 38, fontFamily: "Inter_700Bold", color: type === "gold" ? "#FFD700" : colors.foreground, marginTop: 16, letterSpacing: -1 }}>
          ₺{formatPrice(item.buy)}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: changeColor + "15", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
            <Ionicons name={isPositive ? "trending-up" : "trending-down"} size={14} color={changeColor} />
            <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: changeColor }}>
              {isPositive ? "+" : ""}{item.changePercent.toFixed(2)}% ({isPositive ? "+" : ""}{item.change.toFixed(2)})
            </Text>
          </View>
          <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: type === "gold" ? "rgba(255,215,0,0.5)" : colors.mutedForeground }}>
            Bugün
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPadding + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <FullChart
            data={histData}
            period={period}
            onPeriodChange={setPeriod}
            currentPrice={item.buy}
          />
        </View>

        <View style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 16, letterSpacing: 0.5 }}>
            FİYAT DETAYLARI
          </Text>
          {[
            { label: "Alış", value: formatPrice(item.buy), color: colors.rise },
            { label: "Satış", value: formatPrice(item.sell), color: colors.fall },
            { label: "Spread (Makas)", value: formatPrice(spread), color: colors.foreground },
            { label: "Önceki Kapanış", value: formatPrice(item.prevClose ?? item.buy - item.change), color: colors.foreground },
            { label: "Değişim (₺)", value: `${isPositive ? "+" : ""}${item.change.toFixed(2)}`, color: changeColor },
            { label: "Değişim (%)", value: `${isPositive ? "+" : ""}${item.changePercent.toFixed(2)}%`, color: changeColor },
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{row.label}</Text>
              <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: row.color }}>{row.value}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => setShowAlertModal(true)}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            backgroundColor: colors.primary,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons name="notifications" size={20} color={colors.primaryForeground} />
          <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground }}>
            Fiyat Alarmı Kur
          </Text>
        </Pressable>
      </ScrollView>

      <AddAlertModal
        visible={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        code={code!}
        nameTR={item.nameTR}
        currentPrice={item.buy}
        type={type ?? "currency"}
        colors={colors}
      />
    </View>
  );
}
