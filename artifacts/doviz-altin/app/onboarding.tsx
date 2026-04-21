import { router } from "expo-router";
import * as Notifications from "expo-notifications";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { setOnboardingSeen } from "@/lib/onboardingPref";

const { width: W, height: H } = Dimensions.get("window");

type Theme = {
  ground: string;
  ink: string;
  inkSoft: string;
  inkMute: string;
  divider: string;
  buttonBg: string;
  buttonInk: string;
  accent: string;
  dark: boolean;
};

const LIGHT: Theme = {
  ground: "#FFFFFF",
  ink: "#0B1F3A",
  inkSoft: "rgba(11,31,58,0.65)",
  inkMute: "rgba(11,31,58,0.45)",
  divider: "rgba(11,31,58,0.08)",
  buttonBg: "#0B3D91",
  buttonInk: "#FFFFFF",
  accent: "#0B3D91",
  dark: false,
};

const DARK: Theme = {
  ground: "#0A1628",
  ink: "#E8EEF7",
  inkSoft: "rgba(232,238,247,0.70)",
  inkMute: "rgba(232,238,247,0.45)",
  divider: "rgba(255,255,255,0.10)",
  buttonBg: "#FFFFFF",
  buttonInk: "#0B1F3A",
  accent: "#F59E0B",
  dark: true,
};

const NAVY: Theme = {
  ground: "#0B3D91",
  ink: "#FFFFFF",
  inkSoft: "rgba(255,255,255,0.78)",
  inkMute: "rgba(255,255,255,0.50)",
  divider: "rgba(255,255,255,0.16)",
  buttonBg: "#FFFFFF",
  buttonInk: "#0B3D91",
  accent: "#FFFFFF",
  dark: true,
};

type Slide = {
  num: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  visual: "hero" | "widget" | "notif" | "portfolio";
  theme: Theme;
  showSkip: boolean;
  requestNotif?: boolean;
};

const SLIDES: Slide[] = [
  {
    num: "01",
    eyebrow: "TÜRKİYE İÇİN",
    title: "Bütün döviz, gram\nve sarrafiye altın\ntek ekranda.",
    body: "68 sembol, 5 kategori. Saniye saniye güncel veri, sade arayüz, gizli ücret yok.",
    cta: "Devam et",
    visual: "hero",
    theme: LIGHT,
    showSkip: true,
  },
  {
    num: "02",
    eyebrow: "ANA EKRAN",
    title: "Telefonu açmadan\nfiyatı görüyorsun.",
    body: "Ana ekrana eklenebilen widget ile dilediğin 4 sembolü hep gözünün önünde tut. Açık, koyu ve otomatik tema.",
    cta: "Devam et",
    visual: "widget",
    theme: LIGHT,
    showSkip: true,
  },
  {
    num: "03",
    eyebrow: "AKILLI BİLDİRİM",
    title: "Sadece önemli\nolduğunda haber verir.",
    body: "Fiyat hareketi, açılış ve kapanış brifingi, haftalık portföy özeti. Hepsi sessiz, hepsi senin kontrolünde.",
    cta: "Bildirimlere izin ver",
    visual: "notif",
    theme: DARK,
    showSkip: true,
    requestNotif: true,
  },
  {
    num: "04",
    eyebrow: "PORTFÖY VE ALARM",
    title: "Aldığın fiyatı bilirsen,\nkazandığını da bilirsin.",
    body: "Pozisyonlarını gir, ortalama maliyetini gör, hedef fiyat geldiğinde alarmla bilgilen.",
    cta: "Başla",
    visual: "portfolio",
    theme: NAVY,
    showSkip: false,
  },
];

const ICON = require("../assets/images/icon.png");

function BrandHeader({ theme }: { theme: Theme }) {
  return (
    <View style={s.brandRow}>
      <View
        style={[
          s.brandChip,
          {
            backgroundColor: theme.dark ? "#FFFFFF" : "transparent",
            padding: theme.dark ? 2 : 0,
          },
        ]}
      >
        <Image source={ICON} style={s.brandIcon} resizeMode="contain" />
      </View>
      <Text style={[s.brandText, { color: theme.ink, opacity: 0.85 }]}>
        ÇARŞI PİYASA
      </Text>
    </View>
  );
}

function HeroVisual({ theme }: { theme: Theme }) {
  return (
    <View style={s.visualWrap}>
      <View style={[s.ring, { borderColor: "rgba(11,61,145,0.10)", width: 220, height: 220, marginLeft: -110, marginTop: -130 }]} />
      <View style={[s.ring, { borderColor: "rgba(11,61,145,0.06)", width: 296, height: 296, marginLeft: -148, marginTop: -168 }]} />
      <View style={s.heroIconWrap}>
        <Image source={ICON} style={s.heroIcon} resizeMode="contain" />
      </View>
      <View style={s.heroBottom}>
        <Text style={[s.eyebrowSmall, { color: theme.inkMute }]}>ŞU AN CANLI</Text>
        <View style={s.heroRow}>
          {[
            { c: "USD", v: "41,9120" },
            { c: "EUR", v: "47,3088" },
            { c: "GRAM", v: "5.412,80" },
          ].map((r) => (
            <View key={r.c} style={s.heroPair}>
              <Text style={[s.heroCode, { color: "#0B3D91" }]}>{r.c}</Text>
              <Text style={[s.heroVal, { color: theme.ink }]}>{r.v}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function WidgetVisual({ theme: _theme }: { theme: Theme }) {
  const cells = [
    { code: "USD", price: "41,9120", up: true },
    { code: "EUR", price: "47,3088", up: false },
    { code: "GRAM", price: "5.412,80", up: true },
    { code: "ÇEYREK", price: "8.960,00", up: true },
  ];
  return (
    <View style={s.visualWrap}>
      <View style={s.widgetCard}>
        <View style={s.widgetHeader}>
          <View style={s.widgetHeaderLeft}>
            <View style={[s.brandChip, { backgroundColor: "#FFFFFF", padding: 1.5 }]}>
              <Image source={ICON} style={s.widgetIcon} resizeMode="contain" />
            </View>
            <Text style={s.widgetBrand}>ÇARŞI PİYASA</Text>
          </View>
          <Text style={s.widgetTime}>09:41</Text>
        </View>
        <View style={s.widgetGrid}>
          {cells.map((r) => (
            <View key={r.code} style={s.widgetCell}>
              <Text style={s.widgetCellCode}>{r.code}</Text>
              <Text style={s.widgetCellPrice}>{r.price}</Text>
              <Text style={[s.widgetCellPct, { color: r.up ? "#4ADE80" : "#F87171" }]}>
                {r.up ? "▲ %0,34" : "▼ %0,18"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function NotifVisual({ theme: _theme }: { theme: Theme }) {
  return (
    <View style={s.visualWrap}>
      <View style={s.notifClockWrap}>
        <Text style={s.notifClock}>09:41</Text>
        <Text style={s.notifDate}>Salı, 21 Nisan</Text>
      </View>
      <View style={s.notifList}>
        {[
          {
            title: "USD %1,2 yükseldi",
            sub: "Şimdi 41,9120 TL · son 30 dakikada",
            time: "şimdi",
          },
          {
            title: "Açılış brifingi hazır",
            sub: "USD 41,91 · GRAM 5.412 · ONS 3.412",
            time: "09:00",
          },
        ].map((n, i) => (
          <View key={i} style={s.notifCard}>
            <View style={[s.brandChip, { backgroundColor: "#FFFFFF", padding: 2, marginTop: 2 }]}>
              <Image source={ICON} style={s.notifAvatarImg} resizeMode="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.notifTopRow}>
                <Text style={s.notifAppName}>Çarşı Piyasa</Text>
                <Text style={s.notifTime}> · {n.time}</Text>
              </View>
              <Text style={s.notifTitle}>{n.title}</Text>
              <Text style={s.notifSub}>{n.sub}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function PortfolioVisual({ theme: _theme }: { theme: Theme }) {
  return (
    <View style={s.visualWrap}>
      <View style={{ alignItems: "center", paddingTop: 8 }}>
        <Text style={s.pfLabel}>PORTFÖY DEĞERİ</Text>
        <Text style={s.pfTotal}>₺127.840</Text>
        <Text style={s.pfChange}>▲ +%4,82  ·  +₺5.880</Text>
      </View>
      <View style={s.pfList}>
        {[
          { code: "USD", qty: "1.500", val: "₺62.868", pct: "+%2,1", up: true },
          { code: "GRAM", qty: "8 gr", val: "₺43.302", pct: "+%6,4", up: true },
          { code: "ÇEYREK", qty: "2,5 ad.", val: "₺22.400", pct: "−%0,4", up: false },
        ].map((r) => (
          <View key={r.code} style={s.pfRow}>
            <View>
              <Text style={s.pfCode}>{r.code}</Text>
              <Text style={s.pfQty}>{r.qty}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.pfVal}>{r.val}</Text>
              <Text style={[s.pfPct, { color: r.up ? "#4ADE80" : "#F87171" }]}>{r.pct}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function VisualFor({ kind, theme }: { kind: Slide["visual"]; theme: Theme }) {
  if (kind === "hero") return <HeroVisual theme={theme} />;
  if (kind === "widget") return <WidgetVisual theme={theme} />;
  if (kind === "notif") return <NotifVisual theme={theme} />;
  return <PortfolioVisual theme={theme} />;
}

function Dots({ active, accent, ink }: { active: number; accent: string; ink: string }) {
  return (
    <View style={s.dots}>
      {SLIDES.map((_, i) => (
        <View
          key={i}
          style={[
            s.dot,
            {
              width: i === active ? 22 : 6,
              backgroundColor: i === active ? accent : ink,
              opacity: i === active ? 1 : 0.18,
            },
          ]}
        />
      ))}
    </View>
  );
}

function SlideView({ slide, index }: { slide: Slide; index: number }) {
  const t = slide.theme;
  return (
    <View style={[s.slide, { width: W, backgroundColor: t.ground }]}>
      <View style={s.headerRow}>
        <BrandHeader theme={t} />
        <Text style={[s.pageIdx, { color: t.ink }]}>
          {slide.num}
          <Text style={{ opacity: 0.34 }}> / 04</Text>
        </Text>
      </View>

      <View style={s.visualSection}>
        <VisualFor kind={slide.visual} theme={t} />
      </View>

      <View style={[s.divider, { backgroundColor: t.divider }]} />

      <View style={s.typeBlock}>
        <Text style={[s.eyebrow, { color: t.accent }]}>{slide.eyebrow}</Text>
        <Text style={[s.title, { color: t.ink }]}>{slide.title}</Text>
        <Text style={[s.body, { color: t.inkSoft }]}>{slide.body}</Text>
      </View>

      {/* footer rendered outside per-slide so buttons share consistent placement on tall screens */}
      <View style={{ flex: 1 }} />
      <View style={s.footerSpacer} />
    </View>
  );
}

export default function Onboarding() {
  const [active, setActive] = useState(0);
  const listRef = useRef<FlatList>(null);

  const goTo = useCallback((i: number) => {
    listRef.current?.scrollToOffset({ offset: i * W, animated: true });
  }, []);

  const finish = useCallback(async () => {
    await setOnboardingSeen();
    router.replace("/(tabs)");
  }, []);

  const onPrimary = useCallback(async () => {
    const slide = SLIDES[active];
    if (slide.requestNotif) {
      try {
        await Notifications.requestPermissionsAsync();
      } catch {}
    }
    if (active >= SLIDES.length - 1) {
      void finish();
    } else {
      goTo(active + 1);
    }
  }, [active, goTo, finish]);

  const onSkip = useCallback(() => {
    void finish();
  }, [finish]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / W);
    if (i !== active && i >= 0 && i < SLIDES.length) setActive(i);
  }, [active]);

  const slide = SLIDES[active];
  const t = slide.theme;

  return (
    <View style={{ flex: 1, backgroundColor: t.ground }}>
      <StatusBar
        barStyle={t.dark ? "light-content" : "dark-content"}
        backgroundColor={t.ground}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item, index }) => <SlideView slide={item} index={index} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          bounces={false}
          decelerationRate="fast"
        />

        {/* fixed footer */}
        <View style={[s.footer, { backgroundColor: t.ground }]} pointerEvents="box-none">
          <Pressable
            onPress={onPrimary}
            style={({ pressed }) => [
              s.cta,
              {
                backgroundColor: t.buttonBg,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[s.ctaText, { color: t.buttonInk }]}>
              {slide.cta}
            </Text>
            <Text style={[s.ctaArrow, { color: t.buttonInk }]}>→</Text>
          </Pressable>

          <View style={s.footerRow}>
            <Dots active={active} accent={t.accent} ink={t.ink} />
            {slide.showSkip ? (
              <Pressable onPress={onSkip} hitSlop={12}>
                <Text style={[s.skip, { color: t.inkMute }]}>Atla</Text>
              </Pressable>
            ) : (
              <View />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  slide: {
    flex: 1,
    height: H,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandChip: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  brandIcon: { width: "100%", height: "100%", borderRadius: 4 },
  brandText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 2,
  },
  pageIdx: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 1.5,
  },
  visualSection: {
    flex: 0,
    height: 280,
    justifyContent: "flex-end",
    paddingTop: 16,
  },
  visualWrap: { flex: 1, position: "relative", paddingHorizontal: 24 },
  ring: {
    position: "absolute",
    left: "50%",
    top: "50%",
    borderRadius: 999,
    borderWidth: 1,
  },
  heroIconWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    alignItems: "center",
    paddingTop: 4,
  },
  heroIcon: {
    width: 136,
    height: 136,
    borderRadius: 30,
  },
  heroBottom: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 0,
  },
  eyebrowSmall: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
  },
  heroRow: { flexDirection: "row", alignItems: "baseline", gap: 18, flexWrap: "wrap" },
  heroPair: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  heroCode: { fontFamily: "Inter_700Bold", fontSize: 11 },
  heroVal: { fontFamily: "Inter_700Bold", fontSize: 15 },

  widgetCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 18,
    padding: 14,
    alignSelf: "center",
    width: 264,
    marginTop: 18,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  widgetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  widgetHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  widgetIcon: { width: "100%", height: "100%", borderRadius: 4 },
  widgetBrand: { color: "rgba(255,255,255,0.65)", fontFamily: "Inter_700Bold", fontSize: 9.5, letterSpacing: 1.5 },
  widgetTime: { color: "rgba(255,255,255,0.35)", fontFamily: "Inter_600SemiBold", fontSize: 10 },
  widgetGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  widgetCell: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  widgetCellCode: { color: "rgba(255,255,255,0.65)", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.5 },
  widgetCellPrice: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 13, marginTop: 2 },
  widgetCellPct: { fontFamily: "Inter_700Bold", fontSize: 9, marginTop: 2 },

  notifClockWrap: { alignItems: "center", paddingTop: 4 },
  notifClock: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 44, letterSpacing: -1.5 },
  notifDate: { color: "rgba(255,255,255,0.55)", fontFamily: "Inter_600SemiBold", fontSize: 12, marginTop: 2 },
  notifList: { position: "absolute", left: 24, right: 24, bottom: 0, gap: 6 },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  notifAvatarImg: { width: "100%", height: "100%", borderRadius: 4 },
  notifTopRow: { flexDirection: "row", alignItems: "baseline" },
  notifAppName: { color: "rgba(255,255,255,0.95)", fontFamily: "Inter_700Bold", fontSize: 11 },
  notifTime: { color: "rgba(255,255,255,0.45)", fontFamily: "Inter_500Medium", fontSize: 10 },
  notifTitle: { color: "rgba(255,255,255,0.95)", fontFamily: "Inter_600SemiBold", fontSize: 12, marginTop: 2 },
  notifSub: { color: "rgba(255,255,255,0.55)", fontFamily: "Inter_500Medium", fontSize: 10.5, marginTop: 2 },

  pfLabel: { color: "rgba(255,255,255,0.55)", fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 2.2 },
  pfTotal: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 40, letterSpacing: -1.6, marginTop: 8 },
  pfChange: { color: "#4ADE80", fontFamily: "Inter_700Bold", fontSize: 12, marginTop: 4 },
  pfList: { position: "absolute", left: 24, right: 24, bottom: 4, gap: 6 },
  pfRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  pfCode: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 12 },
  pfQty: { color: "rgba(255,255,255,0.6)", fontFamily: "Inter_500Medium", fontSize: 10 },
  pfVal: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 12 },
  pfPct: { fontFamily: "Inter_700Bold", fontSize: 10, marginTop: 2 },

  divider: { height: 1, marginHorizontal: 24, marginTop: 8 },
  typeBlock: { paddingHorizontal: 24, paddingTop: 20 },
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 10.5,
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  body: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 21,
  },

  footerSpacer: { height: 160 },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 18,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  ctaText: { fontFamily: "Inter_700Bold", fontSize: 15 },
  ctaArrow: { fontFamily: "Inter_700Bold", fontSize: 16 },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  dots: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  skip: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.5 },
});
