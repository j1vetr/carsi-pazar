import { useState } from "react";

function flagEmoji(iso: string) {
  return iso
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

const CURRENCIES = [
  { code: "USD", name: "Amerikan Doları", flag: "US", buy: 38.4120, sell: 38.6540, pct: 0.42 },
  { code: "EUR", name: "Euro",            flag: "EU", buy: 41.8830, sell: 42.1650, pct: -0.18 },
  { code: "GBP", name: "İngiliz Sterlini", flag: "GB", buy: 49.1200, sell: 49.4880, pct: 0.31 },
  { code: "CHF", name: "İsviçre Frangı",  flag: "CH", buy: 43.2200, sell: 43.5400, pct: -0.07 },
  { code: "JPY", name: "Japon Yeni",      flag: "JP", buy:  0.2534, sell:  0.2561, pct: 0.15 },
  { code: "SAR", name: "Suudi Riyali",    flag: "SA", buy: 10.2380, sell: 10.3040, pct: 0.11 },
  { code: "AUD", name: "Avustralya Doları", flag: "AU", buy: 24.8770, sell: 25.0450, pct: -0.29 },
  { code: "CAD", name: "Kanada Doları",   flag: "CA", buy: 28.1050, sell: 28.3220, pct: 0.09 },
  { code: "DKK", name: "Danimarka Kronu", flag: "DK", buy:  5.6120, sell:  5.6630, pct: -0.21 },
  { code: "NOK", name: "Norveç Kronu",    flag: "NO", buy:  3.6450, sell:  3.6820, pct: 0.33 },
  { code: "SEK", name: "İsveç Kronu",     flag: "SE", buy:  3.7220, sell:  3.7580, pct: -0.14 },
];

const BANKS = [
  { code: "BANKAUSD", name: "Banka USD", flag: "TR", buy: 38.1800, sell: 38.9200, pct: 0.38 },
];

function fmt(n: number) {
  const d = n < 1 ? 4 : n < 100 ? 4 : 2;
  return n.toLocaleString("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function CurrencyRow({
  item,
  isFav,
  onToggleFav,
}: {
  item: typeof CURRENCIES[number];
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const pos = item.pct >= 0;
  const changeColor = pos ? "#22C55E" : "#EF4444";
  const arrow = pos ? "↗" : "↘";

  return (
    <div className="flex items-center px-4 py-2.5 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
      {/* Flag */}
      <div className="w-9 h-9 rounded-full bg-gray-100 border border-black/5 flex items-center justify-center text-2xl shrink-0 mr-2.5 overflow-hidden">
        {flagEmoji(item.flag)}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="text-[14.5px] font-bold text-gray-900 leading-tight">{item.code}</div>
        <div className="text-[11px] text-gray-400 mt-0.5 truncate">{item.name}</div>
      </div>

      {/* Buy col */}
      <div className="w-[70px] flex flex-col items-end">
        <div className="text-[12.5px] text-gray-400 font-mono tabular-nums leading-tight">
          {fmt(item.buy)}
        </div>
        <div className="text-[10px] font-bold mt-0.5" style={{ color: changeColor }}>
          {arrow} {Math.abs(item.pct).toFixed(2)}%
        </div>
      </div>

      {/* Sell col */}
      <div className="w-[70px] flex flex-col items-end">
        <div className="text-[13px] font-bold text-gray-900 font-mono tabular-nums leading-tight">
          {fmt(item.sell)}
        </div>
        <div className="text-[10px] font-bold mt-0.5" style={{ color: changeColor }}>
          {arrow} {Math.abs(item.pct).toFixed(2)}%
        </div>
      </div>

      {/* Star */}
      <button
        className="ml-2 p-1 shrink-0"
        onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? "#F59E0B" : "none"} stroke={isFav ? "#F59E0B" : "#9CA3AF"} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
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
      if (next.has(code)) next.delete(code);
      else next.add(code);
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
    <div className="w-[390px] h-[844px] bg-white flex flex-col font-sans overflow-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* TopBar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <button className="p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-24 h-6 bg-gray-800 rounded-sm flex items-center justify-center">
            <span className="text-white text-[10px] font-bold tracking-wide">ÇARŞI PAZAR</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
          <span className="text-[10px] text-gray-400 font-bold tabular-nums">14:32</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2.5">
          <span className="text-[24px] font-bold text-gray-900 tracking-tight">Döviz Kurları</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-50 border border-gray-200">
            <div className="w-2 h-2 rounded-full bg-green-500"/>
            <span className="text-[11px] font-bold text-green-500 tracking-wide">CANLI</span>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-2.5">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5 border border-gray-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="flex-1 bg-transparent text-[14px] text-gray-700 outline-none placeholder-gray-400"
              placeholder="Ara"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 text-sm leading-none">✕</button>
            )}
          </div>
        </div>

        {/* Segment control */}
        <div className="flex mx-4 mb-2.5 p-[3px] bg-gray-100 rounded-xl border border-gray-200">
          {(["all", "fav"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-[9px] text-[13px] font-bold transition-all"
              style={{
                background: tab === t ? "#1B6AE4" : "transparent",
                color: tab === t ? "#fff" : "#6B7280",
              }}
            >
              {t === "all" ? "Tümü" : "Favoriler"}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div className="flex items-center px-4 py-1.5 bg-gray-50 border-t border-b border-gray-100">
          <div className="w-9 mr-2.5 shrink-0" />
          <div className="flex-1 text-[9.5px] font-bold text-gray-400 tracking-widest">BİRİM</div>
          <div className="w-[70px] text-right text-[9.5px] font-bold text-gray-400 tracking-widest">ALIŞ</div>
          <div className="w-[70px] text-right text-[9.5px] font-bold text-gray-400 tracking-widest">SATIŞ</div>
          <div className="w-8 shrink-0"/>
        </div>

        {/* Rows */}
        {filtered.map((c) => (
          <CurrencyRow
            key={c.code}
            item={c}
            isFav={favs.has(c.code)}
            onToggleFav={() => toggleFav(c.code)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <p className="mt-3 text-[13px] font-semibold text-gray-500">Sonuç Bulunamadı</p>
            <p className="text-[12px] mt-1">"{search}" için eşleşen döviz yok.</p>
          </div>
        )}

        {/* Banka section */}
        {tab === "all" && !search && (
          <>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-[15px] font-bold text-gray-900">Banka Fiyatları</span>
              <span className="text-[9.5px] font-bold text-gray-400 tracking-widest">BANKA ORT.</span>
            </div>
            <div className="flex items-center px-4 py-1.5 bg-gray-50 border-t border-b border-gray-100">
              <div className="w-9 mr-2.5 shrink-0" />
              <div className="flex-1 text-[9.5px] font-bold text-gray-400 tracking-widest">BİRİM</div>
              <div className="w-[70px] text-right text-[9.5px] font-bold text-gray-400 tracking-widest">ALIŞ</div>
              <div className="w-[70px] text-right text-[9.5px] font-bold text-gray-400 tracking-widest">SATIŞ</div>
              <div className="w-8 shrink-0"/>
            </div>
            {BANKS.map((b) => (
              <CurrencyRow key={b.code} item={b} isFav={favs.has(b.code)} onToggleFav={() => toggleFav(b.code)} />
            ))}
          </>
        )}

        <div className="h-24" />
      </div>

      {/* Bottom nav */}
      <div className="border-t border-gray-200 bg-white flex items-center justify-around px-2 py-2 shrink-0">
        {[
          { label: "Döviz", active: true, icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/> },
          { label: "Altın",  active: false, icon: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" fill="currentColor"/> },
          { label: "Portföy", active: false, icon: <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" fill="currentColor"/> },
          { label: "Favoriler", active: false, icon: <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/> },
          { label: "Menü", active: false, icon: <><rect x="3" y="6" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="16" width="18" height="2" rx="1" fill="currentColor"/></> },
        ].map((item) => (
          <button key={item.label} className="flex flex-col items-center gap-0.5 min-w-[50px]">
            <svg width="22" height="22" viewBox="0 0 24 24" style={{ color: item.active ? "#1B6AE4" : "#9CA3AF" }}>
              {item.icon}
            </svg>
            <span className="text-[10px] font-semibold" style={{ color: item.active ? "#1B6AE4" : "#9CA3AF" }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
