import { RefreshCw } from "lucide-react";

const ROWS = [
  { code: "USD",    price: "34,2180", pct: "0,42", dir: "up",   tint: "#1D4ED8" },
  { code: "EUR",    price: "37,1045", pct: "0,18", dir: "up",   tint: "#0F766E" },
  { code: "GRAM",   price: "2.856,90", pct: "0,07", dir: "down", tint: "#B45309" },
  { code: "ÇEYREK", price: "4.712,00", pct: "0,31", dir: "up",   tint: "#BE123C" },
];

export function PulseLight() {
  return (
    <div className="min-h-[260px] w-full flex items-center justify-center p-6"
         style={{
           background:
             "radial-gradient(1100px 400px at 15% 10%, #E8F0FE 0%, transparent 55%), radial-gradient(900px 380px at 90% 90%, #FFE8D8 0%, transparent 55%), linear-gradient(180deg,#F5F7FB 0%,#ECEFF6 100%)",
         }}>
      <div className="relative w-[860px] h-[156px] rounded-[32px] overflow-hidden flex items-stretch"
           style={{
             background: "linear-gradient(180deg,#FFFFFF 0%,#F7F9FC 100%)",
             boxShadow:
               "0 1px 0 rgba(255,255,255,0.9) inset, 0 0 0 1px rgba(15,23,42,0.07), 0 32px 64px -24px rgba(15,23,42,0.28), 0 10px 22px -12px rgba(15,23,42,0.14)",
           }}>
        {/* LOGO */}
        <div className="flex items-center justify-center pl-7 pr-5 shrink-0">
          <img src="/__mockup/brand/logo-dark.png"
               alt="Çarşı Piyasa"
               className="h-[44px] w-auto"
               style={{ filter: "drop-shadow(0 1px 2px rgba(15,23,42,0.08))" }} />
        </div>

        {/* divider */}
        <div className="w-px my-5" style={{ background: "linear-gradient(180deg,transparent,rgba(15,23,42,0.12),transparent)" }} />

        {/* CELLS */}
        <div className="flex-1 flex items-stretch">
          {ROWS.map((r, i) => {
            const up = r.dir === "up";
            return (
              <div key={r.code}
                   className="flex-1 flex flex-col justify-center px-4 relative"
                   style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(15,23,42,0.06)" }}>
                {/* colored accent bar */}
                <div className="absolute left-4 top-6 bottom-6 w-[3px] rounded-full"
                     style={{ background: r.tint, boxShadow: `0 0 12px ${r.tint}66` }} />
                <div className="pl-3">
                  <div className="text-[10px] font-bold tracking-[0.14em] text-slate-500 mb-1.5">{r.code}</div>
                  <div className="text-[21px] font-['JetBrains_Mono'] font-extrabold text-slate-900 leading-none tabular-nums">
                    {r.price}
                  </div>
                  <div className="mt-2 inline-flex items-center w-fit gap-1 px-1.5 py-[3px] rounded-md"
                       style={{
                         background: up ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
                         color: up ? "#15803D" : "#B91C1C",
                       }}>
                    <span className="text-[10px] leading-none">{up ? "▲" : "▼"}</span>
                    <span className="text-[10.5px] font-bold tabular-nums leading-none">{r.pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* REFRESH */}
        <div className="flex flex-col items-center justify-center gap-2 px-5 shrink-0">
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "linear-gradient(180deg,#0B1220 0%,#1E293B 100%)",
              boxShadow:
                "0 10px 20px -6px rgba(15,23,42,0.4), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.08) inset",
            }}>
            <RefreshCw className="w-5 h-5 text-white" strokeWidth={2.4} />
          </button>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="text-[9.5px] font-semibold tracking-wider text-slate-500 tabular-nums leading-none">14:32</span>
          </div>
        </div>
      </div>
    </div>
  );
}
