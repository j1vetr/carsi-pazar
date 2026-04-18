import React, { useState, useCallback, useMemo } from "react";
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
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Icon } from "@/components/Icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { AssetIcon } from "@/components/AssetIcon";
import { ScreenHeader } from "@/components/ScreenHeader";

// ── Number formatting ──────────────────────────────────────────────────────
const fmtAmount = (v: number): string => {
  if (!Number.isFinite(v) || v === 0) return "0,00";
  if (v >= 10000) return v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 100) return v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 1) return v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
};

// ── Picker modal ──────────────────────────────────────────────────────────
function CurrencyPickerModal({
  visible, onClose, onSelect, colors, title,
}: {
  visible: boolean; onClose: () => void; onSelect: (code: string) => void; colors: any; title: string;
}) {
  const { currencies, goldRates } = useApp();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const allAssets = useMemo(() => [
    { code: "TRY", nameTR: "Türk Lirası", assetType: "currency" as const },
    ...currencies.map((c) => ({ code: c.code, nameTR: c.nameTR, assetType: "currency" as const })),
    ...goldRates.map((g) => ({ code: g.code, nameTR: g.nameTR, assetType: "gold" as const })),
  ], [currencies, goldRates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    if (!q) return allAssets;
    return allAssets.filter((a) =>
      a.code.toLocaleLowerCase("tr-TR").includes(q) ||
      a.nameTR.toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [allAssets, search]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onDismiss={() => setSearch("")}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 14, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
            {title}
          </Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Icon name="close" size={24} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.secondary, borderRadius: 12, paddingHorizontal: 12 }}>
            <Icon name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Ara: USD, Altın, Euro…"
              placeholderTextColor={colors.mutedForeground}
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground }}
              autoCorrect={false}
              autoCapitalize="characters"
            />
          </View>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { Haptics.selectionAsync().catch(() => {}); onSelect(item.code); setSearch(""); onClose(); }}
              style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, opacity: pressed ? 0.6 : 1 }]}
            >
              <View style={{ marginRight: 14 }}>
                <AssetIcon code={item.code} type={item.assetType} size={36} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>{item.code}</Text>
                <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 2 }}>{item.nameTR}</Text>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 70 }} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  );
}

// ── Asset selector chip ────────────────────────────────────────────────────
function AssetSelector({
  code, nameTR, assetType, onPress, colors, label,
}: {
  code: string; nameTR: string; assetType: "currency" | "gold";
  onPress: () => void; colors: any; label: string;
}) {
  return (
    <View>
      <Text style={{ fontSize: 10.5, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.4, marginBottom: 8 }}>
        {label}
      </Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{
          flexDirection: "row", alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          paddingHorizontal: 12, paddingVertical: 10,
          opacity: pressed ? 0.7 : 1,
        }]}
      >
        <AssetIcon code={code} type={assetType} size={36} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
            {code}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 2 }}>
            {nameTR}
          </Text>
        </View>
        <Icon name="chevron-down" size={18} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────
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

  const allAssets = useMemo(() => [
    { code: "TRY", nameTR: "Türk Lirası", buy: 1, sell: 1, assetType: "currency" as const },
    ...currencies.map((c) => ({ ...c, assetType: "currency" as const })),
    ...goldRates.map((g) => ({ ...g, assetType: "gold" as const })),
  ] as any[], [currencies, goldRates]);

  const fromAsset = allAssets.find((a) => a.code === fromCode);
  const toAsset = allAssets.find((a) => a.code === toCode);

  const numAmount = parseFloat(amount.replace(",", ".")) || 0;
  const convertedAmount = convertAmount(fromCode, toCode, numAmount);
  const unitRate = convertAmount(fromCode, toCode, 1);

  const handleSwap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setFromCode(toCode);
    setToCode(fromCode);
  }, [fromCode, toCode]);

  const quickAmounts = [1, 10, 100, 1000, 10000];

  const COMMON_PAIRS = [
    { from: "USD", to: "TRY" },
    { from: "EUR", to: "TRY" },
    { from: "GBP", to: "TRY" },
    { from: "USD", to: "EUR" },
    { from: "ALTIN", to: "TRY" },
    { from: "CEYREK", to: "TRY" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader eyebrow="Hesaplayıcı" title="Çevirici" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPadding + 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* FROM */}
        <Animated.View entering={FadeIn.duration(300)} style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <AssetSelector
            code={fromCode}
            nameTR={fromAsset?.nameTR ?? ""}
            assetType={fromAsset?.assetType ?? "currency"}
            onPress={() => { Haptics.selectionAsync().catch(() => {}); setShowFromPicker(true); }}
            colors={colors}
            label="GÖNDERİYORUM"
          />

          {/* Amount input — full-width hero */}
          <Animated.View entering={FadeInUp.delay(60).duration(320)} style={{ marginTop: 8, paddingHorizontal: 4 }}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground + "60"}
              selectTextOnFocus
              style={{
                fontSize: 36,
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
                letterSpacing: -1,
                padding: 0,
                includeFontPadding: false,
              }}
            />
          </Animated.View>

          {/* Quick amounts */}
          <Animated.View entering={FadeInUp.delay(120).duration(320)} style={{ marginTop: 8 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: 8 }}>
              {quickAmounts.map((qa) => {
                const isActive = numAmount === qa;
                return (
                  <Pressable
                    key={qa}
                    onPress={() => { Haptics.selectionAsync().catch(() => {}); setAmount(qa.toString()); }}
                    style={({ pressed }) => [{
                      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
                      backgroundColor: isActive ? colors.primary : colors.card,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: isActive ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    }]}
                  >
                    <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: isActive ? colors.primaryForeground : colors.foreground, letterSpacing: -0.1 }}>
                      {qa.toLocaleString("tr-TR")}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Animated.View>

        {/* Swap divider */}
        <Animated.View entering={FadeIn.delay(160).duration(320)} style={{ alignItems: "center", marginVertical: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, width: "100%" }}>
            <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
            <Pressable
              onPress={handleSwap}
              style={({ pressed }) => [{
                width: 38, height: 38, borderRadius: 19,
                backgroundColor: colors.primary,
                alignItems: "center", justifyContent: "center",
                marginHorizontal: 14,
                opacity: pressed ? 0.8 : 1,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.22,
                shadowRadius: 6,
                elevation: 3,
              }]}
            >
              <Icon name="swap-vertical" size={18} color={colors.primaryForeground} />
            </Pressable>
            <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
          </View>
        </Animated.View>

        {/* TO */}
        <View style={{ paddingHorizontal: 20 }}>
          <AssetSelector
            code={toCode}
            nameTR={toAsset?.nameTR ?? ""}
            assetType={toAsset?.assetType ?? "currency"}
            onPress={() => { Haptics.selectionAsync().catch(() => {}); setShowToPicker(true); }}
            colors={colors}
            label="ALACAĞIM"
          />

          {/* Result — full width, primary color */}
          <Animated.View entering={FadeInUp.delay(60).duration(320)} style={{ marginTop: 8, paddingHorizontal: 4 }}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.4}
              style={{
                fontSize: 36,
                fontFamily: "Inter_700Bold",
                color: colors.primary,
                letterSpacing: -1,
                includeFontPadding: false,
              }}
            >
              {fmtAmount(convertedAmount)}
            </Text>
          </Animated.View>

          {/* Live rate hint */}
          {numAmount > 0 && unitRate > 0 && fromCode !== toCode && (
            <Animated.View entering={FadeIn.delay(120).duration(320)} style={{
              marginTop: 10,
              backgroundColor: colors.secondary,
              borderRadius: 10,
              paddingHorizontal: 12, paddingVertical: 8,
              flexDirection: "row", alignItems: "center", gap: 8,
            }}>
              <Icon name="trending-up" size={13} color={colors.primary} />
              <Text adjustsFontSizeToFit numberOfLines={1} style={{ flex: 1, fontSize: 12.5, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
                1 {fromCode} = {fmtAmount(unitRate)} {toCode}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Popular pairs */}
        <View style={{ marginTop: 18, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 }}>
            <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
              Popüler Çevirimler
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {COMMON_PAIRS.map((pair, idx) => {
              const res = convertAmount(pair.from, pair.to, 1);
              const fromA = allAssets.find((a) => a.code === pair.from);
              const toA = allAssets.find((a) => a.code === pair.to);
              return (
                <Animated.View key={`${pair.from}-${pair.to}`} entering={FadeInDown.delay(idx * 40).duration(280)}>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setFromCode(pair.from);
                      setToCode(pair.to);
                      setAmount("1");
                    }}
                    style={({ pressed }) => [{
                      backgroundColor: colors.card,
                      borderRadius: 14,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: colors.border,
                      paddingHorizontal: 14, paddingVertical: 12,
                      flexDirection: "row", alignItems: "center", gap: 10,
                      opacity: pressed ? 0.7 : 1,
                    }]}
                  >
                    <AssetIcon code={pair.from} type={fromA?.assetType ?? "currency"} size={28} />
                    <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.1 }}>
                      1 {pair.from}
                    </Text>
                    <Icon name="arrow-forward" size={13} color={colors.mutedForeground} />
                    <AssetIcon code={pair.to} type={toA?.assetType ?? "currency"} size={28} />
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                      <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.primary, letterSpacing: -0.2 }}>
                        {fmtAmount(res)}
                      </Text>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 1, letterSpacing: 0.3 }}>
                        {pair.to}
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
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
        title="Gönderdiğin"
      />
      <CurrencyPickerModal
        visible={showToPicker}
        onClose={() => setShowToPicker(false)}
        onSelect={setToCode}
        colors={colors}
        title="Aldığın"
      />
    </View>
  );
}
