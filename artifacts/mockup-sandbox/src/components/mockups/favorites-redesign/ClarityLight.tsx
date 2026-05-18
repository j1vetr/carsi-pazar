// Variant B — Clarity · Light Minimal  (with real flag images)

const C = {
  bg: "#FAFBFD",
  card: "#FFFFFF",
  surface: "#F2F5FA",
  border: "#E6ECF5",
  borderSoft: "#EEF2F9",
  primary: "#1246B5",
  text: "#0B1732",
  sub: "#7A8FAD",
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
  { code: "USD", name: "Amerikan Doları", cat: "doviz", buy: "38.891", sell: "38.943", chg: +0.42, flagCode: "us" },
  { code: "EUR", name: "Euro",            cat: "doviz", buy: "43.120", sell: "43.198", chg: -0.18, flagCode: "eu" },
  { code: "GBP", name: "Sterlin",         cat: "doviz", buy: "49.540", sell: "49.632", chg: +0.67, flagCode: "gb" },
  { code: "ALTIN", name: "Gram Altın",    cat: "altin", buy: "6.652",  sell: "6.688",  chg: +1.24, flagCode: null },
  { code: "EURUSD", name: "EUR/USD",      cat: "parite", buy: "1.0982", sell: "1.0994", chg: -0.31, flagCode: "eu" },
];

function FlagIcon({ flagCode, cat }: { flagCode: string | null; cat: string }) {
  const cc = catColor[cat]!;
  if (flagCode) {
    return (
      <div style={{
        width: 40, height: 40, borderRadius: 20,
        overflow: "hidden",
        border: `1.5px solid ${cc.main}20`,
        flexShrink: 0,
      }}>
        <img
          src={`https://flagcdn.com/w80/${flagCode}.png`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          alt={flagCode}
        />
      </div>
    );
  }
  // Gold fallback — stylised circle with ✦
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 20, flexShrink: 0,
      background: `linear-gradient(135deg, #F5E7A0, #D4A843)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      border: `1.5px solid #C0902040`,
    }}>
      <span style={{ fontSize: 18 }}>✦</span>
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

function MiniDirBar({ chg }: { chg: number }) {
  const pos = chg >= 0;
  const w = Math.min(Math.abs(chg) / 2, 1) * 20;
  return (
    <div style={{ width: 28, display: "flex", alignItems: "center", justifyContent: pos ? "flex-start" : "flex-end", position: "relative" }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 1, height: 14, background: C.border, transform: "translate(-50%,-50%)" }} />
      <div style={{
        height: 6, borderRadius: 3, width: w,
        background: pos ? C.rise : C.fall, opacity: 0.7,
        marginLeft: pos ? "50%" : undefined,
        marginRight: !pos ? "50%" : undefined,
      }} />
    </div>
  );
}

function AssetRow({ a, last }: { a: typeof assets[0]; last: boolean }) {
  const pos = a.chg >= 0;
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "13px 18px",
      background: C.card,
      borderBottom: last ? "none" : `1px solid ${C.borderSoft}`,
      gap: 12,
    }}>
      <FlagIcon flagCode={a.flagCode} cat={a.cat} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>{a.code}</span>
          <CategoryTag cat={a.cat} />
        </div>
        <span style={{ fontSize: 10.5, color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
          {a.name}
        </span>
      </div>

      <MiniDirBar chg={a.chg} />

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: -0.4, fontFamily: "ui-monospace, monospace" }}>
          {a.buy}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: pos ? C.rise : C.fall, marginTop: 3 }}>
          {pos ? "▲" : "▼"} {Math.abs(a.chg).toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div style={{ flex: 1, background: bg, borderRadius: 12, padding: "10px 11px", border: `1px solid ${color}22` }}>
      <div style={{ fontSize: 7.5, fontWeight: 800, color: C.sub, letterSpacing: 1.2, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 900, color, letterSpacing: -0.4, lineHeight: "1.2" }}>{value}</div>
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
        <span style={{ fontSize: 10, color: C.sub }}>●●● WiFi</span>
      </div>

      {/* Header */}
      <div style={{ padding: "8px 20px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>
              Daima Takipte
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.text, letterSpacing: -1.2, lineHeight: "1.05" }}>
              Favorilerim
            </div>
          </div>
          <div style={{
            marginTop: 4,
            width: 50, height: 50, borderRadius: 14,
            background: C.goldSoft,
            border: `1.5px solid ${C.gold}40`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 2,
          }}>
            <span style={{ fontSize: 17, lineHeight: "1" }}>⭐</span>
            <span style={{ fontSize: 8, fontWeight: 900, color: C.gold, letterSpacing: 0.5 }}>5 VARLIK</span>
          </div>
        </div>

        {/* Summary strip */}
        <div style={{ display: "flex", gap: 7, marginTop: 16 }}>
          <SummaryCard label="ORT. DEĞİŞİM" value="+0.37%" color={C.rise} bg={C.riseSoft} />
          <SummaryCard label="EN YÜKSELEN" value={"GBP\n+0.67%"} color={C.primary} bg="#EEF3FF" />
          <SummaryCard label="EN DÜŞEN" value={"EUR\n-0.18%"} color={C.fall} bg={C.fallSoft} />
        </div>
      </div>

      {/* Distribution bar */}
      <div style={{ padding: "0 20px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", gap: 2 }}>
          <div style={{ flex: 3, background: catColor.doviz!.main, borderRadius: 3, opacity: 0.8 }} />
          <div style={{ flex: 1, background: catColor.altin!.main, borderRadius: 3, opacity: 0.8 }} />
          <div style={{ flex: 1, background: catColor.parite!.main, borderRadius: 3, opacity: 0.8 }} />
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

      {/* Section break */}
      <div style={{ height: 8, background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }} />

      {/* Asset list */}
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", background: C.card }}>
        {assets.map((a, i) => (
          <AssetRow key={a.code} a={a} last={i === assets.length - 1} />
        ))}
        <div style={{ padding: "18px", display: "flex", justifyContent: "center" }}>
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
