import { ArrowRight } from "lucide-react";

const ASSET = (p: string) => `${import.meta.env.BASE_URL}brand/${p}`;

type Slide = {
  num: string;
  total: string;
  eyebrow: string;
  title: string[];
  body: string;
  cta: string;
  visual: () => JSX.Element;
  ground: string;
  ink: string;
  inkSoft: string;
  inkMute: string;
  accent: string;
  divider: string;
  buttonBg: string;
  buttonInk: string;
  showSkip: boolean;
};

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative"
        style={{
          width: 312,
          height: 640,
          borderRadius: 46,
          padding: 7,
          background: "#000",
          boxShadow:
            "0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        <div
          className="w-full h-full overflow-hidden relative"
          style={{ borderRadius: 40 }}
        >
          {children}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-[96px] h-[26px] rounded-full"
            style={{ background: "#000" }}
          />
        </div>
      </div>
      <div className="text-[10px] font-bold tracking-[2.5px] text-white/40">
        {label}
      </div>
    </div>
  );
}

function PageIndex({ num, total, ink }: { num: string; total: string; ink: string }) {
  return (
    <div
      className="flex items-baseline gap-1.5"
      style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}
    >
      <span className="text-[11px] font-bold tracking-[1.5px]" style={{ color: ink }}>
        {num}
      </span>
      <span
        className="text-[11px] font-bold tracking-[1.5px]"
        style={{ color: ink, opacity: 0.34 }}
      >
        / {total}
      </span>
    </div>
  );
}

function BrandHeader({ ink }: { ink: string }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={ASSET("icon.png")}
        alt=""
        className="w-[20px] h-[20px] object-contain rounded-[5px]"
      />
      <span
        className="text-[10.5px] font-bold tracking-[2px]"
        style={{ color: ink, opacity: 0.78 }}
      >
        ÇARŞI PİYASA
      </span>
    </div>
  );
}

function Dots({ active, total, accent, ink }: { active: number; total: number; accent: string; ink: string }) {
  return (
    <div className="flex items-center gap-[5px]">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === active ? 18 : 5,
            height: 5,
            background: i === active ? accent : ink,
            opacity: i === active ? 1 : 0.18,
          }}
        />
      ))}
    </div>
  );
}

function SlideShell({ slide, activeIdx }: { slide: Slide; activeIdx: number }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: slide.ground }}>
      {/* status bar */}
      <div
        className="flex items-center justify-between px-6 pt-3 text-[10.5px] font-bold tracking-wide"
        style={{ color: slide.inkMute }}
      >
        <span>09:41</span>
        <span>%84</span>
      </div>

      {/* header row */}
      <div className="flex items-center justify-between px-6 pt-5">
        <BrandHeader ink={slide.ink} />
        <PageIndex num={slide.num} total={slide.total} ink={slide.ink} />
      </div>

      {/* visual */}
      <div className="flex-1 flex items-end justify-center pt-6">
        {slide.visual()}
      </div>

      {/* divider */}
      <div className="px-6">
        <div className="h-px w-full" style={{ background: slide.divider }} />
      </div>

      {/* type block */}
      <div className="px-6 pt-6 pb-8">
        <div
          className="text-[10px] font-bold tracking-[2.5px] mb-3"
          style={{ color: slide.accent }}
        >
          {slide.eyebrow}
        </div>
        <h1
          className="font-bold leading-[1.06] tracking-[-0.7px] mb-3"
          style={{ color: slide.ink, fontSize: 26 }}
        >
          {slide.title.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p
          className="text-[12.5px] font-medium leading-[1.55] mb-7"
          style={{ color: slide.inkSoft }}
        >
          {slide.body}
        </p>

        <button
          className="w-full rounded-[16px] py-[15px] flex items-center justify-center gap-2 text-[13.5px] font-bold"
          style={{ background: slide.buttonBg, color: slide.buttonInk }}
        >
          {slide.cta}
          <ArrowRight size={15} strokeWidth={2.6} />
        </button>

        <div className="mt-5 flex items-center justify-between">
          <Dots active={activeIdx} total={4} accent={slide.accent} ink={slide.ink} />
          <span
            className="text-[11px] font-semibold tracking-wide"
            style={{ color: slide.inkMute, opacity: slide.showSkip ? 1 : 0 }}
          >
            Atla
          </span>
        </div>
      </div>
    </div>
  );
}

// =============== visuals ===============

function HeroVisual() {
  return (
    <div className="relative w-full" style={{ height: 244 }}>
      {/* concentric rings */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: 220, height: 220, marginLeft: -110, marginTop: -130,
          border: "1px solid rgba(11,61,145,0.10)",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: 296, height: 296, marginLeft: -148, marginTop: -168,
          border: "1px solid rgba(11,61,145,0.06)",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: 372, height: 372, marginLeft: -186, marginTop: -206,
          border: "1px solid rgba(11,61,145,0.03)",
        }}
      />
      {/* big square icon */}
      <div className="absolute inset-0 flex items-start justify-center pt-2">
        <img
          src={ASSET("icon.png")}
          alt="Çarşı Piyasa"
          className="w-[128px] h-[128px] object-contain rounded-[28px]"
          style={{
            boxShadow: "0 22px 44px rgba(11,61,145,0.28)",
          }}
        />
      </div>
      {/* sample numbers anchored bottom */}
      <div className="absolute left-0 right-0 bottom-0 px-6">
        <div
          className="text-[9.5px] font-bold tracking-[2px] mb-2"
          style={{ color: "#0B1F3A", opacity: 0.45 }}
        >
          ŞU AN CANLI
        </div>
        <div className="flex items-baseline gap-5">
          {[
            { c: "USD", v: "41,9120" },
            { c: "EUR", v: "47,3088" },
            { c: "GRAM", v: "5.412,80" },
          ].map((r) => (
            <div key={r.c} className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-bold tracking-wide" style={{ color: "#0B3D91" }}>
                {r.c}
              </span>
              <span
                className="text-[14px] font-bold"
                style={{ color: "#0B1F3A", fontFeatureSettings: '"tnum" on' }}
              >
                {r.v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WidgetVisual() {
  return (
    <div className="relative w-full" style={{ height: 244 }}>
      {/* simulated home screen */}
      <div
        className="absolute inset-x-6 bottom-0 rounded-t-[28px]"
        style={{
          height: 226,
          background: "linear-gradient(180deg,rgba(11,31,58,0.04) 0%,rgba(11,31,58,0.10) 100%)",
        }}
      />
      <div className="absolute inset-x-10 bottom-2 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-[12px]"
            style={{ background: `rgba(11,31,58,${0.06 + (i % 3) * 0.03})` }}
          />
        ))}
      </div>

      {/* widget card centered */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[14px]" style={{ width: 246 }}>
        <div
          className="rounded-[18px] p-3.5"
          style={{
            background: "#0B1F3A",
            boxShadow: "0 24px 38px rgba(11,31,58,0.32)",
          }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <img src={ASSET("icon.png")} alt="" className="w-3.5 h-3.5 object-contain rounded-[3px]" />
              <span className="text-[9px] font-bold tracking-[1.5px] text-white/65">
                ÇARŞI PİYASA
              </span>
            </div>
            <span className="text-[9px] font-semibold text-white/35">09:41</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { code: "USD", price: "41,9120", up: true },
              { code: "EUR", price: "47,3088", up: false },
              { code: "GRAM", price: "5.412,80", up: true },
              { code: "ÇEYREK", price: "8.960,00", up: true },
            ].map((r) => (
              <div
                key={r.code}
                className="rounded-[10px] px-2.5 py-2"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div className="text-[8.5px] font-bold tracking-wide text-white/65">
                  {r.code}
                </div>
                <div
                  className="text-[12px] font-bold text-white mt-0.5"
                  style={{ fontFeatureSettings: '"tnum" on' }}
                >
                  {r.price}
                </div>
                <div
                  className="text-[8.5px] font-bold mt-0.5"
                  style={{
                    color: r.up ? "#4ADE80" : "#F87171",
                    fontFeatureSettings: '"tnum" on',
                  }}
                >
                  {r.up ? "▲ %0,34" : "▼ %0,18"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotifVisual() {
  return (
    <div className="relative w-full px-6" style={{ height: 244 }}>
      <div className="text-center pt-1">
        <div className="text-[44px] font-bold text-white tracking-[-1.5px] leading-none">
          09:41
        </div>
        <div className="text-[11px] font-semibold text-white/55 mt-1">
          Salı, 21 Nisan
        </div>
      </div>
      <div className="absolute left-6 right-6 bottom-1 flex flex-col gap-1.5">
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
          <div
            key={i}
            className="rounded-[14px] px-3 py-2.5 flex items-start gap-2.5"
            style={{
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <img
              src={ASSET("icon.png")}
              alt=""
              className="w-[18px] h-[18px] object-contain mt-0.5 rounded-[4px]"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10.5px] font-bold text-white/95">Çarşı Piyasa</span>
                <span className="text-[9.5px] text-white/45">· {n.time}</span>
              </div>
              <div className="text-[11.5px] font-semibold text-white/95 mt-0.5 leading-snug">
                {n.title}
              </div>
              <div className="text-[10px] font-medium text-white/55 mt-0.5">
                {n.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioVisual() {
  return (
    <div className="relative w-full px-6" style={{ height: 244 }}>
      <div className="text-center pt-2">
        <div className="text-[10px] font-bold tracking-[2.5px] text-white/55">
          PORTFÖY DEĞERİ
        </div>
        <div
          className="text-[40px] font-bold text-white tracking-[-1.6px] leading-none mt-2"
          style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}
        >
          ₺127.840
        </div>
        <div
          className="text-[12px] font-bold mt-1.5"
          style={{ color: "#4ADE80", fontFeatureSettings: '"tnum" on' }}
        >
          ▲ +%4,82  ·  +₺5.880
        </div>
      </div>
      <div className="absolute left-6 right-6 bottom-2 space-y-1.5">
        {[
          { code: "USD", qty: "1.500", val: "₺62.868", pct: "+%2,1", up: true },
          { code: "GRAM", qty: "8 gr", val: "₺43.302", pct: "+%6,4", up: true },
          { code: "ÇEYREK", qty: "2,5 ad.", val: "₺22.400", pct: "−%0,4", up: false },
        ].map((r) => (
          <div
            key={r.code}
            className="flex items-center justify-between rounded-[10px] px-2.5 py-1.5"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div>
              <div className="text-[10.5px] font-bold text-white">{r.code}</div>
              <div className="text-[9px] text-white/55">{r.qty}</div>
            </div>
            <div className="text-right">
              <div
                className="text-[10.5px] font-bold text-white"
                style={{ fontFeatureSettings: '"tnum" on' }}
              >
                {r.val}
              </div>
              <div
                className="text-[9px] font-bold mt-0.5"
                style={{ color: r.up ? "#4ADE80" : "#F87171" }}
              >
                {r.pct}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============== content ===============

const LIGHT = {
  ground: "#FFFFFF",
  ink: "#0B1F3A",
  inkSoft: "rgba(11,31,58,0.65)",
  inkMute: "rgba(11,31,58,0.45)",
  divider: "rgba(11,31,58,0.08)",
  buttonBg: "#0B3D91",
  buttonInk: "#FFFFFF",
};

const DARK = {
  ground: "linear-gradient(180deg,#0A1628 0%,#08111F 100%)",
  ink: "#E8EEF7",
  inkSoft: "rgba(232,238,247,0.70)",
  inkMute: "rgba(232,238,247,0.45)",
  divider: "rgba(255,255,255,0.10)",
  buttonBg: "#FFFFFF",
  buttonInk: "#0B1F3A",
};

const NAVY = {
  ground: "linear-gradient(180deg,#0B3D91 0%,#082B66 100%)",
  ink: "#FFFFFF",
  inkSoft: "rgba(255,255,255,0.78)",
  inkMute: "rgba(255,255,255,0.50)",
  divider: "rgba(255,255,255,0.16)",
  buttonBg: "#FFFFFF",
  buttonInk: "#0B3D91",
};

const SLIDES: Slide[] = [
  {
    num: "01", total: "04",
    eyebrow: "TÜRKİYE İÇİN",
    title: ["Bütün döviz, gram", "ve sarrafiye altın", "tek ekranda."],
    body: "68 sembol, 5 kategori. Saniye saniye güncel veri, sade arayüz, gizli ücret yok.",
    cta: "Devam et",
    visual: HeroVisual,
    accent: "#0B3D91",
    showSkip: true,
    ...LIGHT,
  },
  {
    num: "02", total: "04",
    eyebrow: "ANA EKRAN",
    title: ["Telefonu açmadan", "fiyatı görüyorsun."],
    body: "Ana ekrana eklenebilen widget ile dilediğin 4 sembolü hep gözünün önünde tut. Açık, koyu ve otomatik tema.",
    cta: "Devam et",
    visual: WidgetVisual,
    accent: "#0B3D91",
    showSkip: true,
    ...LIGHT,
  },
  {
    num: "03", total: "04",
    eyebrow: "AKILLI BİLDİRİM",
    title: ["Sadece önemli", "olduğunda haber verir."],
    body: "Fiyat hareketi, açılış ve kapanış brifingi, haftalık portföy özeti. Hepsi sessiz, hepsi senin kontrolünde.",
    cta: "Bildirimlere izin ver",
    visual: NotifVisual,
    accent: "#F59E0B",
    showSkip: true,
    ...DARK,
  },
  {
    num: "04", total: "04",
    eyebrow: "PORTFÖY VE ALARM",
    title: ["Aldığın fiyatı", "bilirsen, kazandığını", "da bilirsin."],
    body: "Pozisyonlarını gir, ortalama maliyetini gör, hedef fiyat geldiğinde alarmla bilgilen.",
    cta: "Başla",
    visual: PortfolioVisual,
    accent: "#FFFFFF",
    showSkip: false,
    ...NAVY,
  },
];

export function OnboardingFlow() {
  return (
    <div
      className="min-h-screen w-full flex items-start justify-center py-12"
      style={{ background: "#0B0F1A" }}
    >
      <div className="flex flex-col gap-10">
        <div className="px-2 flex items-baseline gap-3">
          <img src={ASSET("icon.png")} alt="" className="w-5 h-5 object-contain rounded-[5px]" />
          <span className="text-[15px] font-bold text-white tracking-[-0.3px]">
            Çarşı Piyasa · Onboarding
          </span>
          <span className="text-[11px] text-white/40">4 sayfa, sağa kaydırma akışı</span>
        </div>

        <div className="flex items-start gap-8">
          {SLIDES.map((s, i) => (
            <PhoneFrame key={i} label={`SAYFA ${s.num}`}>
              <SlideShell slide={s} activeIdx={i} />
            </PhoneFrame>
          ))}
        </div>

        <div className="text-[11.5px] text-white/45 px-2 max-w-[1100px] leading-relaxed font-medium">
          Akış kuralı: hiçbir izin sistem tarafından ilk açılışta sorulmaz. Kullanıcı 3. sayfada
          "Bildirimlere izin ver" butonuna basınca native diyalog açılır. Atlayan kullanıcı
          rahatsız edilmez, izinleri istediği zaman ayarlardan açabilir.
        </div>
      </div>
    </div>
  );
}
