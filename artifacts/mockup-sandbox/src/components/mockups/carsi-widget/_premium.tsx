import React from "react";

export const PALETTE = {
  bg: "#07101F",
  bgGrad1: "#0B1A33",
  bgGrad2: "#050B16",
  surface: "#0E1B30",
  surfaceHi: "#13243F",
  surfaceLo: "#0A1626",
  border: "rgba(148,163,184,0.10)",
  borderStrong: "rgba(148,163,184,0.18)",
  fg: "#F8FAFC",
  fgMid: "#CBD5E1",
  muted: "#7C8AA3",
  mutedDim: "#56627A",

  brand: "#3B82F6",
  brandSoft: "rgba(59,130,246,0.14)",
  gold: "#F59E0B",
  goldSoft: "rgba(245,158,11,0.14)",
  goldDeep: "#B45309",
  goldGlow: "rgba(245,158,11,0.30)",

  up: "#22C55E",
  upSoft: "rgba(34,197,94,0.14)",
  down: "#F87171",
  downSoft: "rgba(248,113,113,0.14)",

  glassBorder: "rgba(255,255,255,0.06)",
};

export const SF =
  "ui-sans-serif, system-ui, -apple-system, 'SF Pro Text', 'Inter', sans-serif";
export const SF_DISPLAY =
  "ui-sans-serif, system-ui, -apple-system, 'SF Pro Display', 'Inter', sans-serif";
export const MONO =
  "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace";

export function PhoneShell({
  children,
  notchTitle,
}: {
  children: React.ReactNode;
  notchTitle?: string;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 0%, #1F2937 0%, #050B16 60%)",
        padding: "28px 18px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: SF,
      }}
    >
      <div
        style={{
          width: 390,
          background: PALETTE.bg,
          borderRadius: 44,
          overflow: "hidden",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.04)",
          border: "10px solid #050B16",
          position: "relative",
        }}
      >
        <StatusBar />
        {children}
        {notchTitle ? null : null}
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <div
      style={{
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        color: PALETTE.fg,
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      <span>14:32</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, fontWeight: 700 }}>
        <span>●●●●</span>
        <span>5G</span>
        <span
          style={{
            width: 22,
            height: 11,
            border: `1px solid ${PALETTE.fg}`,
            borderRadius: 3,
            position: "relative",
            display: "inline-block",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 1,
              left: 1,
              right: 5,
              bottom: 1,
              background: PALETTE.fg,
              borderRadius: 1,
            }}
          />
        </span>
      </div>
    </div>
  );
}

export function LivePulse({ color = PALETTE.up, label = "CANLI" }: { color?: string; label?: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px 3px 6px",
        background: "rgba(34,197,94,0.10)",
        borderRadius: 999,
        border: `1px solid rgba(34,197,94,0.25)`,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 0 3px ${color}33`,
        }}
      />
      <span style={{ fontSize: 9.5, fontWeight: 800, color, letterSpacing: 0.6 }}>{label}</span>
    </div>
  );
}

export function ChangePill({
  v,
  big,
}: {
  v: number;
  big?: boolean;
}) {
  const up = v > 0;
  const down = v < 0;
  const color = up ? PALETTE.up : down ? PALETTE.down : PALETTE.muted;
  const bg = up ? PALETTE.upSoft : down ? PALETTE.downSoft : "rgba(124,138,163,0.12)";
  const arrow = up ? "▲" : down ? "▼" : "•";
  const abs = Math.abs(v).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: bg,
        color,
        padding: big ? "5px 10px" : "3px 7px",
        borderRadius: 8,
        fontSize: big ? 12 : 10.5,
        fontWeight: 800,
        fontFamily: MONO,
        letterSpacing: 0.1,
      }}
    >
      <span style={{ fontSize: big ? 9 : 7.5 }}>{arrow}</span>
      {abs}%
    </span>
  );
}

export function Sparkline({
  data,
  width = 80,
  height = 28,
  color,
  fill = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  color: string;
  fill?: boolean;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data
    .map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / span) * (height - 4) - 2).toFixed(1)}`)
    .join(" ");
  const fillPath = `M0,${height} L${pts.split(" ").join(" L")} L${width},${height} Z`;
  const linePath = `M${pts.split(" ").join(" L")}`;
  const gid = `g${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.45} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill ? <path d={fillPath} fill={`url(#${gid})`} /> : null}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function FlagBadge({ flag, size = 32, gold = false }: { flag: string; size?: number; gold?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: gold
          ? "linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #B45309 100%)"
          : PALETTE.surfaceHi,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.55,
        boxShadow: gold ? `0 4px 12px ${PALETTE.goldGlow}` : "inset 0 0 0 1px rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}
    >
      {flag}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 22 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px 10px",
        }}
      >
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 800,
            color: PALETTE.muted,
            letterSpacing: 1.4,
          }}
        >
          {title}
        </span>
        {action ? (
          <span style={{ fontSize: 12, fontWeight: 700, color: PALETTE.brand }}>
            {action} ›
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

// Sample sparkline data sets
export const SPARK = {
  up: [10, 11, 10.5, 12, 11.8, 13, 12.7, 14, 13.6, 15.2, 14.8, 16.1],
  down: [16, 15.5, 16.2, 14.8, 15, 13.9, 14.1, 13, 12.5, 12.8, 11.9, 12.1],
  flat: [12, 12.4, 12.1, 12.8, 12.3, 12.6, 12.2, 12.9, 12.4, 12.7, 12.5, 12.6],
};
