import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "@/components/Icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp, PortfolioItem } from "@/contexts/AppContext";

function EmptyPortfolio({ colors, onAdd }: { colors: any; onAdd: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
      <Icon name="briefcase-outline" size={64} color={colors.mutedForeground} />
      <Text style={{ fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 20, textAlign: "center" }}>
        Portföyünüz boş
      </Text>
      <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
        Döviz ve altın varlıklarınızı ekleyerek toplam değerinizi takip edin.
      </Text>
      <Pressable
        onPress={onAdd}
        style={{ marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 25 }}
      >
        <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground }}>
          Varlık Ekle
        </Text>
      </Pressable>
    </View>
  );
}

function AddAssetModal({
  visible,
  onClose,
  onAdd,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: Omit<PortfolioItem, "id">) => void;
  colors: any;
}) {
  const { currencies, goldRates } = useApp();
  const [selectedCode, setSelectedCode] = useState("USD");
  const [selectedType, setSelectedType] = useState<"currency" | "gold">("currency");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const allAssets = [
    ...currencies.map((c) => ({ ...c, assetType: "currency" as const })),
    ...goldRates.map((g) => ({ ...g, assetType: "gold" as const })),
  ];

  const selectedAsset = allAssets.find((a) => a.code === selectedCode);

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    const pr = parseFloat(price);
    if (!amt || !pr || !selectedAsset) return;
    onAdd({
      type: selectedType,
      code: selectedCode,
      name: selectedAsset.name,
      nameTR: selectedAsset.nameTR,
      amount: amt,
      purchasePrice: pr,
      purchaseDate: new Date().toISOString(),
    });
    setAmount("");
    setPrice("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }}>
            Varlık Ekle
          </Text>
          <Pressable onPress={onClose}>
            <Icon name="close" size={24} color={colors.foreground} />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: selectedType === "currency" ? colors.primary : colors.secondary, alignItems: "center" }}
              onPress={() => { setSelectedType("currency"); setSelectedCode("USD"); }}
            >
              <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: selectedType === "currency" ? colors.primaryForeground : colors.mutedForeground }}>
                Döviz
              </Text>
            </Pressable>
            <Pressable
              style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: selectedType === "gold" ? colors.gold : colors.secondary, alignItems: "center" }}
              onPress={() => { setSelectedType("gold"); setSelectedCode("ALTIN"); }}
            >
              <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: selectedType === "gold" ? "#1A0F00" : colors.mutedForeground }}>
                Altın/Gümüş
              </Text>
            </Pressable>
          </View>

          <View>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>
              VARLIK SEÇİN
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
              {allAssets
                .filter((a) => a.assetType === selectedType)
                .map((asset) => (
                  <Pressable
                    key={asset.code}
                    onPress={() => setSelectedCode(asset.code)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      marginRight: 8,
                      backgroundColor: selectedCode === asset.code ? colors.primary : colors.secondary,
                      borderWidth: 1,
                      borderColor: selectedCode === asset.code ? colors.primary : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: selectedCode === asset.code ? colors.primaryForeground : colors.foreground }}>
                      {asset.code}
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>
          </View>

          {selectedAsset && (
            <View style={{ backgroundColor: colors.secondary, borderRadius: 10, padding: 14 }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                Güncel Fiyat
              </Text>
              <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 4 }}>
                ₺{selectedAsset.buy >= 1000 ? selectedAsset.buy.toFixed(2) : selectedAsset.buy.toFixed(4)}
              </Text>
            </View>
          )}

          <View>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>
              MİKTAR
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              style={{ backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 14, fontSize: 16, fontFamily: "Inter_500Medium", color: colors.foreground }}
            />
          </View>

          <View>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>
              ALIM FİYATI (₺)
            </Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              style={{ backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 14, fontSize: 16, fontFamily: "Inter_500Medium", color: colors.foreground }}
            />
          </View>
        </ScrollView>

        <View style={{ padding: 20, paddingBottom: bottomPad + 20 }}>
          <Pressable
            onPress={handleSubmit}
            style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: "center" }}
          >
            <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground }}>
              Portföye Ekle
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function PortfolioItemCard({ item, colors, onDelete }: { item: PortfolioItem; colors: any; onDelete: () => void }) {
  const { currencies, goldRates } = useApp();
  const allRates = [...currencies, ...goldRates] as any[];
  const rate = allRates.find((r: any) => r.code === item.code);
  const currentPrice = rate ? (rate.buy ?? rate.buy) : item.purchasePrice;
  const currentValue = item.amount * currentPrice;
  const costValue = item.amount * item.purchasePrice;
  const gainLoss = currentValue - costValue;
  const gainLossPercent = ((gainLoss) / costValue) * 100;
  const isPos = gainLoss >= 0;

  const formatVal = (v: number) => v >= 1000 ? v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : v.toFixed(4);

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: colors.radius, padding: 16, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View>
          <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground }}>{item.code}</Text>
          <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>{item.nameTR}</Text>
          <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 4 }}>
            Miktar: {item.amount} • Alım: ₺{formatVal(item.purchasePrice)}
          </Text>
        </View>
        <Pressable onPress={onDelete} style={{ padding: 4 }}>
          <Icon name="trash-outline" size={18} color={colors.fall} />
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View>
          <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Güncel Değer</Text>
          <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 2 }}>
            ₺{currentValue.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Kar/Zarar</Text>
          <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: isPos ? colors.rise : colors.fall, marginTop: 2 }}>
            {isPos ? "+" : ""}₺{Math.abs(gainLoss).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: isPos ? colors.rise : colors.fall }}>
            {isPos ? "+" : ""}{gainLossPercent.toFixed(2)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { portfolio, addToPortfolio, removeFromPortfolio, getPortfolioTotalValue, getPortfolioGainLoss } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const totalValue = getPortfolioTotalValue();
  const { value: gainLoss, percent: gainLossPercent } = getPortfolioGainLoss();
  const isPos = gainLoss >= 0;

  const handleDelete = (id: string) => {
    Alert.alert("Varlığı Sil", "Bu varlığı portföyünüzden silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); removeFromPortfolio(id); } },
    ]);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topPadding + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.5 },
    addBtn: { backgroundColor: colors.primary, width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    summaryCard: { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, overflow: "hidden" },
    listContent: { paddingHorizontal: 16, paddingBottom: bottomPadding + 16, gap: 10 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portföyüm</Text>
        <Pressable onPress={() => setShowAddModal(true)} style={styles.addBtn}>
          <Icon name="add" size={22} color={colors.primaryForeground} />
        </Pressable>
      </View>

      {portfolio.length > 0 && (
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={[colors.accent, "#0D2B47"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 20 }}
          >
            <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>
              TOPLAM PORTFÖY DEĞERİ
            </Text>
            <Text style={{ fontSize: 30, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 6, letterSpacing: -0.5 }}>
              ₺{totalValue.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
              <Icon name={isPos ? "trending-up" : "trending-down"} size={14} color={isPos ? "#22C55E" : "#EF4444"} />
              <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: isPos ? "#22C55E" : "#EF4444", marginLeft: 4 }}>
                {isPos ? "+" : ""}₺{Math.abs(gainLoss).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isPos ? "+" : ""}{gainLossPercent.toFixed(2)}%)
              </Text>
            </View>
            <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              {portfolio.length} varlık
            </Text>
          </LinearGradient>
        </View>
      )}

      <FlatList
        data={portfolio}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PortfolioItemCard item={item} colors={colors} onDelete={() => handleDelete(item.id)} />
        )}
        ListEmptyComponent={<EmptyPortfolio colors={colors} onAdd={() => setShowAddModal(true)} />}
        contentContainerStyle={[styles.listContent, portfolio.length === 0 && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
      />

      <AddAssetModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addToPortfolio}
        colors={colors}
      />
    </View>
  );
}
