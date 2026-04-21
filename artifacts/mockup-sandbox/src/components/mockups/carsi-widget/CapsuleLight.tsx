import { RotateCw } from "lucide-react";

const ROWS = [
  { code: "USD",    nameTR: "Dolar",     buy: "34,2050", sell: "34,2180", pct: "+0,42", dir: "up",   spark: [3, 5, 4, 7, 6, 9, 8, 11] },
  { code: "EUR",    nameTR: "Euro",      buy: "37,0810", sell: "37,1045", pct: "+0,18", dir: "up",   spark: [6, 5, 6, 8, 7, 9, 8, 10] },
  { code: "GRAM",   nameTR: "Gram Altın", buy: "2.855,40", sell: "2.856,90", pct: "-0,07", dir: "down", spark: [10, 9, 11, 8, 9, 7, 8, 7] },
  { code: "ÇEYREK", nameTR: "Çeyrek",    buy: "4.710,00", sell: "4.712,00", pct: "+0,31", dir: "up",   spark: [4, 6, 5, 7, 8, 7, 9, 10] },
];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 46, h = 14;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="overflow-visible">
      <polyline points={pts} stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CapsuleLight() {
  return (
    <div className="min-h-[260px] w-full flex items-center justify-center p-6"
         style={{
           background:
             "radial-gradient(700px 280px at 20% 10%, #FDF4E3 0%, transparent 60%), radial-gradient(800px 320px at 85% 90%, #EDE4D3 0%, transparent 60%), linear-gradient(180deg,#F3EDE1 0%,#E7DFD0 100%)",
         }}>
      <div className="relative w-[820px] h-[140px] rounded-full"
           style={{
             background: "linear-gradient(180deg,#FFFBF2 0%,#FAF5E9 100%)",
             boxShadow:
               "0 1px 0 rgba(255,255,255,0.8) inset, 0 0 0 1px rgba(120,96,56,0.12), 0 18px 36px -14px rgba(90,70,40,0.22)",
           }}>
        {/* header row inside capsule */}
        <div className="absolute left-8 top-[18px] flex items-center gap-2">
          <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center"
               style={{ background: "linear-gradient(135deg,#D4A44C 0%,#8A6420 100%)" }}>
            <span className="text-white text-[11px] font-bold font-['Playfair_Display']">Ç</span>
          </div>
          <div className="leading-none">
            <div className="text-[12px] font-['Playfair_Display'] italic font-semibold text-stone-800">Çarşı Piyasa</div>
            <div className="text-[8px] tracking-[0.25em] text-stone-500 mt-0.5 font-medium">CANLI PANO</div>
          </div>
        </div>

        {/* timestamp + refresh on right */}
        <div className="absolute right-6 top-[20px] flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="text-[9px] tracking-wider text-stone-500 tabular-nums">14:32 · az önce</span>
          </div>
          <button className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{ background: "rgba(120,96,56,0.08)", border: "1px solid rgba(120,96,56,0.15)" }}>
            <RotateCw className="w-3.5 h-3.5 text-stone-700" strokeWidth={2} />
          </button>
        </div>

        {/* 4 cells */}
        <div className="absolute left-8 right-8 bottom-[16px] flex items-end">
          {ROWS.map((r, i) => {
            const up = r.dir === "up";
            const color = up ? "#0E8F4E" : "#B23A2B";
            return (
              <div key={r.code}
                   className="flex-1 flex flex-col relative pl-4"
                   style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(120,96,56,0.14)" }}>
                <div className="flex items-center justify-between pr-3 mb-1">
                  <span className="text-[9px] font-semibold tracking-[0.14em] text-stone-500 uppercase">{r.nameTR}</span>
                  <Sparkline data={r.spark} color={color} />
                </div>
                <div className="text-[19px] font-['Playfair_Display'] font-semibold text-stone-900 leading-none tabular-nums">
                  {r.sell}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-[9px] font-medium text-stone-500 tabular-nums">{r.buy}</span>
                  <span className="text-[9px] tabular-nums font-semibold" style={{ color }}>
                    {up ? "▲" : "▼"} {r.pct.replace("+","").replace("-","")}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
