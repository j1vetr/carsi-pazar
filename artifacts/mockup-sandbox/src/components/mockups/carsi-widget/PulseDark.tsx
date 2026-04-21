import { RefreshCw } from "lucide-react";

const ROWS = [
  { code: "USD",   price: "34,2180", pct: "+0,42", dir: "up",   tint: "#60A5FA" },
  { code: "EUR",   price: "37,1045", pct: "+0,18", dir: "up",   tint: "#2DD4BF" },
  { code: "GRAM",  price: "2.856,90", pct: "-0,07", dir: "down", tint: "#F59E0B" },
  { code: "ÇEYREK", price: "4.712,00", pct: "+0,31", dir: "up",  tint: "#FB7185" },
];

export function PulseDark() {
  return (
    <div className="min-h-[260px] w-full flex items-center justify-center p-6"
         style={{
           background:
             "radial-gradient(900px 360px at 18% 15%, #1E2A4A 0%, transparent 55%), radial-gradient(800px 340px at 90% 88%, #3B1D3A 0%, transparent 58%), linear-gradient(180deg,#05070E 0%,#0A0F1C 100%)",
         }}>
      <div className="relative w-[820px] h-[130px] rounded-[30px] overflow-hidden"
           style={{
             background:
               "linear-gradient(180deg,rgba(20,27,45,0.88) 0%,rgba(12,17,30,0.94) 100%)",
             backdropFilter: "blur(20px)",
             boxShadow:
               "0 1px 0 rgba(255,255,255,0.08) inset, 0 0 0 1px rgba(255,255,255,0.06), 0 32px 56px -20px rgba(0,0,0,0.6), 0 8px 18px -10px rgba(0,0,0,0.4)",
           }}>
        {/* brand strip */}
        <div className="absolute left-0 top-0 bottom-0 w-[110px] flex flex-col items-start justify-center pl-5"
             style={{ background: "linear-gradient(135deg,#1E3A8A 0%,#0F172A 100%)" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-semibold tracking-[0.18em] text-emerald-300/90">CANLI</span>
          </div>
          <div className="text-white text-[14px] font-['Inter'] font-extrabold tracking-tight leading-none">ÇARŞI</div>
          <div className="text-white/60 text-[9px] font-medium tracking-[0.22em] mt-0.5">PİYASA</div>
        </div>

        {/* cells */}
        <div className="absolute left-[110px] right-[78px] top-0 bottom-0 flex items-stretch">
          {ROWS.map((r, i) => {
            const up = r.dir === "up";
            return (
              <div key={r.code}
                   className="flex-1 flex flex-col justify-center px-3 relative"
                   style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1 h-3 rounded-sm" style={{ background: r.tint }} />
                  <span className="text-[9.5px] font-bold tracking-[0.12em] text-slate-400">{r.code}</span>
                </div>
                <div className="text-[17px] font-['JetBrains_Mono'] font-bold text-white leading-none tabular-nums">
                  {r.price}
                </div>
                <div className="mt-1.5 inline-flex items-center w-fit gap-1 px-1.5 py-0.5 rounded-md"
                     style={{
                       background: up ? "rgba(34,197,94,0.15)" : "rgba(248,113,113,0.15)",
                       color: up ? "#4ADE80" : "#FCA5A5",
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
              background: "linear-gradient(180deg,#3B82F6 0%,#1D4ED8 100%)",
              boxShadow: "0 8px 18px -4px rgba(59,130,246,0.55), 0 0 0 1px rgba(255,255,255,0.1) inset",
            }}>
            <RefreshCw className="w-4 h-4 text-white" strokeWidth={2.4} />
          </button>
          <div className="text-[8.5px] font-semibold tracking-wider text-slate-400 tabular-nums leading-none">14:32</div>
        </div>
      </div>
    </div>
  );
}
