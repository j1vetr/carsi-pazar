import {
  ArrowLeftRight,
  ArrowUpDown,
  Gem,
  Newspaper,
  TrendingUp,
  Inbox,
  Bell,
  SlidersHorizontal,
  Smartphone,
  Palette,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  active?: boolean;
};
type Section = { title: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    title: "ARAÇLAR",
    items: [
      { key: "converter", label: "Çevirici", icon: ArrowLeftRight },
      { key: "gold-calc", label: "Saf Altın Hesaplayıcı", icon: Gem },
      { key: "compare", label: "Karşılaştırma", icon: ArrowUpDown },
    ],
  },
  {
    title: "İÇERİK",
    items: [
      { key: "news", label: "Haberler", icon: Newspaper, active: true },
      { key: "parities", label: "Pariteler", icon: TrendingUp },
    ],
  },
  {
    title: "BİLDİRİMLER",
    items: [
      { key: "inbox", label: "Gelen Kutusu", icon: Inbox, badge: "3" },
      { key: "alerts", label: "Alarmlar", icon: Bell, badge: "5" },
    ],
  },
  {
    title: "AYARLAR",
    items: [
      {
        key: "settings",
        label: "Bildirimler & Tercihler",
        icon: SlidersHorizontal,
      },
      { key: "widget", label: "Widget Ayarları", icon: Smartphone },
      { key: "theme", label: "Tema", icon: Palette },
    ],
  },
  {
    title: "YASAL",
    items: [
      { key: "disclaimer", label: "Yasal Uyarı", icon: AlertCircle },
      { key: "privacy", label: "KVKK Aydınlatma Metni", icon: ShieldCheck },
    ],
  },
];

const ACCENT = "#5B8DEF";
const GOLD = "#E8C752";

export function GlassMono() {
  return (
    <div
      className="min-h-screen w-full flex flex-col relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0A1424 0%, #0A1424 35%, #0E1A30 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#E8EEF7",
      }}
    >
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full"
        style={{ background: "rgba(91,141,239,0.18)", filter: "blur(60px)" }}
      />
      <div
        className="pointer-events-none absolute top-32 -right-24 h-64 w-64 rounded-full"
        style={{ background: "rgba(232,199,82,0.10)", filter: "blur(70px)" }}
      />
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%221.6%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
        }}
      />

      {/* Brand */}
      <header
        className="relative px-6 pt-10 pb-6"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Geometric monoline mark */}
          <div
            className="relative flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(91,141,239,0.18), rgba(232,199,82,0.10))",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 18 L12 4 L20 18"
                stroke={GOLD}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.5 18 L12 10 L16.5 18"
                stroke={ACCENT}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="text-[18px] tracking-[-0.01em]"
              style={{ fontWeight: 700, color: "#F4F8FF" }}
            >
              Çarşı Piyasa
            </span>
            <span
              className="mt-1.5 text-[10.5px] tracking-[0.18em] uppercase"
              style={{ color: "rgba(232,238,247,0.5)", fontWeight: 500 }}
            >
              Canlı · Döviz &amp; Altın
            </span>
          </div>
        </div>

        {/* Status pill */}
        <div className="mt-5 flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full"
            style={{
              background: "rgba(34,197,94,0.10)",
              border: "1px solid rgba(34,197,94,0.30)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                style={{ background: "#22C55E" }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: "#22C55E" }}
              />
            </span>
            <span
              className="text-[10.5px] tracking-[0.06em]"
              style={{ color: "#86EFAC", fontWeight: 600 }}
            >
              Piyasa açık
            </span>
          </div>
          <div
            className="px-2.5 py-1.5 rounded-full text-[10.5px] tracking-[0.06em]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(232,238,247,0.7)",
              fontWeight: 500,
            }}
          >
            66 sembol
          </div>
        </div>
      </header>

      {/* Sections */}
      <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-6 relative">
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-1">
            <div
              className="px-4 pt-4 pb-2 text-[10px] tracking-[0.28em]"
              style={{
                color: "rgba(232,238,247,0.42)",
                fontWeight: 600,
              }}
            >
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = !!item.active;
              return (
                <button
                  key={item.key}
                  className="group relative w-full flex items-center gap-3.5 px-3.5 py-2.5 my-0.5 rounded-xl text-left transition-all"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, rgba(91,141,239,0.16), rgba(91,141,239,0.04))"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(91,141,239,0.32)"
                      : "1px solid transparent",
                  }}
                >
                  {/* Icon — monoline in subtle ring */}
                  <span
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      background: active
                        ? "rgba(91,141,239,0.18)"
                        : "rgba(255,255,255,0.04)",
                      border: active
                        ? "1px solid rgba(91,141,239,0.40)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <Icon
                      strokeWidth={1.6}
                      className="h-[17px] w-[17px]"
                      style={{
                        color: active ? "#A8C5FF" : "rgba(232,238,247,0.78)",
                      }}
                    />
                  </span>

                  <span
                    className="flex-1 text-[14.5px] tracking-[-0.005em]"
                    style={{
                      color: active ? "#F4F8FF" : "rgba(232,238,247,0.88)",
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className="flex items-center gap-1.5 text-[10.5px] tabular-nums"
                      style={{ color: "rgba(232,238,247,0.55)", fontWeight: 600 }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: "#EF4444" }}
                      />
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Footer */}
        <div className="mt-4 mx-2 px-4 py-4 rounded-2xl flex items-center justify-between"
             style={{
               background: "rgba(255,255,255,0.03)",
               border: "1px solid rgba(255,255,255,0.06)",
             }}>
          <div>
            <div className="text-[10.5px] tracking-[0.18em] uppercase"
                 style={{ color: "rgba(232,238,247,0.45)", fontWeight: 600 }}>
              Sürüm
            </div>
            <div className="text-[12.5px] mt-1 tabular-nums"
                 style={{ color: "rgba(232,238,247,0.85)", fontWeight: 600 }}>
              1.0.0 · build 24
            </div>
          </div>
          <div className="h-8 w-8 rounded-full flex items-center justify-center"
               style={{
                 background: "rgba(232,199,82,0.10)",
                 border: "1px solid rgba(232,199,82,0.28)",
               }}>
            <span style={{ color: GOLD, fontSize: 14, fontWeight: 700 }}>₺</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
