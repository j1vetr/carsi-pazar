import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useColors } from "@/hooks/useColors";
import { SYMBOL_REGISTRY } from "@/lib/haremApi";
import {
  DEFAULT_WIDGET_CONFIG,
  readWidgetConfig,
  writeWidgetConfig,
  type PriceField,
  type WidgetConfig,
  type WidgetTheme,
} from "@/widgets/config";
import { refreshPriceWidget } from "@/widgets/refresh";
import {
  isOngoingEnabled,
  refreshOngoingNotificationIfEnabled,
  startOngoingNotification,
  stopOngoingNotification,
} from "@/lib/ongoingNotification";

const LOGO_DARK = require("@/assets/images/logo-dark.png");
const LOGO_LIGHT = require("@/assets/images/logo-light.png");

type Colors = ReturnType<typeof useColors>;

type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

function Segmented<T extends string>({
  colors,
  options,
  value,
  onChange,
}: {
  colors: Colors;
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.secondary,
        borderRadius: 12,
        padding: 4,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(opt.value);
            }}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 9,
              backgroundColor: active ? colors.card : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12.5,
                fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                color: active ? colors.foreground : colors.mutedForeground,
                letterSpacing: -0.1,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SectionLabel({ colors, children }: { colors: Colors; children: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontFamily: "Inter_700Bold",
        color: colors.mutedForeground,
        letterSpacing: 1.2,
        paddingHorizontal: 4,
        paddingBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

function Card({ colors, children }: { colors: Colors; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      }}
    >
      {children}
    </View>
  );
}

/* ─────────────────  PREVIEW (mirrors native PulseView)  ───────────────── */

const PREVIEW_TINTS_LIGHT = ["#1D4ED8", "#0F766E", "#B45309", "#BE123C"];
const PREVIEW_TINTS_DARK = ["#60A5FA", "#2DD4BF", "#F59E0B", "#FB7185"];

const PREVIEW_PALETTE = {
  light: {
    bg: "#F1F4FB",
    card: "#FFFFFF",
    border: "#E2E8F0",
    divider: "#EEF2F7",
    fg: "#0F172A",
    muted: "#64748B",
    refreshBg: "#0B1220",
    refreshFg: "#FFFFFF",
    up: "#15803D",
    upBg: "rgba(22,163,74,0.15)",
    down: "#B91C1C",
    downBg: "rgba(220,38,38,0.15)",
    flat: "#64748B",
    flatBg: "rgba(100,116,139,0.15)",
    tints: PREVIEW_TINTS_LIGHT,
    logo: LOGO_LIGHT,
  },
  dark: {
    bg: "#05070E",
    card: "#10172A",
    border: "#1F2A44",
    divider: "#1B2540",
    fg: "#F8FAFC",
    muted: "#94A3B8",
    refreshBg: "#2563EB",
    refreshFg: "#FFFFFF",
    up: "#4ADE80",
    upBg: "rgba(34,197,94,0.20)",
    down: "#FCA5A5",
    downBg: "rgba(248,113,113,0.20)",
    flat: "#94A3B8",
    flatBg: "rgba(148,163,184,0.20)",
    tints: PREVIEW_TINTS_DARK,
    logo: LOGO_DARK,
  },
};

interface PreviewRow {
  label: string;
  buy: string;
  sell: string;
  changePercent: number;
}

const SAMPLE_ROWS: PreviewRow[] = [
  { label: "USD",    buy: "34,2050", sell: "34,2180", changePercent: 0.42 },
  { label: "EUR",    buy: "37,0810", sell: "37,1045", changePercent: 0.18 },
  { label: "GRAM",   buy: "2.855,40", sell: "2.856,90", changePercent: -0.07 },
  { label: "ÇEYREK", buy: "4.710,00", sell: "4.712,00", changePercent: 0.31 },
];

function fmtPercent(v: number): string {
  if (!Number.isFinite(v) || v === 0) return "0,00%";
  const abs = Math.abs(v).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${v > 0 ? "▲" : "▼"} ${abs}%`;
}

function PreviewCell({
  row,
  tint,
  pal,
  isFirst,
  priceField,
}: {
  row: PreviewRow;
  tint: string;
  pal: typeof PREVIEW_PALETTE.light;
  isFirst: boolean;
  priceField: PriceField;
}) {
  const up = row.changePercent > 0;
  const down = row.changePercent < 0;
  const cColor = up ? pal.up : down ? pal.down : pal.flat;
  const cBg = up ? pal.upBg : down ? pal.downBg : pal.flatBg;
  const value = priceField === "buy" ? row.buy : row.sell;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        borderLeftWidth: isFirst ? 0 : 1,
        borderLeftColor: pal.divider,
        height: "100%",
      }}
    >
      <View
        style={{
          width: 3,
          height: 38,
          backgroundColor: tint,
          borderRadius: 2,
          marginRight: 6,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: pal.muted, letterSpacing: 0.4 }}
        >
          {row.label}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            fontWeight: "700",
            fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
            color: pal.fg,
            marginTop: 2,
          }}
        >
          {value}
        </Text>
        <View
          style={{
            backgroundColor: cBg,
            borderRadius: 4,
            paddingHorizontal: 4,
            paddingVertical: 1,
            alignSelf: "flex-start",
            marginTop: 3,
          }}
        >
          <Text
            numberOfLines={1}
            style={{ fontSize: 8.5, fontFamily: "Inter_700Bold", color: cColor }}
          >
            {fmtPercent(row.changePercent)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function WidgetPreview({
  codes,
  priceField,
  themeMode,
  systemDark,
}: {
  codes: string[];
  priceField: PriceField;
  themeMode: WidgetTheme;
  systemDark: boolean;
}) {
  const isDark = themeMode === "dark" || (themeMode === "auto" && systemDark);
  const pal = isDark ? PREVIEW_PALETTE.dark : PREVIEW_PALETTE.light;

  const rows: PreviewRow[] = codes.slice(0, 4).map((code, i) => {
    const meta = SYMBOL_REGISTRY.find((m) => m.code === code);
    const sample = SAMPLE_ROWS[i] ?? SAMPLE_ROWS[0];
    return { ...sample, label: meta?.code ?? code };
  });

  return (
    <View
      style={{
        height: 116,
        borderRadius: 18,
        backgroundColor: pal.bg,
        padding: 4,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: pal.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: pal.border,
          flexDirection: "row",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* logo */}
        <View style={{ width: 78, alignItems: "center", justifyContent: "center" }}>
          <Image
            source={pal.logo}
            style={{ width: 64, height: 16, resizeMode: "contain" }}
          />
        </View>
        <View style={{ width: 1, height: "70%", backgroundColor: pal.divider }} />

        {/* cells */}
        <View style={{ flex: 1, flexDirection: "row", height: "100%" }}>
          {rows.map((row, i) => (
            <PreviewCell
              key={`${row.label}-${i}`}
              row={row}
              tint={pal.tints[i] ?? pal.tints[0]}
              pal={pal}
              isFirst={i === 0}
              priceField={priceField}
            />
          ))}
        </View>

        {/* refresh */}
        <View style={{ width: 60, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: pal.refreshBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="refresh" size={18} color={pal.refreshFg} />
          </View>
          <Text
            style={{
              fontSize: 8,
              fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
              fontWeight: "700",
              color: pal.muted,
              marginTop: 3,
            }}
          >
            14:32
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ───────────────────────  SYMBOL SLOTS + PICKER  ─────────────────────── */

function SymbolSlot({
  colors,
  index,
  code,
  onPress,
}: {
  colors: Colors;
  index: number;
  code: string;
  onPress: () => void;
}) {
  const meta = SYMBOL_REGISTRY.find((m) => m.code === code);
  const title = meta?.code ?? code;
  const subtitle = meta?.nameTR ?? "Sembol seç";
  const isGold =
    meta?.category === "MADEN" ||
    meta?.category === "SARRAFIYE" ||
    meta?.category === "GRAM ALTIN";
  const accent = isGold ? "#F59E0B" : "#3B82F6";
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 11,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: colors.secondary,
        marginBottom: 8,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: accent + "22",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: accent }}>
          {index + 1}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_700Bold",
            color: colors.foreground,
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 11.5,
            fontFamily: "Inter_500Medium",
            color: colors.mutedForeground,
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
      </View>
      <Icon name="chevron-forward" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

function SymbolPickerModal({
  visible,
  onClose,
  onPick,
  colors,
  excludeCodes,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (code: string) => void;
  colors: Colors;
  excludeCodes: string[];
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    const filtered = SYMBOL_REGISTRY.filter((s) => {
      if (!q) return true;
      return (
        s.code.toLocaleLowerCase("tr").includes(q) ||
        s.nameTR.toLocaleLowerCase("tr").includes(q)
      );
    });
    const map = new Map<string, typeof SYMBOL_REGISTRY>();
    for (const s of filtered) {
      const arr = map.get(s.category) ?? [];
      arr.push(s);
      map.set(s.category, arr);
    }
    return Array.from(map.entries());
  }, [query]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="formSheet"
    >
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomColor: colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 17,
              fontFamily: "Inter_700Bold",
              color: colors.foreground,
              letterSpacing: -0.3,
            }}
          >
            Sembol Seç
          </Text>
          <Pressable
            onPress={onClose}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 9,
              backgroundColor: colors.secondary,
            }}
          >
            <Text
              style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground }}
            >
              Kapat
            </Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.secondary,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: Platform.OS === "ios" ? 10 : 6,
            }}
          >
            <Icon name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Ara: USD, Çeyrek, EUR…"
              placeholderTextColor={colors.mutedForeground}
              style={{
                flex: 1,
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: colors.foreground,
                padding: 0,
              }}
            />
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {grouped.map(([category, items]) => (
            <View key={category} style={{ marginBottom: 18 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_700Bold",
                  color: colors.mutedForeground,
                  letterSpacing: 1.2,
                  paddingBottom: 8,
                  paddingHorizontal: 4,
                }}
              >
                {category}
              </Text>
              {items.map((s) => {
                const taken = excludeCodes.includes(s.code);
                return (
                  <Pressable
                    key={s.code}
                    disabled={taken}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      onPick(s.code);
                    }}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 11,
                      paddingHorizontal: 12,
                      borderRadius: 11,
                      backgroundColor: colors.card,
                      marginBottom: 6,
                      opacity: taken ? 0.35 : pressed ? 0.7 : 1,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: colors.border,
                    })}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Inter_700Bold",
                          color: colors.foreground,
                          letterSpacing: -0.2,
                        }}
                      >
                        {s.code}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11.5,
                          fontFamily: "Inter_500Medium",
                          color: colors.mutedForeground,
                          marginTop: 1,
                        }}
                      >
                        {s.nameTR}
                      </Text>
                    </View>
                    {taken ? (
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Inter_700Bold",
                          color: colors.mutedForeground,
                          letterSpacing: 0.6,
                        }}
                      >
                        EKLİ
                      </Text>
                    ) : (
                      <Icon name="add" size={18} color={colors.mutedForeground} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
          {grouped.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                paddingTop: 40,
                fontSize: 13,
                color: colors.mutedForeground,
                fontFamily: "Inter_500Medium",
              }}
            >
              Eşleşen sembol bulunamadı.
            </Text>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ──────────────────────────────  SCREEN  ────────────────────────────── */

export default function WidgetSettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_WIDGET_CONFIG);
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const isAndroid = Platform.OS === "android";
  const systemDark = colors.background === "#000000" || colors.foreground === "#FFFFFF" || colors.foreground === "#F8FAFC";

  useEffect(() => {
    void readWidgetConfig().then(setConfig);
  }, []);

  const [ongoingOn, setOngoingOn] = useState(false);
  const [ongoingBusy, setOngoingBusy] = useState(false);

  useEffect(() => {
    void isOngoingEnabled().then(setOngoingOn);
  }, []);

  const apply = (next: WidgetConfig) => {
    setConfig(next);
    void writeWidgetConfig(next).then(() => {
      void refreshPriceWidget({ force: true });
      void refreshOngoingNotificationIfEnabled();
    });
  };

  const toggleOngoing = async (next: boolean) => {
    if (ongoingBusy) return;
    setOngoingBusy(true);
    Haptics.selectionAsync().catch(() => {});
    try {
      if (next) {
        await startOngoingNotification();
        setOngoingOn(await isOngoingEnabled());
      } else {
        await stopOngoingNotification();
        setOngoingOn(false);
      }
    } finally {
      setOngoingBusy(false);
    }
  };

  const setPriceField = (priceField: PriceField) => apply({ ...config, priceField });
  const setTheme = (theme: WidgetTheme) => apply({ ...config, theme });
  const setCodeAt = (idx: number, code: string) => {
    const codes = [...config.codes];
    codes[idx] = code;
    apply({ ...config, codes });
    setPickerIdx(null);
  };

  const bottomPad =
    (Platform.OS === "android" ? Math.max(insets.bottom, 16) : insets.bottom) + 24;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader eyebrow="Tercihler" title="Widget Ayarları" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* PREVIEW */}
        <SectionLabel colors={colors}>ÖNİZLEME</SectionLabel>
        <WidgetPreview
          codes={config.codes}
          priceField={config.priceField}
          themeMode={config.theme}
          systemDark={systemDark}
        />
        <Text
          style={{
            fontSize: 11.5,
            fontFamily: "Inter_500Medium",
            color: colors.mutedForeground,
            marginTop: 10,
            marginHorizontal: 4,
            lineHeight: 16,
          }}
        >
          Aşağıdaki seçimler bu önizlemeyi ve ana ekrandaki widget'ı anında günceller.
        </Text>

        {!isAndroid ? (
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: colors.card,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Icon name="alert-circle" size={20} color={colors.mutedForeground} />
            <Text
              style={{
                flex: 1,
                fontSize: 12.5,
                fontFamily: "Inter_500Medium",
                color: colors.mutedForeground,
                lineHeight: 17,
              }}
            >
              Widget yalnızca Android cihazlarda kullanılabilir. Tercihlerin kaydedilir.
            </Text>
          </View>
        ) : null}

        {/* SYMBOLS */}
        <View style={{ height: 22 }} />
        <SectionLabel colors={colors}>SEMBOLLER · 4 ADET</SectionLabel>
        <Card colors={colors}>
          {config.codes.map((code, idx) => (
            <SymbolSlot
              key={`${idx}-${code}`}
              colors={colors}
              index={idx}
              code={code}
              onPress={() => setPickerIdx(idx)}
            />
          ))}
          <Text
            style={{
              fontSize: 11.5,
              fontFamily: "Inter_500Medium",
              color: colors.mutedForeground,
              marginTop: 4,
              lineHeight: 16,
            }}
          >
            68 sembol arasından seç. Her hücre kendi renk aksanıyla gösterilir.
          </Text>
        </Card>

        {/* PRICE FIELD */}
        <View style={{ height: 18 }} />
        <SectionLabel colors={colors}>FİYAT ALANI</SectionLabel>
        <Card colors={colors}>
          <Segmented
            colors={colors}
            value={config.priceField}
            onChange={setPriceField}
            options={[
              { value: "buy", label: "Alış" },
              { value: "sell", label: "Satış" },
            ]}
          />
        </Card>

        {/* THEME */}
        <View style={{ height: 18 }} />
        <SectionLabel colors={colors}>TEMA</SectionLabel>
        <Card colors={colors}>
          <Segmented
            colors={colors}
            value={config.theme}
            onChange={setTheme}
            options={[
              { value: "auto", label: "Otomatik" },
              { value: "dark", label: "Koyu" },
              { value: "light", label: "Açık" },
            ]}
          />
          <Text
            style={{
              fontSize: 11.5,
              fontFamily: "Inter_500Medium",
              color: colors.mutedForeground,
              marginTop: 10,
              lineHeight: 16,
            }}
          >
            Açık temada koyu logo, koyu temada açık logo gösterilir.
          </Text>
        </Card>

        {/* ONGOING NOTIFICATION */}
        <View style={{ height: 22 }} />
        <SectionLabel colors={colors}>BİLDİRİM ÇUBUĞU · CANLI</SectionLabel>
        <Card colors={colors}>
          <Pressable
            onPress={() => toggleOngoing(!ongoingOn)}
            disabled={!isAndroid || ongoingBusy}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: colors.foreground,
                  letterSpacing: -0.2,
                }}
              >
                Bildirim çubuğunda göster
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 11.5,
                  fontFamily: "Inter_500Medium",
                  color: colors.mutedForeground,
                  lineHeight: 16,
                }}
              >
                Widget ile aynı 4 sembol Android bildirim çubuğunda kalıcı görünür. Yaklaşık 1–2 dakikada bir yenilenir.
              </Text>
            </View>
            <View
              style={{
                width: 46,
                height: 28,
                borderRadius: 14,
                backgroundColor: ongoingOn ? "#0B3D91" : colors.secondary,
                padding: 3,
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: "#fff",
                  transform: [{ translateX: ongoingOn ? 18 : 0 }],
                }}
              />
            </View>
          </Pressable>
          <Text
            style={{
              marginTop: 12,
              fontSize: 11,
              fontFamily: "Inter_500Medium",
              color: colors.mutedForeground,
              lineHeight: 16,
            }}
          >
            Pil tüketimi orta düzeydedir. Kapattığında bildirim hemen kaldırılır. Yalnızca Android'de çalışır.
          </Text>
        </Card>

        {/* MANUAL REFRESH */}
        <View style={{ height: 22 }} />
        <Pressable
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            void refreshPriceWidget({ force: true });
          }}
          style={({ pressed }) => ({
            paddingVertical: 14,
            borderRadius: 14,
            backgroundColor: "#0B3D91",
            alignItems: "center",
            opacity: pressed ? 0.8 : 1,
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          })}
        >
          <Icon name="refresh" size={18} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontSize: 14,
              fontFamily: "Inter_700Bold",
              letterSpacing: -0.2,
            }}
          >
            Widget'ı Şimdi Yenile
          </Text>
        </Pressable>

        <Text
          style={{
            fontSize: 11,
            fontFamily: "Inter_500Medium",
            color: colors.mutedForeground,
            marginTop: 14,
            textAlign: "center",
            lineHeight: 16,
          }}
        >
          Widget üzerindeki ↻ butonu ile her an manuel güncelle. Sistem 30 dk'da bir otomatik tazeler;
          uygulamayı her açtığında da taze veriyle yenilenir.
        </Text>
      </ScrollView>

      <SymbolPickerModal
        visible={pickerIdx !== null}
        onClose={() => setPickerIdx(null)}
        onPick={(code) => {
          if (pickerIdx !== null) setCodeAt(pickerIdx, code);
        }}
        colors={colors}
        excludeCodes={config.codes}
      />
    </View>
  );
}
