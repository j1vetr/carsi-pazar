import React from "react";
import {
  DARK,
  LIGHT,
  MONO,
  Palette,
  PhoneFrame,
  Row,
  SAMPLE_ROWS,
  ThemeLabel,
  fmtPercent,
} from "./_shared";

const W = 360;
const H = 92;

function StripCell({ row, theme, isLast }: { row: Row; theme: Palette; isLast: boolean }) {
  const up = row.changePercent > 0;
  const down = row.changePercent < 0;
  const changeColor = up ? theme.up : down ? theme.down : theme.flat;
  const accent = row.kind === "gold" ? theme.goldAccent : theme.currencyAccent;

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 10px",
        borderRight: isLast ? "none" : `1px solid ${theme.divider}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 3,
              height: 11,
              background: accent,
              borderRadius: 2,
              marginRight: 5,
            }}
          />
          <span style={{ fontSize: 10.5, fontWeight: 800, color: theme.muted, letterSpacing: 0.2 }}>{row.label}</span>
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color: changeColor }}>{fmtPercent(row.changePercent)}</span>
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: theme.fg,
          marginTop: 4,
          fontFamily: MONO,
          letterSpacing: -0.3,
        }}
      >
        {row.sell}
      </div>
    </div>
  );
}

function WidgetCard({ theme }: { theme: Palette }) {
  return (
    <div
      style={{
        width: W,
        height: H,
        background: theme.bg,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
      }}
    >
      {SAMPLE_ROWS.map((r, i) => (
        <StripCell key={i} row={r} theme={theme} isLast={i === SAMPLE_ROWS.length - 1} />
      ))}
    </div>
  );
}

export function WidgetStrip() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 28,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <ThemeLabel dark>KOYU TEMA</ThemeLabel>
        <PhoneFrame dark>
          <WidgetCard theme={DARK} />
        </PhoneFrame>
      </div>
      <div style={{ textAlign: "center" }}>
        <ThemeLabel dark>AÇIK TEMA</ThemeLabel>
        <PhoneFrame dark={false}>
          <WidgetCard theme={LIGHT} />
        </PhoneFrame>
      </div>
    </div>
  );
}

export default WidgetStrip;
