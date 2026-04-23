import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";

// ─── Karat (ayar) definitions — Türkiye kuyumcu standardı ───────────────
interface Karat {
  k: number;
  millem: number;
  label: string;
  hint: string;
}
const KARATS: Karat[] = [
  { k: 8,  millem: 0.333, label: "8",  hint: "İmitasyon takı" },
  { k: 14, millem: 0.585, label: "14", hint: "Hafif takı" },
  { k: 18, millem: 0.750, label: "18", hint: "Pırlanta yuvası" },
  { k: 21, millem: 0.875, label: "21", hint: "Künye / zincir" },
  { k: 22, millem: 0.916, label: "22", hint: "Bilezik standardı" },
  { k: 24, millem: 0.995, label: "24", hint: "Saf has altın" },
];

const QUICK_WEIGHTS = [5, 10, 25, 50, 100];

// ─── Number formatting ────────────────────────────────────────────────────
const fmtGram = (v: number): string => {
  if (!Number.isFinite(v)) return "0,000";
  return v.toLocaleString("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
};
const fmtTRY = (v: number): string => {
  if (!Number.isFinite(v)) return "0,00";
  return v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtCount = (v: number): string => {
  if (!Number.isFinite(v) || v === 0) return "0";
  if (v >= 100) return v.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
  return v.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};

export default function GoldCalcScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { goldGram, goldRates } = useApp();

  const [weightStr, setWeightStr] = useState<string>("");
  const [karatIdx, setKaratIdx] = useState<number>(4); // default 22 ayar (bilezik)

  const weight = useMemo(() => {
    const n = parseFloat(weightStr.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [weightStr]);

  const karat = KARATS[karatIdx] ?? KARATS[0]!;

  // Source prices
  const altinGram = goldGram.find((g) => g.code === "ALTIN");
  const ceyrek = goldRates.find((g) => g.code === "CEYREK");

  const gramPrice = altinGram?.sell ?? 0; // ₺/gr saf altın (995 millem)
  const ceyrekPrice = ceyrek?.sell ?? 0;

  // Pure gold equivalent
  const pureGrams = weight * karat.millem;
  // Adjust: gram altın price is for ~995 millem. Convert by ratio.
  const tryValue = gramPrice > 0 ? pureGrams * (gramPrice / 0.995) : 0;
  const ceyrekEq = ceyrekPrice > 0 ? tryValue / ceyrekPrice : 0;

  const isAndroid = Platform.OS === "android";
  const bottomPadding = Platform.OS === "web" ? 40 : Math.max(insets.bottom, 16) + 32;

  const hasInput = weight > 0;
  const hasPrice = gramPrice > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader eyebrow="Hesaplayıcı" title="Saf Altın" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Live price chip */}
        <Animated.View entering={FadeIn.duration(280)} style={{ paddingHorizontal: 20, marginTop: 4 }}>
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 10,
            paddingVertical: 10, paddingHorizontal: 14,
            backgroundColor: colors.card, borderRadius: 12,
            borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
          }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: hasPrice ? "#22C55E" : colors.mutedForeground }} />
            <Text style={{ flex: 1, fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: -0.1 }}>
              Gram Altın · Anlık
            </Text>
            <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
              {hasPrice ? `₺${fmtTRY(gramPrice)}` : "—"}
            </Text>
          </View>
        </Animated.View>

        {/* Weight input — hero */}
        <Animated.View entering={FadeInUp.delay(60).duration(320)} style={{ paddingHorizontal: 20, marginTop: 18 }}>
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2 }}>
            AĞIRLIK
          </Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 4 }}>
            <TextInput
              value={weightStr}
              onChangeText={setWeightStr}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground + "60"}
              selectTextOnFocus
              style={{
                flex: 1,
                fontSize: 56,
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
                letterSpacing: -2,
                padding: 0,
                includeFontPadding: false,
              }}
            />
            <Text style={{ fontSize: 22, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 8, marginLeft: 6, letterSpacing: -0.4 }}>
              gram
            </Text>
          </View>

          {/* Quick weight chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12, paddingRight: 8 }}>
            {QUICK_WEIGHTS.map((w) => {
              const active = Math.abs(weight - w) < 0.001;
              return (
                <Pressable
                  key={w}
                  onPress={() => { Haptics.selectionAsync().catch(() => {}); setWeightStr(String(w)); }}
                  style={({ pressed }) => [{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                    backgroundColor: active ? "#F59E0B" : colors.card,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: active ? "#F59E0B" : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  }]}
                >
                  <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: active ? "#fff" : colors.foreground, letterSpacing: -0.1 }}>
                    {w} gr
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Karat selector */}
        <Animated.View entering={FadeInUp.delay(120).duration(320)} style={{ marginTop: 22 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 10 }}>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2 }}>
              AYAR
            </Text>
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
              %{(karat.millem * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} saf
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {KARATS.map((kr, idx) => {
              const active = idx === karatIdx;
              return (
                <Pressable
                  key={kr.k}
                  onPress={() => { Haptics.selectionAsync().catch(() => {}); setKaratIdx(idx); }}
                  style={({ pressed }) => [{
                    minWidth: 64,
                    paddingHorizontal: 14, paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: active ? "#F59E0B" : colors.card,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: active ? "#F59E0B" : colors.border,
                    alignItems: "center",
                    opacity: pressed ? 0.8 : 1,
                  }]}
                >
                  <Text style={{
                    fontSize: 18, fontFamily: "Inter_700Bold",
                    color: active ? "#fff" : colors.foreground, letterSpacing: -0.4,
                  }}>
                    {kr.label}
                  </Text>
                  <Text style={{
                    fontSize: 9, fontFamily: "Inter_700Bold",
                    color: active ? "rgba(255,255,255,0.85)" : colors.mutedForeground,
                    letterSpacing: 0.6, marginTop: 1,
                  }}>
                    AYAR
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={{
            fontSize: 12, fontFamily: "Inter_500Medium",
            color: colors.mutedForeground,
            paddingHorizontal: 20, marginTop: 10, letterSpacing: -0.1,
          }}>
            {karat.k} ayar · {karat.hint}
          </Text>
        </Animated.View>

        {/* Result hero card */}
        <Animated.View entering={FadeInUp.delay(180).duration(340)} style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <LinearGradient
            colors={["#92400E", "#F59E0B", "#FCD34D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 22, padding: 22, overflow: "hidden" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Icon name="diamond" size={14} color="rgba(255,255,255,0.95)" />
              <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.95)", letterSpacing: 1.2 }}>
                BUGÜNKÜ DEĞERİ
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
              <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.85)" }}>
                ₺
              </Text>
              <Text style={{
                fontSize: 40, fontFamily: "Inter_700Bold",
                color: "#fff", letterSpacing: -1.2,
              }}>
                {hasInput && hasPrice ? fmtTRY(tryValue) : "0,00"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", marginTop: 18, gap: 8 }}>
              <View style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.18)",
                borderRadius: 14,
                padding: 12,
              }}>
                <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.85)", letterSpacing: 0.8 }}>
                  SAF ALTIN
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3, marginTop: 4 }}>
                  <Text style={{ fontSize: 19, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.5 }}>
                    {hasInput ? fmtGram(pureGrams) : "0,000"}
                  </Text>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.85)" }}>
                    gr
                  </Text>
                </View>
              </View>
              <View style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.18)",
                borderRadius: 14,
                padding: 12,
              }}>
                <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.85)", letterSpacing: 0.8 }}>
                  ÇEYREK KARŞILIĞI
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3, marginTop: 4 }}>
                  <Text style={{ fontSize: 19, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.5 }}>
                    {hasInput && ceyrekPrice > 0 ? fmtCount(ceyrekEq) : "—"}
                  </Text>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.85)" }}>
                    adet
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Reference prices */}
        <Animated.View entering={FadeInUp.delay(240).duration(320)} style={{ paddingHorizontal: 20, marginTop: 18 }}>
          <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10 }}>
            REFERANS FİYATLAR
          </Text>
          <View style={{
            backgroundColor: colors.card, borderRadius: 14,
            borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
            paddingVertical: 4,
          }}>
            <PriceRow
              label="Gram Altın (Has)"
              sublabel="HaremAltın · Satış"
              value={hasPrice ? `₺${fmtTRY(gramPrice)}` : "—"}
              colors={colors}
            />
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 16 }} />
            <PriceRow
              label="Çeyrek Altın"
              sublabel="HaremAltın · Satış"
              value={ceyrekPrice > 0 ? `₺${fmtTRY(ceyrekPrice)}` : "—"}
              colors={colors}
            />
          </View>
        </Animated.View>

        {/* Educational footer */}
        <Animated.View entering={FadeInUp.delay(300).duration(320)} style={{ paddingHorizontal: 20, marginTop: 18 }}>
          <View style={{
            backgroundColor: colors.card, borderRadius: 14, padding: 14,
            borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
            flexDirection: "row", gap: 12,
          }}>
            <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "#0EA5E91A", alignItems: "center", justifyContent: "center" }}>
              <Icon name="alert-circle" size={16} color="#0EA5E9" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
                Ayar Nedir?
              </Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4, lineHeight: 17 }}>
                24 ayar saf altındır (%99,5). 22 ayar bileziklerde, 14-18 ayar takılarda kullanılır. Ayar düştükçe saf altın oranı azalır, hesaplanan değer de buna göre düşer.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function PriceRow({ label, sublabel, value, colors }: {
  label: string; sublabel?: string; value: string; colors: any;
}) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center",
      paddingVertical: 12, paddingHorizontal: 14,
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.2 }}>
          {label}
        </Text>
        {sublabel ? (
          <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 2 }}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, letterSpacing: -0.3 }}>
        {value}
      </Text>
    </View>
  );
}
