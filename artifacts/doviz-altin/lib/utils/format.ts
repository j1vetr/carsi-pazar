/**
 * TR-locale fiyat / yüzde / zaman / sembol biçimleyiciler.
 * Pure helpers — Hooks/RN bağımlılığı yok, jest "utils" project'i altında
 * kolayca test edilir.
 */

/**
 * Fiyatı TL/USD/EUR vs. için ondalık duyarlılığı dinamik seçen biçim:
 *  - >= 1000 → 0 ondalık (binlik nokta)
 *  - >= 10   → 2 ondalık
 *  - >= 1    → 4 ondalık
 *  - <  1    → 6 ondalık (kripto/parite gibi küçük değerler için)
 * Kullanıcının lokalini değil, TR lokalini sabitliyoruz; uygulama TR-only.
 */
export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  let digits = 4;
  if (abs >= 1000) digits = 0;
  else if (abs >= 10) digits = 2;
  else if (abs >= 1) digits = 4;
  else digits = 6;
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/**
 * Yüzde değişimi okçukla biçimler (▲/▼). 0 / NaN / Infinite → "0,00%".
 * abs limit 999.99% (sınırsız büyüklükteki rakamlar dökülür).
 */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0,00%";
  const abs = Math.abs(value).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value > 0 ? "▲" : "▼"} ${abs}%`;
}

/**
 * Zaman farkını TR diliyle "şimdi / 5 dk önce / 2 sa önce / 3 g önce"
 * şeklinde döker. `now` parametresi test edilebilirlik için opsiyonel.
 */
export function formatTimeAgo(timestamp: number, now: number = Date.now()): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "—";
  const diff = Math.max(0, now - timestamp);
  const sec = Math.floor(diff / 1000);
  if (sec < 30) return "şimdi";
  if (sec < 60) return `${sec} sn önce`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} sa önce`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} g önce`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo} ay önce`;
  return `${Math.floor(mo / 12)} yıl önce`;
}

/**
 * Tarihi "23 Nis 2026" / "23 Nis 14:32" formatında döker.
 * `withTime=true` ise saat eklenir, aksi halde sadece tarih.
 */
const MONTHS_TR_SHORT = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

export function formatDate(input: number | Date, withTime = false): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  const day = d.getDate();
  const mon = MONTHS_TR_SHORT[d.getMonth()] ?? "?";
  const year = d.getFullYear();
  if (!withTime) return `${day} ${mon} ${year}`;
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${mon} ${hh}:${mm}`;
}

/**
 * Mutlak değişimi (₺ cinsi delta) işaretle birlikte biçimler.
 */
export function formatChange(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0,00";
  const sign = value > 0 ? "+" : "−";
  const abs = Math.abs(value).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${abs}`;
}
