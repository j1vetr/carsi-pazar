import React from "react";

export type Theme = "light" | "dark";

export const T = {
  light: {
    bg: "#F7F7F5",
    surface: "#FFFFFF",
    sub: "#FAFAF8",
    ink: "#0E1116",
    inkSoft: "#3A3F47",
    muted: "#8A8E96",
    mutedDim: "#B5B8BD",
    hairline: "rgba(14,17,22,0.08)",
    hairlineStrong: "rgba(14,17,22,0.14)",
    chip: "#EFEFEC",
    chipActive: "#0E1116",
    chipActiveText: "#FFFFFF",
    accent: "#0A2540",
    up: "#127A4A",
    upBg: "rgba(18,122,74,0.08)",
    down: "#C0392B",
    downBg: "rgba(192,57,43,0.08)",
    gold: "#A87515",
    goldHi: "#C28A1B",
    pillBg: "rgba(14,17,22,0.04)",
    logoLight: false,
  },
  dark: {
    bg: "#0A0E14",
    surface: "#0E141C",
    sub: "#0A1018",
    ink: "#F4F1E8",
    inkSoft: "#D7D3C4",
    muted: "#7B8290",
    mutedDim: "#4D5462",
    hairline: "rgba(255,245,220,0.07)",
    hairlineStrong: "rgba(255,245,220,0.14)",
    chip: "rgba(255,255,255,0.06)",
    chipActive: "#F4F1E8",
    chipActiveText: "#0A0E14",
    accent: "#9CC3FF",
    up: "#5EE0A0",
    upBg: "rgba(94,224,160,0.10)",
    down: "#FF8A7A",
    downBg: "rgba(255,138,122,0.10)",
    gold: "#D4A24C",
    goldHi: "#F5D78A",
    pillBg: "rgba(255,255,255,0.04)",
    logoLight: true,
  },
};

export const SANS =
  "ui-sans-serif, system-ui, -apple-system, 'SF Pro Text', Inter, sans-serif";
export const MONO =
  "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace";

export function PhoneShell({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}) {
  const t = T[theme];
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          theme === "light"
            ? "linear-gradient(180deg,#E8E8E3 0%,#D6D6D0 100%)"
            : "radial-gradient(circle at 25% 0%, #11151E 0%, #04060A 75%)",
        padding: "30px 18px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          width: 390,
          background: t.bg,
          borderRadius: 44,
          overflow: "hidden",
          boxShadow:
            theme === "light"
              ? "0 30px 80px rgba(15,23,42,0.18), inset 0 0 0 1px rgba(15,23,42,0.06)"
              : "0 40px 100px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.04)",
          border: theme === "light" ? "10px solid #1B1F26" : "10px solid #050307",
          position: "relative",
          color: t.ink,
        }}
      >
        <StatusBar theme={theme} />
        {children}
      </div>
    </div>
  );
}

function StatusBar({ theme }: { theme: Theme }) {
  const t = T[theme];
  return (
    <div
      style={{
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        color: t.ink,
        fontSize: 13,
        fontWeight: 600,
        opacity: 0.85,
      }}
    >
      <span>14:32</span>
      <span style={{ fontSize: 11, opacity: 0.7 }}>●●●●  5G  ▮</span>
    </div>
  );
}

export function TopBar({
  theme,
  date = "19 NİS",
  time = "14:32:08",
}: {
  theme: Theme;
  date?: string;
  time?: string;
}) {
  const t = T[theme];
  const logoSrc = theme === "light"
    ? "/__mockup/brand/logo-light.png"
    : "/__mockup/brand/logo-dark.png";
  return (
    <div
      style={{
        position: "relative",
        height: 56,
        borderBottom: `1px solid ${t.hairline}`,
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
      }}
    >
      {/* left: hamburger placeholder */}
      <div
        style={{
          width: 36, height: 36, borderRadius: 12,
          background: t.pillBg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ width: 14, height: 1.6, background: t.inkSoft, borderRadius: 1 }} />
          <span style={{ width: 14, height: 1.6, background: t.inkSoft, borderRadius: 1 }} />
          <span style={{ width: 10, height: 1.6, background: t.inkSoft, borderRadius: 1 }} />
        </div>
      </div>

      {/* center: logo absolute */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        <img src={logoSrc} alt="Çarşı Piyasa" style={{ height: 26, width: "auto", display: "block" }} />
      </div>

      {/* right: date + time */}
      <div style={{ marginLeft: "auto", textAlign: "right" }}>
        <div
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: t.muted,
          }}
        >
          {date}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: t.ink,
            marginTop: 2,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: -0.2,
          }}
        >
          {time}
        </div>
      </div>
    </div>
  );
}

export function Segments({
  theme,
  items,
  active,
}: {
  theme: Theme;
  items: string[];
  active: number;
}) {
  const t = T[theme];
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "14px 18px 10px",
        overflowX: "auto",
      }}
    >
      {items.map((it, i) => {
        const on = i === active;
        return (
          <span
            key={it}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              padding: "7px 14px",
              borderRadius: 999,
              background: on ? t.chipActive : t.chip,
              color: on ? t.chipActiveText : t.muted,
              whiteSpace: "nowrap",
              letterSpacing: -0.1,
            }}
          >
            {it}
          </span>
        );
      })}
    </div>
  );
}

export function TableHeader({
  theme,
  cols = ["Birim", "Alış", "Satış"],
}: {
  theme: Theme;
  cols?: string[];
}) {
  const t = T[theme];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 18px",
        background: t.sub,
        borderTop: `1px solid ${t.hairline}`,
        borderBottom: `1px solid ${t.hairline}`,
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: 1.4,
          color: t.muted,
          flex: 1,
        }}
      >
        {cols[0].toUpperCase()}
      </div>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: 1.4,
          color: t.muted,
          width: 86,
          textAlign: "right",
        }}
      >
        {cols[1].toUpperCase()}
      </div>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: 1.4,
          color: t.muted,
          width: 96,
          textAlign: "right",
        }}
      >
        {cols[2].toUpperCase()}
      </div>
    </div>
  );
}

export interface PriceRow {
  code: string;
  name: string;
  buy: string;
  sell: string;
  change: number;
  flag?: string;     // emoji or 2-letter
  badge?: string;    // optional small badge
}

export function Row({
  theme,
  row,
  last,
}: {
  theme: Theme;
  row: PriceRow;
  last?: boolean;
}) {
  const t = T[theme];
  const up = row.change > 0;
  const down = row.change < 0;
  const c = up ? t.up : down ? t.down : t.muted;
  const bg = up ? t.upBg : down ? t.downBg : "transparent";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "13px 18px",
        borderBottom: last ? "none" : `1px solid ${t.hairline}`,
        background: t.surface,
      }}
    >
      {/* flag/icon disc */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          background: t.pillBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {row.flag ?? row.code.slice(0, 2)}
      </div>

      {/* code + name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 14.5,
              fontWeight: 700,
              color: t.ink,
              letterSpacing: -0.2,
            }}
          >
            {row.code}
          </span>
          {row.badge ? (
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: 0.6,
                color: t.muted,
                padding: "1px 6px",
                borderRadius: 4,
                background: t.pillBg,
              }}
            >
              {row.badge}
            </span>
          ) : null}
        </div>
        <div
          style={{
            fontSize: 11,
            color: t.muted,
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {row.name}
        </div>
      </div>

      {/* buy */}
      <div
        style={{
          width: 86,
          textAlign: "right",
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 500,
          color: t.inkSoft,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: -0.3,
        }}
      >
        {row.buy}
      </div>

      {/* sell + change */}
      <div
        style={{
          width: 96,
          textAlign: "right",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 14,
            fontWeight: 700,
            color: t.ink,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: -0.3,
            lineHeight: 1.1,
          }}
        >
          {row.sell}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            marginTop: 3,
            padding: "1px 6px",
            borderRadius: 5,
            background: bg,
            fontSize: 10.5,
            fontWeight: 700,
            color: c,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: -0.1,
          }}
        >
          {up ? "▲" : down ? "▼" : "·"} {Math.abs(row.change).toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export function SectionTitle({
  theme,
  title,
  meta,
}: {
  theme: Theme;
  title: string;
  meta?: string;
}) {
  const t = T[theme];
  return (
    <div
      style={{
        padding: "18px 18px 10px",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: t.ink,
          letterSpacing: -0.3,
        }}
      >
        {title}
      </div>
      {meta ? (
        <div
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: t.muted,
          }}
        >
          {meta}
        </div>
      ) : null}
    </div>
  );
}
