import { ChevronDown, RefreshCw } from "lucide-react";

const ROWS = [
  { code: "USD", name: "Dolar",   glyph: "$",  price: "41,9120", pct: 0.34, tint: "#1D4ED8" },
  { code: "EUR", name: "Euro",    glyph: "€",  price: "47,3088", pct: -0.18, tint: "#0F766E" },
  { code: "GRAM", name: "Gram Altın", glyph: "Au", price: "5.412,80", pct: 0.42, tint: "#B45309" },
  { code: "ÇEYREK", name: "Çeyrek", glyph: "¼", price: "8.960,00", pct: 0.21, tint: "#BE123C" },
];

export function NotifShellB() {
  return (
    <div
      className="min-h-screen w-full flex items-start justify-center pt-10 pb-10"
      style={{
        background:
          "linear-gradient(180deg,#0A0F1E 0%,#10172A 38%,#0B1224 100%)",
      }}
    >
      <div className="w-[420px]">
        <div className="flex items-center justify-between px-5 pb-4 text-[12px] text-white/60 font-medium">
          <span>09:41</span>
          <span>Pzt 21 Nis</span>
        </div>

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
            <div
              className="w-5 h-5 rounded-[6px] flex items-center justify-center text-[10px] font-bold"
              style={{ background: "#0B3D91", color: "#fff" }}
            >
              ÇP
            </div>
            <span className="text-[12px] font-semibold text-white/85">Çarşı Piyasa</span>
            <span className="text-[11px] text-white/40">·</span>
            <span className="text-[11px] text-white/45">canlı</span>
            <span className="text-[11px] text-white/40">·</span>
            <span className="text-[11px] text-white/45">09:41</span>
            <div className="ml-auto flex items-center gap-2 text-white/55">
              <ChevronDown size={14} />
            </div>
          </div>

          {/* 2x2 grid */}
          <div className="px-3 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {ROWS.map((r) => {
                const up = r.pct > 0;
                return (
                  <div
                    key={r.code}
                    className="rounded-[14px] p-3 flex items-center gap-2.5"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0"
                      style={{ background: r.tint + "33", color: "#fff" }}
                    >
                      {r.glyph}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[12px] font-bold tracking-wide text-white/85">{r.code}</span>
                        <span className="text-[10px] text-white/40 truncate">{r.name}</span>
                      </div>
                      <div
                        className="text-[15px] font-bold text-white leading-tight"
                        style={{ fontFeatureSettings: '"tnum" on, "lnum" on' }}
                      >
                        {r.price}
                      </div>
                      <div
                        className="text-[10.5px] font-bold mt-0.5"
                        style={{
                          color: up ? "#4ADE80" : "#F87171",
                          fontFeatureSettings: '"tnum" on, "lnum" on',
                        }}
                      >
                        {up ? "▲" : "▼"} %{Math.abs(r.pct).toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10.5px] text-white/45 font-medium">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#22C55E" }} />
                <span>Her 1–2 dk yenilenir</span>
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

        <div className="mt-4 px-2 text-center text-[11px] text-white/45 font-medium">
          Varyant B · 2×2 Grid — daha fazla detay
        </div>
      </div>
    </div>
  );
}
