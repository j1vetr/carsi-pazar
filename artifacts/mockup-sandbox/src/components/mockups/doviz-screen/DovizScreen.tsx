import { useState } from "react";

function FlagImg({ iso, size = 36 }: { iso: string; size?: number }) {
  const code = iso.toLowerCase();
  return (
    <div
      style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", border: "0.5px solid rgba(0,0,0,0.08)", flexShrink: 0, background: "#f3f4f6" }}
    >
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        alt={iso}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    </div>
  );
}

const CURRENCIES = [
  { code: "USD", name: "Amerikan Doları",   flag: "us", buy: 38.4120, sell: 38.6540, pct:  0.42 },
  { code: "EUR", name: "Euro",              flag: "eu", buy: 41.8830, sell: 42.1650, pct: -0.18 },
  { code: "GBP", name: "İngiliz Sterlini", flag: "gb", buy: 49.1200, sell: 49.4880, pct:  0.31 },
  { code: "CHF", name: "İsviçre Frangı",   flag: "ch", buy: 43.2200, sell: 43.5400, pct: -0.07 },
  { code: "JPY", name: "Japon Yeni",        flag: "jp", buy:  0.2534, sell:  0.2561, pct:  0.15 },
  { code: "SAR", name: "Suudi Riyali",      flag: "sa", buy: 10.2380, sell: 10.3040, pct:  0.11 },
  { code: "AUD", name: "Avustralya Doları", flag: "au", buy: 24.8770, sell: 25.0450, pct: -0.29 },
  { code: "CAD", name: "Kanada Doları",     flag: "ca", buy: 28.1050, sell: 28.3220, pct:  0.09 },
  { code: "DKK", name: "Danimarka Kronu",   flag: "dk", buy:  5.6120, sell:  5.6630, pct: -0.21 },
  { code: "NOK", name: "Norveç Kronu",      flag: "no", buy:  3.6450, sell:  3.6820, pct:  0.33 },
  { code: "SEK", name: "İsveç Kronu",       flag: "se", buy:  3.7220, sell:  3.7580, pct: -0.14 },
];

const BANKS = [
  { code: "BANKAUSD", name: "Banka USD", flag: "tr", buy: 38.1800, sell: 38.9200, pct: 0.38 },
];

function fmt(n: number) {
  const d = n < 1 ? 4 : n < 100 ? 4 : 2;
  return n.toLocaleString("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function CurrencyRow({ item, isFav, onToggleFav }: {
  item: typeof CURRENCIES[number];
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const pos = item.pct >= 0;
  const changeColor = pos ? "#16A34A" : "#DC2626";
  const arrow = pos ? "↗" : "↘";

  return (
    <div className="flex items-center px-4 py-2.5 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
      <FlagImg iso={item.flag} size={36} />
      <div style={{ marginLeft: 10 }} />

      <div className="flex-1 min-w-0 pr-2">
        <div className="text-[14.5px] font-bold text-gray-900 leading-tight">{item.code}</div>
        <div className="text-[11px] text-gray-400 mt-0.5 truncate">{item.name}</div>
      </div>

      {/* ALIŞ */}
      <div className="flex flex-col items-end" style={{ width: 72 }}>
        <div className="text-[12.5px] text-gray-400 font-mono tabular-nums leading-tight">{fmt(item.buy)}</div>
        <div className="text-[10px] font-bold mt-0.5 tabular-nums" style={{ color: changeColor }}>
          {arrow} {Math.abs(item.pct).toFixed(2)}%
        </div>
      </div>

      {/* SATIŞ */}
      <div className="flex flex-col items-end" style={{ width: 72 }}>
        <div className="text-[13px] font-bold text-gray-900 font-mono tabular-nums leading-tight">{fmt(item.sell)}</div>
        <div className="text-[10px] font-bold mt-0.5 tabular-nums" style={{ color: changeColor }}>
          {arrow} {Math.abs(item.pct).toFixed(2)}%
        </div>
      </div>

      {/* Star */}
      <button className="ml-2 p-1 shrink-0" onClick={(e) => { e.stopPropagation(); onToggleFav(); }}>
        <svg width="16" height="16" viewBox="0 0 24 24"
          fill={isFav ? "#F59E0B" : "none"}
          stroke={isFav ? "#F59E0B" : "#9CA3AF"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="flex items-center px-4 py-1.5 bg-gray-50 border-t border-b border-gray-200">
      <div style={{ width: 46 }} className="shrink-0" />
      <div className="flex-1 text-[9.5px] font-bold text-gray-400 tracking-widest">BİRİM</div>
      <div className="text-right text-[9.5px] font-bold text-gray-400 tracking-widest" style={{ width: 72 }}>ALIŞ</div>
      <div className="text-right text-[9.5px] font-bold text-gray-400 tracking-widest" style={{ width: 72 }}>SATIŞ</div>
      <div style={{ width: 30 }} className="shrink-0" />
    </div>
  );
}

export function DovizScreen() {
  const [tab, setTab] = useState<"all" | "fav">("all");
  const [search, setSearch] = useState("");
  const [favs, setFavs] = useState<Set<string>>(new Set(["USD", "EUR"]));

  const toggleFav = (code: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const filtered = CURRENCIES.filter((c) => {
    if (tab === "fav" && !favs.has(c.code)) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="w-[390px] h-[844px] bg-white flex flex-col overflow-hidden select-none"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* ── MinimalTopBar ── */}
      <div className="flex items-center justify-between px-4 bg-white border-b border-gray-100" style={{ paddingTop: 12, paddingBottom: 10 }}>
        {/* Hamburger */}
        <button className="p-1 -ml-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Logo */}
        <img src="/logo-dark.png" alt="Çarşı Pazar" style={{ height: 28, objectFit: "contain" }} />

        {/* Saat + canlı nokta */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500 font-semibold tabular-nums">14:32</span>
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-none">
        {/* Başlık + CANLI */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <span className="text-[24px] font-bold text-gray-900 tracking-tight">Döviz Kurları</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-50 border border-gray-200">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[11px] font-bold text-green-600 tracking-wide">CANLI</span>
          </div>
        </div>

        {/* Arama */}
        <div className="px-4 pb-2.5">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5 border border-gray-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="flex-1 bg-transparent text-[14px] text-gray-700 outline-none placeholder-gray-400"
              placeholder="Ara"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch("")} className="text-gray-400 text-sm leading-none">✕</button>}
          </div>
        </div>

        {/* Segment */}
        <div className="flex mx-4 mb-2.5 p-[3px] bg-gray-100 rounded-xl border border-gray-200">
          {(["all", "fav"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-[9px] text-[13px] font-bold transition-all"
              style={{ background: tab === t ? "#1B6AE4" : "transparent", color: tab === t ? "#fff" : "#6B7280" }}>
              {t === "all" ? "Tümü" : "Favoriler"}
            </button>
          ))}
        </div>

        <TableHeader />

        {filtered.map((c) => (
          <CurrencyRow key={c.code} item={c} isFav={favs.has(c.code)} onToggleFav={() => toggleFav(c.code)} />
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p className="mt-3 text-[13px] font-semibold text-gray-500">Sonuç Bulunamadı</p>
            {search && <p className="text-[12px] mt-1 text-gray-400">"{search}" için eşleşen döviz yok.</p>}
          </div>
        )}

        {/* Banka Fiyatları */}
        {tab === "all" && !search && (
          <>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-[15px] font-bold text-gray-900">Banka Fiyatları</span>
              <span className="text-[9.5px] font-bold text-gray-400 tracking-widest">BANKA ORT.</span>
            </div>
            <TableHeader />
            {BANKS.map((b) => (
              <CurrencyRow key={b.code} item={b} isFav={favs.has(b.code)} onToggleFav={() => toggleFav(b.code)} />
            ))}
          </>
        )}

        <div className="h-24" />
      </div>

      {/* Bottom nav */}
      <div className="border-t border-gray-200 bg-white flex items-center justify-around px-1 shrink-0" style={{ paddingTop: 8, paddingBottom: 10 }}>
        {[
          { label: "Döviz",    active: true,  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" },
          { label: "Altın",   active: false, d: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" },
          { label: "Portföy", active: false, d: "M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" },
          { label: "Favoriler", active: false, d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" },
        ].map((item) => (
          <button key={item.label} className="flex flex-col items-center gap-0.5 min-w-[52px]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={item.active ? "#1B6AE4" : "#9CA3AF"}>
              <path d={item.d} />
            </svg>
            <span className="text-[10px] font-semibold" style={{ color: item.active ? "#1B6AE4" : "#9CA3AF" }}>
              {item.label}
            </span>
          </button>
        ))}
        <button className="flex flex-col items-center gap-0.5 min-w-[52px]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <span className="text-[10px] font-semibold text-gray-400">Menü</span>
        </button>
      </div>
    </div>
  );
}
