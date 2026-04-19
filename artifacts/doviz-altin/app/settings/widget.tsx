import React, { useEffect, useMemo, useState } from "react";
import {
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
  type WidgetTemplate,
  type WidgetTheme,
} from "@/widgets/config";
import { refreshPriceWidget } from "@/widgets/refresh";

type Colors = ReturnType<typeof useColors>;

type SegmentOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
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
            disabled={opt.disabled}
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
              opacity: opt.disabled ? 0.4 : 1,
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

function SectionLabel({
  colors,
  children,
}: {
  colors: Colors;
  children: string;
}) {
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

function Card({
  colors,
  children,
}: {
  colors: Colors;
  children: React.ReactNode;
}) {
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
  const isGold = meta?.category === "MADEN" || meta?.category === "SARRAFIYE" || meta?.category === "GRAM ALTIN";
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, paddingBottom: insets.bottom + 24 }}
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

export default function WidgetSettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_WIDGET_CONFIG);
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const isAndroid = Platform.OS === "android";

  useEffect(() => {
    void readWidgetConfig().then(setConfig);
  }, []);

  const apply = (next: WidgetConfig) => {
    setConfig(next);
    void writeWidgetConfig(next).then(() => {
      void refreshPriceWidget({ force: true });
    });
  };

  const setTemplate = (template: WidgetTemplate) => {
    let priceField = config.priceField;
    if (template === "strip" && priceField === "both") {
      priceField = "sell";
    }
    apply({ ...config, template, priceField });
  };

  const setPriceField = (priceField: PriceField) => {
    apply({ ...config, priceField });
  };

  const setTheme = (theme: WidgetTheme) => {
    apply({ ...config, theme });
  };

  const setCodeAt = (idx: number, code: string) => {
    const codes = [...config.codes];
    codes[idx] = code;
    apply({ ...config, codes });
    setPickerIdx(null);
  };

  const bottomPad = (Platform.OS === "android" ? Math.max(insets.bottom, 16) : insets.bottom) + 24;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader eyebrow="Tercihler" title="Widget Ayarları" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {!isAndroid ? (
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: colors.card,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              marginBottom: 16,
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

        <SectionLabel colors={colors}>ŞABLON</SectionLabel>
        <Card colors={colors}>
          <Segmented
            colors={colors}
            value={config.template}
            onChange={setTemplate}
            options={[
              { value: "list", label: "Liste · 4×2" },
              { value: "strip", label: "Şerit · 4×1" },
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
            {config.template === "list"
              ? "4 satır liste · alış / satış · % değişim · güncelleme saati."
              : "Tek satır kompakt görünüm · seçtiğin tek fiyat alanı · % değişim."}
          </Text>
        </Card>

        <View style={{ height: 18 }} />
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
            68 sembol arasından seç. Para birimleri mavi, altın/maden amber renkli aksent ile gösterilir.
          </Text>
        </Card>

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
              {
                value: "both",
                label: "İkisi",
                disabled: config.template === "strip",
              },
            ]}
          />
          {config.template === "strip" ? (
            <Text
              style={{
                fontSize: 11.5,
                fontFamily: "Inter_500Medium",
                color: colors.mutedForeground,
                marginTop: 10,
                lineHeight: 16,
              }}
            >
              Şerit şablonda yer dar olduğu için tek fiyat alanı gösterilir.
            </Text>
          ) : null}
        </Card>

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
        </Card>

        <View style={{ height: 18 }} />
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
          <Icon name="swap-vertical" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: -0.2 }}>
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
          Android sistemi widget'ı 30 dakikada bir kendiliğinden günceller. Uygulamayı her açtığında da
          taze veri ile yenilenir.
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
