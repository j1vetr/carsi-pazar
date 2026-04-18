import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
  Modal,
  ScrollView,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
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
        Portföyün Boş
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

// ── Date format ────────────────────────────────────────────────────────────
const fmtShortDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "2-digit" });
  } catch {
    return "—";
  }
};

// ── Holding (consolidated by code) ─────────────────────────────────────────
type Lot = {
  id: string;
  amount: number;
  purchasePrice: number;
  purchaseDate: string;
};

type Holding = {
  key: string;
  code: string;
  type: "currency" | "gold";
  name: string;
  nameTR: string;
  totalAmount: number;
  costTotal: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  lots: Lot[];
};

// ── Holding card (consolidated, expandable lot list) ──────────────────────
function HoldingCard({
  holding, colors, expanded, onToggle, onDeleteLot, onDeleteAll, index,
}: {
  holding: Holding;
  colors: any;
  expanded: boolean;
  onToggle: () => void;
  onDeleteLot: (lotId: string) => void;
  onDeleteAll: () => void;
  index: number;
}) {
  const isGold = holding.type === "gold";
  const accentColor = isGold ? colors.gold : "#3B82F6";
  const isPos = holding.gainLoss >= 0;
  const lotCount = holding.lots.length;
  const hasMultipleLots = lotCount > 1;

  const chevronRotation = useSharedValue(expanded ? 1 : 0);
  React.useEffect(() => {
    chevronRotation.value = withTiming(expanded ? 1 : 0, { duration: 220 });
  }, [expanded, chevronRotation]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value * 180}deg` }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(280)}>
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 18,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        overflow: "hidden",
      }}>
        {/* ── Main row ───────────────────────────────────────────────── */}
        <Pressable
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            onToggle();
          }}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            onDeleteAll();
          }}
          delayLongPress={420}
          style={({ pressed }) => [{
            paddingVertical: 16,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            opacity: pressed ? 0.75 : 1,
          }]}
        >
          {/* Accent strip */}
          <View style={{ width: 4, alignSelf: "stretch", backgroundColor: accentColor, borderRadius: 2, marginRight: 14 }} />

          {/* Left: identity + holdings */}
          <View style={{ flex: 1, paddingRight: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <Text numberOfLines={1} style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
                {holding.code}
              </Text>
              <View style={{
                backgroundColor: isGold ? colors.gold + "20" : "#3B82F615",
                paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
              }}>
                <Text style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: isGold ? colors.goldDark : "#3B82F6", letterSpacing: 0.3 }}>
                  {isGold ? "MADEN" : "DÖVİZ"}
                </Text>
              </View>
              {hasMultipleLots ? (
                <View style={{
                  backgroundColor: colors.secondary,
                  paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5,
                  flexDirection: "row", alignItems: "center", gap: 3,
                }}>
                  <Icon name="grid-outline" size={9} color={colors.mutedForeground} />
                  <Text style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.3 }}>
                    {lotCount} ALIM
                  </Text>
                </View>
              ) : null}
            </View>
            <Text numberOfLines={1} style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4 }}>
              {holding.nameTR}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
              <Text numberOfLines={1} style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.foreground, opacity: 0.85 }}>
                {fmtAmount(holding.totalAmount)}
              </Text>
              <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                ort. ₺{fmtPrice(holding.avgPrice)}
              </Text>
            </View>
          </View>

          {/* Right: value + change */}
          <View style={{ alignItems: "flex-end", maxWidth: 140 }}>
            <Text
              adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.7}
              style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}
            >
              ₺{fmtTL(holding.currentValue)}
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 3,
              backgroundColor: (isPos ? colors.rise : colors.fall) + "1A",
              paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, marginTop: 6,
            }}>
              <Icon name={isPos ? "arrow-up" : "arrow-down"} size={10} color={isPos ? colors.rise : colors.fall} />
              <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: isPos ? colors.rise : colors.fall, letterSpacing: -0.1 }}>
                {isPos ? "+" : ""}{holding.gainLossPercent.toFixed(2)}%
              </Text>
            </View>
            <Text
              adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.7}
              style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: isPos ? colors.rise : colors.fall, marginTop: 5, opacity: 0.9 }}
            >
              {isPos ? "+" : "−"}₺{fmtTL(Math.abs(holding.gainLoss))}
            </Text>
          </View>

          {/* Chevron */}
          <Animated.View style={[{ marginLeft: 10 }, chevronStyle]}>
            <Icon name="chevron-down" size={16} color={colors.mutedForeground} />
          </Animated.View>
        </Pressable>

        {/* ── Expanded: lot list ─────────────────────────────────────── */}
        {expanded ? (
          <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.background }}>
            {/* Avg cost summary strip */}
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: colors.secondary,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Icon name="trending-up" size={12} color={colors.mutedForeground} />
                <Text style={{ fontSize: 10.5, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.4 }}>
                  AĞIRLIKLI ORTALAMA MALİYET
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
                ₺{fmtPrice(holding.avgPrice)}
              </Text>
            </View>

            {/* Header row */}
            <View style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 6,
            }}>
              <Text style={{ flex: 1, fontSize: 9.5, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.5 }}>
                TARİH
              </Text>
              <Text style={{ width: 70, textAlign: "right", fontSize: 9.5, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.5 }}>
                ADET
              </Text>
              <Text style={{ width: 90, textAlign: "right", fontSize: 9.5, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.5 }}>
                FİYAT
              </Text>
              <View style={{ width: 30 }} />
            </View>

            {/* Lots */}
            {holding.lots.map((lot, i) => {
              const lotCost = lot.amount * lot.purchasePrice;
              const lotValue = lot.amount * holding.currentPrice;
              const lotGainPct = lotCost > 0 ? ((lotValue - lotCost) / lotCost) * 100 : 0;
              const lotPos = lotValue >= lotCost;
              return (
                <View
                  key={lot.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: colors.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12.5, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                      {fmtShortDate(lot.purchaseDate)}
                    </Text>
                    <View style={{
                      flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2,
                    }}>
                      <Text style={{ fontSize: 10.5, fontFamily: "Inter_700Bold", color: lotPos ? colors.rise : colors.fall, letterSpacing: -0.1 }}>
                        {lotPos ? "+" : ""}{lotGainPct.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={{ width: 70, textAlign: "right", fontSize: 12.5, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                    {fmtAmount(lot.amount)}
                  </Text>
                  <Text style={{ width: 90, textAlign: "right", fontSize: 12.5, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                    ₺{fmtPrice(lot.purchasePrice)}
                  </Text>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      onDeleteLot(lot.id);
                    }}
                    hitSlop={10}
                    style={({ pressed }) => [{
                      width: 30,
                      alignItems: "flex-end",
                      opacity: pressed ? 0.5 : 0.8,
                    }]}
                  >
                    <Icon name="trash-outline" size={15} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              );
            })}

            {/* Footer hint */}
            <View style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}>
              <Icon name="alert-circle" size={12} color={colors.mutedForeground} />
              <Text style={{ fontSize: 10.5, fontFamily: "Inter_500Medium", color: colors.mutedForeground, flex: 1, letterSpacing: -0.1 }}>
                Tüm alımları silmek için karta uzun bas
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────
export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { portfolio, addToPortfolio, removeFromPortfolio, currencies, goldRates } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 84 : insets.bottom + 60;

  // ── Group lots by code+type → holdings with weighted average ──────────
  const holdings = useMemo<Holding[]>(() => {
    const allRates = [...currencies, ...goldRates] as any[];
    const map = new Map<string, Holding>();
    for (const item of portfolio) {
      const key = `${item.type}:${item.code}`;
      const lot: Lot = {
        id: item.id,
        amount: item.amount,
        purchasePrice: item.purchasePrice,
        purchaseDate: item.purchaseDate,
      };
      const existing = map.get(key);
      if (existing) {
        existing.totalAmount += item.amount;
        existing.costTotal += item.amount * item.purchasePrice;
        existing.lots.push(lot);
      } else {
        map.set(key, {
          key,
          code: item.code,
          type: item.type,
          name: item.name,
          nameTR: item.nameTR,
          totalAmount: item.amount,
          costTotal: item.amount * item.purchasePrice,
          avgPrice: 0,
          currentPrice: 0,
          currentValue: 0,
          gainLoss: 0,
          gainLossPercent: 0,
          lots: [lot],
        });
      }
    }
    const result: Holding[] = [];
    for (const h of map.values()) {
      h.avgPrice = h.totalAmount > 0 ? h.costTotal / h.totalAmount : 0;
      const rate = allRates.find((r: any) => r.code === h.code);
      h.currentPrice = rate?.buy ?? h.avgPrice;
      h.currentValue = h.totalAmount * h.currentPrice;
      h.gainLoss = h.currentValue - h.costTotal;
      h.gainLossPercent = h.costTotal > 0 ? (h.gainLoss / h.costTotal) * 100 : 0;
      h.lots.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
      result.push(h);
    }
    result.sort((a, b) => b.currentValue - a.currentValue);
    return result;
  }, [portfolio, currencies, goldRates]);

  const stats = useMemo(() => {
    let totalValue = 0, costTotal = 0, currencyValue = 0, goldValue = 0;
    for (const h of holdings) {
      totalValue += h.currentValue;
      costTotal += h.costTotal;
      if (h.type === "gold") goldValue += h.currentValue;
      else currencyValue += h.currentValue;
    }
    const gainLoss = totalValue - costTotal;
    const gainLossPercent = costTotal > 0 ? (gainLoss / costTotal) * 100 : 0;
    return { totalValue, costTotal, gainLoss, gainLossPercent, currencyValue, goldValue };
  }, [holdings]);

  const isPos = stats.gainLoss >= 0;
  const totalDist = stats.currencyValue + stats.goldValue;
  const currencyPct = totalDist > 0 ? (stats.currencyValue / totalDist) * 100 : 0;
  const goldPct = totalDist > 0 ? 100 - currencyPct : 0;

  const handleDeleteLot = (lotId: string) => {
    Alert.alert("Alımı Sil", "Bu alımı portföyünden silmek istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          removeFromPortfolio(lotId);
        },
      },
    ]);
  };

  const handleDeleteAll = (h: Holding) => {
    Alert.alert(
      `${h.code} – Tümünü Sil`,
      `${h.lots.length} alımın tamamını portföyünden silmek istediğine emin misin?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Tümünü Sil",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            for (const lot of h.lots) {
              await removeFromPortfolio(lot.id);
            }
            if (expandedKey === h.key) setExpandedKey(null);
          },
        },
      ]
    );
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
        data={holdings}
        keyExtractor={(h) => h.key}
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: 20 }}>
            <HoldingCard
              holding={item}
              colors={colors}
              expanded={expandedKey === item.key}
              onToggle={() => setExpandedKey((k) => (k === item.key ? null : item.key))}
              onDeleteLot={handleDeleteLot}
              onDeleteAll={() => handleDeleteAll(item)}
              index={index}
            />
          </View>
        )}
        ListHeaderComponent={
          holdings.length > 0 ? (
            <>
              <HeroSection />
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: 20, marginBottom: 16 }} />
              <View style={{ flexDirection: "row", alignItems: "baseline", paddingHorizontal: 20, marginBottom: 12 }}>
                <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
                  Varlıklarım
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginLeft: 8 }}>
                  {holdings.length}
                </Text>
              </View>
            </>
          ) : null
        }
        ListEmptyComponent={<EmptyPortfolio colors={colors} onAdd={() => setShowAddModal(true)} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={
          holdings.length > 0 ? (
            <View style={{ alignItems: "center", marginTop: 20, gap: 8 }}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.secondary,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 999,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
              }}>
                <Icon name="ellipsis-horizontal" size={11} color={colors.mutedForeground} />
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: -0.1 }}>
                  Detay İçin Dokun, Tüm Alımları Silmek İçin Basılı Tut
                </Text>
              </View>
            </View>
          ) : null
        }
        contentContainerStyle={[
          { paddingBottom: bottomPadding + 16, paddingTop: 4 },
          holdings.length === 0 && { flex: 1 },
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
