import { RefreshCw } from "lucide-react";

const ROWS = [
  { code: "USD",    price: "34,2180", pct: "0,42", dir: "up",   tint: "#60A5FA" },
  { code: "EUR",    price: "37,1045", pct: "0,18", dir: "up",   tint: "#2DD4BF" },
  { code: "GRAM",   price: "2.856,90", pct: "0,07", dir: "down", tint: "#F59E0B" },
  { code: "ÇEYREK", price: "4.712,00", pct: "0,31", dir: "up",   tint: "#FB7185" },
];

export function PulseDark() {
  return (
    <div className="min-h-[260px] w-full flex items-center justify-center p-6"
         style={{
           background:
             "radial-gradient(900px 360px at 18% 15%, #1E2A4A 0%, transparent 55%), radial-gradient(800px 340px at 90% 88%, #3B1D3A 0%, transparent 58%), linear-gradient(180deg,#05070E 0%,#0A0F1C 100%)",
         }}>
      <div className="relative w-[860px] h-[156px] rounded-[32px] overflow-hidden flex items-stretch"
           style={{
             background: "linear-gradient(180deg,rgba(22,29,48,0.92) 0%,rgba(12,17,30,0.96) 100%)",
             backdropFilter: "blur(24px)",
             boxShadow:
               "0 1px 0 rgba(255,255,255,0.09) inset, 0 0 0 1px rgba(255,255,255,0.07), 0 38px 68px -22px rgba(0,0,0,0.7), 0 12px 22px -12px rgba(0,0,0,0.5)",
           }}>
        {/* LOGO */}
        <div className="flex items-center justify-center pl-7 pr-5 shrink-0">
          <img src="/__mockup/brand/logo-dark.png"
               alt="Çarşı Piyasa"
               className="h-[34px] w-auto"
               style={{ filter: "drop-shadow(0 2px 8px rgba(96,165,250,0.25))" }} />
        </div>

        {/* divider */}
        <div className="w-px my-5" style={{ background: "linear-gradient(180deg,transparent,rgba(255,255,255,0.14),transparent)" }} />

        {/* CELLS */}
        <div className="flex-1 flex items-stretch">
          {ROWS.map((r, i) => {
            const up = r.dir === "up";
            return (
              <div key={r.code}
                   className="flex-1 flex flex-col justify-center px-4 relative"
                   style={{ borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.07)" }}>
                <div className="absolute left-4 top-6 bottom-6 w-[3px] rounded-full"
                     style={{ background: r.tint, boxShadow: `0 0 14px ${r.tint}aa` }} />
                <div className="pl-3">
                  <div className="text-[10px] font-bold tracking-[0.14em] text-slate-400 mb-1.5">{r.code}</div>
                  <div className="text-[21px] font-['JetBrains_Mono'] font-extrabold text-white leading-none tabular-nums">
                    {r.price}
                  </div>
                  <div className="mt-2 inline-flex items-center w-fit gap-1 px-1.5 py-[3px] rounded-md"
                       style={{
                         background: up ? "rgba(34,197,94,0.18)" : "rgba(248,113,113,0.18)",
                         color: up ? "#4ADE80" : "#FCA5A5",
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
              background: "linear-gradient(180deg,#3B82F6 0%,#1D4ED8 100%)",
              boxShadow:
                "0 12px 24px -6px rgba(59,130,246,0.6), 0 0 0 1px rgba(255,255,255,0.12) inset, 0 1px 0 rgba(255,255,255,0.18) inset",
            }}>
            <RefreshCw className="w-5 h-5 text-white" strokeWidth={2.4} />
          </button>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9.5px] font-semibold tracking-wider text-slate-400 tabular-nums leading-none">14:32</span>
          </div>
        </div>
      </div>
    </div>
  );
}
