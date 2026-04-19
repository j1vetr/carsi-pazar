import React from "react";

export const C = {
  bg: "#0A0E14",
  bgDeep: "#06090F",
  ink: "#F6F2E8",
  inkSoft: "#D9D2C2",
  muted: "#8A8273",
  mutedDim: "#5A5446",
  hairline: "rgba(255,245,220,0.08)",
  hairlineStrong: "rgba(255,245,220,0.16)",
  up: "#7BCBA0",
  down: "#E0816C",
  gold: "#D4A24C",
  goldHi: "#F5D78A",
  goldDeep: "#7A5523",
};

export const SANS =
  "ui-sans-serif, system-ui, -apple-system, 'SF Pro Text', 'Inter', sans-serif";
export const SERIF =
  "'Iowan Old Style', 'Palatino', 'Hoefler Text', 'Cambria', 'Georgia', serif";
export const DISPLAY =
  "'Iowan Old Style', 'Palatino', 'Hoefler Text', 'Cambria', 'Georgia', serif";
export const MONO =
  "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace";

export const LOGO_DARK_URL = "/__mockup/brand/logo-dark.png";
export const LOGO_LIGHT_URL = "/__mockup/brand/logo-light.png";

export function PhoneShell({
  children,
  bgGradient,
}: {
  children: React.ReactNode;
  bgGradient?: string;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 0%, #1A1208 0%, #050307 70%)",
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
          background: bgGradient ?? C.bg,
          borderRadius: 44,
          overflow: "hidden",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.04)",
          border: "10px solid #050307",
          position: "relative",
        }}
      >
        <StatusBar />
        {children}
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
        color: C.ink,
        fontSize: 14,
        fontWeight: 600,
        opacity: 0.85,
      }}
    >
      <span>14:32</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11 }}>
        <span>●●●●</span>
        <span>5G</span>
        <span
          style={{
            width: 22,
            height: 11,
            border: `1px solid ${C.ink}`,
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
              background: C.ink,
              borderRadius: 1,
            }}
          />
        </span>
      </div>
    </div>
  );
}

export function Logo({ height = 18, light = true }: { height?: number; light?: boolean }) {
  return (
    <img
      src={light ? LOGO_DARK_URL : LOGO_LIGHT_URL}
      alt="Çarşı Piyasa"
      style={{ height, width: "auto", display: "block", opacity: 0.95 }}
    />
  );
}

export function Hairline({
  color = C.hairline,
  margin = "0 22px",
}: {
  color?: string;
  margin?: string;
}) {
  return <div style={{ height: 1, background: color, margin }} />;
}

export function ChangeText({
  v,
  size = 12,
  color: forceColor,
}: {
  v: number;
  size?: number;
  color?: string;
}) {
  const up = v > 0;
  const down = v < 0;
  const color = forceColor ?? (up ? C.up : down ? C.down : C.muted);
  const arrow = up ? "↑" : down ? "↓" : "·";
  const abs = Math.abs(v).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <span style={{ color, fontSize: size, fontWeight: 600, fontFamily: SANS, letterSpacing: -0.1 }}>
      <span style={{ marginRight: 3, fontSize: size * 0.95 }}>{arrow}</span>
      {abs}%
    </span>
  );
}

export function NumLg({
  whole,
  frac,
  prefix,
  size = 56,
  color = C.ink,
  fontFamily = DISPLAY,
}: {
  whole: string;
  frac?: string;
  prefix?: string;
  size?: number;
  color?: string;
  fontFamily?: string;
}) {
  return (
    <div
      style={{
        fontFamily,
        fontWeight: 500,
        fontSize: size,
        color,
        letterSpacing: -2,
        lineHeight: 0.95,
        fontVariantNumeric: "tabular-nums oldstyle-nums",
        display: "flex",
        alignItems: "baseline",
        gap: 0,
      }}
    >
      {prefix ? (
        <span style={{ fontSize: size * 0.55, color: C.muted, marginRight: 6, fontWeight: 400, letterSpacing: 0 }}>
          {prefix}
        </span>
      ) : null}
      <span>{whole}</span>
      {frac ? (
        <span style={{ color: C.muted, fontWeight: 400 }}>
          ,<span style={{ color }}>{frac}</span>
        </span>
      ) : null}
    </div>
  );
}
