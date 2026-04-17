import React, { useMemo, useState } from "react";
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
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Icon } from "@/components/Icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp, PortfolioItem } from "@/contexts/AppContext";

// ── Number formatting ──────────────────────────────────────────────────────
const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPrice = (v: number) =>
  v >= 100
    ? v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const fmtAmount = (v: number) =>
  Number.isInteger(v) ? v.toString() : v.toLocaleString("tr-TR", { maximumFractionDigits: 4 });

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyPortfolio({ colors, onAdd }: { colors: any; onAdd: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
      <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }}>
        <Icon name="briefcase-outline" size={42} color={colors.mutedForeground} />
      </View>
      <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 24, textAlign: "center", letterSpacing: -0.5 }}>
        Portföyün boş
      </Text>
      <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 10, textAlign: "center", lineHeight: 21 }}>
        Döviz ve maden yatırımlarını ekleyerek toplam değerini canlı kurla takip et.
      </Text>
      <Pressable
        onPress={onAdd}
        style={({ pressed }) => [{
          marginTop: 28, backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 30,
          opacity: pressed ? 0.85 : 1,
        }]}
      >
        <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.primaryForeground, letterSpacing: -0.2 }}>
          İlk Varlığını Ekle
        </Text>
      </Pressable>
    </View>
  );
}

// ── Add asset modal ────────────────────────────────────────────────────────
function AddAssetModal({
  visible, onClose, onAdd, colors,
}: {
  visible: boolean; onClose: () => void;
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
  const isCurrency = selectedType === "currency";

  const handleSubmit = () => {
    const amt = parseFloat(amount.replace(",", "."));
    const pr = parseFloat(price.replace(",", "."));
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
    setAmount(""); setPrice(""); onClose();
  };

  const labels = isCurrency
    ? { selector: "PARA BİRİMİ SEÇ", amount: "TUTAR", amountPlaceholder: "Örn: 1000", priceLabel: "ALIM KURU (₺)" }
    : { selector: "MADEN SEÇ", amount: "GRAM / ADET", amountPlaceholder: "Örn: 5", priceLabel: "ALIM FİYATI (₺)" };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
            Varlık Ekle
          </Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Icon name="close" size={24} color={colors.foreground} />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 18 }}>
          <View style={{ flexDirection: "row", gap: 6, padding: 4, backgroundColor: colors.secondary, borderRadius: 14 }}>
            <Pressable
              style={{ flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: isCurrency ? colors.primary : "transparent", alignItems: "center" }}
              onPress={() => { Haptics.selectionAsync().catch(() => {}); setSelectedType("currency"); setSelectedCode("USD"); }}
            >
              <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: isCurrency ? colors.primaryForeground : colors.mutedForeground }}>
                Döviz
              </Text>
            </Pressable>
            <Pressable
              style={{ flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: !isCurrency ? colors.gold : "transparent", alignItems: "center" }}
              onPress={() => { Haptics.selectionAsync().catch(() => {}); setSelectedType("gold"); setSelectedCode("ALTIN"); }}
            >
              <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: !isCurrency ? "#1A0F00" : colors.mutedForeground }}>
                Altın / Maden
              </Text>
            </Pressable>
          </View>

          <View>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, marginBottom: 10, letterSpacing: 0.6 }}>
              {labels.selector}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
              {allAssets.filter((a) => a.assetType === selectedType).map((asset) => (
                <Pressable
                  key={asset.code}
                  onPress={() => { Haptics.selectionAsync().catch(() => {}); setSelectedCode(asset.code); }}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
                    backgroundColor: selectedCode === asset.code ? colors.primary : colors.card,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: selectedCode === asset.code ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: selectedCode === asset.code ? colors.primaryForeground : colors.foreground, letterSpacing: -0.1 }}>
                    {asset.code}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {selectedAsset && (
            <View style={{ backgroundColor: colors.secondary, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.5 }}>
                  GÜNCEL FİYAT
                </Text>
                <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 2 }}>
                  {selectedAsset.nameTR}
                </Text>
              </View>
              <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.5, marginLeft: 12 }}>
                ₺{fmtPrice(selectedAsset.buy)}
              </Text>
            </View>
          )}

          <View>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, marginBottom: 8, letterSpacing: 0.6 }}>
              {labels.amount}
            </Text>
            <TextInput
              value={amount} onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder={labels.amountPlaceholder}
              placeholderTextColor={colors.mutedForeground}
              style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, padding: 14, fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground }}
            />
          </View>

          <View>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, marginBottom: 8, letterSpacing: 0.6 }}>
              {labels.priceLabel}
            </Text>
            <TextInput
              value={price} onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={colors.mutedForeground}
              style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, padding: 14, fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground }}
            />
            <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 6 }}>
              Aldığın günkü birim fiyat. Kar/zarar hesaplamak için kullanılır.
            </Text>
          </View>
        </ScrollView>

        <View style={{ padding: 20, paddingBottom: bottomPad + 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [{
              backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: "center",
              opacity: pressed ? 0.85 : 1,
            }]}
          >
            <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.primaryForeground, letterSpacing: -0.2 }}>
              Portföye Ekle
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ── Item card ─────────────────────────────────────────────────────────────
function PortfolioItemCard({ item, colors, onDelete, index }: {
  item: PortfolioItem; colors: any; onDelete: () => void; index: number;
}) {
  const { currencies, goldRates } = useApp();
  const allRates = [...currencies, ...goldRates] as any[];
  const rate = allRates.find((r: any) => r.code === item.code);
  const currentPrice = rate?.buy ?? item.purchasePrice;
  const currentValue = item.amount * currentPrice;
  const costValue = item.amount * item.purchasePrice;
  const gainLoss = currentValue - costValue;
  const gainLossPercent = costValue > 0 ? (gainLoss / costValue) * 100 : 0;
  const isPos = gainLoss >= 0;

  const isGold = item.type === "gold";
  const accentColor = isGold ? colors.gold : "#3B82F6";

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(280)}>
      <Pressable
        onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); onDelete(); }}
        delayLongPress={400}
        style={({ pressed }) => [{
          backgroundColor: colors.card,
          borderRadius: 18,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          paddingVertical: 16,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          opacity: pressed ? 0.7 : 1,
        }]}
      >
        <View style={{ width: 4, alignSelf: "stretch", backgroundColor: accentColor, borderRadius: 2, marginRight: 14 }} />

        <View style={{ flex: 1, paddingRight: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Text numberOfLines={1} style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
              {item.code}
            </Text>
            <View style={{
              backgroundColor: isGold ? colors.gold + "20" : "#3B82F615",
              paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
            }}>
              <Text style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: isGold ? colors.goldDark : "#3B82F6", letterSpacing: 0.3 }}>
                {isGold ? "MADEN" : "DÖVİZ"}
              </Text>
            </View>
          </View>
          <Text numberOfLines={1} style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4 }}>
            {item.nameTR}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 5, opacity: 0.75 }}>
            {fmtAmount(item.amount)} {isGold ? "× ₺" : "@ ₺"}{fmtPrice(item.purchasePrice)}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", maxWidth: 140 }}>
          <Text
            adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.7}
            style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}
          >
            ₺{fmtTL(currentValue)}
          </Text>
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 3,
            backgroundColor: (isPos ? colors.rise : colors.fall) + "1A",
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, marginTop: 6,
          }}>
            <Icon name={isPos ? "arrow-up" : "arrow-down"} size={10} color={isPos ? colors.rise : colors.fall} />
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: isPos ? colors.rise : colors.fall, letterSpacing: -0.1 }}>
              {isPos ? "+" : ""}{gainLossPercent.toFixed(2)}%
            </Text>
          </View>
          <Text
            adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.7}
            style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: isPos ? colors.rise : colors.fall, marginTop: 5, opacity: 0.9 }}
          >
            {isPos ? "+" : "−"}₺{fmtTL(Math.abs(gainLoss))}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────
export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { portfolio, addToPortfolio, removeFromPortfolio, currencies, goldRates } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const stats = useMemo(() => {
    const allRates = [...currencies, ...goldRates] as any[];
    let totalValue = 0, costTotal = 0, currencyValue = 0, goldValue = 0;
    for (const item of portfolio) {
      const rate = allRates.find((r: any) => r.code === item.code);
      const cur = (rate?.buy ?? item.purchasePrice) * item.amount;
      totalValue += cur;
      costTotal += item.purchasePrice * item.amount;
      if (item.type === "gold") goldValue += cur;
      else currencyValue += cur;
    }
    const gainLoss = totalValue - costTotal;
    const gainLossPercent = costTotal > 0 ? (gainLoss / costTotal) * 100 : 0;
    return { totalValue, costTotal, gainLoss, gainLossPercent, currencyValue, goldValue };
  }, [portfolio, currencies, goldRates]);

  const isPos = stats.gainLoss >= 0;
  const totalDist = stats.currencyValue + stats.goldValue;
  const currencyPct = totalDist > 0 ? (stats.currencyValue / totalDist) * 100 : 0;
  const goldPct = totalDist > 0 ? 100 - currencyPct : 0;

  const handleDelete = (id: string) => {
    Alert.alert("Varlığı Sil", "Bu varlığı portföyünden silmek istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); removeFromPortfolio(id); } },
    ]);
  };

  // ── Hero section: full-width, breathable, edge-to-edge ─────────────────
  const HeroSection = () => (
    <Animated.View entering={FadeIn.duration(400)} style={{ paddingHorizontal: 20, paddingBottom: 28 }}>
      {/* Label */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.gold }} />
        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.4 }}>
          TOPLAM PORTFÖY DEĞERİ
        </Text>
      </View>

      {/* THE big number — full width, edge to edge, never clipped */}
      <Animated.View entering={FadeInUp.delay(80).duration(400)}>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          minimumFontScale={0.4}
          style={{
            fontSize: 52,
            fontFamily: "Inter_700Bold",
            color: colors.foreground,
            letterSpacing: -1.8,
            marginTop: 10,
            includeFontPadding: false,
          }}
        >
          ₺{fmtTL(stats.totalValue)}
        </Text>
      </Animated.View>

      {/* Trend pill */}
      <Animated.View entering={FadeInUp.delay(140).duration(400)} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 5,
          backgroundColor: (isPos ? colors.rise : colors.fall) + "1A",
          paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
        }}>
          <Icon name={isPos ? "trending-up" : "trending-down"} size={13} color={isPos ? colors.rise : colors.fall} />
          <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: isPos ? colors.rise : colors.fall, letterSpacing: -0.2 }}>
            {isPos ? "+" : "−"}₺{fmtTL(Math.abs(stats.gainLoss))}
          </Text>
        </View>
        <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: isPos ? colors.rise : colors.fall, letterSpacing: -0.1 }}>
          {isPos ? "+" : ""}{stats.gainLossPercent.toFixed(2)}%
        </Text>
        <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginLeft: 2 }}>
          toplam getiri
        </Text>
      </Animated.View>

      {/* Stat row: cost / current — clean, side by side */}
      <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ flexDirection: "row", marginTop: 22, gap: 10 }}>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border }}>
          <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.7 }}>
            MALİYET
          </Text>
          <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 5, letterSpacing: -0.4 }}>
            ₺{fmtTL(stats.costTotal)}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border }}>
          <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.7 }}>
            GETİRİ
          </Text>
          <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: isPos ? colors.rise : colors.fall, marginTop: 5, letterSpacing: -0.4 }}>
            {isPos ? "+" : "−"}₺{fmtTL(Math.abs(stats.gainLoss))}
          </Text>
        </View>
      </Animated.View>

      {/* Distribution — only if both types exist */}
      {totalDist > 0 && (stats.currencyValue > 0 && stats.goldValue > 0) && (
        <Animated.View entering={FadeInUp.delay(260).duration(400)} style={{ marginTop: 22 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.7 }}>
              DAĞILIM
            </Text>
          </View>
          <View style={{ flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: colors.secondary }}>
            {currencyPct > 0 && <View style={{ width: `${currencyPct}%`, backgroundColor: "#3B82F6" }} />}
            {goldPct > 0 && <View style={{ width: `${goldPct}%`, backgroundColor: colors.gold }} />}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: "#3B82F6" }} />
              <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                Döviz
              </Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground }}>
                %{currencyPct.toFixed(0)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.gold }} />
              <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                Maden
              </Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground }}>
                %{goldPct.toFixed(0)}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: topPadding + 12, paddingHorizontal: 20, paddingBottom: 18, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: 0.6, textTransform: "uppercase" }}>
            Yatırımlarım
          </Text>
          <Text style={{ fontSize: 32, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 2, letterSpacing: -0.8 }}>
            Portföyüm
          </Text>
        </View>
        <Pressable
          onPress={() => { Haptics.selectionAsync().catch(() => {}); setShowAddModal(true); }}
          style={({ pressed }) => [{
            backgroundColor: colors.primary,
            paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
            flexDirection: "row", alignItems: "center", gap: 6,
            opacity: pressed ? 0.85 : 1,
          }]}
        >
          <Icon name="add" size={16} color={colors.primaryForeground} />
          <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primaryForeground, letterSpacing: -0.1 }}>
            Ekle
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={portfolio}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: 20 }}>
            <PortfolioItemCard item={item} colors={colors} onDelete={() => handleDelete(item.id)} index={index} />
          </View>
        )}
        ListHeaderComponent={
          portfolio.length > 0 ? (
            <>
              <HeroSection />
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: 20, marginBottom: 16 }} />
              <View style={{ flexDirection: "row", alignItems: "baseline", paddingHorizontal: 20, marginBottom: 12 }}>
                <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
                  Varlıklarım
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginLeft: 8 }}>
                  {portfolio.length}
                </Text>
              </View>
            </>
          ) : null
        }
        ListEmptyComponent={<EmptyPortfolio colors={colors} onAdd={() => setShowAddModal(true)} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={
          portfolio.length > 0 ? (
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, textAlign: "center", marginTop: 18, opacity: 0.6 }}>
              Bir varlığı silmek için basılı tut
            </Text>
          ) : null
        }
        contentContainerStyle={[
          { paddingBottom: bottomPadding + 16, paddingTop: 4 },
          portfolio.length === 0 && { flex: 1 },
        ]}
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
