import React from "react";
import {
  ChangePill,
  FlagBadge,
  LivePulse,
  MONO,
  PALETTE,
  PhoneShell,
  SF_DISPLAY,
  SPARK,
  Section,
  Sparkline,
} from "./_premium";

const CHIPS = [
  { id: "all", label: "Tümü", count: 24 },
  { id: "major", label: "Majör", count: 8 },
  { id: "cross", label: "Çapraz", count: 12 },
  { id: "bank", label: "Banka", count: 4 },
];

interface CurrencyRow {
  flag: string;
  code: string;
  name: string;
  buy: string;
  sell: string;
  change: number;
  spark: number[];
}

const ROWS: CurrencyRow[] = [
  { flag: "🇪🇺", code: "EUR", name: "Euro", buy: "47,2310", sell: "47,3088", change: -0.18, spark: SPARK.down },
  { flag: "🇬🇧", code: "GBP", name: "İngiliz Sterlini", buy: "53,1240", sell: "53,2500", change: 0.41, spark: SPARK.up },
  { flag: "🇨🇭", code: "CHF", name: "İsviçre Frangı", buy: "47,8800", sell: "47,9400", change: 0.12, spark: SPARK.flat },
  { flag: "🇨🇦", code: "CAD", name: "Kanada Doları", buy: "30,1810", sell: "30,2200", change: -0.06, spark: SPARK.flat },
  { flag: "🇦🇺", code: "AUD", name: "Avustralya Doları", buy: "27,4150", sell: "27,4720", change: 0.55, spark: SPARK.up },
  { flag: "🇸🇦", code: "SAR", name: "Suudi Riyali", buy: "11,1620", sell: "11,1890", change: 0.34, spark: SPARK.up },
  { flag: "🇯🇵", code: "JPY", name: "Japon Yeni", buy: "0,2748", sell: "0,2752", change: -0.22, spark: SPARK.down },
];

function HeroCard() {
  return (
    <div
      style={{
        margin: "0 18px",
        borderRadius: 24,
        background: "linear-gradient(140deg, #102241 0%, #0B1A33 50%, #0A152A 100%)",
        border: `1px solid ${PALETTE.borderStrong}`,
        padding: 18,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 18px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -50,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: 999,
          background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FlagBadge flag="🇺🇸" size={36} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: PALETTE.fg, letterSpacing: -0.2 }}>
              USD <span style={{ color: PALETTE.muted, fontWeight: 600 }}>/ TRY</span>
            </div>
            <div style={{ fontSize: 10.5, color: PALETTE.muted, fontWeight: 600, marginTop: 2 }}>
              Amerikan Doları
            </div>
          </div>
        </div>
        <ChangePill v={0.34} big />
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: PALETTE.fg,
              letterSpacing: -1.5,
              lineHeight: 1,
              fontFamily: SF_DISPLAY,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ₺41<span style={{ color: PALETTE.fgMid }}>,</span>9120
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
            <PriceTag label="ALIŞ" value="41,8542" />
            <PriceTag label="SATIŞ" value="41,9120" hi />
          </div>
        </div>
        <Sparkline data={SPARK.up} width={92} height={48} color={PALETTE.up} />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${PALETTE.border}`,
        }}
      >
        <span style={{ fontSize: 10.5, color: PALETTE.muted, fontWeight: 600 }}>
          Açılış <span style={{ color: PALETTE.fgMid, fontFamily: MONO }}>41,7708</span>
        </span>
        <span style={{ fontSize: 10.5, color: PALETTE.muted, fontWeight: 600 }}>
          Yüksek <span style={{ color: PALETTE.up, fontFamily: MONO }}>42,0210</span>
        </span>
        <span style={{ fontSize: 10.5, color: PALETTE.muted, fontWeight: 600 }}>
          Düşük <span style={{ color: PALETTE.down, fontFamily: MONO }}>41,7012</span>
        </span>
      </div>
    </div>
  );
}

function PriceTag({ label, value, hi }: { label: string; value: string; hi?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 9, fontWeight: 800, color: PALETTE.muted, letterSpacing: 1 }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: hi ? PALETTE.fg : PALETTE.fgMid,
          fontFamily: MONO,
          marginTop: 2,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function QuickStat({
  flag,
  code,
  value,
  change,
  gold,
}: {
  flag: string;
  code: string;
  value: string;
  change: number;
  gold?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: PALETTE.surface,
        borderRadius: 14,
        padding: 11,
        border: `1px solid ${PALETTE.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <FlagBadge flag={flag} size={22} gold={gold} />
        <ChangePill v={change} />
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 800, color: PALETTE.muted, letterSpacing: 0.4 }}>{code}</div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: PALETTE.fg,
            fontFamily: MONO,
            marginTop: 2,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: -0.3,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function ChipRow() {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "0 18px",
        overflowX: "auto",
      }}
    >
      {CHIPS.map((c, i) => {
        const active = i === 0;
        return (
          <div
            key={c.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 13px",
              borderRadius: 999,
              background: active ? PALETTE.fg : PALETTE.surface,
              color: active ? PALETTE.bg : PALETTE.fgMid,
              fontSize: 12.5,
              fontWeight: 800,
              border: `1px solid ${active ? PALETTE.fg : PALETTE.border}`,
              flexShrink: 0,
              letterSpacing: -0.1,
            }}
          >
            {c.label}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                opacity: 0.6,
                background: active ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.05)",
                padding: "1px 6px",
                borderRadius: 999,
              }}
            >
              {c.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ListRow({ row, divider }: { row: CurrencyRow; divider: boolean }) {
  const sparkColor = row.change > 0 ? PALETTE.up : row.change < 0 ? PALETTE.down : PALETTE.muted;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 18px",
        borderBottom: divider ? `1px solid ${PALETTE.border}` : "none",
      }}
    >
      <FlagBadge flag={row.flag} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: PALETTE.fg, letterSpacing: -0.2 }}>{row.code}</div>
        <div
          style={{
            fontSize: 11.5,
            color: PALETTE.muted,
            fontWeight: 600,
            marginTop: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {row.name}
        </div>
      </div>
      <Sparkline data={row.spark} width={50} height={22} color={sparkColor} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 78 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: PALETTE.fg,
            fontFamily: MONO,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: -0.3,
          }}
        >
          {row.sell}
        </span>
        <ChangePill v={row.change} />
      </div>
    </div>
  );
}

export function CurrencyHome() {
  return (
    <PhoneShell>
      <div style={{ paddingBottom: 20 }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 20px 14px",
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: PALETTE.muted, letterSpacing: 1.4 }}>
              CANLI PİYASA
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: PALETTE.fg,
                letterSpacing: -0.6,
                marginTop: 2,
              }}
            >
              Döviz
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <LivePulse />
            <span style={{ fontSize: 10.5, color: PALETTE.muted, fontFamily: MONO, fontWeight: 600 }}>
              Son · 14:32:08
            </span>
          </div>
        </div>

        <HeroCard />

        <Section title="HIZLI BAKIŞ">
          <div style={{ display: "flex", gap: 10, padding: "0 18px" }}>
            <QuickStat flag="🇪🇺" code="EUR" value="47,3088" change={-0.18} />
            <QuickStat flag="🇬🇧" code="GBP" value="53,2500" change={0.41} />
            <QuickStat flag="🟡" code="ALTIN" value="4.384,20" change={0.82} gold />
          </div>
        </Section>

        <Section title="TÜM DÖVİZLER" action="Sırala">
          <div style={{ padding: "0 0 0 0" }}>
            <ChipRow />
            <div style={{ height: 14 }} />
            <div
              style={{
                margin: "0 14px",
                background: PALETTE.surface,
                border: `1px solid ${PALETTE.border}`,
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              {ROWS.map((r, i) => (
                <ListRow key={r.code} row={r} divider={i !== ROWS.length - 1} />
              ))}
            </div>
          </div>
        </Section>
      </div>
    </PhoneShell>
  );
}

export default CurrencyHome;
