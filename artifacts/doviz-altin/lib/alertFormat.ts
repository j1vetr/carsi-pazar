import type { SmartAlert } from "./alertTypes";
import type { EvalResult } from "./alertEvaluator";

function fmtPrice(p: number): string {
  if (p >= 10000) return p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 10) return p.toFixed(4);
  return p.toFixed(4);
}

function fmtPct(p: number): string {
  return `%${Math.abs(p).toFixed(2).replace(".", ",")}`;
}

export function formatAlertRule(alert: SmartAlert): string {
  switch (alert.kind) {
    case "price":
      return `Fiyat ₺${fmtPrice(alert.targetPrice)} seviyesinin ${
        alert.direction === "above" ? "üzerine çıkınca" : "altına düşünce"
      }`;
    case "percent": {
      const dir =
        alert.direction === "up" ? "yükselirse" :
        alert.direction === "down" ? "düşerse" : "hareket ederse";
      return `Son ${alert.windowHours} saatte ${fmtPct(alert.thresholdPct)} ${dir}`;
    }
    case "trend":
      return `${alert.days} gün üst üste ${alert.direction === "up" ? "yükselirse" : "düşerse"}`;
    case "volatility":
      return `Ortalama günlük hareketin ${alert.multiplier.toFixed(1)} katı kadar oynama olursa`;
  }
}

export function formatAlertTitle(alert: SmartAlert): string {
  const sym = alert.nameTR;
  switch (alert.kind) {
    case "price":
      return alert.direction === "above"
        ? `${sym} hedefin üzerine çıktı`
        : `${sym} hedefin altına düştü`;
    case "percent":
      return alert.direction === "up"
        ? `${sym} sert yükseldi`
        : alert.direction === "down"
        ? `${sym} sert düştü`
        : `${sym} önemli hareket yaptı`;
    case "trend":
      return alert.direction === "up"
        ? `${sym} kesintisiz yükseliyor`
        : `${sym} kesintisiz düşüyor`;
    case "volatility":
      return `${sym} sakin piyasadan çıktı`;
  }
}

export function formatAlertBody(alert: SmartAlert, r: EvalResult): string {
  switch (alert.kind) {
    case "price":
      return r.observed != null
        ? `Şu anki fiyat ₺${fmtPrice(r.observed)}. Hedef: ₺${fmtPrice(alert.targetPrice)}.`
        : formatAlertRule(alert);
    case "percent":
      if (r.observed != null) {
        const sign = r.observed >= 0 ? "yükseldi" : "düştü";
        return `${alert.nameTR} son ${alert.windowHours} saatte ${fmtPct(r.observed)} ${sign}.`;
      }
      return formatAlertRule(alert);
    case "trend":
      return `${alert.nameTR} ${alert.days} gün üst üste ${
        alert.direction === "up" ? "yükseliş" : "düşüş"
      } kaydetti.`;
    case "volatility":
      if (r.observed != null && r.baseline != null) {
        return `Bugünkü hareket ${fmtPct(r.observed)} · son günlerin ortalaması ${fmtPct(r.baseline)}.`;
      }
      return formatAlertRule(alert);
  }
}

export function formatAlertPreview(alert: SmartAlert, currentPrice: number, history: { t: number; buy: number }[]): string {
  switch (alert.kind) {
    case "price":
      return `Şu an ₺${fmtPrice(currentPrice)} → ₺${fmtPrice(alert.targetPrice)} olduğunda uyaracak.`;
    case "percent": {
      if (history.length === 0) return "Yeterli geçmiş veri toplanınca değerlendirilecek.";
      const target = Date.now() - alert.windowHours * 60 * 60 * 1000;
      let best = history[0];
      let bestDist = Math.abs(best.t - target);
      for (const p of history) {
        const d = Math.abs(p.t - target);
        if (d < bestDist) { best = p; bestDist = d; }
      }
      const pct = ((currentPrice - best.buy) / best.buy) * 100;
      return `Şu an ${fmtPct(pct)} → ${fmtPct(alert.thresholdPct)} olduğunda uyaracak.`;
    }
    case "trend":
      return `${alert.days} gün üst üste ${alert.direction === "up" ? "yükseliş" : "düşüş"} görüldüğünde uyaracak.`;
    case "volatility":
      return `Son günlerin ortalamasının ${alert.multiplier.toFixed(1)} katı kadar bir hareket olduğunda uyaracak.`;
  }
}
