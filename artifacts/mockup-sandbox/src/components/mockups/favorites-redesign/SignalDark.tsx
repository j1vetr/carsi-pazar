// Variant A — Signal · Dark Premium

const C = {
  bg: "#080F1E",
  surface: "#0D1A2E",
  surfaceHigh: "#122039",
  border: "#1B2F4A",
  gold: "#D4A843",
  goldSoft: "#2A2010",
  primary: "#4E80EE",
  rise: "#1DB874",
  riseSoft: "#0D2218",
  fall: "#E05252",
  fallSoft: "#2A1212",
  text: "#EBF0FA",
  sub: "#6A83A8",
  dim: "#3A5070",
};

const assets = [
  { code: "USD", name: "Amerikan Doları", cat: "doviz", buy: "38.891", sell: "38.943", chg: +0.42, flag: "🇺🇸" },
  { code: "EUR", name: "Euro", cat: "doviz", buy: "43.120", sell: "43.198", chg: -0.18, flag: "🇪🇺" },
  { code: "GBP", name: "Sterlin", cat: "doviz", buy: "49.540", sell: "49.632", chg: +0.67, flag: "🇬🇧" },
  { code: "ALTIN", name: "Gram Altın", cat: "altin", buy: "6.652", sell: "6.688", chg: +1.24, flag: "🥇" },
  { code: "EURUSD", name: "EUR/USD Parite", cat: "parite", buy: "1.0982", sell: "1.0994", chg: -0.31, flag: "💱" },
];

const catColor: Record<string, string> = {
  doviz: "#4E80EE",
  altin: "#D4A843",
  parite: "#9B6EF3",
};

function Ticker() {
  return (
    <div style={{
      display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 12px",
      scrollbarWidth: "none",
    }}>
      {assets.map(a => (
        <div key={a.code} style={{
          flexShrink: 0,
          background: a.chg >= 0 ? C.riseSoft : C.fallSoft,
          border: `1px solid ${a.chg >= 0 ? "#1DB87440" : "#E0525240"}`,
          borderRadius: 999,
          padding: "5px 12px",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 13 }}>{a.flag}</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: C.text, letterSpacing: 0.3 }}>{a.code}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: a.chg >= 0 ? C.rise : C.fall }}>
            {a.chg >= 0 ? "+" : ""}{a.chg.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function StatPill({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div style={{
      flex: 1,
      background: C.surfaceHigh,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "10px 12px",
      display: "flex", flexDirection: "column", gap: 2,
    }}>
      <span style={{ fontSize: 8, fontWeight: 800, color: C.sub, letterSpacing: 1.2, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color: accent, letterSpacing: -0.3 }}>{value}</span>
      {sub && <span style={{ fontSize: 8.5, color: C.sub, marginTop: 1 }}>{sub}</span>}
    </div>
  );
}

function AssetRow({ a, last }: { a: typeof assets[0]; last: boolean }) {
  const pos = a.chg >= 0;
  const accent = catColor[a.cat]!;
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "12px 16px",
      borderBottom: last ? "none" : `1px solid ${C.border}`,
      position: "relative",
      background: C.surface,
      gap: 10,
    }}>
      {/* left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 10, bottom: 10,
        width: 3, borderRadius: "0 3px 3px 0",
        background: accent,
      }} />

      {/* icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 18,
        background: `${accent}22`,
        border: `1.5px solid ${accent}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>
        {a.flag}
      </div>

      {/* name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.text, letterSpacing: -0.2 }}>{a.code}</div>
        <div style={{ fontSize: 10, color: C.sub, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
      </div>

      {/* price + change */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: -0.3, fontFamily: "monospace" }}>
          {a.buy}
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 2,
          marginTop: 3, padding: "2px 7px", borderRadius: 999,
          background: pos ? C.riseSoft : C.fallSoft,
          border: `1px solid ${pos ? "#1DB87430" : "#E0525230"}`,
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: pos ? C.rise : C.fall, letterSpacing: -0.1 }}>
            {pos ? "▲" : "▼"} {Math.abs(a.chg).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, count, color }: { title: string; count: number; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px 6px",
      background: C.bg,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: color }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: C.text, letterSpacing: 0.5 }}>{title}</span>
      </div>
      <span style={{
        fontSize: 9, fontWeight: 700, color,
        background: `${color}18`, borderRadius: 999, padding: "2px 8px",
        border: `1px solid ${color}30`,
      }}>{count} varlık</span>
    </div>
  );
}

export function SignalDark() {
  return (
    <div style={{
      width: 390, height: 844,
      background: C.bg,
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      color: C.text,
    }}>
      {/* Status bar */}
      <div style={{ height: 44, background: C.bg, display: "flex", alignItems: "flex-end", padding: "0 20px 8px", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>09:41</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: C.sub }}>●●●</span>
          <span style={{ fontSize: 11, color: C.sub }}>WiFi</span>
        </div>
      </div>

      {/* Hero header */}
      <div style={{ padding: "16px 20px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: C.sub, letterSpacing: 1.8, textTransform: "uppercase" }}>Takip Listesi</span>
            </div>
            <div style={{
              fontSize: 36, fontWeight: 900, color: C.text,
              letterSpacing: -1.5, lineHeight: "1.05", marginTop: 6,
            }}>
              Favorilerim
            </div>
          </div>
          {/* count badge */}
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.gold}33, ${C.gold}11)`,
            border: `1.5px solid ${C.gold}55`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: C.gold, letterSpacing: -1 }}>5</span>
            <span style={{ fontSize: 7.5, fontWeight: 700, color: C.sub, letterSpacing: 0.5 }}>VARLIK</span>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <StatPill label="Ort. Değişim" value="+0.37%" accent={C.rise} />
          <StatPill label="En Yükselen" value="GBP" sub="+0.67%" accent={C.primary} />
          <StatPill label="En Düşen" value="EURUSD" sub="-0.31%" accent={C.fall} />
        </div>
      </div>

      {/* Ticker chips */}
      <Ticker />

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        <SectionHeader title="DÖVİZ KURLARI" count={3} color={catColor.doviz!} />
        <div style={{ marginBottom: 2 }}>
          {assets.filter(a => a.cat === "doviz").map((a, i, arr) => (
            <AssetRow key={a.code} a={a} last={i === arr.length - 1} />
          ))}
        </div>
        <SectionHeader title="ALTIN & MADENLER" count={1} color={catColor.altin!} />
        <div style={{ marginBottom: 2 }}>
          {assets.filter(a => a.cat === "altin").map((a, i, arr) => (
            <AssetRow key={a.code} a={a} last={i === arr.length - 1} />
          ))}
        </div>
        <SectionHeader title="PARİTELER" count={1} color={catColor.parite!} />
        <div>
          {assets.filter(a => a.cat === "parite").map((a, i, arr) => (
            <AssetRow key={a.code} a={a} last={i === arr.length - 1} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 16px", display: "flex", justifyContent: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: C.surfaceHigh, border: `1px solid ${C.border}`,
            borderRadius: 999, padding: "7px 16px",
          }}>
            <span style={{ color: C.gold, fontSize: 12 }}>★</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.sub }}>Çıkarmak için sola kaydır</span>
          </div>
        </div>
      </div>
    </div>
  );
}
