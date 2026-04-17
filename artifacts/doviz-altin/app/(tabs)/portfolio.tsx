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
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Icon } from "@/components/Icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp, PortfolioItem } from "@/contexts/AppContext";

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPrice = (v: number) =>
  v >= 1000 ? fmtTL(v) : v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const fmtAmount = (v: number) =>
  Number.isInteger(v) ? v.toString() : v.toLocaleString("tr-TR", { maximumFractionDigits: 4 });

function EmptyPortfolio({ colors, onAdd }: { colors: any; onAdd: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
      <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }}>
        <Icon name="briefcase-outline" size={40} color={colors.mutedForeground} />
      </View>
      <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 22, textAlign: "center", letterSpacing: -0.4 }}>
        Portföyün boş
      </Text>
      <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
        Döviz ve maden yatırımlarını ekleyerek toplam değerini canlı takip et.
      </Text>
      <Pressable
        onPress={onAdd}
        style={({ pressed }) => [{
          marginTop: 26, backgroundColor: colors.primary, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 28,
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
    setAmount("");
    setPrice("");
    onClose();
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
          <View style={{ flexDirection: "row", gap: 8, padding: 4, backgroundColor: colors.secondary, borderRadius: 12 }}>
            <Pressable
              style={{ flex: 1, paddingVertical: 11, borderRadius: 9, backgroundColor: isCurrency ? colors.primary : "transparent", alignItems: "center" }}
              onPress={() => { Haptics.selectionAsync().catch(() => {}); setSelectedType("currency"); setSelectedCode("USD"); }}
            >
              <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: isCurrency ? colors.primaryForeground : colors.mutedForeground }}>
                Döviz
              </Text>
            </Pressable>
            <Pressable
              style={{ flex: 1, paddingVertical: 11, borderRadius: 9, backgroundColor: !isCurrency ? colors.gold : "transparent", alignItems: "center" }}
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
              {allAssets
                .filter((a) => a.assetType === selectedType)
                .map((asset) => (
                  <Pressable
                    key={asset.code}
                    onPress={() => { Haptics.selectionAsync().catch(() => {}); setSelectedCode(asset.code); }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 999,
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
              <View>
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: 0.4 }}>
                  GÜNCEL FİYAT
                </Text>
                <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 2 }}>
                  {selectedAsset.nameTR}
                </Text>
              </View>
              <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.5 }}>
                ₺{fmtPrice(selectedAsset.buy)}
              </Text>
            </View>
          )}

          <View>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, marginBottom: 8, letterSpacing: 0.6 }}>
              {labels.amount}
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
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
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={colors.mutedForeground}
              style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, padding: 14, fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground }}
            />
            <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 6 }}>
              Aldığın günkü birim fiyat. Sonradan kar/zararı hesaplamak için kullanılır.
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

// ── Award-level item card ──────────────────────────────────────────────────
function PortfolioItemCard({ item, colors, onDelete, index }: { item: PortfolioItem; colors: any; onDelete: () => void; index: number }) {
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
  const accent = isGold ? colors.gold : colors.primary;
  const accentText = isGold ? "#1A0F00" : colors.primaryForeground;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(320)}>
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 18,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        overflow: "hidden",
      }}>
        <View style={{ flexDirection: "row", padding: 14, alignItems: "center" }}>
          <View style={{
            width: 46, height: 46, borderRadius: 14,
            backgroundColor: accent,
            alignItems: "center", justifyContent: "center",
            marginRight: 12,
          }}>
            <Text style={{ color: accentText, fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: -0.2 }}>
              {item.code.slice(0, 4)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
              {item.code}
            </Text>
            <Text numberOfLines={1} style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 2 }}>
              {item.nameTR}
            </Text>
          </View>
          <Pressable onPress={onDelete} hitSlop={10} style={{ padding: 6 }}>
            <Icon name="close" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: 14 }} />

        <View style={{ flexDirection: "row", paddingHorizontal: 14, paddingVertical: 14, gap: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.5 }}>
              GÜNCEL DEĞER
            </Text>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 4, letterSpacing: -0.4 }}>
              ₺{fmtTL(currentValue)}
            </Text>
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 3 }}>
              {fmtAmount(item.amount)} {isGold ? "gr/adet" : item.code} • ₺{fmtPrice(currentPrice)}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              backgroundColor: (isPos ? colors.rise : colors.fall) + "1A",
              paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
            }}>
              <Icon name={isPos ? "arrow-up" : "arrow-down"} size={11} color={isPos ? colors.rise : colors.fall} />
              <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: isPos ? colors.rise : colors.fall, letterSpacing: -0.1 }}>
                {isPos ? "+" : ""}{gainLossPercent.toFixed(2)}%
              </Text>
            </View>
            <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: isPos ? colors.rise : colors.fall, marginTop: 6, letterSpacing: -0.3 }}>
              {isPos ? "+" : "−"}₺{fmtTL(Math.abs(gainLoss))}
            </Text>
            <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 2 }}>
              maliyet ₺{fmtTL(costValue)}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Award-level hero summary ──────────────────────────────────────────────
function HeroSummary({
  colors, totalValue, gainLoss, gainLossPercent, costTotal,
  currencyValue, goldValue, count,
}: {
  colors: any; totalValue: number; gainLoss: number; gainLossPercent: number; costTotal: number;
  currencyValue: number; goldValue: number; count: number;
}) {
  const isPos = gainLoss >= 0;
  const total = currencyValue + goldValue;
  const currencyPct = total > 0 ? (currencyValue / total) * 100 : 0;
  const goldPct = total > 0 ? (goldValue / total) * 100 : 0;

  return (
    <Animated.View entering={FadeIn.duration(400)} style={{ marginHorizontal: 20, marginBottom: 16, borderRadius: 22, overflow: "hidden" }}>
      <LinearGradient
        colors={["#0E2C66", "#0B3D91", "#082356"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 22 }}
      >
        {/* Decorative gold accent line */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: colors.gold, opacity: 0.85 }} />

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.65)", letterSpacing: 1.2 }}>
            TOPLAM PORTFÖY
          </Text>
          <View style={{ backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.3 }}>
              {count} VARLIK
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 38, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 10, letterSpacing: -1.2 }}>
          ₺{fmtTL(totalValue)}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 }}>
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 4,
            backgroundColor: isPos ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)",
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
          }}>
            <Icon name={isPos ? "trending-up" : "trending-down"} size={13} color={isPos ? "#4ADE80" : "#F87171"} />
            <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: isPos ? "#4ADE80" : "#F87171", letterSpacing: -0.1 }}>
              {isPos ? "+" : ""}₺{fmtTL(Math.abs(gainLoss))}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: isPos ? "#4ADE80" : "#F87171", opacity: 0.85 }}>
              ({isPos ? "+" : ""}{gainLossPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>

        {/* Distribution bar */}
        {total > 0 && (
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: "row", height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.1)" }}>
              {currencyPct > 0 && (
                <View style={{ width: `${currencyPct}%`, backgroundColor: "#60A5FA" }} />
              )}
              {goldPct > 0 && (
                <View style={{ width: `${goldPct}%`, backgroundColor: colors.gold }} />
              )}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#60A5FA" }} />
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.75)" }}>
                  Döviz
                </Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" }}>
                  %{currencyPct.toFixed(0)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold }} />
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.75)" }}>
                  Maden
                </Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" }}>
                  %{goldPct.toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Cost vs current mini stats */}
        <View style={{ flexDirection: "row", marginTop: 18, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.12)", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.55)", letterSpacing: 0.5 }}>
              MALİYET
            </Text>
            <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 4, letterSpacing: -0.2 }}>
              ₺{fmtTL(costTotal)}
            </Text>
          </View>
          <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.12)" }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.55)", letterSpacing: 0.5 }}>
              GÜNCEL
            </Text>
            <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 4, letterSpacing: -0.2 }}>
              ₺{fmtTL(totalValue)}
            </Text>
          </View>
          <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.12)" }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.55)", letterSpacing: 0.5 }}>
              KAR / ZARAR
            </Text>
            <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: isPos ? "#4ADE80" : "#F87171", marginTop: 4, letterSpacing: -0.2 }}>
              {isPos ? "+" : "−"}₺{fmtTL(Math.abs(gainLoss))}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { portfolio, addToPortfolio, removeFromPortfolio, currencies, goldRates } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const stats = useMemo(() => {
    const allRates = [...currencies, ...goldRates] as any[];
    let totalValue = 0;
    let costTotal = 0;
    let currencyValue = 0;
    let goldValue = 0;
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

  const handleDelete = (id: string) => {
    Alert.alert("Varlığı Sil", "Bu varlığı portföyünden silmek istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); removeFromPortfolio(id); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topPadding + 12, paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View>
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
            paddingHorizontal: 14, paddingVertical: 10,
            borderRadius: 999,
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
          <PortfolioItemCard item={item} colors={colors} onDelete={() => handleDelete(item.id)} index={index} />
        )}
        ListHeaderComponent={
          portfolio.length > 0 ? (
            <HeroSummary
              colors={colors}
              totalValue={stats.totalValue}
              gainLoss={stats.gainLoss}
              gainLossPercent={stats.gainLossPercent}
              costTotal={stats.costTotal}
              currencyValue={stats.currencyValue}
              goldValue={stats.goldValue}
              count={portfolio.length}
            />
          ) : null
        }
        ListEmptyComponent={<EmptyPortfolio colors={colors} onAdd={() => setShowAddModal(true)} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={[
          { paddingHorizontal: 20, paddingBottom: bottomPadding + 16, paddingTop: 4 },
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
