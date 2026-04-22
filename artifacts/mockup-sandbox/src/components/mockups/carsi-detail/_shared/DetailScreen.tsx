import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Star,
  Bell,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type Range = "1H" | "1A" | "1Y" | "5Y";
type Point = { t: string; c: number };

const RANGES: Range[] = ["1H", "1A", "1Y", "5Y"];

export interface DetailScreenProps {
  symbol: string;
  nameTR: string;
  description: string;
  buy: number;
  sell: number;
  change: number;
  changePercent: number;
  prevClose: number;
  type: "currency" | "gold";
  iconText: string;
  iconBg: string;
}

const W = 360;
const H = 200;
const PAD = { top: 12, right: 8, bottom: 28, left: 56 };

function formatTick(v: number) {
  if (v >= 10000) return v.toFixed(0);
  if (v >= 100) return v.toFixed(1);
  if (v >= 10) return v.toFixed(2);
  return v.toFixed(4);
}

function formatXLabel(iso: string, range: Range) {
  const d = new Date(iso);
  if (range === "5Y" || range === "1Y") {
    return `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
  }
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatPrice(p: number) {
  if (p >= 10000)
    return p.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  return p.toFixed(4);
}

function PriceChart({ data, range }: { data: Point[]; range: Range }) {
  const chart = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: "", fill: "", grid: [], xLabels: [], first: 0, last: 0, hi: 0, lo: 0 };
    }
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

    const idxs = [0, Math.floor(prices.length / 4), Math.floor(prices.length / 2), Math.floor((3 * prices.length) / 4), prices.length - 1];
    const xLabels = idxs.map((i) => ({ x: toX(i), label: formatXLabel(data[i]!.t, range) }));

    return { path: pathD, fill: fillD, grid, xLabels, first: prices[0]!, last: prices[prices.length - 1]!, hi: maxP, lo: minP };
  }, [data, range]);

  const isPositive = chart.last >= chart.first;
  const lineColor = isPositive ? "#16a34a" : "#dc2626";
  const changePct = chart.first ? ((chart.last - chart.first) / chart.first) * 100 : 0;

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ height: H }}>
        <span className="text-xs text-zinc-400">Veri yok</span>
      </div>
    );
  }

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="block mx-auto">
        <defs>
          <linearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.22} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        {chart.grid.map((g, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={g.y} x2={W - PAD.right} y2={g.y} stroke="#e4e4e7" strokeWidth={0.5} strokeDasharray="3,3" />
            <text x={PAD.left - 4} y={g.y + 3} fontSize={9} fill="#a1a1aa" textAnchor="end">{g.label}</text>
          </g>
        ))}
        {chart.xLabels.map((l, i) => (
          <text key={i} x={l.x} y={H - 6} fontSize={9} fill="#a1a1aa" textAnchor="middle">{l.label}</text>
        ))}
        <path d={chart.fill} fill="url(#pcGrad)" />
        <path d={chart.path} stroke={lineColor} strokeWidth={2} fill="none" />
      </svg>
      <div className="flex justify-around mt-3">
        {[
          { label: "BAŞLANGIÇ", value: formatTick(chart.first), color: "#0f172a" },
          { label: "EN YÜKSEK", value: formatTick(chart.hi), color: "#16a34a" },
          { label: "EN DÜŞÜK", value: formatTick(chart.lo), color: "#dc2626" },
          { label: "DEĞİŞİM", value: `${isPositive ? "+" : ""}${changePct.toFixed(2)}%`, color: lineColor },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center">
            <span className="text-[9px] tracking-wider text-zinc-400 font-medium">{s.label}</span>
            <span className="text-[13px] font-semibold mt-0.5" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailScreen(props: DetailScreenProps) {
  const { symbol, nameTR, description, buy, sell, change, changePercent, prevClose, type, iconText, iconBg } = props;
  const [range, setRange] = useState<Range>("1A");
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [fav, setFav] = useState(false);

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

  const isPositive = changePercent >= 0;
  const changeColor = isPositive ? "#16a34a" : "#dc2626";
  const spread = sell - buy;

  const goldHeader = type === "gold";
  const headerStyle: React.CSSProperties = goldHeader
    ? { background: "linear-gradient(180deg, #0B3D91 0%, #1E5BC6 100%)" }
    : { background: "#fafafa", borderBottom: "1px solid #e4e4e7" };
  const headerFg = goldHeader ? "#FFFFFF" : "#0f172a";
  const headerMuted = goldHeader ? "rgba(255,255,255,0.7)" : "#71717a";
  const pillBg = goldHeader ? "rgba(255,255,255,0.18)" : `${changeColor}15`;
  const pillFg = goldHeader ? "#FFFFFF" : changeColor;

  return (
    <div className="min-h-screen w-full bg-white font-['Inter']">
      {/* Header */}
      <div style={headerStyle} className="px-5 pt-3 pb-4">
        <div className="flex items-center mb-5">
          <button className="p-2 -ml-2"><ArrowLeft size={22} color={headerFg} /></button>
          <div className="flex-1" />
          <button onClick={() => setFav((f) => !f)} className="p-2">
            <Star size={22} color={fav ? "#F59E0B" : headerFg} fill={fav ? "#F59E0B" : "none"} />
          </button>
          <button className="p-2"><Bell size={22} color={headerFg} /></button>
        </div>
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: iconBg }}
          >
            {iconText}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[22px] font-bold leading-tight tracking-tight truncate" style={{ color: headerFg }}>{nameTR}</div>
            <div className="text-[13px] mt-0.5" style={{ color: headerMuted }}>{description}</div>
          </div>
        </div>
        <div className="text-[38px] font-bold mt-4 tracking-tight leading-none" style={{ color: headerFg }}>
          ₺{formatPrice(buy)}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: pillBg }}
          >
            {isPositive ? <TrendingUp size={14} color={pillFg} /> : <TrendingDown size={14} color={pillFg} />}
            <span className="text-[13px] font-semibold" style={{ color: pillFg }}>
              {isPositive ? "+" : ""}{changePercent.toFixed(2)}% ({isPositive ? "+" : ""}{change.toFixed(2)})
            </span>
          </div>
          <span className="text-[12px]" style={{ color: headerMuted }}>Bugün</span>
        </div>
      </div>

      {/* Chart card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-zinc-200">
        <div className="text-[13px] font-semibold text-zinc-500 mb-3 tracking-wider">GEÇMİŞ FİYAT</div>
        <div className="flex justify-center gap-1.5 mb-3">
          {RANGES.map((p) => {
            const active = range === p;
            return (
              <button
                key={p}
                onClick={() => setRange(p)}
                className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors"
                style={{
                  background: active ? `${changeColor}20` : "#f4f4f5",
                  color: active ? changeColor : "#71717a",
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: H }}>
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
          </div>
        ) : err ? (
          <div className="flex items-center justify-center" style={{ height: H }}>
            <span className="text-[13px] text-zinc-400">Veri yüklenemedi</span>
          </div>
        ) : (
          <PriceChart data={data} range={range} />
        )}
      </div>

      {/* Price details card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-zinc-200">
        <div className="text-[13px] font-semibold text-zinc-500 mb-3 tracking-wider">FİYAT DETAYLARI</div>
        {[
          { label: "Alış", value: formatPrice(buy), color: "#16a34a" },
          { label: "Satış", value: formatPrice(sell), color: "#dc2626" },
          { label: "Alış / Satış Farkı", value: formatPrice(spread), color: "#0f172a" },
          { label: "Önceki Kapanış", value: formatPrice(prevClose), color: "#0f172a" },
          { label: "Değişim (₺)", value: `${isPositive ? "+" : ""}${change.toFixed(2)}`, color: changeColor },
          { label: "Değişim (%)", value: `${isPositive ? "+" : ""}${changePercent.toFixed(2)}%`, color: changeColor },
        ].map((row, i, a) => (
          <div
            key={row.label}
            className="flex justify-between py-2.5"
            style={{ borderBottom: i === a.length - 1 ? "none" : "1px solid #e4e4e7" }}
          >
            <span className="text-[14px] text-zinc-500">{row.label}</span>
            <span className="text-[14px] font-semibold" style={{ color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Alarm CTA */}
      <button className="mx-4 mt-4 mb-6 w-[calc(100%-2rem)] bg-zinc-900 text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-[15px]">
        <Bell size={20} />
        Fiyat Alarmı Kur
      </button>
    </div>
  );
}
