import React, { useState, useCallback } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  FlatList,
} from "react-native";
import { Icon } from "@/components/Icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { AssetIcon } from "@/components/AssetIcon";

function CurrencyPickerModal({
  visible,
  onClose,
  onSelect,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  colors: any;
}) {
  const { currencies, goldRates } = useApp();
  const insets = useSafeAreaInsets();
  const allAssets = [
    { code: "TRY", nameTR: "Türk Lirası", assetType: "currency" as const },
    ...currencies.map((c) => ({ code: c.code, nameTR: c.nameTR, assetType: "currency" as const })),
    ...goldRates.map((g) => ({ code: g.code, nameTR: g.nameTR, assetType: "gold" as const })),
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }}>Para Birimi Seç</Text>
          <Pressable onPress={onClose}>
            <Icon name="close" size={24} color={colors.foreground} />
          </Pressable>
        </View>
        <FlatList
          data={allAssets}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { onSelect(item.code); onClose(); }}
              style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              <View style={{ marginRight: 14 }}>
                <AssetIcon code={item.code} type={item.assetType} size={36} />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{item.code}</Text>
                <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{item.nameTR}</Text>
              </View>
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        />
      </View>
    </Modal>
  );
}

export default function ConverterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currencies, goldRates, convertAmount } = useApp();

  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("TRY");
  const [amount, setAmount] = useState("1");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 84 : 60 + (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom);

  const allAssets = [
    { code: "TRY", nameTR: "Türk Lirası", buy: 1, sell: 1, assetType: "currency" as const },
    ...currencies.map((c) => ({ ...c, assetType: "currency" as const })),
    ...goldRates.map((g) => ({ ...g, assetType: "gold" as const })),
  ] as any[];

  const fromAsset = allAssets.find((a) => a.code === fromCode);
  const toAsset = allAssets.find((a) => a.code === toCode);

  const numAmount = parseFloat(amount) || 0;
  const convertedAmount = convertAmount(fromCode, toCode, numAmount);

  const handleSwap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  }, [fromCode, toCode]);

  const formatResult = (v: number) => {
    if (v === 0) return "0.00";
    if (v >= 10000) return v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (v >= 100) return v.toFixed(2);
    if (v >= 1) return v.toFixed(4);
    return v.toFixed(6);
  };

  const quickAmounts = [1, 10, 100, 500, 1000, 5000];

  const COMMON_PAIRS = [
    { from: "USD", to: "TRY" },
    { from: "EUR", to: "TRY" },
    { from: "GBP", to: "TRY" },
    { from: "USD", to: "EUR" },
    { from: "ALTIN", to: "TRY" },
    { from: "CEYREK", to: "TRY" },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topPadding + 16, paddingHorizontal: 20, paddingBottom: 16 },
    headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.5 },
    content: { flex: 1 },
    converterCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    currencySelector: {
      backgroundColor: colors.secondary,
      borderRadius: 14,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    currencyIcon: { fontSize: 28, marginRight: 12 },
    currencyCode: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground },
    currencyName: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    amountInput: {
      fontSize: 32,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "right",
      flex: 1,
    },
    swapBtn: {
      alignSelf: "center",
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 12,
    },
    resultSection: {
      backgroundColor: colors.secondary,
      borderRadius: 14,
      padding: 16,
    },
    resultAmount: {
      fontSize: 32,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    resultCode: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginTop: 4,
    },
    quickAmounts: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 16,
    },
    quickBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground },
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 0.8,
      marginBottom: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Çevirici</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: bottomPadding + 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.converterCard}>
          <Pressable style={styles.currencySelector} onPress={() => setShowFromPicker(true)}>
            <View style={{ marginRight: 12 }}>
              <AssetIcon code={fromCode} type={fromAsset?.assetType ?? "currency"} size={40} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.currencyCode}>{fromCode}</Text>
              <Text style={styles.currencyName} numberOfLines={1}>{fromAsset?.nameTR ?? ""}</Text>
            </View>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              selectTextOnFocus
            />
          </Pressable>

          <Pressable onPress={handleSwap} style={styles.swapBtn}>
            <Icon name="swap-vertical" size={22} color={colors.primaryForeground} />
          </Pressable>

          <View style={styles.resultSection}>
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
              onPress={() => setShowToPicker(true)}
            >
              <View style={{ marginRight: 12 }}>
                <AssetIcon code={toCode} type={toAsset?.assetType ?? "currency"} size={40} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.currencyCode}>{toCode}</Text>
                <Text style={styles.currencyName}>{toAsset?.nameTR ?? ""}</Text>
              </View>
              <Icon name="chevron-down" size={20} color={colors.mutedForeground} />
            </Pressable>
            <Text style={styles.resultAmount}>{formatResult(convertedAmount)}</Text>
            <Text style={styles.resultCode}>{toCode} karşılığı</Text>
          </View>

          <View style={styles.quickAmounts}>
            {quickAmounts.map((qa) => (
              <Pressable key={qa} style={styles.quickBtn} onPress={() => setAmount(qa.toString())}>
                <Text style={styles.quickBtnText}>{qa.toLocaleString("tr-TR")}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
          <Text style={styles.sectionTitle}>POPÜLER ÇEVİRİMLER</Text>
          <View style={{ gap: 8 }}>
            {COMMON_PAIRS.map((pair) => {
              const res = convertAmount(pair.from, pair.to, 1);
              const fromA = allAssets.find((a) => a.code === pair.from);
              const toA = allAssets.find((a) => a.code === pair.to);
              return (
                <Pressable
                  key={`${pair.from}-${pair.to}`}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: colors.radius,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  onPress={() => {
                    setFromCode(pair.from);
                    setToCode(pair.to);
                    setAmount("1");
                  }}
                >
                  <View style={{ marginRight: 8 }}>
                    <AssetIcon code={pair.from} type={fromA?.assetType ?? "currency"} size={24} />
                  </View>
                  <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                    1 {pair.from}
                  </Text>
                  <Icon name="arrow-forward" size={14} color={colors.mutedForeground} style={{ marginHorizontal: 8 }} />
                  <View style={{ marginRight: 6 }}>
                    <AssetIcon code={pair.to} type={toA?.assetType ?? "currency"} size={24} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.primary, textAlign: "right" }}>
                    {formatResult(res)} {pair.to}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <CurrencyPickerModal
        visible={showFromPicker}
        onClose={() => setShowFromPicker(false)}
        onSelect={setFromCode}
        colors={colors}
      />
      <CurrencyPickerModal
        visible={showToPicker}
        onClose={() => setShowToPicker(false)}
        onSelect={setToCode}
        colors={colors}
      />
    </View>
  );
}
