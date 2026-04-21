import { Bell, ChevronRight, Grid3x3, LineChart, Sparkles, Wallet } from "lucide-react";

type Slide = {
  index: number;
  total: number;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  skip?: string;
  visual: () => JSX.Element;
  bg: string;
  accent: string;
};

function PhoneFrame({ children, label, isLast }: { children: React.ReactNode; label: string; isLast?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative"
        style={{
          width: 300,
          height: 612,
          borderRadius: 44,
          padding: 8,
          background: "linear-gradient(180deg,#15192A 0%,#0B0F1E 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05) inset",
        }}
      >
        <div
          className="w-full h-full overflow-hidden relative"
          style={{ borderRadius: 36 }}
        >
          {children}
          {/* notch */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full"
            style={{ background: "#000" }}
          />
        </div>
      </div>
      <div className="text-[10.5px] font-bold tracking-[1.5px] text-white/45">
        {label}
      </div>
      {!isLast ? (
        <div className="text-white/20 text-2xl absolute" style={{ marginTop: 280, marginLeft: 320 }}>
          →
        </div>
      ) : null}
    </div>
  );
}

function Dots({ index, total, accent }: { index: number; total: number; accent: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === index ? 22 : 6,
            height: 6,
            background: i === index ? accent : "rgba(255,255,255,0.22)",
          }}
        />
      ))}
    </div>
  );
}

function SlideShell({ slide, children }: { slide: Slide; children?: React.ReactNode }) {
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: slide.bg }}
    >
      {/* status bar */}
      <div className="flex items-center justify-between px-6 pt-3 text-[11px] text-white/55 font-semibold">
        <span>09:41</span>
        <span className="text-white/40">{slide.skip ?? ""}</span>
      </div>

      {/* visual area */}
      <div className="flex-1 flex items-center justify-center px-6 pt-4 pb-4 relative">
        {children ?? slide.visual()}
      </div>

      {/* footer */}
      <div className="px-6 pb-9 pt-3">
        <div className="text-[10px] font-bold tracking-[2px] mb-2.5" style={{ color: slide.accent }}>
          {slide.eyebrow}
        </div>
        <div className="text-[24px] font-bold text-white leading-[1.18] tracking-[-0.6px] mb-2.5">
          {slide.title}
        </div>
        <div className="text-[12.5px] font-medium text-white/65 leading-[1.55] mb-6">
          {slide.body}
        </div>

        <button
          className="w-full rounded-full py-3.5 flex items-center justify-center gap-1.5 text-[13.5px] font-bold text-white"
          style={{
            background: slide.accent,
            boxShadow: `0 12px 32px ${slide.accent}55`,
          }}
        >
          {slide.cta}
          <ChevronRight size={16} />
        </button>

        <div className="mt-4 flex items-center justify-between">
          <Dots index={slide.index} total={slide.total} accent={slide.accent} />
          {slide.index < slide.total - 1 ? (
            <span className="text-[11.5px] font-semibold text-white/40">Atla</span>
          ) : (
            <span className="text-[11.5px] font-semibold text-white/40 opacity-0">·</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- visuals ----------

function WelcomeVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="absolute"
        style={{
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle,#3A6EE0 0%,#0B3D91 60%,transparent 75%)",
          filter: "blur(2px)",
          opacity: 0.55,
        }}
      />
      {/* logo block */}
      <div
        className="relative z-10 flex flex-col items-center"
      >
        <div
          className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-5"
          style={{
            background: "linear-gradient(135deg,#3A6EE0 0%,#0B3D91 100%)",
            boxShadow: "0 14px 30px rgba(11,61,145,0.55)",
          }}
        >
          <LineChart size={36} color="#fff" strokeWidth={2.4} />
        </div>
        <div className="text-[10.5px] font-bold tracking-[3px] text-white/55 mb-1">ÇARŞI PİYASA</div>
        <div className="text-[18px] font-bold text-white tracking-[-0.4px]">Hoş Geldin</div>
      </div>
      {/* floating chips */}
      <div className="absolute" style={{ top: 24, left: 18 }}>
        <FloatChip code="USD" price="41,91" up tint="#3A6EE0" />
      </div>
      <div className="absolute" style={{ top: 60, right: 16 }}>
        <FloatChip code="EUR" price="47,30" up={false} tint="#0F766E" />
      </div>
      <div className="absolute" style={{ bottom: 30, left: 30 }}>
        <FloatChip code="GRAM" price="5.412" up tint="#B45309" />
      </div>
      <div className="absolute" style={{ bottom: 60, right: 22 }}>
        <FloatChip code="ÇEYREK" price="8.960" up tint="#BE123C" />
      </div>
    </div>
  );
}

function FloatChip({ code, price, up, tint }: { code: string; price: string; up: boolean; tint: string }) {
  return (
    <div
      className="rounded-2xl px-3 py-2 flex flex-col"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="text-[9.5px] font-bold tracking-wide" style={{ color: tint }}>
        {code}
      </div>
      <div className="text-[12px] font-bold text-white" style={{ fontFeatureSettings: '"tnum" on' }}>
        {price}
      </div>
      <div
        className="text-[9px] font-bold mt-0.5"
        style={{ color: up ? "#4ADE80" : "#F87171" }}
      >
        {up ? "▲ %0,34" : "▼ %0,18"}
      </div>
    </div>
  );
}

function WidgetVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* phone home screen blur */}
      <div
        className="absolute inset-x-4 inset-y-2 rounded-[28px]"
        style={{
          background: "linear-gradient(160deg,rgba(99,102,241,0.18) 0%,rgba(0,0,0,0) 60%)",
        }}
      />
      {/* fake icon grid */}
      <div className="absolute" style={{ top: 14, left: 26, right: 26 }}>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-[14px]"
              style={{
                background: `hsl(${(i * 47) % 360},35%,${20 + (i % 3) * 6}%)`,
                opacity: 0.55,
              }}
            />
          ))}
        </div>
      </div>
      {/* widget card pinned center */}
      <div
        className="relative z-10 rounded-[20px] p-3.5 w-[230px]"
        style={{
          background: "linear-gradient(160deg,#0B3D91 0%,#1E293B 100%)",
          boxShadow: "0 18px 38px rgba(11,61,145,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset",
        }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9.5px] font-bold tracking-[1.5px] text-white/65">ÇARŞI PİYASA</span>
          <span className="text-[9px] font-semibold text-white/40">09:41</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { code: "USD", price: "41,9120", up: true, tint: "#3A6EE0" },
            { code: "EUR", price: "47,3088", up: false, tint: "#0F766E" },
            { code: "GRAM", price: "5.412,80", up: true, tint: "#B45309" },
            { code: "ÇEYREK", price: "8.960,00", up: true, tint: "#BE123C" },
          ].map((r) => (
            <div
              key={r.code}
              className="rounded-[10px] px-2 py-1.5"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div className="text-[8.5px] font-bold tracking-wide" style={{ color: "#fff" }}>
                {r.code}
              </div>
              <div className="text-[11px] font-bold text-white" style={{ fontFeatureSettings: '"tnum" on' }}>
                {r.price}
              </div>
              <div
                className="text-[8.5px] font-bold mt-0.5"
                style={{ color: r.up ? "#4ADE80" : "#F87171" }}
              >
                {r.up ? "▲ %0,34" : "▼ %0,18"}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute" style={{ bottom: 6, right: 18 }}>
        <Grid3x3 size={42} color="#fff" strokeWidth={1.2} opacity={0.12} />
      </div>
    </div>
  );
}

function NotifVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center px-2">
      <div
        className="absolute"
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle,#F59E0B 0%,#7C2D12 50%,transparent 70%)",
          opacity: 0.35,
          filter: "blur(8px)",
        }}
      />
      {/* notification cards */}
      <div className="relative z-10 w-full flex flex-col gap-2">
        <div
          className="rounded-2xl p-3 flex items-start gap-2.5"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            transform: "rotate(-1.5deg)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#0B3D91" }}
          >
            <Bell size={16} color="#fff" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-white/85">Çarşı Piyasa · şimdi</div>
            <div className="text-[11px] font-semibold text-white/95 mt-0.5 leading-tight">
              USD %1,2 yükseldi → 41,9120
            </div>
          </div>
        </div>
        <div
          className="rounded-2xl p-3 flex items-start gap-2.5"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            transform: "rotate(1deg)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#B45309" }}
          >
            <Sparkles size={16} color="#fff" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-white/85">Açılış Brifingi · 09:00</div>
            <div className="text-[11px] font-semibold text-white/95 mt-0.5 leading-tight">
              ONS 3.412 · GRAM 5.412 · USD 41,91
            </div>
          </div>
        </div>
        <div
          className="rounded-2xl p-3 flex items-start gap-2.5"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            transform: "rotate(-0.5deg)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#8B5CF6" }}
          >
            <Bell size={16} color="#fff" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-white/85">Haber · BloombergHT</div>
            <div className="text-[11px] font-semibold text-white/95 mt-0.5 leading-tight">
              Merkez faiz kararı bugün açıklanacak
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortfolioVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="absolute"
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle,#10B981 0%,#064E3B 55%,transparent 72%)",
          opacity: 0.45,
          filter: "blur(6px)",
        }}
      />
      <div
        className="relative z-10 rounded-[20px] p-4 w-[230px]"
        style={{
          background: "linear-gradient(160deg,#064E3B 0%,#0B0F1E 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 38px rgba(16,185,129,0.35)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#10B981" }}
          >
            <Wallet size={16} color="#fff" />
          </div>
          <div className="text-[10.5px] font-bold tracking-[1.5px] text-white/65">PORTFÖYÜM</div>
        </div>
        <div className="text-[10.5px] font-medium text-white/55 mb-1">Toplam Değer</div>
        <div className="text-[24px] font-bold text-white tracking-[-0.5px]" style={{ fontFeatureSettings: '"tnum" on' }}>
          ₺127.840
        </div>
        <div className="text-[11px] font-bold text-emerald-400 mt-1">▲ +%4,82  ·  ₺5.880</div>

        <div className="mt-4 space-y-2">
          {[
            { code: "USD", qty: "1.500", val: "₺62.868", pct: "+%2,1", up: true },
            { code: "GRAM", qty: "8 gr", val: "₺43.302", pct: "+%6,4", up: true },
            { code: "ÇEYREK", qty: "2,5 ad", val: "₺22.400", pct: "−%0,4", up: false },
          ].map((r) => (
            <div
              key={r.code}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div>
                <div className="text-[10px] font-bold text-white/85">{r.code}</div>
                <div className="text-[8.5px] text-white/45">{r.qty}</div>
              </div>
              <div className="text-right">
                <div className="text-[10.5px] font-bold text-white" style={{ fontFeatureSettings: '"tnum" on' }}>
                  {r.val}
                </div>
                <div
                  className="text-[8.5px] font-bold"
                  style={{ color: r.up ? "#4ADE80" : "#F87171" }}
                >
                  {r.pct}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- main ----------

const SLIDES: Slide[] = [
  {
    index: 0,
    total: 4,
    eyebrow: "ANLIK · DOĞRU · TÜRKÇE",
    title: "Türkiye'nin canlı piyasa cebinde.",
    body: "68 sembol, 5 kategori. Döviz, gram altın, sarrafiye, külçe, paladyum ve gümüş — hepsi tek ekranda saniyelik güncel.",
    cta: "Devam Et",
    visual: WelcomeVisual,
    bg: "linear-gradient(180deg,#0A0F1E 0%,#10172A 50%,#0B3D91 130%)",
    accent: "#3A6EE0",
  },
  {
    index: 1,
    total: 4,
    eyebrow: "ANA EKRAN WIDGET'I",
    title: "4 sembolün her zaman gözünün önünde.",
    body: "Telefonunu açmadan ana ekrandan döviz ve altın fiyatlarını gör. Hangi 4 sembolün gözükeceğine sen karar ver.",
    cta: "Devam Et",
    visual: WidgetVisual,
    bg: "linear-gradient(180deg,#0F0B1E 0%,#1E1A3A 60%,#3730A3 130%)",
    accent: "#6366F1",
  },
  {
    index: 2,
    total: 4,
    eyebrow: "BİLDİRİMLER",
    title: "Önemli olduğunda haber al.",
    body: "Fiyat hareketleri, sabah/akşam brifingi, haftalık portföy özeti ve seçili haberler. Hepsi sessiz, hepsi senin kontrolünde.",
    cta: "Bildirimleri Aç",
    visual: NotifVisual,
    bg: "linear-gradient(180deg,#1A0F0F 0%,#2A1810 55%,#7C2D12 130%)",
    accent: "#F59E0B",
  },
  {
    index: 3,
    total: 4,
    eyebrow: "PORTFÖY & ALARMLAR",
    title: "Hesabını her zaman bil.",
    body: "Aldığın fiyatı gir, ortalama maliyetini ve kâr-zararını anlık takip et. Hedef fiyata ulaşan sembollerde alarm kur.",
    cta: "Hadi Başlayalım",
    visual: PortfolioVisual,
    bg: "linear-gradient(180deg,#0B1F18 0%,#0F2A1F 55%,#064E3B 130%)",
    accent: "#10B981",
  },
];

export function OnboardingFlow() {
  return (
    <div
      className="min-h-screen w-full flex items-start justify-center py-10"
      style={{ background: "#06080F" }}
    >
      <div className="flex flex-col gap-8">
        <div className="flex items-end gap-2 px-2">
          <div className="text-[14px] font-bold text-white">Onboarding Akışı</div>
          <div className="text-[11px] text-white/40 mb-0.5">4 sayfa · sağa kaydırılır</div>
        </div>

        <div className="flex items-start gap-7">
          {SLIDES.map((s, i) => (
            <PhoneFrame key={i} label={`SAYFA ${i + 1}`} isLast={i === SLIDES.length - 1}>
              <SlideShell slide={s} />
            </PhoneFrame>
          ))}
        </div>

        <div className="text-[11px] text-white/40 px-2 leading-relaxed max-w-[1000px]">
          Akış: izinler ASLA ilk açılışta sistem tarafından sorulmaz. Önce bu 4 sayfa gösterilir,
          ardından kullanıcı 3. sayfada "Bildirimleri Aç" deyince native izin diyaloğu çıkar.
          Atla'ya basan da rahatsız edilmez — daha sonra Ayarlar'dan açabilir.
        </div>
      </div>
    </div>
  );
}
