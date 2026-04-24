import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useApp, type PortfolioItem } from "@/contexts/AppContext";
import { useHistoricalPriceAt } from "@/hooks/useHistoricalPriceAt";
import { formatSymbolName } from "@/lib/utils/symbolDescriptions";

const fmtPrice = (v: number) =>
  v >= 100
    ? v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const fmtAmount = (v: number) =>
  Number.isInteger(v) ? v.toString() : v.toLocaleString("tr-TR", { maximumFractionDigits: 4 });

export function TxModal({
  visible,
  onClose,
  initialSide = "buy",
  lockedCode,
  lockedType,
}: {
  visible: boolean;
  onClose: () => void;
  initialSide?: "buy" | "sell";
  lockedCode?: string;
  lockedType?: "currency" | "gold";
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currencies, goldRates, banks, addToPortfolio, sellFromPortfolio, availableAmount } = useApp();

  const [side, setSide] = useState<"buy" | "sell">(initialSide);
  const [selectedCode, setSelectedCode] = useState(lockedCode ?? "USD");
  const [selectedType, setSelectedType] = useState<"currency" | "gold">(lockedType ?? "currency");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [datePreset, setDatePreset] = useState<"today" | "yesterday" | "custom">("today");
  const [customDate, setCustomDate] = useState("");

  useEffect(() => {
    if (visible) {
      setSide(initialSide);
      if (lockedCode) setSelectedCode(lockedCode);
      if (lockedType) setSelectedType(lockedType);
      setDatePreset("today");
      setCustomDate("");
    }
  }, [visible, initialSide, lockedCode, lockedType]);

  const resolvedDate = useMemo(() => {
    if (datePreset === "today") return new Date();
    if (datePreset === "yesterday") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    }
    const m = customDate.trim().match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
    if (!m) return null;
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    if (year < 1970 || year > 9999) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const d = new Date(year, month - 1, day, 12, 0, 0);
    // Calendar-valid: rolled-over dates (e.g. 31.02) fail this check
    if (
      d.getFullYear() !== year ||
      d.getMonth() !== month - 1 ||
      d.getDate() !== day
    ) {
      return null;
    }
    // Reject any date strictly after today (day-level comparison)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const picked = new Date(year, month - 1, day);
    if (picked.getTime() > today.getTime()) return null;
    return d;
  }, [datePreset, customDate]);

  const dateLabel = useMemo(() => {
    if (!resolvedDate) return "Geçersiz tarih";
    const dd = String(resolvedDate.getDate()).padStart(2, "0");
    const mm = String(resolvedDate.getMonth() + 1).padStart(2, "0");
    const yy = resolvedDate.getFullYear();
    return `${dd}.${mm}.${yy}`;
  }, [resolvedDate]);

  const allAssets = useMemo(
    () => [
      ...currencies.map((c) => ({ ...c, assetType: "currency" as const })),
      ...goldRates.map((g) => ({ ...g, assetType: "gold" as const })),
      ...banks.map((b) => ({
        ...b,
        assetType: (b.code === "BANKAUSD" ? "currency" : "gold") as "currency" | "gold",
      })),
    ],
    [currencies, goldRates, banks],
  );
  const selectedAsset = allAssets.find((a) => a.code === selectedCode);
  const isCurrency = selectedType === "currency";

  const have = useMemo(
    () => availableAmount(selectedCode, selectedType),
    [availableAmount, selectedCode, selectedType],
  );

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSubmit = async () => {
    const amt = parseFloat(amount.replace(",", "."));
    const pr = parseFloat(price.replace(",", "."));
    if (!amt || !pr || !selectedAsset) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    if (!resolvedDate) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert("Tarih hatalı", "Lütfen tarihi GG.AA.YYYY formatında ve bugünden ileri olmayacak şekilde gir.");
      return;
    }
    const iso = resolvedDate.toISOString();
    if (side === "sell") {
      const res = await sellFromPortfolio({
        code: selectedCode,
        type: selectedType,
        name: selectedAsset.name,
        nameTR: selectedAsset.nameTR,
        amount: amt,
        price: pr,
        date: iso,
      });
      if (!res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        Alert.alert(
          "Yetersiz miktar",
          `Elinde yalnızca ${fmtAmount(have)} ${selectedCode} var. Daha fazlasını satamazsın.`,
        );
        return;
      }
    } else {
      const payload: Omit<PortfolioItem, "id"> = {
        type: selectedType,
        code: selectedCode,
        name: selectedAsset.name,
        nameTR: selectedAsset.nameTR,
        amount: amt,
        purchasePrice: pr,
        purchaseDate: iso,
        side: "buy",
      };
      await addToPortfolio(payload);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setAmount("");
    setPrice("");
    onClose();
  };

  const submitColor =
    side === "sell"
      ? colors.fall
      : isCurrency
        ? colors.primary
        : colors.gold;
  const submitTextColor =
    side === "sell"
      ? "#FFFFFF"
      : isCurrency
        ? colors.primaryForeground
        : "#1A0F00";

  const canSellAsset = (code: string, t: "currency" | "gold") => availableAmount(code, t) > 0;

  const handleCustomDateChange = useCallback((text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }
    setCustomDate(formatted);
  }, []);

  // Hook sadece şu durumda fetch tetikler: modal açık + alış işlemi + geçmiş tarih
  const historicalDate = useMemo(
    () =>
      visible && side === "buy" && datePreset !== "today" && resolvedDate
        ? resolvedDate
        : null,
    [visible, side, datePreset, resolvedDate],
  );
  const historical = useHistoricalPriceAt(selectedCode, historicalDate);

  const historicalSourceLabel = useMemo(() => {
    if (!historical.point) return "";
    const d = new Date(historical.point.t);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}.${mm}.${yy}`;
  }, [historical.point]);

  const historicalChangePct = useMemo(() => {
    if (!historical.point || !selectedAsset || historical.point.c <= 0) return null;
    return ((selectedAsset.buy - historical.point.c) / historical.point.c) * 100;
  }, [historical.point, selectedAsset]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={{
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 14,
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: colors.foreground,
              letterSpacing: -0.3,
            }}
          >
            {side === "sell" ? "Satış Kaydet" : "Varlık Ekle"}
          </Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Icon name="close" size={24} color={colors.foreground} />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }}>
          {!lockedCode ? (
            <View
              style={{
                flexDirection: "row",
                gap: 6,
                padding: 4,
                backgroundColor: colors.secondary,
                borderRadius: 14,
              }}
            >
              {(["buy", "sell"] as const).map((s) => {
                const active = side === s;
                const bg = active ? (s === "sell" ? colors.fall : colors.primary) : "transparent";
                const fg = active ? "#FFFFFF" : colors.mutedForeground;
                return (
                  <Pressable
                    key={s}
                    style={{
                      flex: 1,
                      paddingVertical: 11,
                      borderRadius: 10,
                      backgroundColor: bg,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setSide(s);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_700Bold",
                        color: fg,
                        letterSpacing: -0.1,
                      }}
                    >
                      {s === "buy" ? "Alım" : "Satış"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {!lockedCode ? (
            <View
              style={{
                flexDirection: "row",
                gap: 6,
                padding: 4,
                backgroundColor: colors.secondary,
                borderRadius: 14,
              }}
            >
              <Pressable
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: isCurrency ? colors.card : "transparent",
                  alignItems: "center",
                }}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSelectedType("currency");
                  setSelectedCode("USD");
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter_700Bold",
                    color: isCurrency ? colors.foreground : colors.mutedForeground,
                  }}
                >
                  Döviz
                </Text>
              </Pressable>
              <Pressable
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: !isCurrency ? colors.card : "transparent",
                  alignItems: "center",
                }}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSelectedType("gold");
                  setSelectedCode("ALTIN");
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter_700Bold",
                    color: !isCurrency ? colors.foreground : colors.mutedForeground,
                  }}
                >
                  Altın / Maden
                </Text>
              </Pressable>
            </View>
          ) : null}

          {!lockedCode ? (
            <View>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_700Bold",
                  color: colors.mutedForeground,
                  marginBottom: 10,
                  letterSpacing: 0.6,
                }}
              >
                {side === "sell" ? "SATILACAK VARLIK" : isCurrency ? "PARA BİRİMİ SEÇ" : "MADEN SEÇ"}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: 8 }}
              >
                {allAssets
                  .filter((a) => a.assetType === selectedType)
                  .filter((a) => side === "buy" || canSellAsset(a.code, a.assetType))
                  .map((asset) => {
                    const active = selectedCode === asset.code;
                    return (
                      <Pressable
                        key={asset.code}
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => {});
                          setSelectedCode(asset.code);
                        }}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 9,
                          borderRadius: 999,
                          backgroundColor: active ? colors.primary : colors.card,
                          borderWidth: StyleSheet.hairlineWidth,
                          borderColor: active ? colors.primary : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "Inter_700Bold",
                            color: active ? colors.primaryForeground : colors.foreground,
                          }}
                        >
                          {formatSymbolName(asset.code)}
                        </Text>
                      </Pressable>
                    );
                  })}
              </ScrollView>
              {side === "sell" && allAssets.filter((a) => a.assetType === selectedType).every((a) => !canSellAsset(a.code, a.assetType)) ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    marginTop: 8,
                  }}
                >
                  Bu kategoride satılacak bir varlığın yok.
                </Text>
              ) : null}
            </View>
          ) : null}

          {selectedAsset ? (
            <View
              style={{
                backgroundColor: colors.secondary,
                borderRadius: 14,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_700Bold",
                    color: colors.mutedForeground,
                    letterSpacing: 0.5,
                  }}
                >
                  {lockedCode ? formatSymbolName(selectedAsset.code).toUpperCase() : "GÜNCEL FİYAT"}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter_500Medium",
                    color: colors.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  {selectedAsset.nameTR}
                </Text>
                {side === "sell" ? (
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Inter_700Bold",
                      color: colors.primary,
                      marginTop: 4,
                      letterSpacing: -0.1,
                    }}
                  >
                    Elinde: {fmtAmount(have)}
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={() => {
                  setPrice(String(selectedAsset.buy));
                  Haptics.selectionAsync().catch(() => {});
                }}
                style={{
                  alignItems: "flex-end",
                }}
              >
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={{
                    fontSize: 22,
                    fontFamily: "Inter_700Bold",
                    color: colors.foreground,
                    letterSpacing: -0.5,
                  }}
                >
                  ₺{fmtPrice(selectedAsset.buy)}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Inter_600SemiBold",
                    color: colors.primary,
                    marginTop: 2,
                  }}
                >
                  Kullan
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_700Bold",
                  color: colors.mutedForeground,
                  letterSpacing: 0.6,
                }}
              >
                {side === "sell" ? "SATILACAK MİKTAR" : isCurrency ? "TUTAR" : "GRAM / ADET"}
              </Text>
              {side === "sell" && have > 0 ? (
                <Pressable
                  onPress={() => {
                    setAmount(String(have));
                    Haptics.selectionAsync().catch(() => {});
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Inter_700Bold",
                      color: colors.primary,
                      letterSpacing: -0.1,
                    }}
                  >
                    TÜMÜ
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder={side === "sell" ? `En fazla ${fmtAmount(have)}` : "Örn: 1000"}
              placeholderTextColor={colors.mutedForeground}
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
                padding: 14,
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: colors.foreground,
              }}
            />
          </View>

          <View>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter_700Bold",
                color: colors.mutedForeground,
                marginBottom: 8,
                letterSpacing: 0.6,
              }}
            >
              {side === "sell" ? "SATIŞ FİYATI (₺)" : isCurrency ? "ALIM KURU (₺)" : "ALIM FİYATI (₺)"}
            </Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder={selectedAsset ? fmtPrice(selectedAsset.buy) : "0.00"}
              placeholderTextColor={colors.mutedForeground}
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
                padding: 14,
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: colors.foreground,
              }}
            />
          </View>

          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_700Bold",
                  color: colors.mutedForeground,
                  letterSpacing: 0.6,
                }}
              >
                İŞLEM TARİHİ
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_600SemiBold",
                  color: resolvedDate ? colors.primary : colors.fall,
                  letterSpacing: -0.1,
                }}
              >
                {dateLabel}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {(
                [
                  { k: "today", label: "Bugün" },
                  { k: "yesterday", label: "Dün" },
                  { k: "custom", label: "Özel" },
                ] as const
              ).map((opt) => {
                const active = datePreset === opt.k;
                return (
                  <Pressable
                    key={opt.k}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setDatePreset(opt.k);
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 11,
                      borderRadius: 10,
                      alignItems: "center",
                      backgroundColor: active ? colors.primary : colors.card,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: active ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Inter_700Bold",
                        color: active ? colors.primaryForeground : colors.foreground,
                        letterSpacing: -0.1,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {datePreset === "custom" ? (
              <TextInput
                value={customDate}
                onChangeText={handleCustomDateChange}
                placeholder="GG.AA.YYYY"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                inputMode="numeric"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                textContentType="none"
                importantForAutofill="no"
                maxLength={10}
                style={{
                  marginTop: 8,
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.border,
                  padding: 14,
                  fontSize: 15,
                  fontFamily: "Inter_600SemiBold",
                  color: colors.foreground,
                  letterSpacing: 1,
                }}
              />
            ) : null}

            {historical.supported && historical.point && side === "buy" ? (
              <Pressable
                onPress={() => {
                  if (historical.point) {
                    setPrice(String(historical.point.c));
                    Haptics.selectionAsync().catch(() => {});
                  }
                }}
                style={({ pressed }) => ({
                  marginTop: 10,
                  backgroundColor: colors.secondary,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontFamily: "Inter_700Bold",
                      color: colors.mutedForeground,
                      letterSpacing: 0.5,
                    }}
                  >
                    O GÜNKÜ PİYASA
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_700Bold",
                      color: colors.foreground,
                      marginTop: 3,
                      letterSpacing: -0.3,
                    }}
                  >
                    ₺{fmtPrice(historical.point.c)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Inter_500Medium",
                      color: colors.mutedForeground,
                      marginTop: 2,
                    }}
                  >
                    {historicalSourceLabel}
                    {historicalChangePct != null
                      ? `  ·  bugüne göre ${historicalChangePct >= 0 ? "+" : "−"}%${Math.abs(historicalChangePct).toFixed(2)}`
                      : ""}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 8,
                    backgroundColor: colors.card,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_700Bold",
                      color: colors.primary,
                      letterSpacing: -0.1,
                    }}
                  >
                    Kullan
                  </Text>
                </View>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>

        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: bottomPad + 12,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => ({
              backgroundColor: submitColor,
              paddingVertical: 15,
              borderRadius: 14,
              alignItems: "center",
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter_700Bold",
                color: submitTextColor,
                letterSpacing: -0.2,
              }}
            >
              {side === "sell" ? "Satışı Kaydet" : "Portföye Ekle"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
