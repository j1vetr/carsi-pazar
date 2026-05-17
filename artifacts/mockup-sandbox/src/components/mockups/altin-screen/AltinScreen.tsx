import { useState, useRef } from "react";

// ── Yardımcı tipler ──────────────────────────────────────────────────────────
interface GoldItem {
  code: string;
  name: string;
  badge?: "YENİ" | "ESKİ";
  buy: number;
  sell: number;
  pct: number;
  icon: string; // emoji / kısa metin
}

interface Section {
  key: string;
  title: string;
  subtitle: string;
  data: GoldItem[];
  hasSarrafiye?: boolean;
}

// ── Örnek veriler ─────────────────────────────────────────────────────────────
const GRAM_ONS: GoldItem[] = [
  { code: "ALTIN",   name: "Gram Altın",  buy: 4_126.40, sell: 4_142.80, pct:  0.62, icon: "🥇" },
  { code: "XAUUSD",  name: "Ons Altın",   buy: 3_328.50, sell: 3_336.20, pct:  0.51, icon: "Au" },
  { code: "ALTIN22", name: "22 Ayar",     buy: 3_779.80, sell: 3_795.60, pct:  0.58, icon: "22k" },
  { code: "ALTIN18", name: "18 Ayar",     buy: 3_094.80, sell: 3_107.10, pct:  0.61, icon: "18k" },
];

const SARRAFIYE_YENI: GoldItem[] = [
  { code: "CEYREK",  name: "Çeyrek Altın",  buy: 102_540, sell: 103_120, pct:  0.55, icon: "¼" },
  { code: "YARIM",   name: "Yarım Altın",   buy: 205_080, sell: 206_240, pct:  0.53, icon: "½" },
  { code: "TAM",     name: "Tam Altın",     buy: 410_160, sell: 412_480, pct:  0.57, icon: "1" },
  { code: "ATA",     name: "Ata Altın",     buy: 410_160, sell: 413_200, pct:  0.60, icon: "A" },
  { code: "CUMHUR",  name: "Cumhuriyet",    buy: 410_160, sell: 413_640, pct:  0.58, icon: "C" },
];

const SARRAFIYE_ESKI: GoldItem[] = [
  { code: "CEYREK",  name: "Çeyrek Altın",  buy:  99_850, sell: 100_480, pct:  0.43, icon: "¼" },
  { code: "YARIM",   name: "Yarım Altın",   buy: 199_700, sell: 200_960, pct:  0.41, icon: "½" },
  { code: "TAM",     name: "Tam Altın",     buy: 399_400, sell: 401_920, pct:  0.44, icon: "1" },
];

const KULCE: GoldItem[] = [
  { code: "KULCE1",  name: "1 gr Külçe",    buy:   4_128, sell:   4_145, pct:  0.62, icon: "1g" },
  { code: "KULCE5",  name: "5 gr Külçe",    buy:  20_640, sell:  20_725, pct:  0.61, icon: "5g" },
  { code: "KULCE10", name: "10 gr Külçe",   buy:  41_280, sell:  41_450, pct:  0.61, icon: "10g" },
  { code: "KULCE20", name: "20 gr Külçe",   buy:  82_560, sell:  82_900, pct:  0.62, icon: "20g" },
];

const BILEZIK: GoldItem[] = [
  { code: "B22",     name: "22 Ayar Bilezik", buy: 3_742, sell: 3_788, pct:  0.49, icon: "22" },
  { code: "B18",     name: "18 Ayar Bilezik", buy: 3_062, sell: 3_098, pct:  0.52, icon: "18" },
  { code: "B14",     name: "14 Ayar Bilezik", buy: 2_384, sell: 2_412, pct:  0.47, icon: "14" },
];

const GUMUS: GoldItem[] = [
  { code: "XAGUSD",  name: "Ons Gümüş",    buy:   33.42, sell:   33.58, pct: -0.14, icon: "Ag" },
  { code: "GRAMGUM", name: "Gram Gümüş",   buy:    3.48, sell:    3.51, pct: -0.12, icon: "g" },
];

const ALL_SECTIONS: Section[] = [
  { key: "gram",      title: "Gram & Ons Altın",    subtitle: "Saf altın fiyatları",     data: GRAM_ONS },
  { key: "sarrafiye", title: "Sarrafiye Altın",     subtitle: "Yeni basım",              data: SARRAFIYE_YENI, hasSarrafiye: true },
  { key: "kulce",     title: "Külçe Altın",         subtitle: "Gram bazlı külçeler",     data: KULCE },
  { key: "bilezik",   title: "Bilezik & Ziynet",    subtitle: "Ayar bazlı bilezikler",   data: BILEZIK },
  { key: "gumUs",     title: "Gümüş",               subtitle: "Gram, ons ve kg",         data: GUMUS },
];

const CHIP_LABELS = ["Tümü", "Gram & Ons", "Sarrafiye", "Külçe", "Bilezik", "Gümüş", "Favoriler"];

// ── Yardımcı bileşenler ───────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 10_000) return n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (n >= 100)    return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function GoldDisc({ icon, size = 36 }: { icon: string; size?: number }) {
  const bg = "#FBF3D5";
  const txt = "#8A6E14";
  const fontSize = icon.length > 2 ? size * 0.28 : size * 0.36;
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{ fontSize, fontWeight: 800, color: txt, letterSpacing: -0.5 }}>{icon}</span>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="flex items-center px-4 py-1.5 bg-gray-50 border-t border-b border-gray-200">
      <div style={{ width: 46 }} className="shrink-0" />
      <div className="flex-1 text-[9.5px] font-bold text-gray-400 tracking-widest">VARLIK</div>
      <div className="text-right text-[9.5px] font-bold text-gray-400 tracking-widest" style={{ width: 158 }}>ALIŞ / SATIŞ</div>
      <div style={{ width: 26 }} className="shrink-0" />
    </div>
  );
}

function GoldRow({ item, isFav, onToggleFav }: {
  item: GoldItem;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const pos = item.pct >= 0;
  const changeColor = pos ? "#16A34A" : "#DC2626";
  const changeBg   = pos ? "#F0FDF4" : "#FFF1F2";
  const arrow = pos ? "▲" : "▼";

  return (
    <div className="flex items-center px-4 py-2.5 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
      <GoldDisc icon={item.icon} />
      <div style={{ marginLeft: 10 }} />

      <div className="flex-1 min-w-0 pr-2">
        <div className="text-[14.5px] font-bold text-gray-900 leading-tight truncate">{item.name}</div>
        <div className="text-[11px] text-gray-400 mt-0.5">{item.code}</div>
      </div>

      {/* Fiyat kolonu: alış üstte (sönük), satış altta (bold) + değişim pill */}
      <div className="flex flex-col items-end" style={{ width: 158 }}>
        <div className="flex items-baseline gap-1">
          <span className="text-[12.5px] text-gray-400 font-mono tabular-nums">{fmt(item.buy)}</span>
          <span className="text-[11px] text-gray-300">·</span>
          <span className="text-[14.5px] font-bold text-gray-900 font-mono tabular-nums">{fmt(item.sell)}</span>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] mt-0.5"
          style={{ background: changeBg }}>
          <span className="text-[9px] font-bold" style={{ color: changeColor }}>{arrow}</span>
          <span className="text-[10.5px] font-bold tabular-nums" style={{ color: changeColor }}>
            {Math.abs(item.pct).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Star */}
      <button className="ml-1.5 p-1 shrink-0" onClick={(e) => { e.stopPropagation(); onToggleFav(); }}>
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

// ── Ana bileşen ───────────────────────────────────────────────────────────────
export function AltinScreen() {
  const [activeChip, setActiveChip] = useState("Tümü");
  const [emission, setEmission] = useState<"yeni" | "eski">("yeni");
  const [favs, setFavs] = useState<Set<string>>(new Set(["ALTIN", "CEYREK"]));
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleFav = (code: string) => {
    setFavs((p) => { const n = new Set(p); n.has(code) ? n.delete(code) : n.add(code); return n; });
  };

  const sections = ALL_SECTIONS.map((s) => {
    if (s.hasSarrafiye) return { ...s, data: emission === "yeni" ? SARRAFIYE_YENI : SARRAFIYE_ESKI, subtitle: emission === "yeni" ? "Yeni basım" : "Eski basım (1980 öncesi)" };
    return s;
  }).filter((s) => {
    if (activeChip === "Tümü") return true;
    if (activeChip === "Favoriler") return s.data.some((d) => favs.has(d.code));
    const map: Record<string, string> = {
      "Gram & Ons": "gram", "Sarrafiye": "sarrafiye",
      "Külçe": "kulce", "Bilezik": "bilezik", "Gümüş": "gumUs",
    };
    return s.key === map[activeChip];
  });

  return (
    <div className="w-[390px] h-[844px] bg-white flex flex-col overflow-hidden select-none"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* ── MinimalTopBar ── */}
      <div className="flex items-center justify-between px-4 bg-white border-b border-gray-100" style={{ paddingTop: 12, paddingBottom: 10 }}>
        <button className="p-1 -ml-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <img src="/logo-dark.png" alt="Çarşı Pazar" style={{ height: 28, objectFit: "contain" }} />
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500 font-semibold tabular-nums">14:32</span>
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-none" ref={scrollRef}>

        {/* Başlık satırı */}
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <span className="text-[16px] font-bold text-gray-900">Altın / Madenler</span>
          <span className="text-[9.5px] font-bold text-gray-400 tracking-widest">KAPALIÇARŞI</span>
        </div>

        {/* Chip scroll */}
        <div className="flex gap-2 px-3.5 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {CHIP_LABELS.map((label) => {
            const active = activeChip === label;
            return (
              <button key={label} onClick={() => setActiveChip(label)}
                className="flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-full text-[12.5px] font-bold transition-all shrink-0"
                style={{
                  background: active ? "#111827" : "#F3F4F6",
                  color: active ? "#fff" : "#6B7280",
                }}>
                {label === "Favoriler" && (
                  <svg width="10" height="10" viewBox="0 0 24 24"
                    fill={active ? "#fff" : "#9CA3AF"}
                    stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                )}
                {label}
              </button>
            );
          })}
        </div>

        {/* Sections */}
        {sections.map((section) => {
          const data = activeChip === "Favoriler"
            ? section.data.filter((d) => favs.has(d.code))
            : section.data;

          return (
            <div key={section.key}>
              {/* Section header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-[15px] font-bold text-gray-900 shrink-0">{section.title}</span>
                  <span className="text-[11px] text-gray-400 truncate">{section.subtitle}</span>
                </div>
                {/* Sarrafiye Yeni/Eski pill */}
                {section.hasSarrafiye && (
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5 shrink-0 ml-2">
                    {(["yeni", "eski"] as const).map((e) => (
                      <button key={e} onClick={() => setEmission(e)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all"
                        style={{
                          background: emission === e ? "#fff" : "transparent",
                          color: emission === e ? "#111827" : "#9CA3AF",
                          boxShadow: emission === e ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        }}>
                        {e === "yeni" ? "Yeni" : "Eski"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <TableHeader />

              {data.map((item) => (
                <GoldRow
                  key={item.code + section.key}
                  item={item}
                  isFav={favs.has(item.code)}
                  onToggleFav={() => toggleFav(item.code)}
                />
              ))}
            </div>
          );
        })}

        <div className="h-24" />
      </div>

      {/* Bottom nav */}
      <div className="border-t border-gray-200 bg-white flex items-center justify-around px-1 shrink-0"
        style={{ paddingTop: 8, paddingBottom: 10 }}>
        {[
          { label: "Döviz",    active: false, d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" },
          { label: "Altın",   active: true,  d: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" },
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
