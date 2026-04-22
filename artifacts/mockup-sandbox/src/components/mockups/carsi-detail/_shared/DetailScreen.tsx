import { useEffect, useMemo, useState } from "react";
import { T, SANS, MONO, PhoneShell, type Theme } from "../../carsi-widget/_v2";

type Range = "1H" | "1A" | "1Y" | "3Y" | "5Y";
type Point = { t: string; c: number };

const RANGES: { key: Range; label: string }[] = [
  { key: "1H", label: "1 HAFTA" },
  { key: "1A", label: "1 AY" },
  { key: "1Y", label: "1 YIL" },
  { key: "3Y", label: "3 YIL" },
  { key: "5Y", label: "5 YIL" },
];

const RANGE_TITLE: Record<Range, string> = {
  "1H": "Son 1 hafta",
  "1A": "Son 1 ay",
  "1Y": "Son 1 yıl",
  "3Y": "Son 3 yıl",
  "5Y": "Son 5 yıl",
};

export interface DetailScreenProps {
  theme: Theme;
  symbol: string;
  nameTR: string;
  description: string;
  buy: number;
  sell: number;
  prevClose: number;
  type: "currency" | "gold";
  todayChange: number;
  todayChangePct: number;
}

const W = 354;
const H = 200;
const PAD = { top: 14, right: 12, bottom: 26, left: 50 };

function formatPrice(p: number) {
  if (p >= 10000)
    return p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 100) return p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return p.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function formatTick(v: number) {
  if (v >= 10000) return Math.round(v).toLocaleString("tr-TR");
  if (v >= 100) return v.toFixed(0);
  if (v >= 10) return v.toFixed(2);
  return v.toFixed(4);
}

function formatXLabel(iso: string, range: Range) {
  const d = new Date(iso);
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  if (range === "5Y" || range === "3Y" || range === "1Y") {
    return `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
  }
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function ChartSvg({ data, range, t }: { data: Point[]; range: Range; t: typeof T.light }) {
  const chart = useMemo(() => {
    if (!data || data.length < 2) return null;
    const prices = data.map((d) => d.c);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const r = maxP - minP || maxP * 0.001 || 1;
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;
    const xStep = cW / (prices.length - 1);
    const toX = (i: number) => PAD.left + i * xStep;
    const toY = (p: number) => PAD.top + cH - ((p - minP) / r) * cH;

    let pathD = `M ${toX(0)} ${toY(prices[0])}`;
    for (let i = 1; i < prices.length; i++) {
      const x = toX(i);
      const y = toY(prices[i]);
      const px = toX(i - 1);
      const py = toY(prices[i - 1]);
      const cpX = (px + x) / 2;
      pathD += ` C ${cpX} ${py} ${cpX} ${y} ${x} ${y}`;
    }
    const lastX = toX(prices.length - 1);
    const fillD = pathD + ` L ${lastX} ${PAD.top + cH} L ${PAD.left} ${PAD.top + cH} Z`;

    const gridCount = 4;
    const grid = Array.from({ length: gridCount + 1 }, (_, i) => {
      const p = minP + (i / gridCount) * r;
      return { y: toY(p), label: formatTick(p) };
    });

    const idxs = [
      0,
      Math.floor(prices.length / 4),
      Math.floor(prices.length / 2),
      Math.floor((3 * prices.length) / 4),
      prices.length - 1,
    ];
    const xLabels = idxs.map((i) => ({ x: toX(i), label: formatXLabel(data[i]!.t, range) }));

    return {
      path: pathD,
      fill: fillD,
      grid,
      xLabels,
      first: prices[0]!,
      last: prices[prices.length - 1]!,
      hi: maxP,
      lo: minP,
      lastX,
      lastY: toY(prices[prices.length - 1]!),
    };
  }, [data, range]);

  if (!chart) return null;

  const isPositive = chart.last >= chart.first;
  const lineColor = isPositive ? t.up : t.down;
  const fillId = `pcGrad-${isPositive ? "up" : "dn"}-${range}`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity={0.18} />
          <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      {chart.grid.map((g, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={g.y} x2={W - PAD.right} y2={g.y} stroke={t.hairline} strokeWidth={1} />
          <text x={PAD.left - 6} y={g.y + 3} fontSize={9} fontFamily={MONO} fill={t.muted} textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
            {g.label}
          </text>
        </g>
      ))}
      {chart.xLabels.map((l, i) => (
        <text key={i} x={l.x} y={H - 6} fontSize={9} fontFamily={SANS} fill={t.muted} textAnchor="middle">
          {l.label}
        </text>
      ))}
      <path d={chart.fill} fill={`url(#${fillId})`} />
      <path d={chart.path} stroke={lineColor} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={chart.lastX} cy={chart.lastY} r={3.5} fill={lineColor} stroke={t.surface} strokeWidth={1.5} />
    </svg>
  );
}

export function DetailScreen(props: DetailScreenProps) {
  const { theme, symbol, nameTR, description, buy, sell, prevClose, type, todayChange, todayChangePct } = props;
  const [range, setRange] = useState<Range>("1A");
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const t = T[theme];

  useEffect(() => {
    let abort = false;
    setLoading(true);
    setErr(null);
    const url = `${window.location.origin}/api/history/${symbol}?range=${range}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then((j) => {
        if (abort) return;
        setData(Array.isArray(j.points) ? j.points : []);
        setLoading(false);
      })
      .catch((e) => {
        if (abort) return;
        setErr(String(e));
        setLoading(false);
      });
    return () => {
      abort = true;
    };
  }, [symbol, range]);

  const isTodayUp = todayChangePct >= 0;
  const todayColor = isTodayUp ? t.up : t.down;
  const todayBg = isTodayUp ? t.upBg : t.downBg;

  const rangeStats = useMemo(() => {
    if (!data || data.length < 2) return null;
    const first = data[0]!.c;
    const last = data[data.length - 1]!.c;
    const prices = data.map((d) => d.c);
    const hi = Math.max(...prices);
    const lo = Math.min(...prices);
    const diff = last - first;
    const pct = first ? (diff / first) * 100 : 0;
    return { first, last, hi, lo, diff, pct };
  }, [data]);

  const rangeUp = rangeStats ? rangeStats.diff >= 0 : true;
  const rangeColor = rangeUp ? t.up : t.down;

  const symFmt = (v: number) =>
    type === "gold"
      ? `${formatPrice(v)} ₺`
      : `₺${formatPrice(v)}`;

  return (
    <PhoneShell theme={theme}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 18px 6px",
          borderBottom: `1px solid ${t.hairline}`,
        }}
      >
        <button
          aria-label="Geri"
          style={{
            width: 36, height: 36, borderRadius: 12, background: t.pillBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", cursor: "pointer", color: t.ink,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L3.5 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, color: t.muted }}>
            {type === "gold" ? "ALTIN" : "DÖVİZ"}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.ink, marginTop: 1, letterSpacing: -0.2 }}>
            {symbol}
          </div>
        </div>
        <button
          aria-label="Favori"
          style={{
            width: 36, height: 36, borderRadius: 12, background: t.pillBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", cursor: "pointer", color: t.ink, marginRight: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5l1.7 3.5 3.8.55-2.75 2.7.65 3.8L7 10.25 3.6 12.05l.65-3.8L1.5 5.55 5.3 5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          aria-label="Alarm"
          style={{
            width: 36, height: 36, borderRadius: 12, background: t.pillBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", cursor: "pointer", color: t.ink,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5v1M3 11h8M3.5 11l.7-3.5a2.8 2.8 0 015.6 0l.7 3.5M5.7 12.5a1.4 1.4 0 002.6 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Hero */}
      <div style={{ padding: "22px 18px 18px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: t.ink, letterSpacing: -0.4, lineHeight: 1.15 }}>
          {nameTR}
        </div>
        <div style={{ fontSize: 12, color: t.muted, marginTop: 4, letterSpacing: -0.05 }}>
          {description}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 38,
            fontWeight: 700,
            color: t.ink,
            marginTop: 18,
            letterSpacing: -1.2,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {symFmt(buy)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11.5, fontWeight: 700, color: todayColor,
              padding: "3px 8px", borderRadius: 6, background: todayBg,
              fontFamily: MONO, fontVariantNumeric: "tabular-nums",
              letterSpacing: -0.1,
            }}
          >
            {isTodayUp ? "▲" : "▼"} {Math.abs(todayChangePct).toFixed(2)}%
            <span style={{ opacity: 0.7, marginLeft: 2 }}>
              ({isTodayUp ? "+" : "−"}{Math.abs(todayChange).toFixed(2)})
            </span>
          </span>
          <span style={{ fontSize: 11, color: t.muted, letterSpacing: 0.2 }}>BUGÜN</span>
        </div>
      </div>

      {/* Range picker */}
      <div
        style={{
          display: "flex", padding: "0 18px 12px", gap: 0,
          borderBottom: `1px solid ${t.hairline}`,
        }}
      >
        <div
          style={{
            display: "flex", flex: 1,
            background: t.chip, borderRadius: 10, padding: 3,
          }}
        >
          {RANGES.map((r) => {
            const on = range === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                style={{
                  flex: 1, padding: "6px 0", border: "none",
                  background: on ? t.surface : "transparent",
                  borderRadius: 8, cursor: "pointer",
                  fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6,
                  color: on ? t.ink : t.muted,
                  boxShadow: on
                    ? theme === "light"
                      ? "0 1px 3px rgba(15,23,42,0.10)"
                      : "0 1px 3px rgba(0,0,0,0.5)"
                    : "none",
                  transition: "all 120ms ease",
                  fontFamily: SANS,
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Range header + chart */}
      <div style={{ padding: "16px 18px 6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, color: t.muted }}>
            {RANGE_TITLE[range].toUpperCase()}
          </span>
          {rangeStats ? (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                fontWeight: 700,
                color: rangeColor,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: -0.2,
              }}
            >
              {rangeUp ? "+" : "−"}%{Math.abs(rangeStats.pct).toFixed(2)}
              <span style={{ color: t.muted, fontWeight: 500, marginLeft: 6 }}>
                ({rangeUp ? "+" : "−"}{formatTick(Math.abs(rangeStats.diff))})
              </span>
            </span>
          ) : null}
        </div>
        <div style={{ minHeight: H, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {loading ? (
            <div
              style={{
                width: 22, height: 22, borderRadius: "50%",
                border: `2px solid ${t.hairlineStrong}`,
                borderTopColor: t.ink, animation: "spin 0.8s linear infinite",
              }}
            />
          ) : err ? (
            <span style={{ fontSize: 12, color: t.muted }}>Veri yüklenemedi</span>
          ) : (
            <ChartSvg data={data} range={range} t={t} />
          )}
        </div>
      </div>

      {/* Range stats row */}
      {rangeStats ? (
        <div
          style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            padding: "10px 18px 18px",
            borderBottom: `1px solid ${t.hairline}`,
          }}
        >
          {[
            { label: "BAŞLANGIÇ", value: formatTick(rangeStats.first), color: t.ink },
            { label: "EN YÜKSEK", value: formatTick(rangeStats.hi), color: t.up },
            { label: "EN DÜŞÜK", value: formatTick(rangeStats.lo), color: t.down },
            { label: "DEĞİŞİM", value: `${rangeUp ? "+" : "−"}%${Math.abs(rangeStats.pct).toFixed(2)}`, color: rangeColor },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.1, color: t.muted }}>
                {s.label}
              </span>
              <span
                style={{
                  fontFamily: MONO, fontSize: 13, fontWeight: 700, color: s.color,
                  fontVariantNumeric: "tabular-nums", letterSpacing: -0.3,
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Price details */}
      <div style={{ padding: "20px 18px 8px" }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, color: t.muted, marginBottom: 14 }}>
          FİYAT DETAYLARI
        </div>
        {[
          { label: "Alış", value: symFmt(buy), color: t.ink },
          { label: "Satış", value: symFmt(sell), color: t.ink },
          { label: "Alış / Satış Farkı", value: symFmt(sell - buy), color: t.inkSoft },
          { label: "Önceki Kapanış", value: symFmt(prevClose), color: t.inkSoft },
          { label: "Günlük Değişim", value: `${isTodayUp ? "+" : "−"}${Math.abs(todayChange).toFixed(2)}`, color: todayColor },
          { label: "Günlük Değişim (%)", value: `${isTodayUp ? "+" : "−"}%${Math.abs(todayChangePct).toFixed(2)}`, color: todayColor },
        ].map((row, i, a) => (
          <div
            key={row.label}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "11px 0",
              borderBottom: i === a.length - 1 ? "none" : `1px solid ${t.hairline}`,
            }}
          >
            <span style={{ fontSize: 13, color: t.muted, letterSpacing: -0.1 }}>{row.label}</span>
            <span
              style={{
                fontFamily: MONO, fontSize: 13, fontWeight: 700, color: row.color,
                fontVariantNumeric: "tabular-nums", letterSpacing: -0.2,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Alarm CTA */}
      <div style={{ padding: "16px 18px 24px" }}>
        <button
          style={{
            width: "100%", padding: "14px 16px", border: "none",
            background: t.chipActive, color: t.chipActiveText,
            borderRadius: 14, cursor: "pointer",
            fontSize: 13.5, fontWeight: 700, letterSpacing: 0.2,
            fontFamily: SANS,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5v1M3 11h8M3.5 11l.7-3.5a2.8 2.8 0 015.6 0l.7 3.5M5.7 12.5a1.4 1.4 0 002.6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Fiyat Alarmı Kur
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PhoneShell>
  );
}
