import { ChevronDown, RefreshCw } from "lucide-react";

const ROWS = [
  { code: "USD", glyph: "$",  price: "41,9120", pct: 0.34, tint: "#1D4ED8" },
  { code: "EUR", glyph: "€",  price: "47,3088", pct: -0.18, tint: "#0F766E" },
  { code: "GRAM", glyph: "Au", price: "5.412,80", pct: 0.42, tint: "#B45309" },
  { code: "ÇEYREK", glyph: "¼", price: "8.960,00", pct: 0.21, tint: "#BE123C" },
];

export function NotifShellA() {
  return (
    <div
      className="min-h-screen w-full flex items-start justify-center pt-10 pb-10"
      style={{
        background:
          "linear-gradient(180deg,#0A0F1E 0%,#10172A 38%,#0B1224 100%)",
      }}
    >
      <div className="w-[420px]">
        {/* status bar imitation */}
        <div className="flex items-center justify-between px-5 pb-4 text-[12px] text-white/60 font-medium">
          <span>09:41</span>
          <span>Pzt 21 Nis</span>
        </div>

        {/* notification card */}
        <div
          className="rounded-[28px] overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* header */}
          <div className="flex items-center px-4 pt-3 pb-2 gap-2">
            <img
              src="/brand/logo-light.png"
              alt="Çarşı Piyasa"
              className="w-5 h-5 rounded-[6px] object-contain"
            />
            <span className="text-[12px] font-semibold text-white/85">Çarşı Piyasa</span>
            <span className="text-[11px] text-white/40">·</span>
            <span className="text-[11px] text-white/45">Canlı</span>
            <span className="text-[11px] text-white/40">·</span>
            <span className="text-[11px] text-white/45">09:41</span>
            <div className="ml-auto flex items-center gap-2 text-white/55">
              <ChevronDown size={14} />
            </div>
          </div>

          {/* horizontal strip — 4 cells */}
          <div className="px-3 pb-3">
            <div className="grid grid-cols-4 gap-2">
              {ROWS.map((r) => {
                const up = r.pct > 0;
                const arrow = up ? "▲" : "▼";
                return (
                  <div
                    key={r.code}
                    className="rounded-[14px] px-2.5 py-2.5 flex flex-col items-start"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                        style={{ background: r.tint + "33", color: "#fff" }}
                      >
                        {r.glyph}
                      </span>
                      <span className="text-[10.5px] font-bold tracking-wide text-white/75">
                        {r.code}
                      </span>
                    </div>
                    <div
                      className="mt-1.5 text-[13.5px] font-bold text-white"
                      style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}
                    >
                      {r.price}
                    </div>
                    <div
                      className="mt-0.5 text-[10.5px] font-bold"
                      style={{
                        color: up ? "#4ADE80" : "#F87171",
                        fontFeatureSettings: '"tnum" on, "lnum" on',
                      }}
                    >
                      {arrow} %{Math.abs(r.pct).toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* footer micro-actions */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center text-[10.5px] text-white/45 font-medium">
                <span>Her 1–2 dakikada bir yenilenir.</span>
              </div>
              <button
                className="flex items-center gap-1 text-[11px] font-semibold text-white/85 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <RefreshCw size={11} />
                <span>Yenile</span>
              </button>
            </div>
          </div>
        </div>

        {/* caption */}
        <div className="mt-4 px-2 text-center text-[11px] text-white/45 font-medium">
          Varyant A · Pulse Strip — 4 hücre yatay
        </div>
      </div>
    </div>
  );
}
