import React from "react";
import {
  C,
  ChangeText,
  DISPLAY,
  Hairline,
  Logo,
  MONO,
  NumLg,
  PhoneShell,
  SANS,
  SERIF,
} from "./_editorial";

interface Row {
  code: string;
  name: string;
  emission?: "Eski" | "Yeni";
  sell: string;
  change: number;
  unit?: string;
}

const ROWS: Row[] = [
  { code: "Çeyrek", name: "Çeyrek Altın", emission: "Yeni", sell: "7.245,00", change: 0.71, unit: "adet" },
  { code: "Çeyrek", name: "Çeyrek Altın", emission: "Eski", sell: "7.190,00", change: 0.66, unit: "adet" },
  { code: "Yarım", name: "Yarım Altın", emission: "Yeni", sell: "14.380,00", change: 0.74, unit: "adet" },
  { code: "Tam", name: "Tam Altın", emission: "Yeni", sell: "28.760,00", change: 0.78, unit: "adet" },
  { code: "Cumhuriyet", name: "Cumhuriyet Altını", emission: "Yeni", sell: "29.040,00", change: 0.79, unit: "adet" },
  { code: "Ata", name: "Ata Altın", emission: "Yeni", sell: "29.610,00", change: 0.81, unit: "adet" },
  { code: "Reşat", name: "Reşat Altını", emission: "Yeni", sell: "31.220,00", change: 0.83, unit: "adet" },
  { code: "22 Ayar", name: "Bilezik (22A)", sell: "4.024,00", change: 0.65, unit: "₺/gr" },
];

const FILTERS = ["Hepsi", "Çeyrek", "Yarım", "Tam", "Cumhuriyet", "Ata", "Reşat", "Ayar"];

function TopBar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 22px 0",
      }}
    >
      <Logo height={18} light={false} />
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 10.5, color: "#A78B5C", fontWeight: 600, letterSpacing: 0.6 }}>
          19 NİS · CUMA
        </div>
        <div style={{ fontSize: 10.5, color: C.mutedDim, fontFamily: MONO, marginTop: 2 }}>
          14.32.08
        </div>
      </div>
    </div>
  );
}

function Spotlight() {
  return (
    <div style={{ padding: "26px 22px 22px", position: "relative" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -40,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: 999,
          background:
            "radial-gradient(circle, rgba(245,215,138,0.18) 0%, rgba(212,162,76,0.06) 35%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(2px)",
        }}
      />
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 14,
          color: "#A78B5C",
          letterSpacing: -0.1,
          marginBottom: 6,
          position: "relative",
        }}
      >
        Kapalıçarşı, has altın
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 38,
          fontWeight: 500,
          color: C.goldHi,
          letterSpacing: -1.6,
          lineHeight: 1,
          position: "relative",
          marginBottom: 4,
        }}
      >
        Gram Altın
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 13,
          color: "#A78B5C",
          letterSpacing: -0.1,
          marginBottom: 18,
        }}
      >
        ons referansı 2.612,40 USD
      </div>

      <NumLg prefix="₺" whole="4.384" frac="20" size={64} color={C.goldHi} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginTop: 18,
        }}
      >
        <ChangeText v={0.82} size={15} color={C.gold} />
        <span style={{ color: C.mutedDim, fontSize: 13 }}>·</span>
        <span
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 13,
            color: "#A78B5C",
            letterSpacing: -0.1,
          }}
        >
          son 24 saat
        </span>
      </div>

      <div
        style={{
          marginTop: 22,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 0,
          borderTop: `1px solid rgba(212,162,76,0.16)`,
          paddingTop: 14,
        }}
      >
        <Stat label="Alış" value="4.382,50" />
        <Stat label="Satış" value="4.384,20" emphasized />
        <Stat label="Birim" value="₺ / gr" subtle italic />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  emphasized,
  subtle,
  italic,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  subtle?: boolean;
  italic?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 9.5,
          color: "#A78B5C",
          fontWeight: 700,
          letterSpacing: 1.2,
          marginBottom: 4,
        }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: italic ? SERIF : MONO,
          fontStyle: italic ? "italic" : "normal",
          fontSize: 14,
          color: emphasized ? C.goldHi : subtle ? "#A78B5C" : C.inkSoft,
          fontWeight: emphasized ? 700 : 500,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: -0.3,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FilterRow() {
  return (
    <div
      style={{
        padding: "14px 22px 18px",
        borderTop: `1px solid ${C.hairline}`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          alignItems: "baseline",
        }}
      >
        {FILTERS.map((f, i) => {
          const active = i === 0;
          return (
            <span
              key={f}
              style={{
                fontFamily: DISPLAY,
                fontSize: active ? 17 : 15,
                fontWeight: active ? 600 : 400,
                color: active ? C.goldHi : C.muted,
                letterSpacing: -0.4,
                whiteSpace: "nowrap",
                paddingBottom: 4,
                borderBottom: active ? `1px solid ${C.gold}` : "1px solid transparent",
                fontStyle: active ? "normal" : "italic",
              }}
            >
              {f}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ListRow({ row, last }: { row: Row; last: boolean }) {
  const up = row.change > 0;
  const down = row.change < 0;
  const c = up ? C.up : down ? C.down : C.muted;
  return (
    <div
      style={{
        padding: "14px 22px",
        display: "flex",
        alignItems: "center",
        borderBottom: last ? "none" : `1px solid ${C.hairline}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 18,
              fontWeight: 500,
              color: C.ink,
              letterSpacing: -0.4,
              lineHeight: 1,
            }}
          >
            {row.code}
          </span>
          {row.emission ? (
            <span
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 11,
                color: row.emission === "Yeni" ? C.gold : "#A78B5C",
                letterSpacing: -0.1,
              }}
            >
              · {row.emission.toLowerCase()}
            </span>
          ) : null}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 11.5,
            color: C.mutedDim,
            marginTop: 3,
          }}
        >
          {row.name} · {row.unit}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 16,
            fontWeight: 600,
            color: C.ink,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: -0.4,
            lineHeight: 1.1,
          }}
        >
          {row.sell}
        </span>
        <span
          style={{
            fontSize: 11.5,
            color: c,
            fontWeight: 600,
            marginTop: 2,
            fontFamily: MONO,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {up ? "↑" : down ? "↓" : "·"} {Math.abs(row.change).toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        padding: "22px 22px 28px",
        textAlign: "center",
        borderTop: `1px solid ${C.hairline}`,
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 11.5,
          color: C.mutedDim,
          letterSpacing: 0.1,
        }}
      >
        Sarrafiye fiyatları Kapalıçarşı toptan piyasasından derlenmiştir.
      </div>
      <div
        style={{
          fontSize: 10,
          color: C.mutedDim,
          fontWeight: 600,
          letterSpacing: 1.4,
          marginTop: 8,
        }}
      >
        ÇARŞI PİYASA — 2026
      </div>
    </div>
  );
}

export function GoldHome() {
  return (
    <PhoneShell bgGradient="linear-gradient(180deg, #14110A 0%, #0A0905 35%, #07060A 100%)">
      <div style={{ paddingBottom: 4 }}>
        <TopBar />
        <Spotlight />
        <FilterRow />
        <div>
          {ROWS.map((r, i) => (
            <ListRow key={`${r.code}-${i}`} row={r} last={i === ROWS.length - 1} />
          ))}
        </div>
        <Footer />
      </div>
    </PhoneShell>
  );
}

export default GoldHome;
