import React from "react";
import { AppIcon, C, Caret, MONO, ShadeFrame } from "./_shared";

type Cell = {
  code: string;
  price: string;
  unit: string;
  dir: "up" | "down";
  pct: string;
};

const CELLS: Cell[] = [
  { code: "USD", price: "44,93", unit: "₺", dir: "up", pct: "0,02" },
  { code: "EUR", price: "52,72", unit: "₺", dir: "down", pct: "0,18" },
  { code: "ALTIN", price: "6.877", unit: "₺", dir: "down", pct: "0,35" },
  { code: "GBP", price: "60,61", unit: "₺", dir: "down", pct: "0,09" },
];

function GridCell({ c, last }: { c: Cell; last: boolean }) {
  const upCol = c.dir === "up" ? C.upText : C.downText;
  return (
    <div
      style={{
        flex: 1,
        padding: "10px 12px",
        borderRight: last ? "none" : `1px solid ${C.hairline}`,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: C.muted,
          letterSpacing: 1.2,
        }}
      >
        {c.code}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 16,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: -0.4,
          lineHeight: 1.1,
        }}
      >
        {c.price}
        <span style={{ fontSize: 11, fontWeight: 500, color: C.inkSoft, marginLeft: 3 }}>
          {c.unit}
        </span>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 700,
          color: upCol,
          letterSpacing: -0.1,
          marginTop: 1,
        }}
      >
        {c.dir === "up" ? "▲" : "▼"} %{c.pct}
      </div>
    </div>
  );
}

function NotifCard({ expanded, showLabel }: { expanded: boolean; showLabel: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.7)",
          fontWeight: 600,
          letterSpacing: 1.2,
          padding: "0 6px 6px",
        }}
      >
        {showLabel}
      </div>
      <div
        style={{
          background: `linear-gradient(180deg,${C.cardBg} 0%, ${C.cardBg2} 100%)`,
          borderRadius: 22,
          padding: expanded ? "12px 12px 12px" : "12px 14px",
          color: C.ink,
          boxShadow: "0 6px 16px rgba(11,61,145,0.45)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: expanded ? "0 4px 10px" : 0 }}>
          <AppIcon size={28} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>
              Çarşı Piyasa
            </div>
            {expanded && (
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1, letterSpacing: 0.3 }}>
                4 SEMBOL · GÜNCELLENDİ 16:25
              </div>
            )}
          </div>
          {!expanded && (
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>16:25</span>
          )}
          <Caret dir={expanded ? "up" : "down"} />
        </div>

        {expanded ? (
          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${C.hairline}`,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", borderBottom: `1px solid ${C.hairline}` }}>
              <GridCell c={CELLS[0]!} last={false} />
              <GridCell c={CELLS[1]!} last />
            </div>
            <div style={{ display: "flex" }}>
              <GridCell c={CELLS[2]!} last={false} />
              <GridCell c={CELLS[3]!} last />
            </div>
          </div>
        ) : (
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {CELLS.map((c) => (
              <div
                key={c.code}
                style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: MONO }}
              >
                <span style={{ fontSize: 10.5, color: C.muted, fontWeight: 700 }}>{c.code}</span>
                <span style={{ fontSize: 12.5, color: C.ink, fontWeight: 700, letterSpacing: -0.2 }}>
                  {c.price}
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    color: c.dir === "up" ? C.upText : C.downText,
                    fontWeight: 700,
                  }}
                >
                  {c.dir === "up" ? "▲" : "▼"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProposalB() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#E8E8E3 0%,#D6D6D0 100%)",
        display: "flex",
        gap: 28,
        padding: 30,
        justifyContent: "center",
        alignItems: "flex-start",
        flexWrap: "wrap",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'SF Pro Text', Inter, sans-serif",
      }}
    >
      <ShadeFrame time="16:25" date="22 Nis Çar">
        <NotifCard expanded={false} showLabel="KAPALI HALİ" />
      </ShadeFrame>
      <ShadeFrame time="16:25" date="22 Nis Çar">
        <NotifCard expanded showLabel="AÇIK HALİ" />
      </ShadeFrame>
    </div>
  );
}
