import { useState, useRef } from "react";

// ── Nav icons ────────────────────────────────────────────────────────────────
type NavIcon = "doviz" | "altin" | "portfolio" | "heart" | "menu";

function BottomNavItem({ label, active, icon }: { label: string; active: boolean; icon: NavIcon }) {
  const color = active ? "#1B6AE4" : "#9CA3AF";
  const sw = "1.8";
  const sc = "round";
  const sj = "round";
  return (
    <button className="flex flex-col items-center gap-0.5 min-w-[52px]">
      {icon === "doviz" && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap={sc} strokeLinejoin={sj}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v1M12 16v1M14.5 9.5H10.5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H9.5" />
        </svg>
      )}
      {icon === "altin" && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap={sc} strokeLinejoin={sj}>
          <rect x="2"  y="14" width="20" height="5" rx="1.5" />
          <rect x="5"  y="9"  width="14" height="5" rx="1.5" />
          <rect x="8"  y="4"  width="8"  height="5" rx="1.5" />
        </svg>
      )}
      {icon === "portfolio" && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap={sc} strokeLinejoin={sj}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <path d="M12 12v4M10 14h4" />
        </svg>
      )}
      {icon === "heart" && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={color} strokeWidth={sw} strokeLinecap={sc} strokeLinejoin={sj}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
      {icon === "menu" && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap={sc}>
          <line x1="3" y1="6"  x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      )}
      <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
    </button>
  );
}

// ── Veri ─────────────────────────────────────────────────────────────────────
interface GoldItem {
  code: string;
  name: string;
  subtitle: string;
  buy: number;
  sell: number;
}

const GRAM_ONS: GoldItem[] = [
  { code: "ALTIN",    name: "Gram Altın (Has)",  subtitle: "1 gram saf altın",       buy: 6_659.85, sell: 6_688.07 },
  { code: "XAUUSD",  name: "Ons Altın",          subtitle: "1 troy ons (USD)",       buy: 4_537.90, sell: 4_538.57 },
  { code: "XAUEUR",  name: "Ons Altın (EUR)",     subtitle: "1 troy ons (EUR)",       buy: 3_902.19, sell: 3_911.52 },
  { code: "XAUSPOT", name: "Ons Altın (Spot)",    subtitle: "Anlık ons fiyatı",       buy: 4_537.90, sell: 4_538.57 },
];

const SARRAFIYE_YENI: GoldItem[] = [
  { code: "CEYREK",  name: "Çeyrek Altın (Yeni)", subtitle: "Çeyrek altın · yeni emisyon", buy: 10_856, sell: 10_934 },
  { code: "YARIM",   name: "Yarım Altın",          subtitle: "Yarım altın · yeni emisyon",  buy: 21_712, sell: 21_861 },
  { code: "TAM",     name: "Tam Altın",             subtitle: "Tam altın · yeni emisyon",    buy: 43_424, sell: 43_722 },
  { code: "ATA",     name: "Ata Altın (Yeni)",      subtitle: "Tek ata · yeni emisyon",      buy: 43_424, sell: 43_900 },
  { code: "CUMHUR",  name: "Cumhuriyet (Yeni)",     subtitle: "Cumhuriyet altını · yeni",    buy: 43_424, sell: 44_020 },
];

const SARRAFIYE_ESKI: GoldItem[] = [
  { code: "CEYREK_E", name: "Çeyrek Altın (Eski)", subtitle: "Çeyrek altın · eski emisyon", buy:  9_985, sell: 10_048 },
  { code: "YARIM_E",  name: "Yarım Altın (Eski)",  subtitle: "Yarım altın · eski emisyon",  buy: 19_970, sell: 20_096 },
  { code: "TAM_E",    name: "Tam Altın (Eski)",     subtitle: "Tam altın · eski emisyon",    buy: 39_940, sell: 40_192 },
];

const KULCE: GoldItem[] = [
  { code: "K1",  name: "1 gr Külçe",   subtitle: "1 gram külçe altın",   buy:  6_660, sell:  6_690 },
  { code: "K5",  name: "5 gr Külçe",   subtitle: "5 gram külçe altın",   buy: 33_300, sell: 33_450 },
  { code: "K10", name: "10 gr Külçe",  subtitle: "10 gram külçe altın",  buy: 66_600, sell: 66_900 },
  { code: "K20", name: "20 gr Külçe",  subtitle: "20 gram külçe altın",  buy: 133_200, sell: 133_800 },
];

const BILEZIK: GoldItem[] = [
  { code: "B22", name: "22 Ayar Bilezik", subtitle: "Milyem 916 · işçilik hariç", buy: 6_102, sell: 6_165 },
  { code: "B18", name: "18 Ayar Bilezik", subtitle: "Milyem 750 · işçilik hariç", buy: 4_994, sell: 5_046 },
  { code: "B14", name: "14 Ayar Bilezik", subtitle: "Milyem 585 · işçilik hariç", buy: 3_885, sell: 3_930 },
];

const GUMUS: GoldItem[] = [
  { code: "XAGUSD", name: "Ons Gümüş",   subtitle: "1 troy ons (USD)", buy: 33.42, sell: 33.58 },
  { code: "GRAMG",  name: "Gram Gümüş",  subtitle: "1 gram gümüş",     buy:  3.48, sell:  3.51 },
];

interface Section {
  key: string;
  title: string;
  data: GoldItem[];
  hasSarrafiye?: boolean;
}

const ALL_SECTIONS: Section[] = [
  { key: "gram",      title: "Gram & Ons Altın",  data: GRAM_ONS },
  { key: "sarrafiye", title: "Sarrafiye Altın",    data: SARRAFIYE_YENI, hasSarrafiye: true },
  { key: "kulce",     title: "Külçe Altın",        data: KULCE },
  { key: "bilezik",   title: "Bilezik & Ziynet",   data: BILEZIK },
  { key: "gumus",     title: "Gümüş",              data: GUMUS },
];

const CHIP_LABELS = ["Tümü", "Gram & Ons", "Sarrafiye", "Külçe", "Bilezik", "Gümüş", "Favoriler"];

// ── Formatlama ────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 10_000) return n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (n >= 100)    return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

// ── GoldRow: screenshot'a birebir ──────────────────────────────────────────
function GoldRow({ item, isFav, onToggleFav, isLast }: {
  item: GoldItem;
  isFav: boolean;
  onToggleFav: () => void;
  isLast: boolean;
}) {
  return (
    <div
      className="flex items-center bg-white px-4 py-3"
      style={{ borderBottom: isLast ? "none" : "1px solid #E5E7EB", cursor: "pointer" }}
    >
      {/* Sol: BİRİM + isim + subtitle — hafif gri arka plan */}
      <div className="flex-1 min-w-0 -mx-4 px-4 py-3 -my-3 mr-0 pr-3 self-stretch flex flex-col justify-center"
        style={{ background: "#F9FAFB", borderRight: "1px solid #E5E7EB" }}>
        <div className="text-[10px] font-semibold text-gray-400 tracking-widest mb-0.5">BİRİM</div>
        <div className="text-[15px] font-bold text-gray-900 leading-tight truncate">{item.name}</div>
        <div className="text-[11.5px] text-gray-400 mt-0.5 leading-tight truncate">{item.subtitle}</div>
      </div>

      {/* ALIŞ */}
      <div className="flex flex-col items-end pr-4" style={{ minWidth: 70 }}>
        <div className="text-[9.5px] font-semibold text-gray-400 tracking-widest mb-0.5">ALIŞ</div>
        <div className="text-[15px] font-bold text-gray-800 tabular-nums leading-tight">{fmt(item.buy)}</div>
      </div>

      {/* SATIŞ */}
      <div className="flex flex-col items-end pr-2" style={{ minWidth: 70 }}>
        <div className="text-[9.5px] font-semibold text-gray-400 tracking-widest mb-0.5">SATIŞ</div>
        <div className="text-[15px] font-bold text-gray-900 tabular-nums leading-tight">{fmt(item.sell)}</div>
      </div>

      {/* Yıldız */}
      <button className="p-1 shrink-0" onClick={(e) => { e.stopPropagation(); onToggleFav(); }}>
        <svg width="22" height="22" viewBox="0 0 24 24"
          fill={isFav ? "#F59E0B" : "none"}
          stroke={isFav ? "#F59E0B" : "#D1D5DB"}
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
  const [favs, setFavs] = useState<Set<string>>(new Set(["ALTIN", "CEYREK", "XAUUSD"]));
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleFav = (code: string) => {
    setFavs((p) => { const n = new Set(p); n.has(code) ? n.delete(code) : n.add(code); return n; });
  };

  const sections = ALL_SECTIONS.map((s) => {
    if (s.hasSarrafiye) {
      const data = emission === "yeni" ? SARRAFIYE_YENI : SARRAFIYE_ESKI;
      return { ...s, data };
    }
    return s;
  }).filter((s) => {
    if (activeChip === "Tümü") return true;
    if (activeChip === "Favoriler") return s.data.some((d) => favs.has(d.code));
    const map: Record<string, string> = {
      "Gram & Ons": "gram", "Sarrafiye": "sarrafiye",
      "Külçe": "kulce", "Bilezik": "bilezik", "Gümüş": "gumus",
    };
    return s.key === map[activeChip];
  }).map((s) => ({
    ...s,
    data: activeChip === "Favoriler" ? s.data.filter((d) => favs.has(d.code)) : s.data,
  })).filter((s) => s.data.length > 0);

  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden select-none"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", background: "#F2F3F7" }}>

      {/* ── MinimalTopBar ── */}
      <div className="flex items-center justify-between px-4 bg-white border-b border-gray-200" style={{ paddingTop: 12, paddingBottom: 10 }}>
        <button className="p-1 -ml-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <img src="/__mockup/logo-light.png" alt="Çarşı Pazar" style={{ height: 34, objectFit: "contain" }} />
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500 font-semibold tabular-nums">14:32</span>
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-none" ref={scrollRef}>

        {/* Sayfa başlığı */}
        <div className="text-center pt-5 pb-1">
          <span className="text-[20px] font-bold text-gray-900">Altın Fiyatları</span>
        </div>

        {/* Chip scroll */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {CHIP_LABELS.map((label) => {
            const active = activeChip === label;
            return (
              <button key={label} onClick={() => setActiveChip(label)}
                className="flex items-center gap-1 whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-semibold transition-all shrink-0"
                style={{
                  background: active ? "#0F2560" : "#E5E7EB",
                  color: active ? "#fff" : "#4B5563",
                }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.key} className="mb-4">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 pt-2 pb-3">
              <span className="text-[18px] font-bold text-gray-900">{section.title}</span>
              {section.hasSarrafiye && (
                <div className="flex items-center bg-gray-200 rounded-lg p-0.5 ml-2">
                  {(["yeni", "eski"] as const).map((e) => (
                    <button key={e} onClick={() => setEmission(e)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all"
                      style={{
                        background: emission === e ? "#fff" : "transparent",
                        color: emission === e ? "#111827" : "#9CA3AF",
                        boxShadow: emission === e ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                      }}>
                      {e === "yeni" ? "Yeni" : "Eski"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rows card */}
            <div className="mx-0 rounded-none overflow-hidden border-t border-b border-gray-200">
              {section.data.map((item, idx) => (
                <GoldRow
                  key={item.code}
                  item={item}
                  isFav={favs.has(item.code)}
                  onToggleFav={() => toggleFav(item.code)}
                  isLast={idx === section.data.length - 1}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="h-20" />
      </div>

      {/* Bottom nav */}
      <div className="border-t border-gray-200 bg-white flex items-center justify-around px-1 shrink-0"
        style={{ paddingTop: 8, paddingBottom: 10 }}>
        <BottomNavItem label="Döviz"     active={false} icon="doviz" />
        <BottomNavItem label="Altın"     active={true}  icon="altin" />
        <BottomNavItem label="Portföy"   active={false} icon="portfolio" />
        <BottomNavItem label="Favoriler" active={false} icon="heart" />
        <BottomNavItem label="Menü"      active={false} icon="menu" />
      </div>
    </div>
  );
}
