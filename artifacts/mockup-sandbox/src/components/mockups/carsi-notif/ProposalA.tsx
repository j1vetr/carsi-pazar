import React from "react";
import { AppIcon, C, Caret, Chip, MONO, ShadeFrame } from "./_shared";

type Row = {
  flag: string;
  code: string;
  name: string;
  price: string;
  unit: string;
  dir: "up" | "down";
  pct: string;
};

const ROWS: Row[] = [
  { flag: "🇺🇸", code: "USD", name: "Dolar / TL", price: "44,93", unit: "₺", dir: "up", pct: "0,02" },
  { flag: "🇪🇺", code: "EUR", name: "Euro / TL", price: "52,72", unit: "₺", dir: "down", pct: "0,18" },
  { flag: "🟡", code: "ALTIN", name: "Gram Altın", price: "6.877", unit: "₺", dir: "down", pct: "0,35" },
  { flag: "🇬🇧", code: "GBP", name: "Sterlin / TL", price: "60,61", unit: "₺", dir: "down", pct: "0,09" },
];

function NotifCard({
  expanded,
  showLabel,
}: {
  expanded: boolean;
  showLabel: string;
}) {
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
          padding: expanded ? "14px 16px 16px" : "12px 14px",
          color: C.ink,
          boxShadow: "0 6px 16px rgba(11,61,145,0.45)",
        }}
      >
        {/* header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AppIcon size={28} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: C.ink,
                letterSpacing: -0.1,
              }}
            >
              Çarşı Piyasa{expanded ? " · Canlı Fiyatlar" : ""}
            </div>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>16:25</span>
          <Caret dir={expanded ? "up" : "down"} />
        </div>

        {expanded ? (
          <>
            <div
              style={{
                height: 1,
                background: C.hairline,
                margin: "12px 0 6px",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {ROWS.map((r, i) => (
                <div
                  key={r.code}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 0",
                    borderBottom:
                      i === ROWS.length - 1 ? "none" : `1px solid ${C.hairline}`,
                  }}
                >
                  <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{r.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.ink,
                        letterSpacing: -0.1,
                      }}
                    >
                      {r.name}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: C.ink,
                      letterSpacing: -0.3,
                    }}
                  >
                    {r.price} {r.unit}
                  </span>
                  <div style={{ width: 70, display: "flex", justifyContent: "flex-end" }}>
                    <Chip dir={r.dir} pct={r.pct} />
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 10,
                color: C.muted,
                fontFamily: MONO,
                letterSpacing: 0.4,
              }}
            >
              GÜNCELLENDİ · 16:25
            </div>
          </>
        ) : (
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            {ROWS.slice(0, 4).map((r) => (
              <div
                key={r.code}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: MONO,
                }}
              >
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{r.code}</span>
                <span style={{ fontSize: 12.5, color: C.ink, fontWeight: 700, letterSpacing: -0.2 }}>
                  {r.price}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: r.dir === "up" ? C.upText : C.downText,
                    fontWeight: 700,
                  }}
                >
                  {r.dir === "up" ? "▲" : "▼"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProposalA() {
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
