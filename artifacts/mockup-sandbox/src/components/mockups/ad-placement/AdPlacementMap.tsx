// AdPlacementMap — Reklam yerleşim haritası

const screens = [
  {
    id: "doviz",
    title: "Döviz",
    icon: "💱",
    color: "#1246B5",
    banners: [
      { pos: "top", label: "Üst banner", pct: 15 },
      { pos: "bottom", label: "Alt banner", pct: 88 },
    ],
    sections: [
      { label: "MinimalTopBar", h: 12, bg: "#1246B515" },
      { label: "Döviz Kurları başlığı", h: 8, bg: "#F2F5FA" },
      { label: "ModernTableHeader", h: 5, bg: "#E6ECF5" },
      { label: "USD", h: 7, bg: "#fff" },
      { label: "EUR", h: 7, bg: "#F9FAFC" },
      { label: "GBP", h: 7, bg: "#fff" },
      { label: "CHF", h: 7, bg: "#F9FAFC" },
      { label: "JPY", h: 7, bg: "#fff" },
      { label: "SAR", h: 7, bg: "#F9FAFC" },
    ],
  },
  {
    id: "altin",
    title: "Altın",
    icon: "🥇",
    color: "#C09020",
    banners: [
      { pos: "top", label: "Üst banner", pct: 15 },
      { pos: "bottom", label: "Alt banner", pct: 88 },
    ],
    sections: [
      { label: "MinimalTopBar", h: 12, bg: "#1246B515" },
      { label: "Altın başlığı", h: 8, bg: "#F2F5FA" },
      { label: "Bölüm chip'leri", h: 7, bg: "#FEF7E6" },
      { label: "Gram Altın", h: 7, bg: "#fff" },
      { label: "Ons Altın", h: 7, bg: "#F9FAFC" },
      { label: "Cumhuriyet", h: 7, bg: "#fff" },
      { label: "Reşat", h: 7, bg: "#F9FAFC" },
      { label: "Ata", h: 7, bg: "#fff" },
      { label: "Yarım Altın", h: 7, bg: "#F9FAFC" },
    ],
  },
  {
    id: "portfolio",
    title: "Portföy",
    icon: "💼",
    color: "#0A8F5A",
    banners: [
      { pos: "mid", label: "Orta banner", pct: 45 },
    ],
    sections: [
      { label: "MinimalTopBar", h: 12, bg: "#1246B515" },
      { label: "Portföy özeti hero", h: 22, bg: "#E8F8F1" },
      { label: "Toplam değer / kâr-zarar", h: 12, bg: "#E8F8F1" },
      { label: "Varlık 1", h: 8, bg: "#fff" },
      { label: "Varlık 2", h: 8, bg: "#F9FAFC" },
      { label: "Varlık 3", h: 8, bg: "#fff" },
      { label: "Varlık 4", h: 8, bg: "#F9FAFC" },
    ],
  },
  {
    id: "haberler",
    title: "Haberler",
    icon: "📰",
    color: "#7B3FD4",
    banners: [
      { pos: "mid", label: "Orta banner", pct: 42 },
    ],
    sections: [
      { label: "Üst bar + filtreler", h: 16, bg: "#F3ECFF" },
      { label: "Öne çıkan haber", h: 20, bg: "#F3ECFF" },
      { label: "Haber 1", h: 10, bg: "#fff" },
      { label: "Haber 2", h: 10, bg: "#F9FAFC" },
      { label: "Haber 3", h: 10, bg: "#fff" },
      { label: "Haber 4", h: 10, bg: "#F9FAFC" },
    ],
  },
  {
    id: "detay",
    title: "Detay",
    icon: "📈",
    color: "#C93030",
    banners: [
      { pos: "chart-bottom", label: "Grafik altı banner", pct: 62 },
    ],
    sections: [
      { label: "Üst bar + fiyat hero", h: 20, bg: "#FDEAEA" },
      { label: "Alış / Satış kartları", h: 12, bg: "#F9FAFC" },
      { label: "Grafik (1H/1A/1Y/5Y)", h: 28, bg: "#EEF3FF" },
      { label: "İstatistik kartları", h: 12, bg: "#F9FAFC" },
      { label: "Diğer bilgiler", h: 10, bg: "#fff" },
    ],
  },
  {
    id: "favoriler",
    title: "Favoriler",
    icon: "⭐",
    color: "#C09020",
    banners: [
      { pos: "bottom", label: "Alt banner", pct: 85 },
    ],
    sections: [
      { label: "Favorilerim başlığı", h: 14, bg: "#FEF7E6" },
      { label: "Ort/Yükselen/Düşen strip", h: 12, bg: "#F2F5FA" },
      { label: "Dağılım bar", h: 8, bg: "#F9FAFC" },
      { label: "USD • DÖVİZ", h: 8, bg: "#fff" },
      { label: "EUR • DÖVİZ", h: 8, bg: "#F9FAFC" },
      { label: "GBP • DÖVİZ", h: 8, bg: "#fff" },
      { label: "ALTIN • ALTIN", h: 8, bg: "#F9FAFC" },
    ],
  },
];

const PHONE_W = 160;
const PHONE_H = 320;
const AD_H = 14;

function PhoneFrame({ screen }: { screen: typeof screens[0] }) {
  const totalSectionH = screen.sections.reduce((s, sec) => s + sec.h, 0);
  const scale = (PHONE_H - 8) / Math.max(totalSectionH, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: PHONE_W + 24 }}>
      {/* Phone shell */}
      <div style={{
        width: PHONE_W + 8,
        height: PHONE_H + 8,
        borderRadius: 22,
        background: "#1C1C1E",
        padding: 4,
        boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
        position: "relative",
      }}>
        {/* Notch */}
        <div style={{
          position: "absolute", top: 4, left: "50%", transform: "translateX(-50%)",
          width: 40, height: 8, borderRadius: 4, background: "#1C1C1E", zIndex: 10,
        }} />

        {/* Screen */}
        <div style={{
          width: PHONE_W, height: PHONE_H,
          borderRadius: 18, overflow: "hidden",
          background: "#fff", position: "relative",
        }}>
          {/* Content sections */}
          {screen.sections.map((sec, i) => (
            <div key={i} style={{
              height: sec.h * scale,
              background: sec.bg,
              borderBottom: "1px solid #EEF2F9",
              display: "flex", alignItems: "center",
              paddingLeft: 8,
              fontSize: 6.5, color: "#9AABBF",
              fontFamily: "system-ui",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}>
              {sec.label}
            </div>
          ))}

          {/* Ad banners */}
          {screen.banners.map((b, i) => (
            <div key={i} style={{
              position: "absolute",
              top: `${b.pct}%`,
              left: 0, right: 0,
              height: AD_H,
              background: `linear-gradient(90deg, ${screen.color}EE, ${screen.color}CC)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 5,
              zIndex: 5,
              boxShadow: `0 1px 8px ${screen.color}55`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: "#fff", opacity: 0.9 }} />
              <span style={{
                fontSize: 7, fontWeight: 900, color: "#fff",
                fontFamily: "system-ui", letterSpacing: 1.2,
              }}>REKLAM</span>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: "#fff", opacity: 0.9 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Screen label */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 16 }}>{screen.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#0B1732", fontFamily: "system-ui" }}>
          {screen.title}
        </span>
      </div>

      {/* Banner position labels */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
        {screen.banners.map((b, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: `${screen.color}12`,
            border: `1px solid ${screen.color}30`,
            borderRadius: 6, padding: "4px 8px",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: screen.color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: screen.color, fontFamily: "system-ui" }}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdPlacementMap() {
  const row1 = screens.slice(0, 3);
  const row2 = screens.slice(3, 6);

  return (
    <div style={{
      width: 960, background: "#F7F9FC",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: 36, borderRadius: 20,
      border: "1px solid #E6ECF5",
    }}>
      {/* Title */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#7A8FAD", letterSpacing: 1.8, marginBottom: 8 }}>
          REKLAM YERLEŞİM HARİTASI
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#0B1732", letterSpacing: -0.8 }}>
          6 Ekran · 7 Banner
        </div>
        <div style={{ fontSize: 13, color: "#7A8FAD", marginTop: 6 }}>
          Tüm bannerlar yalnızca Android'de görünür. Geliştirme modunda test reklamı, canlıda gerçek reklam.
        </div>
      </div>

      {/* Row 1 */}
      <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 40 }}>
        {row1.map((s) => <PhoneFrame key={s.id} screen={s} />)}
      </div>

      {/* Row 2 */}
      <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
        {row2.map((s) => <PhoneFrame key={s.id} screen={s} />)}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: 32, padding: "14px 20px",
        background: "#fff", borderRadius: 12,
        border: "1px solid #E6ECF5",
        display: "flex", flexWrap: "wrap", gap: 20,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#7A8FAD", letterSpacing: 1, alignSelf: "center" }}>TOPLAM</div>
        {[
          { label: "Üst banner", count: 2, icon: "⬆️" },
          { label: "Alt banner", count: 3, icon: "⬇️" },
          { label: "Orta banner", count: 2, icon: "↕️" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>{l.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0B1732" }}>{l.label}</span>
            <span style={{
              fontSize: 11, fontWeight: 900, color: "#fff",
              background: "#0B1732", borderRadius: 999,
              padding: "1px 7px",
            }}>{l.count}x</span>
          </div>
        ))}
      </div>
    </div>
  );
}
