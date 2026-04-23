import { router } from "expo-router";
import { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { setOnboardingSeen } from "@/lib/storage/onboardingPref";
import { haptics } from "@/lib/utils/haptics";

const { width: W } = Dimensions.get("window");

/* =============================================================
   Brand tokens (V3 mockup ile birebir uyumlu)
   ============================================================= */
const C = {
  paper: "#FBFAF7",
  paperDeep: "#F2EFE8",
  ink: "#0B1F3A",
  inkSoft: "#3F4B62",
  muted: "#7A8499",
  hairline: "rgba(11,31,58,0.10)",
  hairlineSoft: "rgba(11,31,58,0.06)",
  navy: "#0B3D91",
  gold: "#C9A227",
  goldDeep: "#8A6E14",
  goldSoft: "#F5EBC4",
  rise: "#0E9F6E",
  riseSoft: "#E5F4EE",
  fall: "#D43A3A",
};

const ICON = require("../assets/images/icon.png");

const SLIDES = [
  { kind: "hero", eyebrow: null, title: "Çarşı Piyasa", body: "Anlık piyasa, cebinizde.", cta: "Başla" },
  { kind: "widget", eyebrow: "WIDGET", title: "Ana ekranda.", body: "Tek bakışta gör.", cta: "Devam" },
  { kind: "alarm", eyebrow: "ALARM", title: "Hedefini söyle.", body: "Sen seyret.", cta: "Hadi başlayalım" },
] as const;

type Slide = (typeof SLIDES)[number];

/* =============================================================
   Visuals (RN port of V3 mockup)
   ============================================================= */

function GoldRule({ width = 18 }: { width?: number }) {
  return <View style={{ width, height: 2, backgroundColor: C.gold, borderRadius: 1 }} />;
}

function Eyebrow({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <GoldRule width={18} />
      <Text
        style={{
          fontFamily: "Inter_800ExtraBold",
          fontSize: 10.5,
          letterSpacing: 2,
          color: C.goldDeep,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

/* ---------------- Page 1 hero ---------------- */
function HeroVisual() {
  const items = [
    { c: "USD", p: "44,93", up: true, v: "0,18" },
    { c: "EUR", p: "52,72", up: false, v: "0,21" },
    { c: "ALTIN", p: "6.877", up: false, v: "0,35" },
  ];
  return (
    <View style={{ alignItems: "center", width: "100%" }}>
      <View
        style={{
          padding: 14,
          backgroundColor: C.paperDeep,
          borderRadius: 28,
          marginBottom: 28,
        }}
      >
        <Image source={ICON} style={{ width: 96, height: 96, borderRadius: 22 }} resizeMode="contain" />
      </View>

      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 40,
          lineHeight: 42,
          letterSpacing: -1.6,
          color: C.ink,
          textAlign: "center",
        }}
      >
        Çarşı Piyasa
      </Text>
      <Text
        style={{
          marginTop: 12,
          fontFamily: "Inter_500Medium",
          fontSize: 15,
          letterSpacing: -0.2,
          color: C.inkSoft,
          textAlign: "center",
        }}
      >
        Anlık piyasa, cebinizde.
      </Text>

      <View
        style={{
          marginTop: 36,
          flexDirection: "row",
          backgroundColor: C.paperDeep,
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: C.hairlineSoft,
          alignSelf: "stretch",
        }}
      >
        {items.map((it, i) => (
          <View key={it.c} style={{ flex: 1, flexDirection: "row" }}>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: "Inter_800ExtraBold",
                  fontSize: 9.5,
                  letterSpacing: 1.2,
                  color: C.muted,
                  marginBottom: 4,
                }}
              >
                {it.c}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 17,
                  letterSpacing: -0.5,
                  color: C.ink,
                }}
              >
                {it.p}
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontFamily: "Inter_700Bold",
                  fontSize: 10,
                  color: it.up ? C.rise : C.fall,
                }}
              >
                {it.up ? "▲" : "▼"} %{it.v}
              </Text>
            </View>
            {i < items.length - 1 && (
              <View style={{ width: 1, backgroundColor: C.hairline }} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------------- Page 2 widget ---------------- */
function WidgetVisual() {
  const rows = [
    { c: "USD/TRY", p: "44,93", up: true, pct: "0,18" },
    { c: "EUR/TRY", p: "52,72", up: false, pct: "0,21" },
    { c: "ALTIN", p: "6.877", up: false, pct: "0,35" },
    { c: "GBP/TRY", p: "60,61", up: false, pct: "0,09" },
  ];
  return (
    <View
      style={{
        width: 264,
        height: 320,
        borderRadius: 30,
        overflow: "hidden",
        backgroundColor: "#1F3554",
        alignSelf: "center",
        padding: 14,
      }}
    >
      {/* faux app grid */}
      <View
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          bottom: 80,
          flexDirection: "row",
          flexWrap: "wrap",
          opacity: 0.45,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={i}
            style={{
              width: "22%",
              height: 44,
              margin: "1.5%",
              borderRadius: 11,
              backgroundColor: "rgba(255,255,255,0.18)",
            }}
          />
        ))}
      </View>

      {/* widget card */}
      <View
        style={{
          position: "absolute",
          top: 110,
          left: 14,
          right: 14,
          backgroundColor: C.paper,
          borderRadius: 18,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 8,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: C.hairline,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Image source={ICON} style={{ width: 14, height: 14, borderRadius: 3.5 }} />
            <Text
              style={{
                fontFamily: "Inter_800ExtraBold",
                fontSize: 9.5,
                letterSpacing: 1.1,
                color: C.muted,
              }}
            >
              ÇARŞI · CANLI
            </Text>
          </View>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 9, color: C.muted }}>
            9:41
          </Text>
        </View>
        {rows.map((r, i, a) => (
          <View
            key={r.c}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 6,
              borderBottomWidth: i === a.length - 1 ? 0 : StyleSheet.hairlineWidth,
              borderBottomColor: C.hairline,
            }}
          >
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: C.ink, letterSpacing: -0.2 }}>
              {r.c}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 12,
                  color: C.ink,
                  letterSpacing: -0.3,
                }}
              >
                {r.p}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 9.5,
                  color: r.up ? C.rise : C.fall,
                  minWidth: 38,
                  textAlign: "right",
                }}
              >
                {r.up ? "▲" : "▼"} %{r.pct}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------------- Page 3 alarm ---------------- */
function AlarmVisual() {
  const alerts = [
    { d: "≥", v: "45,50", state: "AKTİF", color: C.rise, bg: C.riseSoft },
    { d: "≤", v: "44,50", state: "AKTİF", color: C.rise, bg: C.riseSoft },
    { d: "≥", v: "46,20", state: "TETİKLENDİ", color: C.muted, bg: "rgba(11,31,58,0.06)" },
  ];
  return (
    <View
      style={{
        alignSelf: "stretch",
        marginHorizontal: 24,
        backgroundColor: C.paper,
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 14,
        borderWidth: 1,
        borderColor: C.hairlineSoft,
        shadowColor: C.ink,
        shadowOpacity: 0.10,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingBottom: 12,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: C.hairline,
        }}
      >
        <View>
          <Eyebrow>HEDEF</Eyebrow>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 22,
              letterSpacing: -0.6,
              color: C.ink,
            }}
          >
            Dolar / TL
          </Text>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 11,
              color: C.muted,
              marginTop: 2,
            }}
          >
            şu an · 44,93 ₺
          </Text>
        </View>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            backgroundColor: C.goldSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18, color: C.goldDeep }}>🔔</Text>
        </View>
      </View>

      {alerts.map((a, i, arr) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 11,
            borderBottomWidth: i === arr.length - 1 ? 0 : StyleSheet.hairlineWidth,
            borderBottomColor: C.hairline,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
            <View
              style={{
                width: 28,
                height: 24,
                borderRadius: 7,
                backgroundColor: "rgba(11,31,58,0.05)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "Inter_800ExtraBold", fontSize: 13, color: C.inkSoft }}>
                {a.d}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 15,
                letterSpacing: -0.4,
                color: C.ink,
              }}
            >
              {a.v} ₺
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 9,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: a.bg,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_800ExtraBold",
                fontSize: 9.5,
                letterSpacing: 0.7,
                color: a.color,
              }}
            >
              {a.state}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function VisualFor({ kind }: { kind: Slide["kind"] }) {
  if (kind === "hero") return <HeroVisual />;
  if (kind === "widget") return <WidgetVisual />;
  return <AlarmVisual />;
}

/* =============================================================
   Slide & shell
   ============================================================= */

function SlideView({ slide }: { slide: Slide }) {
  return (
    <View style={[styles.slide, { width: W }]}>
      <View style={styles.contentArea}>
        {slide.eyebrow ? <Eyebrow>{slide.eyebrow}</Eyebrow> : null}
        {slide.kind !== "hero" && (
          <>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </>
        )}
        <View style={styles.visualWrap}>
          <VisualFor kind={slide.kind} />
        </View>
      </View>
    </View>
  );
}

function Dots({ active }: { active: number }) {
  return (
    <View style={styles.dots}>
      {SLIDES.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: i === active ? 22 : 6,
              backgroundColor: i === active ? C.navy : "rgba(11,31,58,0.15)",
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function Onboarding() {
  const [active, setActive] = useState(0);
  const listRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const goTo = useCallback((i: number) => {
    listRef.current?.scrollToOffset({ offset: i * W, animated: true });
  }, []);

  const finish = useCallback(async () => {
    await setOnboardingSeen();
    router.replace("/(tabs)");
  }, []);

  const onPrimary = useCallback(async () => {
    haptics.tap();
    if (active >= SLIDES.length - 1) {
      void finish();
    } else {
      goTo(active + 1);
    }
  }, [active, goTo, finish]);

  const onBack = useCallback(() => {
    if (active <= 0) return;
    haptics.select();
    goTo(active - 1);
  }, [active, goTo]);

  const onSkip = useCallback(() => {
    haptics.select();
    void finish();
  }, [finish]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const i = Math.round(e.nativeEvent.contentOffset.x / W);
      if (i !== active && i >= 0 && i < SLIDES.length) setActive(i);
    },
    [active]
  );

  const slide = SLIDES[active];

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.paper} />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* Üst bar: sol "Geri" (1. slide gizli), sağ "Atla" (son slide gizli) */}
        <View style={styles.topBar} pointerEvents="box-none">
          {active > 0 ? (
            <Pressable
              onPress={onBack}
              hitSlop={14}
              accessibilityRole="button"
              accessibilityLabel="Önceki adıma dön"
              style={({ pressed }) => [styles.topBtn, { opacity: pressed ? 0.55 : 1 }]}
            >
              <Text style={styles.topBtnArrow}>‹</Text>
              <Text style={styles.topBtnText}>Geri</Text>
            </Pressable>
          ) : (
            <View style={styles.topBtn} />
          )}
          {active < SLIDES.length - 1 ? (
            <Pressable
              onPress={onSkip}
              hitSlop={14}
              accessibilityRole="button"
              accessibilityLabel="Tanıtımı atla ve uygulamayı aç"
              style={({ pressed }) => [styles.topBtn, { opacity: pressed ? 0.55 : 1 }]}
            >
              <Text style={styles.topBtnText}>Atla</Text>
            </Pressable>
          ) : (
            <View style={styles.topBtn} />
          )}
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES as readonly Slide[] as Slide[]}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <SlideView slide={item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          bounces={false}
          decelerationRate="fast"
        />

        {/* Footer — Android navigation bar (3-buton veya gesture) için
            useSafeAreaInsets ile gerçek inset.bottom değerini ekliyoruz.
            position:absolute olduğundan SafeAreaView padding'i çocuklara
            uygulanmıyor; manuel ekleme şart. */}
        <View
          style={[
            styles.footer,
            {
              paddingBottom:
                (Platform.OS === "ios" ? 30 : 22) +
                Math.max(insets.bottom - (Platform.OS === "ios" ? 18 : 0), 0),
            },
          ]}
          pointerEvents="box-none"
        >
          <Dots active={active} />
          <Pressable
            onPress={onPrimary}
            style={({ pressed }) => [
              styles.cta,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.ctaText}>{slide.cta}</Text>
            <Text style={styles.ctaArrow}>{slide.cta === "Hadi başlayalım" ? "✓" : "→"}</Text>
          </Pressable>
          <View style={{ height: 12 }} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 4,
    minHeight: 40,
  },
  topBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 56,
  },
  topBtnArrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: C.inkSoft,
    lineHeight: 22,
    marginTop: -3,
  },
  topBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: C.inkSoft,
    letterSpacing: -0.2,
  },
  slide: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 30,
  },
  contentArea: {
    flex: 1,
    paddingBottom: 220,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -1.2,
    color: C.ink,
  },
  body: {
    marginTop: 10,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 20,
    color: C.inkSoft,
    letterSpacing: -0.2,
  },
  visualWrap: {
    flex: 1,
    marginTop: 18,
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 30,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 30 : 22,
    backgroundColor: C.paper,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.hairlineSoft,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.ink,
    shadowColor: C.ink,
    shadowOpacity: 0.25,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  ctaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15.5,
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  ctaArrow: {
    fontFamily: "Inter_500Medium",
    fontSize: 17,
    color: "#FFFFFF",
  },
});
