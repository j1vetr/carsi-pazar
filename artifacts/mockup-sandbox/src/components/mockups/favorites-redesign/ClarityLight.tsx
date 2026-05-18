// Variant B — Clarity · Light Minimal

const C = {
  bg: "#FAFBFD",
  card: "#FFFFFF",
  surface: "#F2F5FA",
  border: "#E6ECF5",
  borderSoft: "#EEF2F9",
  primary: "#1246B5",
  text: "#0B1732",
  sub: "#7A8FAD",
  dim: "#C4CEDF",
  gold: "#C09020",
  goldSoft: "#FEF7E6",
  rise: "#0A8F5A",
  riseSoft: "#E8F8F1",
  fall: "#C93030",
  fallSoft: "#FDEAEA",
};

const catColor: Record<string, { main: string; soft: string; label: string }> = {
  doviz:  { main: "#1246B5", soft: "#EEF3FF", label: "DÖVİZ"   },
  altin:  { main: "#C09020", soft: "#FEF7E6", label: "ALTIN"   },
  parite: { main: "#7B3FD4", soft: "#F3ECFF", label: "PARİTE"  },
};

const assets = [
  { code: "USD", name: "Amerikan Doları", cat: "doviz", buy: "38.891", sell: "38.943", chg: +0.42, flag: "🇺🇸" },
  { code: "EUR", name: "Euro",            cat: "doviz", buy: "43.120", sell: "43.198", chg: -0.18, flag: "🇪🇺" },
  { code: "GBP", name: "Sterlin",         cat: "doviz", buy: "49.540", sell: "49.632", chg: +0.67, flag: "🇬🇧" },
  { code: "ALTIN", name: "Gram Altın",    cat: "altin", buy: "6.652",  sell: "6.688",  chg: +1.24, flag: "🥇" },
  { code: "EURUSD", name: "EUR/USD",      cat: "parite", buy: "1.0982", sell: "1.0994", chg: -0.31, flag: "💱" },
];

function MiniBar({ pct }: { pct: number }) {
  // tiny visual bar showing -2% → +2% range
  const clamped = Math.max(-2, Math.min(2, pct));
  const pos = clamped >= 0;
  const w = Math.abs(clamped) / 2 * 24;
  return (
    <div style={{ display: "flex", alignItems: "center", width: 28, height: 10, justifyContent: pos ? "flex-start" : "flex-end", position: "relative" }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 1, height: 8, background: C.border, transform: "translate(-50%,-50%)" }} />
      <div style={{
        height: 6, borderRadius: 3, width: w,
        background: pos ? C.rise : C.fall,
        opacity: 0.75,
        marginLeft: pos ? "50%" : undefined,
        marginRight: !pos ? "50%" : undefined,
      }} />
    </div>
  );
}

function CategoryTag({ cat }: { cat: string }) {
  const c = catColor[cat]!;
  return (
    <span style={{
      fontSize: 7.5, fontWeight: 800, letterSpacing: 0.8,
      color: c.main, background: c.soft,
      borderRadius: 4, padding: "2px 5px",
    }}>{c.label}</span>
  );
}

function AssetCard({ a, last }: { a: typeof assets[0]; last: boolean }) {
  const pos = a.chg >= 0;
  const cc = catColor[a.cat]!;
  return (
    <div style={{
      background: C.card,
      borderBottom: last ? "none" : `1px solid ${C.borderSoft}`,
      padding: "13px 18px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      {/* Icon disc */}
      <div style={{
        width: 40, height: 40, borderRadius: 20,
        background: cc.soft,
        border: `1.5px solid ${cc.main}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}>
        {a.flag}
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>{a.code}</span>
          <CategoryTag cat={a.cat} />
        </div>
        <span style={{ fontSize: 10.5, color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{a.name}</span>
      </div>

      {/* Price column */}
      <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <MiniBar pct={a.chg} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: -0.4, fontFamily: "ui-monospace, monospace" }}>
            {a.buy}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700,
            color: pos ? C.rise : C.fall,
            marginTop: 3, textAlign: "right",
          }}>
            {pos ? "▲" : "▼"} {Math.abs(a.chg).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div style={{
      flex: 1, background: bg,
      borderRadius: 12, padding: "10px 12px",
      border: `1px solid ${color}25`,
    }}>
      <div style={{ fontSize: 8, fontWeight: 800, color: C.sub, letterSpacing: 1.2, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 900, color, letterSpacing: -0.4 }}>{value}</div>
    </div>
  );
}

function DistBar() {
  return (
    <div style={{ padding: "0 20px 16px" }}>
      <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", gap: 2 }}>
        <div style={{ flex: 3, background: catColor.doviz!.main, borderRadius: 3, opacity: 0.85 }} />
        <div style={{ flex: 1, background: catColor.altin!.main, borderRadius: 3, opacity: 0.85 }} />
        <div style={{ flex: 1, background: catColor.parite!.main, borderRadius: 3, opacity: 0.85 }} />
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 9 }}>
        {[
          { label: "Döviz", count: 3, cat: "doviz" },
          { label: "Altın", count: 1, cat: "altin" },
          { label: "Parite", count: 1, cat: "parite" },
        ].map(({ label, count, cat }) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: catColor[cat]!.main }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClarityLight() {
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
      <div style={{ height: 44, display: "flex", alignItems: "flex-end", padding: "0 20px 8px", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>09:41</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: C.sub }}>●●● WiFi</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "8px 20px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 5 }}>
              Daima Takipte
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.text, letterSpacing: -1.2, lineHeight: "1.05" }}>
              Favorilerim
            </div>
          </div>
          {/* star badge */}
          <div style={{
            marginTop: 4,
            width: 48, height: 48, borderRadius: 14,
            background: C.goldSoft,
            border: `1.5px solid ${C.gold}40`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 1,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>⭐</span>
            <span style={{ fontSize: 8, fontWeight: 800, color: C.gold, letterSpacing: 0.3 }}>5</span>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <SummaryCard label="ORT. DEĞİŞİM" value="+0.37%" color={C.rise} bg={C.riseSoft} />
          <SummaryCard label="EN YÜKSELEN" value="GBP +0.67%" color={C.primary} bg="#EEF3FF" />
          <SummaryCard label="EN DÜŞEN" value="EUR -0.18%" color={C.fall} bg={C.fallSoft} />
        </div>
      </div>

      {/* Distribution bar */}
      <DistBar />

      {/* Divider */}
      <div style={{ height: 8, background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }} />

      {/* Asset list */}
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", background: C.card }}>
        {assets.map((a, i) => (
          <AssetCard key={a.code} a={a} last={i === assets.length - 1} />
        ))}

        {/* Footer hint */}
        <div style={{ padding: "18px 18px 24px", display: "flex", justifyContent: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 999, padding: "7px 16px",
          }}>
            <span style={{ fontSize: 13, color: C.gold }}>☆</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.sub }}>Çıkarmak için sola kaydır</span>
          </div>
        </div>
      </div>
    </div>
  );
}
