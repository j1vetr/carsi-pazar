import "./_tokens.css";

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPrice = (v: number) =>
  v >= 100
    ? v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const fmtAmount = (v: number) =>
  Number.isInteger(v) ? v.toString() : v.toLocaleString("tr-TR", { maximumFractionDigits: 4 });

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", CHF: "Fr", JPY: "¥",
  SAR: "ر", AED: "د", CAD: "C$", AUD: "A$",
};

type Holding = {
  code: string;
  name: string;
  type: "currency" | "gold";
  amount: number;
  avgPrice: number;
  currentPrice: number;
  prevClose: number;
  spark: number[];
  txs?: { side: "buy" | "sell"; amount: number; price: number; date: string }[];
};

const HOLDINGS: Holding[] = [
  {
    code: "USD", name: "Amerikan Doları", type: "currency",
    amount: 1500, avgPrice: 33.5012, currentPrice: 34.8520, prevClose: 34.6890,
    spark: [33.6, 33.9, 34.1, 33.8, 34.2, 34.5, 34.3, 34.7, 34.6, 34.85],
    txs: [
      { side: "buy", amount: 1000, price: 33.10, date: "12 Şub 2026" },
      { side: "buy", amount: 500, price: 34.30, date: "3 Nis 2026" },
    ],
  },
  {
    code: "EUR", name: "Euro", type: "currency",
    amount: 800, avgPrice: 36.2030, currentPrice: 37.8050, prevClose: 38.1120,
    spark: [37.9, 38.1, 38.3, 38.2, 38.0, 37.95, 38.05, 37.85, 37.90, 37.80],
  },
  {
    code: "GA", name: "Gram Altın", type: "gold",
    amount: 25.5, avgPrice: 2980.00, currentPrice: 3050.40, prevClose: 3022.10,
    spark: [3010, 3018, 3025, 3015, 3030, 3042, 3038, 3045, 3047, 3050.4],
  },
  {
    code: "CEYREK", name: "Çeyrek Altın", type: "gold",
    amount: 4, avgPrice: 5180.00, currentPrice: 5320.50, prevClose: 5290.00,
    spark: [5260, 5270, 5285, 5278, 5295, 5310, 5302, 5315, 5318, 5320.5],
  },
];

function calc(h: Holding) {
  const currentValue = h.amount * h.currentPrice;
  const cost = h.amount * h.avgPrice;
  const unrealized = currentValue - cost;
  const unrealizedPct = (unrealized / cost) * 100;
  const dayAbs = h.amount * (h.currentPrice - h.prevClose);
  const dayPct = ((h.currentPrice - h.prevClose) / h.prevClose) * 100;
  return { currentValue, cost, unrealized, unrealizedPct, dayAbs, dayPct };
}

const totals = HOLDINGS.reduce(
  (acc, h) => {
    const c = calc(h);
    acc.value += c.currentValue;
    acc.cost += c.cost;
    acc.day += c.dayAbs;
    return acc;
  },
  { value: 0, cost: 0, day: 0 }
);
const totalReturn = totals.value - totals.cost;
const totalReturnPct = (totalReturn / totals.cost) * 100;
const dayPct = (totals.day / (totals.value - totals.day)) * 100;

const HERO_SPARK = [
  175200, 175900, 176400, 175800, 177300, 178400, 178000, 179200,
  179800, 180100, 180800, 180400, 181500, 181200, 181400, 181570,
];

function Sparkline({
  values, color, width = 96, height = 30, area = true, strokeWidth = 1.8,
}: { values: number[]; color: string; width?: number; height?: number; area?: boolean; strokeWidth?: number }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));
  const d = pts.map((p, i) => (i === 0 ? `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}` : `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)).join(" ");
  const ar = `${d} L ${width} ${height} L 0 ${height} Z`;
  const gid = `g-${color.replace(/[^a-z0-9]/gi, "")}-${width}-${height}`;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.32} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {area && <path d={ar} fill={`url(#${gid})`} />}
      <path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Donut({ buckets, total, size = 128, stroke = 14 }: { buckets: { label: string; value: number; color: string }[]; total: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--secondary)" strokeWidth={stroke} fill="none" />
      {buckets.map((b, i) => {
        const frac = b.value / total;
        const len = c * frac;
        const offset = c * (1 - acc);
        acc += frac;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={b.color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${len} ${c}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}

function CurrencyBadge({ code }: { code: string }) {
  const sym = CURRENCY_SYMBOLS[code] ?? code.slice(0, 1);
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 20,
      background: "var(--currency-soft)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      color: "var(--currency-fg)",
      fontSize: 20, fontWeight: 700, lineHeight: 1,
    }}>
      {sym}
    </div>
  );
}

function HoldingRow({ h, expanded }: { h: Holding; expanded?: boolean }) {
  const c = calc(h);
  const dayPos = c.dayPct >= 0;
  const pos = c.unrealized >= 0;
  const isGold = h.type === "gold";
  return (
    <div style={{
      background: "var(--card)",
      borderRadius: 16,
      border: `1px solid ${expanded ? "var(--primary)" : "var(--border)"}`,
      overflow: "hidden",
      position: "relative",
    }}>
      {isGold && (
        <div style={{
          position: "absolute", left: 0, top: 12, bottom: 12, width: 3,
          borderRadius: 2, background: "var(--gold)",
        }} />
      )}
      <div style={{ padding: "14px 14px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        {h.type === "currency" ? <CurrencyBadge code={h.code} /> : <div style={{ width: 4 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)", letterSpacing: -0.2 }}>
              {h.name}
            </div>
            <div className="num" style={{
              padding: "2px 7px", borderRadius: 5,
              background: dayPos ? "var(--rise-soft)" : "var(--fall-soft)",
              fontSize: 10.5, fontWeight: 700,
              color: dayPos ? "var(--rise)" : "var(--fall)",
              letterSpacing: -0.1,
            }}>
              {dayPos ? "+" : "−"}%{Math.abs(c.dayPct).toFixed(2)}
            </div>
          </div>
          <div className="num" style={{ fontSize: 11.5, fontWeight: 500, color: "var(--muted)", marginTop: 4, letterSpacing: -0.1 }}>
            {fmtAmount(h.amount)} {isGold ? (h.code === "GA" ? "Gram" : "Adet") : "Birim"} · Ort ₺{fmtPrice(h.avgPrice)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
          <div className="num" style={{ fontSize: 15.5, fontWeight: 700, color: "var(--fg)", letterSpacing: -0.3 }}>
            ₺{fmtTL(c.currentValue)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkline values={h.spark} color={dayPos ? "var(--rise)" : "var(--fall)"} width={56} height={20} area={false} strokeWidth={1.4} />
            <span className="num" style={{ fontSize: 11.5, fontWeight: 700, color: pos ? "var(--rise)" : "var(--fall)" }}>
              {pos ? "+" : "−"}%{Math.abs(c.unrealizedPct).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <MetricBox label="MEVCUT" value={`₺${fmtTL(c.currentValue)}`} />
            <MetricBox label="MALİYET" value={`₺${fmtTL(c.cost)}`} />
            <MetricBox
              label="K/Z"
              value={`${pos ? "+" : "−"}₺${fmtTL(Math.abs(c.unrealized))}`}
              valueColor={pos ? "var(--rise)" : "var(--fall)"}
            />
          </div>
          {h.txs && (
            <>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.1, marginTop: 14, marginBottom: 4 }}>
                İŞLEM GEÇMİŞİ · {h.txs.length}
              </div>
              <div>
                {h.txs.map((tx, i) => (
                  <TimelineRow key={i} tx={tx} last={i === h.txs!.length - 1} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ flex: 1, background: "var(--secondary)", borderRadius: 11, padding: "10px 11px" }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--muted)", letterSpacing: 0.7 }}>{label}</div>
      <div className="num" style={{ fontSize: 13, fontWeight: 700, color: valueColor ?? "var(--fg)", marginTop: 4, letterSpacing: -0.2 }}>{value}</div>
    </div>
  );
}

function TimelineRow({ tx, last }: { tx: { side: "buy" | "sell"; amount: number; price: number; date: string }; last?: boolean }) {
  const accent = tx.side === "buy" ? "var(--rise)" : "var(--fall)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
      <div style={{ width: 14, alignSelf: "stretch", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 7, height: 7, borderRadius: 4, background: accent, marginTop: 6 }} />
        {!last && <div style={{ width: 1, flex: 1, background: "var(--border)", marginTop: 3 }} />}
      </div>
      <div style={{ flex: 1 }}>
        <div className="num" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)", letterSpacing: -0.1 }}>
          {tx.side === "buy" ? "Alım" : "Satış"} · {fmtAmount(tx.amount)}
          <span style={{ color: "var(--muted)", fontWeight: 500 }}> · ₺{fmtPrice(tx.price)}</span>
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--muted)", marginTop: 1 }}>{tx.date}</div>
      </div>
      <div className="num" style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: -0.1 }}>
        {tx.side === "sell" ? "−" : "+"}₺{fmtTL(tx.amount * tx.price)}
      </div>
    </div>
  );
}

function ChartCard() {
  const ranges = ["1H", "1A", "3A", "6A", "1Y", "TÜM"];
  return (
    <div style={{
      margin: "0 20px 18px",
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 18,
      padding: "16px 14px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 4px 6px" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.2 }}>
          DEĞER GEÇMİŞİ
        </div>
        <div className="num" style={{ fontSize: 11.5, fontWeight: 700, color: "var(--rise)", letterSpacing: -0.1 }}>
          +%3,62
        </div>
      </div>
      <div style={{ height: 116, padding: "4px 0 0" }}>
        <Sparkline values={HERO_SPARK} color="var(--primary)" width={384} height={116} strokeWidth={2} />
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 10, padding: "4px", background: "var(--secondary)", borderRadius: 10 }}>
        {ranges.map((r) => (
          <div key={r} style={{
            flex: 1, textAlign: "center", padding: "7px 0",
            borderRadius: 7, fontSize: 11, fontWeight: 700, letterSpacing: -0.1,
            background: r === "1A" ? "var(--card)" : "transparent",
            color: r === "1A" ? "var(--fg)" : "var(--muted)",
            boxShadow: r === "1A" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
          }}>{r}</div>
        ))}
      </div>
    </div>
  );
}

function AllocationCard() {
  const dovizValue = HOLDINGS.filter((h) => h.type === "currency")
    .reduce((s, h) => s + h.amount * h.currentPrice, 0);
  const gramValue = HOLDINGS.filter((h) => h.code === "GA").reduce((s, h) => s + h.amount * h.currentPrice, 0);
  const sarrValue = HOLDINGS.filter((h) => h.type === "gold" && h.code !== "GA").reduce((s, h) => s + h.amount * h.currentPrice, 0);
  const buckets = [
    { label: "Döviz", value: dovizValue, color: "var(--primary)" },
    { label: "Gram Altın", value: gramValue, color: "var(--gold)" },
    { label: "Sarrafiye", value: sarrValue, color: "#F4DC7A" },
  ];
  const total = buckets.reduce((s, b) => s + b.value, 0);
  return (
    <div style={{
      margin: "0 20px 22px",
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 18,
      padding: "16px 16px 18px",
    }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.2, marginBottom: 14 }}>
        VARLIK DAĞILIMI
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Donut buckets={buckets} total={total} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {buckets.map((b) => {
            const pct = (b.value / total) * 100;
            return (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: b.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)", letterSpacing: -0.1 }}>
                    {b.label}
                  </div>
                  <div className="num" style={{ fontSize: 10.5, fontWeight: 500, color: "var(--muted)", marginTop: 1 }}>
                    ₺{fmtTL(b.value)}
                  </div>
                </div>
                <div className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)", letterSpacing: -0.2 }}>
                  %{pct.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PortfolioScreen({ theme }: { theme: "light" | "dark" }) {
  const dayPos = totals.day >= 0;
  const totalPos = totalReturn >= 0;
  return (
    <div className={`pf2 ${theme}`}>
      {/* Header */}
      <div style={{ padding: "20px 20px 4px", display: "flex", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.4 }}>
            PORTFÖY
          </div>
          <div className="serif" style={{ fontSize: 30, color: "var(--fg)", letterSpacing: -0.6, marginTop: 2, lineHeight: 1.05 }}>
            Varlıklarım
          </div>
        </div>
        <button
          aria-label="Geçmiş işlemler"
          style={{
            width: 40, height: 40, borderRadius: 20, background: "var(--secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginRight: 8, border: "none", cursor: "pointer", color: "var(--fg)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
          </svg>
        </button>
        <button
          aria-label="Yeni işlem"
          style={{
            width: 40, height: 40, borderRadius: 20, background: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", cursor: "pointer", color: "var(--primary-fg)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Hero */}
      <div style={{ padding: "10px 20px 26px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.4 }}>
          TOPLAM PORTFÖY DEĞERİ
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
          <div className="num" style={{
            fontSize: 46, fontWeight: 700, color: "var(--fg)",
            letterSpacing: -1.7, lineHeight: 1.02,
          }}>
            ₺{fmtTL(totals.value)}
          </div>
          <div style={{ paddingBottom: 6 }}>
            <Sparkline values={HERO_SPARK} color={dayPos ? "var(--rise)" : "var(--fall)"} width={88} height={32} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: dayPos ? "var(--rise-soft)" : "var(--fall-soft)",
            padding: "6px 11px", borderRadius: 999,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={dayPos ? "var(--rise)" : "var(--fall)"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {dayPos ? <path d="M6 15l6-6 6 6" /> : <path d="M6 9l6 6 6-6" />}
            </svg>
            <span className="num" style={{
              fontSize: 12.5, fontWeight: 700,
              color: dayPos ? "var(--rise)" : "var(--fall)", letterSpacing: -0.1,
            }}>
              {dayPos ? "+" : "−"}₺{fmtTL(Math.abs(totals.day))} · %{Math.abs(dayPct).toFixed(2)}
            </span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>Bugün</span>
        </div>

        <div style={{ display: "flex", marginTop: 18, gap: 10 }}>
          <div style={{
            flex: 1, background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "12px 14px",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: 0.7 }}>MALİYET</div>
            <div className="num" style={{ fontSize: 17, fontWeight: 700, color: "var(--fg)", marginTop: 5, letterSpacing: -0.4 }}>
              ₺{fmtTL(totals.cost)}
            </div>
          </div>
          <div style={{
            flex: 1, background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "12px 14px",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: 0.7 }}>TOPLAM GETİRİ</div>
            <div className="num" style={{
              fontSize: 17, fontWeight: 700,
              color: totalPos ? "var(--rise)" : "var(--fall)",
              marginTop: 5, letterSpacing: -0.4,
            }}>
              {totalPos ? "+" : "−"}₺{fmtTL(Math.abs(totalReturn))}
            </div>
            <div className="num" style={{
              fontSize: 11.5, fontWeight: 600,
              color: totalPos ? "var(--rise)" : "var(--fall)", marginTop: 2,
            }}>
              {totalPos ? "+" : ""}{totalReturnPct.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <ChartCard />
      <AllocationCard />

      {/* Holdings */}
      <div style={{ padding: "0 20px 60px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.1 }}>
            VARLIKLARIM · {HOLDINGS.length}
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)" }}>
Uzun Bas → İşlem
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {HOLDINGS.map((h, i) => (
            <HoldingRow key={h.code} h={h} expanded={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
