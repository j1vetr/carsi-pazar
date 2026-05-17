import { useState } from "react";

// ── Renk paleti (light) ────────────────────────────────────────────────────
const C = {
  bg: "#F2F3F7",
  card: "#FFFFFF",
  border: "#E5E7EB",
  fg: "#111827",
  muted: "#6B7280",
  rise: "#16A34A",
  fall: "#DC2626",
  gold: "#CA8A04",
  primary: "#111827",
  secondary: "#F3F4F6",
};

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Mock veriler ────────────────────────────────────────────────────────────
const stats = {
  totalValue: 152_430.5,
  totalCost: 148_000,
  totalReturn: 4_430.5,
  totalReturnPct: 2.99,
  dayChange: 1_234.5,
  dayChangePct: 0.81,
};

const holdings = [
  {
    code: "USD", type: "currency", flag: "us",
    name: "Amerikan Doları", amount: 500, avgPrice: 38.2,
    currentValue: 32_745, unrealizedPct: 71.6, dayChangePct: 0.52, pos: true,
    txs: [{ side: "buy", amount: 300, price: 36.5, date: "12 Oca 2025" }],
  },
  {
    code: "EUR", type: "currency", flag: "eu",
    name: "Euro", amount: 200, avgPrice: 41.1,
    currentValue: 17_950, unrealizedPct: 118.2, dayChangePct: -0.18, pos: true,
    txs: [{ side: "buy", amount: 200, price: 39.8, date: "3 Mar 2025" }],
  },
  {
    code: "ALTIN", type: "gold", flag: null,
    name: "Gram Altın", amount: 10, avgPrice: 5_800,
    currentValue: 66_880, unrealizedPct: 15.3, dayChangePct: 0.62, pos: true,
    txs: [{ side: "buy", amount: 10, price: 5800, date: "15 Şub 2025" }],
  },
];

// ── Pill bileşeni (mevcut Hero'nun baloncukları) ─────────────────────────
function Pill({ label, caption, color, neutral }: { label: string; caption: string; color: string; neutral?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "6px 10px", borderRadius: 999,
      background: neutral ? C.secondary : color + "1A",
      border: neutral ? `1px solid ${C.border}` : "none",
      fontSize: 11.5, fontWeight: 700, color: color,
      whiteSpace: "nowrap",
    }}>
      {label}
      <span style={{ fontSize: 10, fontWeight: 500, color: C.muted }}>· {caption}</span>
    </div>
  );
}

// ── MetricBox (genişletilmiş kartın baloncukları) ──────────────────────────
function MetricBox({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{
      flex: 1, background: C.secondary, borderRadius: 11,
      padding: "9px 10px",
    }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, letterSpacing: "0.7px" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: valueColor ?? C.fg, marginTop: 3, letterSpacing: "-0.2px" }}>
        {value}
      </div>
    </div>
  );
}

// ── HoldingCard ─────────────────────────────────────────────────────────
function HoldingCard({ h }: { h: typeof holdings[0] }) {
  const [expanded, setExpanded] = useState(false);
  const dayPos = h.dayChangePct >= 0;
  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: C.card, borderRadius: 16,
        border: `1px solid ${expanded ? C.primary : C.border}`,
        overflow: "hidden", cursor: "pointer",
        position: "relative",
      }}
    >
      {h.type === "gold" && (
        <div style={{
          position: "absolute", left: 0, top: 12, bottom: 12,
          width: 3, borderRadius: 2, background: C.gold,
        }} />
      )}

      {/* Satır */}
      <div style={{ padding: "14px 14px 14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        {/* İkon */}
        <div style={{
          width: 40, height: 40, borderRadius: 20,
          background: h.type === "gold" ? C.gold + "22" : "#3B82F622",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: h.type === "gold" ? C.gold : "#3B82F6",
          flexShrink: 0,
        }}>
          {h.type === "currency" ? (
            <img src={`https://flagcdn.com/w40/${h.flag}.png`} style={{ width: 22, height: 16, borderRadius: 2 }} />
          ) : "🥇"}
        </div>

        {/* İsim + badge */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.fg, letterSpacing: "-0.2px" }}>{h.name}</span>
            {/* BALON: Günlük % değişim badge'i */}
            <div style={{
              padding: "2px 6px", borderRadius: 4,
              background: (dayPos ? C.rise : C.fall) + "18",
              fontSize: 10, fontWeight: 700,
              color: dayPos ? C.rise : C.fall,
            }}>
              {dayPos ? "+" : "−"}%{Math.abs(h.dayChangePct).toFixed(2)}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>
            {h.amount} {h.type === "gold" ? "Gram" : "Birim"} · Ort ₺{h.avgPrice.toLocaleString("tr-TR")}
          </div>
        </div>

        {/* Değer + % */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.fg }}>₺{fmtTL(h.currentValue)}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* mini sparkline placeholder */}
            <svg width="60" height="22">
              <path d="M0 16 C10 14 20 8 30 10 C40 12 50 6 60 4" stroke={C.rise} strokeWidth="1.4" fill="none" />
            </svg>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: h.pos ? C.rise : C.fall }}>
              +%{h.unrealizedPct.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Genişletilmiş bölüm */}
      {expanded && (
        <div style={{
          padding: "2px 14px 14px",
          borderTop: `1px solid ${C.border}`,
        }}>
          {/* BALON: MetricBox üçlüsü */}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <MetricBox label="MEVCUT" value={`₺${fmtTL(h.currentValue)}`} />
            <MetricBox label="MALİYET" value={`₺${(h.amount * h.avgPrice).toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`} />
            <MetricBox label="K/Z" value={`+₺${fmtTL(h.currentValue - h.amount * h.avgPrice)}`} valueColor={C.rise} />
          </div>

          <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, letterSpacing: "1.1px", marginTop: 14, marginBottom: 8 }}>
            İŞLEM GEÇMİŞİ · {h.txs.length}
          </div>
          {h.txs.map((tx, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: C.rise, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: C.fg }}>
                Alım · {tx.amount}
                <span style={{ color: C.muted, fontWeight: 500 }}> · ₺{tx.price.toLocaleString("tr-TR")}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.rise }}>
                +₺{fmtTL(tx.amount * tx.price)}
              </span>
              <span style={{ fontSize: 15, color: C.muted }}>×</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Ana ekran ───────────────────────────────────────────────────────────────
export default function PortfolioOldScreen() {
  return (
    <div style={{
      width: 390, height: 844, overflowY: "auto",
      background: C.bg, fontFamily: "Inter, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* Status bar */}
      <div style={{ height: 44, background: C.bg, flexShrink: 0 }} />

      {/* Header */}
      <div style={{
        padding: "10px 20px 6px", display: "flex", alignItems: "center", flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "1.4px" }}>PORTFÖY</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.fg, fontStyle: "italic", letterSpacing: "-0.6px", marginTop: 2 }}>
            Varlıklarım
          </div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: C.secondary, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
          <span style={{ fontSize: 18 }}>⏱</span>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 22, color: "#fff" }}>+</span>
        </div>
      </div>

      {/* Scroll içerik */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>

        {/* Hero */}
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "1.4px" }}>TOPLAM PORTFÖY DEĞERİ</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: C.fg, letterSpacing: "-1.6px", marginTop: 8 }}>
            ₺{fmtTL(stats.totalValue)}
          </div>
          {/* BALONLAR — Pill satırı */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Pill label={`+₺${fmtTL(stats.dayChange)} · %${stats.dayChangePct.toFixed(2)}`} caption="Bugün" color={C.rise} />
            <Pill label={`₺${fmtTL(stats.totalCost)}`} caption="Maliyet" color={C.fg} neutral />
            <Pill label={`+₺${fmtTL(stats.totalReturn)} · +%${stats.totalReturnPct.toFixed(2)}`} caption="Toplam Getiri" color={C.rise} />
          </div>
        </div>

        {/* Donut card (collapsed) */}
        <div style={{
          margin: "0 20px 12px", background: C.card, borderRadius: 16,
          border: `1px solid ${C.border}`, padding: "14px 16px",
          display: "flex", alignItems: "center",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "1.1px" }}>VARLIK DAĞILIMI</div>
            <div style={{ fontSize: 12, color: C.fg, marginTop: 3 }}>Altın ağırlıkta · %44 · 2 kategori</div>
          </div>
          <span style={{ color: C.muted, fontSize: 18 }}>∨</span>
        </div>

        {/* Time chart (collapsed) */}
        <div style={{
          margin: "0 20px 16px", background: C.card, borderRadius: 16,
          border: `1px solid ${C.border}`, padding: "14px 16px",
          display: "flex", alignItems: "center",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "1.1px" }}>PORTFÖY GRAFİĞİ</div>
            <div style={{ fontSize: 12, color: C.fg, marginTop: 3 }}>Son 1 Ay · ₺152.430</div>
          </div>
          <span style={{ color: C.muted, fontSize: 18 }}>∨</span>
        </div>

        {/* Holdings */}
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "1.1px" }}>VARLIKLARIM · {holdings.length}</span>
            <span style={{ fontSize: 11, color: C.muted }}>Uzun Bas → İşlem</span>
          </div>
          {holdings.map((h) => (
            <HoldingCard key={h.code} h={h} />
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        height: 60, background: "#fff", borderTop: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "0 4px", flexShrink: 0,
      }}>
        {[
          { label: "Döviz", active: false },
          { label: "Altın", active: false },
          { label: "Portföy", active: true },
          { label: "Favoriler", active: false },
          { label: "Menü", active: false },
        ].map((t) => (
          <div key={t.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, opacity: t.active ? 1 : 0.4 }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: t.active ? C.primary : C.muted, opacity: t.active ? 1 : 0.3 }} />
            <span style={{ fontSize: 10, fontWeight: t.active ? 700 : 500, color: t.active ? C.primary : C.muted }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
