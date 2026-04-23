import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/Icon";
import { useApp } from "@/contexts/AppContext";
import type {
  AlertKind,
  AlertWindow,
  NewAlertInput,
} from "@/lib/alertTypes";
import { alertKindLabel, alertKindBadge } from "@/lib/alertTypes";
import { formatAlertPreview } from "@/lib/alertFormat";

const KINDS: AlertKind[] = ["price", "percent", "trend", "volatility"];
const PERCENT_WINDOWS = [1, 6, 12, 24];
const TREND_PRESETS = [2, 3, 5, 7];
const VOL_PRESETS = [1.5, 2, 3];

function parseHHMM(v: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mn = Number(m[2]);
  if (h < 0 || h > 23 || mn < 0 || mn > 59) return null;
  return { h, m: mn };
}

interface Props {
  visible: boolean;
  onClose: () => void;
  code: string;
  nameTR: string;
  currentPrice: number;
  type: "currency" | "gold";
  colors: any;
}

export function AddAlertModal({ visible, onClose, code, nameTR, currentPrice, type, colors }: Props) {
  const { addAlert, alertGroups, getPriceHistory } = useApp();
  const insets = useSafeAreaInsets();

  const [kind, setKind] = useState<AlertKind>("price");

  // Price
  const [priceDir, setPriceDir] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState(currentPrice.toFixed(2));

  // Percent
  const [pctDir, setPctDir] = useState<"up" | "down" | "any">("any");
  const [pctThreshold, setPctThreshold] = useState("2");
  const [pctWindow, setPctWindow] = useState<number>(24);

  // Trend
  const [trendDir, setTrendDir] = useState<"up" | "down">("up");
  const [trendDays, setTrendDays] = useState<number>(3);

  // Volatility
  const [volMultiplier, setVolMultiplier] = useState<number>(2);
  const [volLookback, setVolLookback] = useState<number>(7);

  // Window
  const [winEnabled, setWinEnabled] = useState(false);
  const [winStart, setWinStart] = useState("09:00");
  const [winEnd, setWinEnd] = useState("18:00");

  // Group
  const [groupId, setGroupId] = useState<string | null>(null);

  // Reset when a fresh open
  React.useEffect(() => {
    if (visible) {
      setTargetPrice(currentPrice.toFixed(2));
    }
  }, [visible, currentPrice]);

  const history = getPriceHistory(code);

  const preview = useMemo(() => {
    if (!visible) return "";
    const draft = buildAlert();
    if (!draft) return "";
    return formatAlertPreview(
      { ...draft, id: "preview" } as any,
      currentPrice,
      history,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    visible, kind, priceDir, targetPrice, pctDir, pctThreshold, pctWindow,
    trendDir, trendDays, volMultiplier, volLookback, currentPrice, history,
  ]);

  function buildAlert(): NewAlertInput | null {
    const base = {
      type,
      code,
      name: code,
      nameTR,
      active: true,
      triggered: false,
      ...(winEnabled ? { window: parseWindow() } : {}),
      ...(groupId ? { groupId } : {}),
    };
    if (winEnabled && !base.window) return null;

    switch (kind) {
      case "price": {
        const p = parseFloat(targetPrice.replace(",", "."));
        if (!Number.isFinite(p) || p <= 0) return null;
        return { ...base, kind: "price", direction: priceDir, targetPrice: p };
      }
      case "percent": {
        const pct = parseFloat(pctThreshold.replace(",", "."));
        if (!Number.isFinite(pct) || pct <= 0) return null;
        return {
          ...base,
          kind: "percent",
          direction: pctDir,
          thresholdPct: pct,
          windowHours: pctWindow,
        };
      }
      case "trend":
        return { ...base, kind: "trend", direction: trendDir, days: trendDays };
      case "volatility":
        return {
          ...base,
          kind: "volatility",
          multiplier: volMultiplier,
          lookbackDays: volLookback,
        };
    }
  }

  function parseWindow(): AlertWindow | undefined {
    const s = parseHHMM(winStart);
    const e = parseHHMM(winEnd);
    if (!s || !e) return undefined;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return {
      start: `${pad(s.h)}:${pad(s.m)}`,
      end: `${pad(e.h)}:${pad(e.m)}`,
    };
  }

  const draft = visible ? buildAlert() : null;
  const canSubmit = !!draft;

  const handleAdd = async () => {
    if (!draft) return;
    await addAlert(draft);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const chip = (label: string, on: boolean, onPress: () => void, key?: string) => (
    <Pressable
      key={key ?? label}
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: on ? colors.foreground : colors.secondary,
        borderWidth: 1,
        borderColor: on ? colors.foreground : colors.border,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={{
        fontSize: 13,
        fontFamily: "Inter_600SemiBold",
        color: on ? colors.background : colors.mutedForeground,
      }}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16,
          flexDirection: "row", alignItems: "center",
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          <Text style={{ flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }}>
            Yeni Alarm — {nameTR}
          </Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Kapat">
            <Icon name="close" size={24} color={colors.foreground} />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 140, gap: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Kind tabs */}
          <View>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>
              ALARM TİPİ
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {KINDS.map((k) => {
                const on = kind === k;
                const b = alertKindBadge(k);
                return (
                  <Pressable
                    key={k}
                    onPress={() => setKind(k)}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: on ? colors.foreground : colors.card,
                      borderWidth: 1,
                      borderColor: on ? colors.foreground : colors.border,
                      flexDirection: "row", alignItems: "center", gap: 6,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={alertKindLabel(k)}
                  >
                    <Text style={{ color: on ? colors.background : b.color, fontSize: 13 }}>
                      {b.glyph}
                    </Text>
                    <Text style={{
                      fontSize: 13,
                      fontFamily: "Inter_600SemiBold",
                      color: on ? colors.background : colors.foreground,
                    }}>
                      {alertKindLabel(k)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Kind-specific fields */}
          {kind === "price" && (
            <>
              <View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>YÖN</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {([["above", "Üzerine Çıkınca", "trending-up", colors.rise], ["below", "Altına Düşünce", "trending-down", colors.fall]] as const).map(([d, lbl, ic, clr]) => {
                    const on = priceDir === d;
                    return (
                      <Pressable
                        key={d}
                        onPress={() => setPriceDir(d)}
                        style={{
                          flex: 1, paddingVertical: 12, borderRadius: 10,
                          backgroundColor: on ? clr + "20" : colors.secondary,
                          borderWidth: 1, borderColor: on ? clr : colors.border,
                          alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6,
                        }}
                        accessibilityRole="button"
                      >
                        <Icon name={ic as any} size={16} color={on ? clr : colors.mutedForeground} />
                        <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: on ? clr : colors.mutedForeground }}>{lbl}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>HEDEF FİYAT (₺)</Text>
                <TextInput
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.mutedForeground}
                  style={{
                    backgroundColor: colors.card, borderRadius: 10,
                    borderWidth: 1, borderColor: colors.border,
                    padding: 14, fontSize: 18,
                    fontFamily: "Inter_600SemiBold", color: colors.foreground,
                  }}
                />
              </View>
            </>
          )}

          {kind === "percent" && (
            <>
              <View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>YÖN</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {chip("Yükseliş", pctDir === "up", () => setPctDir("up"), "u")}
                  {chip("Düşüş", pctDir === "down", () => setPctDir("down"), "d")}
                  {chip("Her İki Yön", pctDir === "any", () => setPctDir("any"), "a")}
                </View>
              </View>
              <View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>EŞİK (%)</Text>
                <TextInput
                  value={pctThreshold}
                  onChangeText={setPctThreshold}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.card, borderRadius: 10,
                    borderWidth: 1, borderColor: colors.border,
                    padding: 14, fontSize: 18,
                    fontFamily: "Inter_600SemiBold", color: colors.foreground,
                  }}
                />
              </View>
              <View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>ZAMAN PENCERESİ</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {PERCENT_WINDOWS.map((h) => chip(`${h} saat`, pctWindow === h, () => setPctWindow(h), `w${h}`))}
                </View>
              </View>
            </>
          )}

          {kind === "trend" && (
            <>
              <View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>YÖN</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {(["up", "down"] as const).map((d) => {
                    const on = trendDir === d;
                    const clr = d === "up" ? colors.rise : colors.fall;
                    return (
                      <Pressable key={d} onPress={() => setTrendDir(d)}
                        style={{
                          flex: 1, paddingVertical: 12, borderRadius: 10,
                          backgroundColor: on ? clr + "20" : colors.secondary,
                          borderWidth: 1, borderColor: on ? clr : colors.border,
                          alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6,
                        }}>
                        <Icon name={d === "up" ? "trending-up" : "trending-down"} size={16} color={on ? clr : colors.mutedForeground} />
                        <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: on ? clr : colors.mutedForeground }}>
                          {d === "up" ? "Yukarı Trend" : "Aşağı Trend"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>ARDIŞIK GÜN</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {TREND_PRESETS.map((d) => chip(`${d} gün`, trendDays === d, () => setTrendDays(d), `t${d}`))}
                </View>
              </View>
            </>
          )}

          {kind === "volatility" && (
            <>
              <View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>HASSASİYET (ORTALAMANIN KATI)</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {VOL_PRESETS.map((m) => chip(`${m.toFixed(1)}×`, volMultiplier === m, () => setVolMultiplier(m), `v${m}`))}
                </View>
              </View>
              <View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>GERİYE BAKIŞ</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[3, 5, 7].map((d) => chip(`${d} gün`, volLookback === d, () => setVolLookback(d), `vl${d}`))}
                </View>
              </View>
            </>
          )}

          {/* Window */}
          <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                  Pencere Ayarı
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>
                  Sadece şu saatler arası tetikle
                </Text>
              </View>
              <Switch
                value={winEnabled}
                onValueChange={setWinEnabled}
                accessibilityLabel="Pencere ayarını aç/kapat"
              />
            </View>
            {winEnabled && (
              <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 4 }}>BAŞLANGIÇ</Text>
                  <TextInput
                    value={winStart}
                    onChangeText={setWinStart}
                    placeholder="09:00"
                    placeholderTextColor={colors.mutedForeground}
                    style={{ backgroundColor: colors.secondary, borderRadius: 8, padding: 10, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, textAlign: "center" }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 4 }}>BİTİŞ</Text>
                  <TextInput
                    value={winEnd}
                    onChangeText={setWinEnd}
                    placeholder="18:00"
                    placeholderTextColor={colors.mutedForeground}
                    style={{ backgroundColor: colors.secondary, borderRadius: 8, padding: 10, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, textAlign: "center" }}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Group */}
          {alertGroups.length > 0 && (
            <View>
              <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8 }}>GRUP</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {chip("Grup Yok", groupId === null, () => setGroupId(null), "gn")}
                {alertGroups.map((g) => chip(g.name, groupId === g.id, () => setGroupId(g.id), g.id))}
              </View>
            </View>
          )}

          {/* Preview */}
          <View style={{ backgroundColor: colors.secondary, borderRadius: 10, padding: 14 }}>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.8, marginBottom: 6 }}>ÖNİZLEME</Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 19 }}>
              {preview || "Alarm kurmak için bir değer girin."}
            </Text>
          </View>
        </ScrollView>

        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: 20,
          paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20,
          backgroundColor: colors.background,
          borderTopWidth: 1, borderTopColor: colors.border,
        }}>
          <Pressable
            onPress={handleAdd}
            disabled={!canSubmit}
            style={{
              backgroundColor: canSubmit ? colors.primary : colors.border,
              paddingVertical: 16, borderRadius: 14, alignItems: "center",
              opacity: canSubmit ? 1 : 0.6,
            }}
            accessibilityRole="button"
            accessibilityLabel="Alarm kur"
          >
            <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground }}>
              Alarm Kur
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
