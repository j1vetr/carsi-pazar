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

const W = 320;
const H = 200;
const HEADER_H = 22;
const ROW_H = (H - HEADER_H) / 4;

function HeaderBar({ theme, fieldHint, updatedAt }: { theme: Palette; fieldHint: string; updatedAt: string }) {
  return (
    <div
      style={{
        height: HEADER_H,
        background: theme.header,
        borderBottom: `1px solid ${theme.divider}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", fontSize: 9.5 }}>
        <span style={{ fontWeight: 800, color: theme.brand, letterSpacing: 0.4 }}>ÇARŞI PİYASA</span>
        <span style={{ color: theme.muted, marginLeft: 6 }}>· {fieldHint}</span>
      </div>
      <span style={{ fontSize: 9.5, color: theme.muted, fontFamily: MONO }}>{updatedAt}</span>
    </div>
  );
}

function ListRow({ row, theme, zebra, isLast }: { row: Row; theme: Palette; zebra: boolean; isLast: boolean }) {
  const up = row.changePercent > 0;
  const down = row.changePercent < 0;
  const changeColor = up ? theme.up : down ? theme.down : theme.flat;
  const changeBg = up ? theme.upBg : down ? theme.downBg : theme.flatBg;
  const accent = row.kind === "gold" ? theme.goldAccent : theme.currencyAccent;

  return (
    <div
      style={{
        height: ROW_H,
        background: zebra ? theme.rowAlt : theme.bg,
        borderBottom: isLast ? "none" : `1px solid ${theme.divider}`,
        display: "flex",
        alignItems: "center",
        padding: "0 8px 0 6px",
      }}
    >
      <div
        style={{
          width: 3,
          height: ROW_H - 12,
          borderRadius: 2,
          background: accent,
          marginRight: 8,
        }}
      />
      <div style={{ width: 56, fontSize: 11, fontWeight: 800, color: theme.fg }}>{row.label}</div>
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", marginRight: 8 }}>
        <span style={{ fontSize: 12, color: theme.muted, fontFamily: MONO }}>{row.buy}</span>
        <span style={{ fontSize: 12, color: theme.muted, margin: "0 6px" }}>·</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: theme.fg, fontFamily: MONO }}>{row.sell}</span>
      </div>
      <div
        style={{
          width: 64,
          background: changeBg,
          borderRadius: 6,
          padding: "2px 6px",
          textAlign: "center",
          fontSize: 10,
          fontWeight: 800,
          color: changeColor,
        }}
      >
        {fmtPercent(row.changePercent)}
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
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
      }}
    >
      <HeaderBar theme={theme} fieldHint="ALIŞ / SATIŞ" updatedAt="14:32:08" />
      {SAMPLE_ROWS.map((r, i) => (
        <ListRow
          key={i}
          row={r}
          theme={theme}
          zebra={i % 2 === 1}
          isLast={i === SAMPLE_ROWS.length - 1}
        />
      ))}
    </div>
  );
}

export function WidgetList() {
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

export default WidgetList;
