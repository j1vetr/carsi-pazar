import "./_group.css";

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPrice = (v: number) =>
  v >= 100
    ? v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const fmtAmount = (v: number) =>
  Number.isInteger(v) ? v.toString() : v.toLocaleString("tr-TR", { maximumFractionDigits: 4 });

type Holding = {
  code: string;
  name: string;
  type: "currency" | "gold";
  amount: number;
  avgPrice: number;
  currentPrice: number;
  prevClose: number;
  flag?: string;
  spark: number[];
};

const HOLDINGS: Holding[] = [
  {
    code: "USD", name: "Amerikan Doları", type: "currency",
    amount: 1500, avgPrice: 33.5012, currentPrice: 34.8520, prevClose: 34.6890,
    flag: "🇺🇸",
    spark: [33.6, 33.9, 34.1, 33.8, 34.2, 34.5, 34.3, 34.7, 34.6, 34.85],
  },
  {
    code: "EUR", name: "Euro", type: "currency",
    amount: 800, avgPrice: 36.2030, currentPrice: 37.8050, prevClose: 38.1120,
    flag: "🇪🇺",
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
  const dayChangeAbs = h.amount * (h.currentPrice - h.prevClose);
  const dayChangePct = ((h.currentPrice - h.prevClose) / h.prevClose) * 100;
  return { currentValue, cost, unrealized, unrealizedPct, dayChangeAbs, dayChangePct };
}

const totals = HOLDINGS.reduce(
  (acc, h) => {
    const c = calc(h);
    acc.value += c.currentValue;
    acc.cost += c.cost;
    acc.day += c.dayChangeAbs;
    return acc;
  },
  { value: 0, cost: 0, day: 0 }
);
const totalReturn = totals.value - totals.cost;
const totalReturnPct = (totalReturn / totals.cost) * 100;
const dayPct = (totals.day / (totals.value - totals.day)) * 100;

const HERO_SPARK = [
  175200, 176100, 175800, 177300, 178400, 178000, 179200, 180100, 180800, 181500, 181400, 181570,
];

function Sparkline({
  values, color, width = 96, height = 30, area = true,
}: { values: number[]; color: string; width?: number; height?: number; area?: boolean }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / range) * (height - 2) - 1,
  }));
  const d = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const ar = `${d} L ${width} ${height} L 0 ${height} Z`;
  const gid = `g-${color.replace("#", "")}`;
  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.35} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {area && <path d={ar} fill={`url(#${gid})`} />}
      <path d={d} stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Donut({ buckets, total }: { buckets: { label: string; value: number; color: string }[]; total: number }) {
  const size = 132;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#152844" strokeWidth={stroke} fill="none" />
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

function StatCard({ label, value, sub, valueColor }: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <div style={{
      flex: 1, background: "var(--card)", borderRadius: 14,
      padding: "12px 14px", border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: 0.7 }}>
        {label}
      </div>
      <div style={{
        fontSize: 17, fontWeight: 700,
        color: valueColor ?? "var(--fg)",
        marginTop: 5, letterSpacing: -0.4,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, fontWeight: 600, color: valueColor ?? "var(--fg)", marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function AssetIcon({ h }: { h: Holding }) {
  const isGold = h.type === "gold";
  const bg = isGold ? "rgba(232,199,82,0.15)" : "rgba(91,141,239,0.15)";
  const fg = isGold ? "var(--gold)" : "var(--primary)";
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 20, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: h.flag ? 20 : 13, fontWeight: 700, color: fg, flexShrink: 0,
    }}>
      {h.flag ?? h.code.slice(0, 2)}
    </div>
  );
}

function HoldingRow({ h, expanded }: { h: Holding; expanded?: boolean }) {
  const c = calc(h);
  const dayPos = c.dayChangePct >= 0;
  const pos = c.unrealized >= 0;
  return (
    <div style={{
      background: "var(--card)", borderRadius: 16,
      border: `1px solid ${expanded ? "var(--primary)" : "var(--border)"}`,
      overflow: "hidden",
    }}>
      <div style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <AssetIcon h={h} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)", letterSpacing: -0.2 }}>
              {h.name}
            </div>
            <div style={{
              padding: "2px 6px", borderRadius: 4,
              background: (dayPos ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"),
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: dayPos ? "var(--rise)" : "var(--fall)" }}>
                {dayPos ? "+" : "−"}%{Math.abs(c.dayChangePct).toFixed(2)}
              </span>
            </div>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--muted)", marginTop: 3, letterSpacing: -0.1 }}>
            {fmtAmount(h.amount)} {h.type === "gold" ? "adet/gr" : "birim"} · Ort ₺{fmtPrice(h.avgPrice)}
          </div>
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)", letterSpacing: -0.2 }}>
            ₺{fmtTL(c.currentValue)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkline values={h.spark} color={dayPos ? "#22C55E" : "#EF4444"} width={60} height={22} area={false} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: pos ? "var(--rise)" : "var(--fall)" }}>
              {pos ? "+" : "−"}%{Math.abs(c.unrealizedPct).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "12px 14px 14px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <MetricBox label="MEVCUT" value={`₺${fmtTL(c.currentValue)}`} />
            <MetricBox label="MALİYET" value={`₺${fmtTL(c.cost)}`} />
            <MetricBox
              label="K/Z"
              value={`${pos ? "+" : "−"}₺${fmtTL(Math.abs(c.unrealized))}`}
              valueColor={pos ? "var(--rise)" : "var(--fall)"}
            />
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.1, marginTop: 14, marginBottom: 8 }}>
            İŞLEM GEÇMİŞİ · 2
          </div>
          <TimelineRow side="buy" amount={h.amount * 0.7} price={h.avgPrice * 0.985} date="12 Şub 2026" />
          <TimelineRow side="buy" amount={h.amount * 0.3} price={h.avgPrice * 1.035} date="3 Nis 2026" last />
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ flex: 1, background: "var(--secondary)", borderRadius: 11, padding: "9px 10px" }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--muted)", letterSpacing: 0.7 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: valueColor ?? "var(--fg)", marginTop: 3, letterSpacing: -0.2 }}>{value}</div>
    </div>
  );
}

function TimelineRow({ side, amount, price, date, last }: { side: "buy" | "sell"; amount: number; price: number; date: string; last?: boolean }) {
  const accent = side === "buy" ? "var(--rise)" : "var(--fall)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
      <div style={{ width: 16, display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch" }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: accent }} />
        {!last && <div style={{ width: 1, flex: 1, background: "var(--border)", marginTop: 2 }} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)", letterSpacing: -0.1 }}>
          {side === "buy" ? "Alım" : "Satış"} · {fmtAmount(amount)}
          <span style={{ color: "var(--muted)", fontWeight: 500 }}> · ₺{fmtPrice(price)}</span>
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--muted)", marginTop: 1 }}>{date}</div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: -0.1 }}>
        {side === "sell" ? "−" : "+"}₺{fmtTL(amount * price)}
      </div>
      <span style={{ color: "var(--muted)", fontSize: 14 }}>×</span>
    </div>
  );
}

function ChartPlaceholder() {
  const ranges = ["1H", "1A", "3A", "6A", "1Y", "TÜM"];
  return (
    <div style={{ margin: "0 20px 22px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.1 }}>DEĞER GEÇMİŞİ</div>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--rise)" }}>+%3.62 · 1A</div>
      </div>
      <div style={{ height: 110 }}>
        <Sparkline values={HERO_SPARK} color="#5B8DEF" width={380} height={110} />
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        {ranges.map((r) => (
          <div key={r} style={{
            flex: 1, textAlign: "center", padding: "6px 0",
            borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: r === "1A" ? "var(--secondary)" : "transparent",
            color: r === "1A" ? "var(--fg)" : "var(--muted)",
          }}>{r}</div>
        ))}
      </div>
    </div>
  );
}

function AllocationSection() {
  const buckets = [
    { label: "Döviz", value: 1500 * 34.852 + 800 * 37.805, color: "#5B8DEF" },
    { label: "Gram Altın", value: 25.5 * 3050.4, color: "#E8C752" },
    { label: "Sarrafiye", value: 4 * 5320.5, color: "#F4DC7A" },
  ];
  const total = buckets.reduce((s, b) => s + b.value, 0);
  return (
    <div style={{ margin: "0 20px 24px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.1, marginBottom: 12 }}>
        VARLIK DAĞILIMI
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Donut buckets={buckets} total={total} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {buckets.map((b) => {
            const pct = (b.value / total) * 100;
            return (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: b.color }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)", letterSpacing: -0.1 }}>
                    {b.label}
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--muted)", marginTop: 1 }}>
                    ₺{fmtTL(b.value)}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>%{pct.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Current() {
  const dayPos = totals.day >= 0;
  const totalPos = totalReturn >= 0;
  return (
    <div className="pf-current">
      {/* Status bar mock */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 22px 4px", fontSize: 13, fontWeight: 700, color: "var(--fg)",
      }}>
        <span>9:41</span>
        <span style={{ display: "inline-flex", gap: 5, fontSize: 12 }}>
          <span>▲▲▲</span><span>·</span><span>100%</span>
        </span>
      </div>

      {/* Header */}
      <div style={{
        padding: "10px 20px 6px", display: "flex", alignItems: "center",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.4 }}>
            PORTFÖY
          </div>
          <div className="pf-serif" style={{ fontSize: 28, color: "var(--fg)", letterSpacing: -0.6, marginTop: 2 }}>
            Varlıklarım
          </div>
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: 20, background: "var(--secondary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 8, border: "none", color: "var(--fg)", fontSize: 18, cursor: "pointer",
        }} aria-label="İşlem geçmişi">⏱</button>
        <button style={{
          width: 40, height: 40, borderRadius: 20, background: "var(--primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", color: "#fff", fontSize: 22, fontWeight: 700, cursor: "pointer",
        }} aria-label="Ekle">+</button>
      </div>

      {/* Hero */}
      <div style={{ padding: "8px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 4, borderRadius: 2, background: "var(--gold)" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.4 }}>
            TOPLAM PORTFÖY DEĞERİ
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: 10 }}>
          <div style={{
            fontSize: 50, fontWeight: 700, color: "var(--fg)", letterSpacing: -1.9, lineHeight: 1,
          }}>
            ₺{fmtTL(totals.value)}
          </div>
          <div style={{ paddingBottom: 6 }}>
            <Sparkline values={HERO_SPARK} color={dayPos ? "#22C55E" : "#EF4444"} width={86} height={30} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: dayPos ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
            padding: "6px 11px", borderRadius: 999,
          }}>
            <span style={{ color: dayPos ? "var(--rise)" : "var(--fall)", fontSize: 11 }}>
              {dayPos ? "▲" : "▼"}
            </span>
            <span style={{
              fontSize: 12.5, fontWeight: 700,
              color: dayPos ? "var(--rise)" : "var(--fall)", letterSpacing: -0.1,
            }}>
              {dayPos ? "+" : "−"}₺{fmtTL(Math.abs(totals.day))} · %{Math.abs(dayPct).toFixed(2)}
            </span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>bugün</span>
        </div>
        <div style={{ display: "flex", marginTop: 18, gap: 10 }}>
          <StatCard label="MALİYET" value={`₺${fmtTL(totals.cost)}`} />
          <StatCard
            label="TOPLAM GETİRİ"
            value={`${totalPos ? "+" : "−"}₺${fmtTL(Math.abs(totalReturn))}`}
            sub={`${totalPos ? "+" : ""}${totalReturnPct.toFixed(2)}%`}
            valueColor={totalPos ? "var(--rise)" : "var(--fall)"}
          />
        </div>
      </div>

      <ChartPlaceholder />
      <AllocationSection />

      {/* Holdings list */}
      <div style={{ padding: "0 20px 60px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1.1 }}>
            VARLIKLARIM · {HOLDINGS.length}
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)" }}>
            uzun bas → işlem
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

export default Current;
