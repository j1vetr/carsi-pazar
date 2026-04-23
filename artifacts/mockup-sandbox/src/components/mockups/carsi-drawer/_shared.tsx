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

const GOLD_DARK = "#C9A227";
const GOLD_LIGHT = "#A4811C";

export type Theme = "dark" | "light";

interface ThemeTokens {
  bg: string;
  headerBg: string;
  headerBorder: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  iconBorder: string;
  iconColor: string;
  hover: string;
  divider: string;
  logoSrc: string;
  chevron: string;
  gold: string;
  goldRule: string;
}

const TOKENS: Record<Theme, ThemeTokens> = {
  dark: {
    bg: "#0B1322",
    headerBg: "radial-gradient(120% 80% at 0% 0%, #14223C 0%, #0B1322 60%)",
    headerBorder: "rgba(201,162,39,0.18)",
    text: "#F4ECD3",
    textMuted: "rgba(232,238,247,0.92)",
    textSubtle: "rgba(232,238,247,0.55)",
    iconBorder: "rgba(232,238,247,0.14)",
    iconColor: "rgba(232,238,247,0.78)",
    hover: "rgba(255,255,255,0.025)",
    divider: "rgba(232,238,247,0.08)",
    logoSrc: "/__mockup/images/logo-dark.png",
    chevron: "rgba(232,238,247,0.32)",
    gold: GOLD_DARK,
    goldRule: `linear-gradient(90deg, transparent 0%, ${GOLD_DARK}99 35%, ${GOLD_DARK}99 65%, transparent 100%)`,
  },
  light: {
    bg: "#FBF9F4",
    headerBg: "radial-gradient(120% 80% at 0% 0%, #FFFFFF 0%, #F2EBDB 60%)",
    headerBorder: "rgba(164,129,28,0.32)",
    text: "#0B1F3A",
    textMuted: "rgba(11,31,58,0.92)",
    textSubtle: "rgba(11,31,58,0.55)",
    iconBorder: "rgba(11,31,58,0.14)",
    iconColor: "rgba(11,31,58,0.72)",
    hover: "rgba(11,31,58,0.04)",
    divider: "rgba(11,31,58,0.08)",
    logoSrc: "/__mockup/images/logo-light.png",
    chevron: "rgba(11,31,58,0.30)",
    gold: GOLD_LIGHT,
    goldRule: `linear-gradient(90deg, transparent 0%, ${GOLD_LIGHT}AA 35%, ${GOLD_LIGHT}AA 65%, transparent 100%)`,
  },
};

interface DrawerProps {
  theme: Theme;
}

export function EditorialDrawer({ theme }: DrawerProps) {
  const t = TOKENS[theme];
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: t.bg,
        fontFamily: "Inter, system-ui, sans-serif",
        color: t.text,
      }}
    >
      <header
        className="relative px-6 pt-9 pb-7"
        style={{
          background: t.headerBg,
          borderBottom: `1px solid ${t.headerBorder}`,
        }}
      >
        <div
          className="absolute left-7 right-7 bottom-0 h-px"
          style={{ background: t.goldRule }}
        />
        <div className="flex items-center justify-center">
          <img
            src={t.logoSrc}
            alt="Çarşı Piyasa"
            style={{
              height: 44,
              width: "auto",
              maxWidth: "62%",
              objectFit: "contain",
            }}
          />
        </div>
      </header>

      <nav className="flex-1 overflow-y-auto pt-2 pb-6">
        {SECTIONS.map((section, sIdx) => (
          <div key={section.title} className="mb-2">
            <div className="px-7 pt-5 pb-2 flex items-baseline gap-3">
              <span
                className="text-[10px] tracking-[0.36em] uppercase"
                style={{ color: t.gold, fontWeight: 600 }}
              >
                {String(sIdx + 1).padStart(2, "0")}
              </span>
              <span
                className="text-[11px] tracking-[0.32em] uppercase"
                style={{
                  color: t.textSubtle,
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontWeight: 600,
                }}
              >
                {section.title}
              </span>
              <span className="flex-1 h-px" style={{ background: t.divider }} />
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              const active = !!item.active;
              return (
                <button
                  key={item.key}
                  className="group relative w-full flex items-center gap-4 px-7 py-3.5 text-left transition-colors"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.hover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-[2px]"
                      style={{ background: t.gold }}
                    />
                  )}
                  <span
                    className="flex h-9 w-9 items-center justify-center"
                    style={{
                      border: active ? `1px solid ${t.gold}` : `1px solid ${t.iconBorder}`,
                      borderRadius: 2,
                      background: active
                        ? theme === "dark"
                          ? "rgba(201,162,39,0.06)"
                          : "rgba(164,129,28,0.08)"
                        : "transparent",
                    }}
                  >
                    <Icon
                      strokeWidth={1.4}
                      className="h-[18px] w-[18px]"
                      style={{ color: active ? t.gold : t.iconColor }}
                    />
                  </span>

                  <span
                    className="flex-1 text-[14.5px] tracking-[-0.005em]"
                    style={{
                      color: active ? t.text : t.textMuted,
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className="text-[10px] tracking-[0.16em] tabular-nums px-1.5 py-0.5"
                      style={{
                        color: t.gold,
                        border: `1px solid ${t.gold}`,
                        borderRadius: 2,
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    strokeWidth={1.2}
                    className="h-3.5 w-3.5"
                    style={{ color: t.chevron }}
                  />
                </button>
              );
            })}
          </div>
        ))}

        <div className="mt-6 px-7 pb-6 flex flex-col items-center">
          <span
            className="block w-8 h-px mb-4"
            style={{ background: t.gold, opacity: 0.55 }}
          />
          <span
            className="text-[10px] tracking-[0.42em] uppercase"
            style={{ color: t.textSubtle }}
          >
            Çarşı Piyasa
          </span>
          <span
            className="mt-1 text-[10px] italic"
            style={{
              color: t.textSubtle,
              fontFamily: "'Playfair Display', serif",
              opacity: 0.75,
            }}
          >
            Versiyon 1.0 · İstanbul
          </span>
        </div>
      </nav>
    </div>
  );
}
