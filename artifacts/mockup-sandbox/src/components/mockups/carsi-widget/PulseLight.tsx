import { RefreshCw } from "lucide-react";

const ROWS = [
  { code: "USD",   price: "34,2180", pct: "+0,42", dir: "up",   tint: "#1E40AF" },
  { code: "EUR",   price: "37,1045", pct: "+0,18", dir: "up",   tint: "#0F766E" },
  { code: "GRAM",  price: "2.856,90", pct: "-0,07", dir: "down", tint: "#B45309" },
  { code: "ÇEYREK", price: "4.712,00", pct: "+0,31", dir: "up",  tint: "#9F1239" },
];

export function PulseLight() {
  return (
    <div className="min-h-[260px] w-full flex items-center justify-center p-6"
         style={{
           background:
             "radial-gradient(1100px 400px at 15% 10%, #E8F0FE 0%, transparent 55%), radial-gradient(900px 380px at 90% 90%, #FFE8D8 0%, transparent 55%), linear-gradient(180deg,#F5F7FB 0%,#ECEFF6 100%)",
         }}>
      <div className="relative w-[820px] h-[130px] rounded-[30px] overflow-hidden"
           style={{
             background: "linear-gradient(180deg,#FFFFFF 0%,#F7F9FC 100%)",
             boxShadow:
               "0 1px 0 rgba(255,255,255,0.9) inset, 0 0 0 1px rgba(15,23,42,0.06), 0 24px 48px -18px rgba(15,23,42,0.22), 0 6px 14px -8px rgba(15,23,42,0.12)",
           }}>
        {/* brand strip */}
        <div className="absolute left-0 top-0 bottom-0 w-[110px] flex flex-col items-start justify-center pl-5"
             style={{ background: "linear-gradient(135deg,#0B1220 0%,#1E293B 100%)" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-semibold tracking-[0.18em] text-emerald-300/90">CANLI</span>
          </div>
          <div className="text-white text-[14px] font-['Inter'] font-extrabold tracking-tight leading-none">ÇARŞI</div>
          <div className="text-white/55 text-[9px] font-medium tracking-[0.22em] mt-0.5">PİYASA</div>
        </div>

        {/* cells */}
        <div className="absolute left-[110px] right-[78px] top-0 bottom-0 flex items-stretch">
          {ROWS.map((r, i) => {
            const up = r.dir === "up";
            return (
              <div key={r.code}
                   className="flex-1 flex flex-col justify-center px-3 relative"
                   style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(15,23,42,0.06)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1 h-3 rounded-sm" style={{ background: r.tint }} />
                  <span className="text-[9.5px] font-bold tracking-[0.12em] text-slate-600">{r.code}</span>
                </div>
                <div className="text-[17px] font-['JetBrains_Mono'] font-bold text-slate-900 leading-none tabular-nums">
                  {r.price}
                </div>
                <div className="mt-1.5 inline-flex items-center w-fit gap-1 px-1.5 py-0.5 rounded-md"
                     style={{
                       background: up ? "rgba(22,163,74,0.10)" : "rgba(220,38,38,0.10)",
                       color: up ? "#15803D" : "#B91C1C",
                     }}>
                  <span className="text-[9px] leading-none">{up ? "▲" : "▼"}</span>
                  <span className="text-[9.5px] font-bold tabular-nums leading-none">{r.pct.replace("+","").replace("-","")}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* refresh capsule */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "linear-gradient(180deg,#0B1220 0%,#1E293B 100%)",
              boxShadow: "0 6px 14px -4px rgba(15,23,42,0.35), 0 0 0 1px rgba(255,255,255,0.05) inset",
            }}>
            <RefreshCw className="w-4 h-4 text-white" strokeWidth={2.4} />
          </button>
          <div className="text-[8.5px] font-semibold tracking-wider text-slate-500 tabular-nums leading-none">14:32</div>
        </div>
      </div>
    </div>
  );
}
