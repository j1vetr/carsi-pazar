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
  sell: string;
  change: number;
}

const ROWS: Row[] = [
  { code: "EUR", name: "Euro", sell: "47,3088", change: -0.18 },
  { code: "GBP", name: "İngiliz Sterlini", sell: "53,2500", change: 0.41 },
  { code: "CHF", name: "İsviçre Frangı", sell: "47,9400", change: 0.12 },
  { code: "AUD", name: "Avustralya Doları", sell: "27,4720", change: 0.55 },
  { code: "CAD", name: "Kanada Doları", sell: "30,2200", change: -0.06 },
  { code: "SAR", name: "Suudi Riyali", sell: "11,1890", change: 0.34 },
  { code: "JPY", name: "Japon Yeni", sell: "0,2752", change: -0.22 },
  { code: "DKK", name: "Danimarka Kronu", sell: "6,3220", change: 0.08 },
  { code: "SEK", name: "İsveç Kronu", sell: "4,4180", change: -0.31 },
];

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
        <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 600, letterSpacing: 0.6 }}>
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
    <div style={{ padding: "30px 22px 26px" }}>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 14,
          color: C.muted,
          letterSpacing: -0.1,
          marginBottom: 6,
        }}
      >
        Bugünün ön planı
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: C.ink,
            letterSpacing: -1.4,
            fontFamily: DISPLAY,
            lineHeight: 1,
          }}
        >
          Dolar
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              color: C.muted,
              fontSize: 22,
              marginLeft: 8,
              letterSpacing: -0.4,
            }}
          >
            / Türk Lirası
          </span>
        </div>
      </div>

      <NumLg prefix="₺" whole="41" frac="9120" size={68} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginTop: 18,
        }}
      >
        <ChangeText v={0.34} size={15} />
        <span style={{ color: C.mutedDim, fontSize: 13 }}>·</span>
        <span
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 13,
            color: C.muted,
            letterSpacing: -0.1,
          }}
        >
          son 24 saat
        </span>
      </div>

      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 0,
          borderTop: `1px solid ${C.hairline}`,
          paddingTop: 14,
        }}
      >
        <Stat label="Alış" value="41,8542" />
        <Stat label="Satış" value="41,9120" emphasized />
        <Stat label="24s düşük" value="41,7012" subtle />
      </div>
    </div>
  );
}

function Stat({ label, value, emphasized, subtle }: { label: string; value: string; emphasized?: boolean; subtle?: boolean }) {
  return (
    <div>
      <div
        style={{
          fontSize: 9.5,
          color: C.muted,
          fontWeight: 700,
          letterSpacing: 1.2,
          marginBottom: 4,
        }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 14,
          color: emphasized ? C.ink : subtle ? C.muted : C.inkSoft,
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

function ListHeader() {
  return (
    <div
      style={{
        padding: "22px 22px 14px",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 22,
            color: C.ink,
            letterSpacing: -0.6,
            fontWeight: 500,
          }}
        >
          Diğer pariteler
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 12.5,
            color: C.muted,
            marginTop: 3,
          }}
        >
          dokuz para birimi · 24 saatlik değişim
        </div>
      </div>
      <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 0.4 }}>
        A — Z
      </span>
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
      <div style={{ width: 56 }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 19,
            fontWeight: 500,
            color: C.ink,
            letterSpacing: -0.5,
            lineHeight: 1,
          }}
        >
          {row.code}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 10.5,
            color: C.mutedDim,
            marginTop: 2,
          }}
        >
          /TRY
        </div>
      </div>
      <div
        style={{
          flex: 1,
          fontSize: 13,
          color: C.inkSoft,
          fontWeight: 500,
          paddingLeft: 4,
        }}
      >
        {row.name}
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
        Veriler Harem Altın & Döviz piyasasından alınmaktadır.
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

export function CurrencyHome() {
  return (
    <PhoneShell>
      <div style={{ paddingBottom: 4 }}>
        <TopBar />
        <Spotlight />
        <Hairline />
        <ListHeader />
        <div>
          {ROWS.map((r, i) => (
            <ListRow key={r.code} row={r} last={i === ROWS.length - 1} />
          ))}
        </div>
        <Footer />
      </div>
    </PhoneShell>
  );
}

export default CurrencyHome;
