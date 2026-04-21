import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp, PriceAlert } from "@/contexts/AppContext";
import { formatSymbolName } from "@/lib/symbolDescriptions";

function AlertCard({ alert, colors, onDelete }: { alert: PriceAlert; colors: any; onDelete: () => void }) {
  const directionColor = alert.direction === "above" ? colors.rise : colors.fall;
  const directionIcon = alert.direction === "above" ? "trending-up" : "trending-down";

  const formatPrice = (p: number) => {
    if (p >= 10000) return p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 10) return p.toFixed(4);
    return p.toFixed(4);
  };

  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: alert.triggered ? colors.primary + "50" : colors.border,
      borderLeftWidth: 3,
      borderLeftColor: directionColor,
      opacity: alert.active ? 1 : 0.6,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground }}>{formatSymbolName(alert.code)}</Text>
            <View style={{ backgroundColor: directionColor + "15", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Icon name={directionIcon} size={11} color={directionColor} />
              <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: directionColor }}>
                {alert.direction === "above" ? "Üzerine çıkınca" : "Altına düşünce"}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{alert.nameTR}</Text>
          <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 6 }}>
            ₺{formatPrice(alert.targetPrice)}
          </Text>
        </View>
        <Pressable onPress={onDelete} style={{ padding: 8 }}>
          <Icon name="trash-outline" size={20} color={colors.fall} />
        </Pressable>
      </View>
      {alert.triggered && (
        <View style={{ marginTop: 10, backgroundColor: colors.primary + "15", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="checkmark-circle" size={14} color={colors.primary} />
          <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.primary }}>Alarm tetiklendi</Text>
        </View>
      )}
    </View>
  );
}

function EmptyAlerts({ colors }: { colors: any }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
      <Icon name="notifications-off-outline" size={64} color={colors.mutedForeground} />
      <Text style={{ fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 20, textAlign: "center" }}>
        Aktif Alarm Yok
      </Text>
      <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
        Döviz veya altın fiyatlarını takip etmek için alarm kurun. Hedef fiyata ulaştığında bildirim alacaksınız.
      </Text>
      <Pressable
        onPress={() => router.back()}
        style={{ marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 25 }}
      >
        <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground }}>
          Fiyatlara Dön
        </Text>
      </Pressable>
    </View>
  );
}

export default function AlertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { alerts, removeAlert } = useApp();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleDelete = (id: string) => {
    Alert.alert("Alarmı Sil", "Bu alarmı silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); removeAlert(id); } },
    ]);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topPadding + 8, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center" },
    backBtn: { padding: 8, marginLeft: -8, marginRight: 8 },
    headerTitle: { flex: 1, fontSize: 24, fontFamily: "Inter_700Bold", color: colors.foreground },
    listContent: { paddingHorizontal: 16, paddingBottom: bottomPadding + 20, gap: 10 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={styles.headerTitle}>Fiyat Alarmları</Text>
        <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.secondary, borderRadius: 20 }}>
          <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>
            {alerts.length} Alarm
          </Text>
        </View>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertCard alert={item} colors={colors} onDelete={() => handleDelete(item.id)} />
        )}
        ListEmptyComponent={<EmptyAlerts colors={colors} />}
        contentContainerStyle={[styles.listContent, alerts.length === 0 && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
