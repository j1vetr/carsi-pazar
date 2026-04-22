import React from "react";

export const SANS =
  "ui-sans-serif, system-ui, -apple-system, 'SF Pro Text', Inter, sans-serif";
export const MONO =
  "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace";

export const C = {
  shadeBg: "linear-gradient(180deg,#9AA8B5 0%,#7E8C9A 100%)",
  cardBg: "#1E5BC6",
  cardBg2: "#0B3D91",
  ink: "#FFFFFF",
  inkSoft: "rgba(255,255,255,0.78)",
  muted: "rgba(255,255,255,0.55)",
  hairline: "rgba(255,255,255,0.18)",
  upChip: "rgba(94,224,160,0.20)",
  upText: "#7CFFC0",
  downChip: "rgba(255,138,122,0.20)",
  downText: "#FFB3A8",
  dotBg: "#FFFFFF",
  dotInk: "#0B3D91",
};

export function ShadeFrame({
  time,
  date,
  children,
}: {
  time: string;
  date: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: 380,
        background: C.shadeBg,
        padding: "16px 14px 22px",
        borderRadius: 24,
        fontFamily: SANS,
        boxShadow: "0 24px 60px rgba(15,23,42,0.28)",
        position: "relative",
      }}
    >
      {/* status bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
          fontSize: 11.5,
          fontWeight: 500,
          padding: "0 6px 12px",
        }}
      >
        <span>Turk Telekom</span>
        <span style={{ opacity: 0.85, letterSpacing: 0.5 }}>📶 5G ⏐ 39%</span>
      </div>
      {/* time */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "0 6px 4px" }}>
        <span style={{ color: "#fff", fontSize: 28, fontWeight: 600, letterSpacing: -0.6 }}>
          {time}
        </span>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 400 }}>
          {date}
        </span>
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 11.5,
          padding: "10px 6px 12px",
          letterSpacing: 0.1,
        }}
      >
        Canlı bildirimler
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

export function AppIcon({ size = 30 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: C.dotBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <path d="M3 17 L9 11 L13 14 L21 6" stroke={C.dotInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="19" width="3" height="2.5" fill="#1FAE5F" />
        <rect x="8" y="16" width="3" height="5.5" fill="#1FAE5F" />
        <rect x="13" y="13" width="3" height="8.5" fill="#1FAE5F" />
      </svg>
    </div>
  );
}

export function Chip({
  dir,
  pct,
}: {
  dir: "up" | "down";
  pct: string;
}) {
  const isUp = dir === "up";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        background: isUp ? C.upChip : C.downChip,
        color: isUp ? C.upText : C.downText,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 11,
        padding: "2px 7px",
        borderRadius: 4,
        letterSpacing: -0.2,
      }}
    >
      {isUp ? "▲" : "▼"} %{pct}
    </span>
  );
}

export function Caret({ dir }: { dir: "up" | "down" }) {
  return (
    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
      {dir === "up" ? "˄" : "˅"}
    </span>
  );
}
