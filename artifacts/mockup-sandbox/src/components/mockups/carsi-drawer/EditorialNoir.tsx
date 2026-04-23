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
  ChevronRight,
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
    title: "Araçlar",
    items: [
      { key: "converter", label: "Çevirici", icon: ArrowLeftRight },
      { key: "gold-calc", label: "Saf Altın Hesaplayıcı", icon: Gem },
      { key: "compare", label: "Karşılaştırma", icon: ArrowUpDown },
    ],
  },
  {
    title: "İçerik",
    items: [
      { key: "news", label: "Haberler", icon: Newspaper, active: true },
      { key: "parities", label: "Pariteler", icon: TrendingUp },
    ],
  },
  {
    title: "Bildirimler",
    items: [
      { key: "inbox", label: "Gelen Kutusu", icon: Inbox, badge: "3" },
      { key: "alerts", label: "Alarmlar", icon: Bell, badge: "5" },
    ],
  },
  {
    title: "Ayarlar",
    items: [
      { key: "settings", label: "Bildirimler & Tercihler", icon: SlidersHorizontal },
      { key: "widget", label: "Widget Ayarları", icon: Smartphone },
      { key: "theme", label: "Tema", icon: Palette },
    ],
  },
  {
    title: "Yasal",
    items: [
      { key: "disclaimer", label: "Yasal Uyarı", icon: AlertCircle },
      { key: "privacy", label: "KVKK Aydınlatma Metni", icon: ShieldCheck },
    ],
  },
];

const GOLD = "#C9A227";

export function EditorialNoir() {
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "#0B1322",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#E8EEF7",
      }}
    >
      {/* Brand hero — editorial */}
      <header
        className="relative px-7 pt-12 pb-8"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, #14223C 0%, #0B1322 60%)",
          borderBottom: "1px solid rgba(201,162,39,0.18)",
        }}
      >
        {/* hairline gold rule */}
        <div
          className="absolute left-7 right-7 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.55) 35%, rgba(201,162,39,0.55) 65%, transparent 100%)",
          }}
        />
        <div
          className="text-[10px] tracking-[0.42em] uppercase mb-3"
          style={{ color: GOLD, fontFamily: "Inter" }}
        >
          Est · 2025
        </div>
        <h1
          className="text-[34px] leading-[1.05] tracking-tight"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 500,
            color: "#F4ECD3",
          }}
        >
          Çarşı
          <br />
          <span style={{ fontStyle: "italic", color: GOLD }}>Piyasa</span>
        </h1>
        <p
          className="mt-3 text-[11px] leading-[1.5] max-w-[230px]"
          style={{ color: "rgba(232,238,247,0.55)", letterSpacing: "0.01em" }}
        >
          Anlık döviz &amp; altın takibinde
          Türkiye&rsquo;nin tercih edilen rehberi.
        </p>
      </header>

      {/* Sections */}
      <nav className="flex-1 overflow-y-auto pt-3 pb-6">
        {SECTIONS.map((section, sIdx) => (
          <div key={section.title} className="mb-2">
            {/* Section title — editorial italic small caps */}
            <div className="px-7 pt-5 pb-2 flex items-baseline gap-3">
              <span
                className="text-[10px] tracking-[0.36em] uppercase"
                style={{ color: GOLD, fontWeight: 600 }}
              >
                {String(sIdx + 1).padStart(2, "0")}
              </span>
              <span
                className="text-[11px] tracking-[0.32em] uppercase"
                style={{
                  color: "rgba(232,238,247,0.62)",
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontWeight: 600,
                }}
              >
                {section.title}
              </span>
              <span
                className="flex-1 h-px"
                style={{ background: "rgba(232,238,247,0.08)" }}
              />
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              const active = !!item.active;
              return (
                <button
                  key={item.key}
                  className="group relative w-full flex items-center gap-4 px-7 py-3.5 text-left transition-colors hover:bg-white/[0.025]"
                >
                  {/* Active gold rule */}
                  {active && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-[2px]"
                      style={{ background: GOLD }}
                    />
                  )}
                  {/* Icon — monochrome thin stroke in hairline frame */}
                  <span
                    className="flex h-9 w-9 items-center justify-center"
                    style={{
                      border: active
                        ? `1px solid ${GOLD}`
                        : "1px solid rgba(232,238,247,0.14)",
                      borderRadius: 2,
                      background: active
                        ? "rgba(201,162,39,0.06)"
                        : "transparent",
                    }}
                  >
                    <Icon
                      strokeWidth={1.4}
                      className="h-[18px] w-[18px]"
                      style={{
                        color: active ? GOLD : "rgba(232,238,247,0.78)",
                      }}
                    />
                  </span>

                  <span
                    className="flex-1 text-[14.5px] tracking-[-0.005em]"
                    style={{
                      color: active ? "#F4ECD3" : "rgba(232,238,247,0.92)",
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className="text-[10px] tracking-[0.16em] tabular-nums px-1.5 py-0.5"
                      style={{
                        color: GOLD,
                        border: `1px solid ${GOLD}`,
                        borderRadius: 2,
                        fontFamily:
                          "'Playfair Display', serif",
                        fontWeight: 700,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    strokeWidth={1.2}
                    className="h-3.5 w-3.5"
                    style={{ color: "rgba(232,238,247,0.32)" }}
                  />
                </button>
              );
            })}
          </div>
        ))}

        {/* Footer signature */}
        <div className="mt-6 px-7 pb-6 flex flex-col items-center">
          <span
            className="block w-8 h-px mb-4"
            style={{ background: GOLD, opacity: 0.55 }}
          />
          <span
            className="text-[10px] tracking-[0.42em] uppercase"
            style={{ color: "rgba(232,238,247,0.55)" }}
          >
            Çarşı Piyasa
          </span>
          <span
            className="mt-1 text-[10px] italic"
            style={{
              color: "rgba(232,238,247,0.4)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Versiyon 1.0 · İstanbul
          </span>
        </div>
      </nav>
    </div>
  );
}
