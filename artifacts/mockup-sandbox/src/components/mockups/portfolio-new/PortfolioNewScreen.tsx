import { useState } from "react";

// ── Renk paleti ───────────────────────────────────────────────────────────
const C = {
  bg: "#F2F3F7",
  card: "#FFFFFF",
  border: "#E5E7EB",
  borderLight: "#F0F1F4",
  fg: "#111827",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
  rise: "#16A34A",
  fall: "#DC2626",
  gold: "#CA8A04",
  primary: "#111827",
  secondary: "#F3F4F6",
};

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtTL0 = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ── Mock veriler ───────────────────────────────────────────────────────────
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
    currentValue: 32_745, costBasis: 19_100,
    unrealized: 13_645, unrealizedPct: 71.44,
    dayChangePct: 0.52, pos: true, dayPos: true,
    txs: [
      { side: "buy", amount: 300, price: 36.5, date: "12 Oca 2025", total: 10_950 },
      { side: "buy", amount: 200, price: 40.75, date: "3 Mar 2025", total: 8_150 },
    ],
  },
  {
    code: "EUR", type: "currency", flag: "eu",
    name: "Euro", amount: 200, avgPrice: 41.1,
    currentValue: 17_950, costBasis: 8_220,
    unrealized: 9_730, unrealizedPct: 118.37,
    dayChangePct: -0.18, pos: true, dayPos: false,
    txs: [
      { side: "buy", amount: 200, price: 39.8, date: "3 Mar 2025", total: 7_960 },
    ],
  },
  {
    code: "ALTIN", type: "gold", flag: null,
    name: "Gram Altın", amount: 10, avgPrice: 5_800,
    currentValue: 66_880, costBasis: 58_000,
    unrealized: 8_880, unrealizedPct: 15.31,
    dayChangePct: 0.62, pos: true, dayPos: true,
    txs: [
      { side: "buy", amount: 10, price: 5_800, date: "15 Şub 2025", total: 58_000 },
    ],
  },
];

// ── BottomNavItem ─────────────────────────────────────────────────────────
function BottomNavItem({ label, active, icon }: { label: string; active: boolean; icon: string }) {
  const color = active ? C.primary : C.mutedLight;
  const renderIcon = () => {
    if (icon === "doviz") return (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r="9" stroke={color} strokeWidth="1.6" fill="none" />
        <text x="11" y="15.5" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>$</text>
      </svg>
    );
    if (icon === "altin") return (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <rect x="5" y="15" width="12" height="3" rx="1" fill={color} />
        <rect x="7" y="10" width="8" height="3" rx="1" fill={color} />
        <rect x="9" y="5" width="4" height="3" rx="1" fill={color} />
      </svg>
    );
    if (icon === "portfolio") return (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <rect x="3" y="8" width="16" height="11" rx="2" stroke={color} strokeWidth="1.6" fill="none" />
        <path d="M8 8V6a3 3 0 016 0v2" stroke={color} strokeWidth="1.6" fill="none" />
      </svg>
    );
    if (icon === "heart") return (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <path d="M11 18s-7-5-7-10a4 4 0 018 0 4 4 0 018 0c0 5-7 10-7 10z" stroke={color} strokeWidth="1.6" fill="none" />
      </svg>
    );
    return (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <rect x="4" y="6" width="14" height="1.8" rx="0.9" fill={color} />
        <rect x="4" y="10.1" width="14" height="1.8" rx="0.9" fill={color} />
        <rect x="4" y="14.2" width="14" height="1.8" rx="0.9" fill={color} />
      </svg>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
      {renderIcon()}
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color }}>{label}</span>
    </div>
  );
}

// ── HoldingRow (yeni temiz satır) ─────────────────────────────────────────
function HoldingRow({ h, isLast }: { h: typeof holdings[0]; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ borderBottom: isLast && !expanded ? "none" : `1px solid ${C.borderLight}` }}>
      {/* Ana satır */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "13px 16px", cursor: "pointer", background: C.card,
        }}
      >
        {/* Sol çizgi (altın) */}
        {h.type === "gold" && (
          <div style={{
            position: "absolute", left: 0,
            width: 3, height: 40, borderRadius: 2, background: C.gold,
          }} />
        )}

        {/* İkon disc */}
        <div style={{
          width: 38, height: 38, borderRadius: 19, flexShrink: 0,
          background: h.type === "gold" ? C.gold + "18" : "#3B82F618",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {h.type === "currency" ? (
            <img src={`https://flagcdn.com/w40/${h.flag}.png`} style={{ width: 24, height: 17, borderRadius: 2 }} />
          ) : (
            <span style={{ fontSize: 18 }}>⬡</span>
          )}
        </div>

        {/* İsim + miktar */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.fg, letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {h.name}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            {h.amount} {h.type === "gold" ? "Gram" : "Birim"} · Ort ₺{h.avgPrice.toLocaleString("tr-TR")}
          </div>
        </div>

        {/* Değer + getiri */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.fg, letterSpacing: "-0.2px" }}>
            ₺{fmtTL0(h.currentValue)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
            {/* mini sparkline */}
            <svg width="42" height="16" style={{ opacity: 0.9 }}>
              <path d="M0 12 C7 10 14 5 21 7 C28 9 35 3 42 1"
                stroke={C.rise} strokeWidth="1.3" fill="none" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: h.pos ? C.rise : C.fall }}>
              +%{h.unrealizedPct.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M4 6l4 4 4-4" stroke={C.muted} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Genişletilmiş — temiz metric satırı */}
      {expanded && (
        <div style={{ background: "#FAFAFA", borderTop: `1px solid ${C.borderLight}` }}>
          {/* Metrikler: düz tablo, baloncuk yok */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.borderLight}` }}>
            {[
              { label: "MEVCUT DEĞER", value: `₺${fmtTL0(h.currentValue)}`, color: C.fg },
              { label: "MALİYET", value: `₺${fmtTL0(h.costBasis)}`, color: C.fg },
              { label: "KÂRA/ZARAR", value: `+₺${fmtTL0(h.unrealized)}`, color: C.rise },
            ].map((m, i) => (
              <div key={i} style={{
                flex: 1, padding: "10px 12px",
                borderRight: i < 2 ? `1px solid ${C.borderLight}` : "none",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: "0.8px" }}>{m.label}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: m.color, marginTop: 3, letterSpacing: "-0.2px" }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* İşlem geçmişi */}
          <div style={{ padding: "10px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "1px", marginBottom: 8 }}>
              İŞLEM GEÇMİŞİ · {h.txs.length}
            </div>
            {h.txs.map((tx, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                paddingVertical: 6,
                borderTop: i > 0 ? `1px solid ${C.borderLight}` : "none",
                padding: "7px 0",
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: 3, flexShrink: 0,
                  background: tx.side === "sell" ? C.fall : C.rise,
                }} />
                <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: C.fg }}>
                  {tx.side === "sell" ? "Satış" : "Alım"} · {tx.amount}
                  <span style={{ color: C.muted, fontWeight: 500 }}> · ₺{tx.price.toLocaleString("tr-TR")}</span>
                </div>
                <span style={{ fontSize: 10.5, color: C.muted }}>{tx.date}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: tx.side === "sell" ? C.fall : C.rise }}>
                  +₺{fmtTL0(tx.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Ana ekran ──────────────────────────────────────────────────────────────
export default function PortfolioNewScreen() {
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
        <div style={{ width: 38, height: 38, borderRadius: 19, background: C.secondary, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" stroke={C.fg} strokeWidth="1.4" fill="none" /><path d="M9 5v4l3 2" stroke={C.fg} strokeWidth="1.4" strokeLinecap="round" fill="none" /></svg>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 19, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 4v10M4 9h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
      </div>

      {/* Scroll içerik */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>

        {/* Hero — baloncuk yok, temiz stat satırı */}
        <div style={{ padding: "8px 20px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "1.4px" }}>TOPLAM PORTFÖY DEĞERİ</div>
          <div style={{ fontSize: 46, fontWeight: 700, color: C.fg, letterSpacing: "-1.6px", marginTop: 6, lineHeight: 1 }}>
            ₺{fmtTL(stats.totalValue)}
          </div>

          {/* Düz 3-sütun stat — pill YOK */}
          <div style={{
            display: "flex", marginTop: 14,
            background: C.card, borderRadius: 14,
            border: `1px solid ${C.border}`,
            overflow: "hidden",
          }}>
            {[
              { label: "BUGÜN", value: `+₺${fmtTL0(stats.dayChange)}`, sub: `%${stats.dayChangePct.toFixed(2)}`, color: C.rise },
              { label: "MALİYET", value: `₺${fmtTL0(stats.totalCost)}`, sub: null, color: C.fg },
              { label: "TOPLAM GETİRİ", value: `+₺${fmtTL0(stats.totalReturn)}`, sub: `%${stats.totalReturnPct.toFixed(2)}`, color: C.rise },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, padding: "11px 10px",
                borderRight: i < 2 ? `1px solid ${C.border}` : "none",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: "0.8px", marginBottom: 5 }}>{s.label}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: s.color, letterSpacing: "-0.2px" }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 11, fontWeight: 600, color: s.color, marginTop: 2 }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Donut + Grafik kartları — collapsed, temiz */}
        <div style={{ padding: "12px 20px 0", display: "flex", gap: 10 }}>
          {[
            { label: "VARLIK DAĞILIMI", sub: "Altın %44 · 2 kategori" },
            { label: "PORTFÖY GRAFİĞİ", sub: "1 Ay · +%2.99" },
          ].map((c) => (
            <div key={c.label} style={{
              flex: 1, background: C.card, borderRadius: 12,
              border: `1px solid ${C.border}`, padding: "11px 12px",
              display: "flex", alignItems: "center",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: "0.8px" }}>{c.label}</div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.fg, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.sub}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 5l4 4 4-4" stroke={C.muted} strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg>
            </div>
          ))}
        </div>

        {/* Holdings listesi */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "1px" }}>
              VARLIKLARIM · {holdings.length}
            </span>
            <span style={{ fontSize: 10.5, color: C.muted }}>Uzun Bas → İşlem</span>
          </div>

          {/* Kart — tüm satırlar tek kart içinde, ayırıcı çizgiler */}
          <div style={{
            background: C.card, borderRadius: 14,
            border: `1px solid ${C.border}`,
            overflow: "hidden",
            position: "relative",
          }}>
            {holdings.map((h, i) => (
              <HoldingRow key={h.code} h={h} isLast={i === holdings.length - 1} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        height: 60, background: C.card, borderTop: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "8px 4px 10px", flexShrink: 0,
      }}>
        <BottomNavItem label="Döviz"    active={false} icon="doviz" />
        <BottomNavItem label="Altın"    active={false} icon="altin" />
        <BottomNavItem label="Portföy"  active={true}  icon="portfolio" />
        <BottomNavItem label="Favoriler" active={false} icon="heart" />
        <BottomNavItem label="Menü"     active={false}  icon="menu" />
      </div>
    </div>
  );
}
