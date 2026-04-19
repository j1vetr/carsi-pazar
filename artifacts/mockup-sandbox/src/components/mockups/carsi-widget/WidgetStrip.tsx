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
const H = 110;
const ACCENT_H = 3;

function StripCell({ row, theme, isLast }: { row: Row; theme: Palette; isLast: boolean }) {
  const up = row.changePercent > 0;
  const down = row.changePercent < 0;
  const changeColor = up ? theme.up : down ? theme.down : theme.flat;
  const changeBg = up ? theme.upBg : down ? theme.downBg : theme.flatBg;
  const accent = row.kind === "gold" ? theme.goldAccent : theme.currencyAccent;

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: isLast ? "none" : `1px solid ${theme.divider}`,
        position: "relative",
      }}
    >
      <div
        style={{
          height: ACCENT_H,
          background: accent,
          width: "100%",
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "8px 8px 8px 8px",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: theme.muted,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "center",
          }}
        >
          {row.label}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: theme.fg,
            fontFamily: MONO,
            letterSpacing: -0.5,
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.1,
          }}
        >
          {row.sell}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: changeBg,
              color: changeColor,
              borderRadius: 5,
              padding: "1px 6px",
              fontSize: 10,
              fontWeight: 800,
              whiteSpace: "nowrap",
              lineHeight: 1.3,
            }}
          >
            {fmtPercent(row.changePercent)}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderStrip({ theme }: { theme: Palette }) {
  return (
    <div
      style={{
        height: 18,
        background: theme.header,
        borderBottom: `1px solid ${theme.divider}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 9px",
      }}
    >
      <span style={{ fontSize: 8.5, fontWeight: 800, color: theme.brand, letterSpacing: 0.5 }}>
        ÇARŞI PİYASA · SATIŞ
      </span>
      <span style={{ fontSize: 8.5, color: theme.muted, fontFamily: MONO }}>14:32:08</span>
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
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
      }}
    >
      <HeaderStrip theme={theme} />
      <div style={{ flex: 1, display: "flex", flexDirection: "row" }}>
        {SAMPLE_ROWS.map((r, i) => (
          <StripCell key={i} row={r} theme={theme} isLast={i === SAMPLE_ROWS.length - 1} />
        ))}
      </div>
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
