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

const CATEGORIES = [
  { id: "gram", icon: "◉", label: "Gram", count: 6 },
  { id: "ceyrek", icon: "◔", label: "Çeyrek", count: 2 },
  { id: "yarim", icon: "◐", label: "Yarım", count: 2 },
  { id: "tam", icon: "●", label: "Tam", count: 2 },
  { id: "cumhur", icon: "★", label: "Cumhuriyet", count: 2 },
  { id: "ata", icon: "✦", label: "Ata", count: 4 },
  { id: "resat", icon: "❖", label: "Reşat", count: 2 },
  { id: "ayar", icon: "◈", label: "Ayar", count: 4 },
];

interface GoldRow {
  code: string;
  name: string;
  emission?: "ESKİ" | "YENİ";
  buy: string;
  sell: string;
  change: number;
  spark: number[];
  unit: string;
}

const ROWS: GoldRow[] = [
  { code: "ÇEYREK", name: "Çeyrek Altın", emission: "YENİ", buy: "7.124,00", sell: "7.245,00", change: 0.71, spark: SPARK.up, unit: "adet" },
  { code: "ÇEYREK", name: "Çeyrek Altın", emission: "ESKİ", buy: "7.080,00", sell: "7.190,00", change: 0.66, spark: SPARK.up, unit: "adet" },
  { code: "YARIM", name: "Yarım Altın", emission: "YENİ", buy: "14.150,00", sell: "14.380,00", change: 0.74, spark: SPARK.up, unit: "adet" },
  { code: "TAM", name: "Tam Altın", emission: "YENİ", buy: "28.300,00", sell: "28.760,00", change: 0.78, spark: SPARK.up, unit: "adet" },
  { code: "ATA", name: "Ata Altın", emission: "YENİ", buy: "29.140,00", sell: "29.610,00", change: 0.81, spark: SPARK.up, unit: "adet" },
  { code: "AYAR22", name: "22 Ayar Bilezik", buy: "4.012,00", sell: "4.024,00", change: 0.65, spark: SPARK.flat, unit: "₺/gr" },
];

function GoldHero() {
  return (
    <div
      style={{
        margin: "0 18px",
        borderRadius: 24,
        background: "linear-gradient(140deg, #2A1A05 0%, #1A1208 50%, #0E0903 100%)",
        border: `1px solid rgba(245,158,11,0.20)`,
        padding: 18,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 18px 40px rgba(245,158,11,0.18), inset 0 1px 0 rgba(252,211,77,0.10)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -40,
          width: 240,
          height: 240,
          borderRadius: 999,
          background: "radial-gradient(circle, rgba(245,158,11,0.30) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -40,
          width: 180,
          height: 180,
          borderRadius: 999,
          background: "radial-gradient(circle, rgba(252,211,77,0.16) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FlagBadge flag="🪙" size={38} gold />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#FCD34D", letterSpacing: -0.2 }}>
              GRAM ALTIN <span style={{ color: "#A78B5C", fontWeight: 600 }}>· Has</span>
            </div>
            <div style={{ fontSize: 10.5, color: "#A78B5C", fontWeight: 600, marginTop: 2 }}>
              Ons referansı · 2.612,40 $
            </div>
          </div>
        </div>
        <ChangePill v={0.82} big />
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", position: "relative" }}>
        <div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: "#FEF3C7",
              letterSpacing: -1.5,
              lineHeight: 1,
              fontFamily: SF_DISPLAY,
              fontVariantNumeric: "tabular-nums",
              textShadow: "0 0 24px rgba(245,158,11,0.35)",
            }}
          >
            ₺4.384<span style={{ color: "#D6C28C" }}>,</span>20
          </div>
          <div style={{ fontSize: 11, color: "#A78B5C", fontWeight: 700, marginTop: 4, letterSpacing: 0.4 }}>
            ALIŞ <span style={{ color: "#FCD34D", fontFamily: MONO }}>4.382,50</span>
            <span style={{ margin: "0 8px", color: "#5C4A24" }}>·</span>
            SATIŞ <span style={{ color: "#FEF3C7", fontFamily: MONO, fontWeight: 800 }}>4.384,20</span>
          </div>
        </div>
        <Sparkline data={SPARK.up} width={92} height={48} color="#F59E0B" />
      </div>
    </div>
  );
}

function CategoryStrip() {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "0 18px",
        overflowX: "auto",
      }}
    >
      {CATEGORIES.map((c, i) => {
        const active = i === 1;
        return (
          <div
            key={c.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "10px 12px",
              borderRadius: 16,
              background: active
                ? "linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(180,83,9,0.10) 100%)"
                : PALETTE.surface,
              border: `1px solid ${active ? "rgba(245,158,11,0.35)" : PALETTE.border}`,
              minWidth: 64,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: active
                  ? "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)"
                  : PALETTE.surfaceHi,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: active ? "#3D2900" : PALETTE.muted,
                fontSize: 14,
                fontWeight: 800,
                boxShadow: active ? "0 4px 10px rgba(245,158,11,0.3)" : "none",
              }}
            >
              {c.icon}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: active ? "#FCD34D" : PALETTE.fgMid,
                letterSpacing: -0.1,
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: active ? "#A78B5C" : PALETTE.muted,
                fontFamily: MONO,
              }}
            >
              {c.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GoldRowItem({ row, divider }: { row: GoldRow; divider: boolean }) {
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
      <FlagBadge flag="🪙" size={36} gold />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14.5, fontWeight: 800, color: PALETTE.fg, letterSpacing: -0.2 }}>
            {row.code}
          </span>
          {row.emission ? (
            <span
              style={{
                fontSize: 8.5,
                fontWeight: 800,
                color: row.emission === "YENİ" ? "#FCD34D" : "#A78B5C",
                background: row.emission === "YENİ" ? "rgba(245,158,11,0.14)" : "rgba(167,139,92,0.14)",
                padding: "1px 6px",
                borderRadius: 4,
                letterSpacing: 0.5,
              }}
            >
              {row.emission}
            </span>
          ) : null}
        </div>
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
          {row.name} · {row.unit}
        </div>
      </div>
      <Sparkline data={row.spark} width={50} height={22} color={sparkColor} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 86 }}>
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

export function GoldHome() {
  return (
    <PhoneShell>
      <div style={{ paddingBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 20px 14px",
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#A78B5C", letterSpacing: 1.4 }}>
              KAPALIÇARŞI · CANLI
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
              Altın
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <LivePulse color="#F59E0B" label="CANLI" />
            <span style={{ fontSize: 10.5, color: PALETTE.muted, fontFamily: MONO, fontWeight: 600 }}>
              Son · 14:32:08
            </span>
          </div>
        </div>

        <GoldHero />

        <Section title="KATEGORİ">
          <CategoryStrip />
        </Section>

        <Section title="ÇEYREK ALTIN" action="Tümü">
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
              <GoldRowItem key={`${r.code}-${i}`} row={r} divider={i !== ROWS.length - 1} />
            ))}
          </div>
        </Section>
      </div>
    </PhoneShell>
  );
}

export default GoldHome;
