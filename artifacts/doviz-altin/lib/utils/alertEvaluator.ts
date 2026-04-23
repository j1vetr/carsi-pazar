import type { SmartAlert, AlertGroup, AlertWindow } from "./alertTypes";

export interface PricePoint {
  t: number;
  buy: number;
  sell: number;
}

export interface EvalContext {
  now: number;
  currentPrice: number;
  history: PricePoint[];
}

export interface EvalResult {
  trigger: boolean;
  observed?: number;
  baseline?: number;
}

const COOLDOWN_MS = 30 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function isMutedNow(alert: SmartAlert, now: number): boolean {
  if (alert.mutedUntil && alert.mutedUntil > now) return true;
  return false;
}

function isInWindow(win: AlertWindow | undefined, now: number): boolean {
  if (!win) return true;
  const d = new Date(now);
  const mins = d.getHours() * 60 + d.getMinutes();
  const [sh, sm] = win.start.split(":").map(Number);
  const [eh, em] = win.end.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return true;
  const startM = sh * 60 + sm;
  const endM = eh * 60 + em;
  if (startM === endM) return true;
  if (startM < endM) return mins >= startM && mins <= endM;
  return mins >= startM || mins <= endM;
}

function findPointNearAge(history: PricePoint[], ageMs: number, now: number): PricePoint | null {
  if (!history || history.length === 0) return null;
  const target = now - ageMs;
  let best = history[0];
  let bestDist = Math.abs(best.t - target);
  for (let i = 1; i < history.length; i++) {
    const d = Math.abs(history[i].t - target);
    if (d < bestDist) {
      best = history[i];
      bestDist = d;
    }
  }
  return best;
}

function dailyClosesFromHistory(history: PricePoint[], days: number, now: number): number[] {
  const closes: number[] = [];
  for (let i = days; i >= 0; i--) {
    const p = findPointNearAge(history, i * DAY_MS, now);
    if (p) closes.push(p.buy);
  }
  return closes;
}

export function evaluatePriceAlert(
  alert: Extract<SmartAlert, { kind: "price" }>,
  ctx: EvalContext
): EvalResult {
  const { currentPrice } = ctx;
  if (alert.direction === "above" && currentPrice >= alert.targetPrice) {
    return { trigger: true, observed: currentPrice, baseline: alert.targetPrice };
  }
  if (alert.direction === "below" && currentPrice <= alert.targetPrice) {
    return { trigger: true, observed: currentPrice, baseline: alert.targetPrice };
  }
  return { trigger: false };
}

export function evaluatePercentAlert(
  alert: Extract<SmartAlert, { kind: "percent" }>,
  ctx: EvalContext
): EvalResult {
  const hours = Math.max(1, alert.windowHours);
  const past = findPointNearAge(ctx.history, hours * 60 * 60 * 1000, ctx.now);
  if (!past || past.buy <= 0) return { trigger: false };
  const ageHours = (ctx.now - past.t) / (60 * 60 * 1000);
  if (ageHours < hours * 0.5) return { trigger: false };
  const pct = ((ctx.currentPrice - past.buy) / past.buy) * 100;
  const abs = Math.abs(pct);
  if (abs < alert.thresholdPct) return { trigger: false };
  if (alert.direction === "up" && pct < 0) return { trigger: false };
  if (alert.direction === "down" && pct > 0) return { trigger: false };
  return { trigger: true, observed: pct, baseline: past.buy };
}

export function evaluateTrendAlert(
  alert: Extract<SmartAlert, { kind: "trend" }>,
  ctx: EvalContext
): EvalResult {
  const days = Math.max(2, alert.days);
  const closes = dailyClosesFromHistory(ctx.history, days, ctx.now);
  if (closes.length < days + 1) return { trigger: false };
  let up = 0;
  let down = 0;
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1];
    const cur = closes[i];
    if (cur > prev) up++;
    else if (cur < prev) down++;
  }
  const total = closes.length - 1;
  if (alert.direction === "up" && up === total) {
    return { trigger: true, observed: up, baseline: days };
  }
  if (alert.direction === "down" && down === total) {
    return { trigger: true, observed: down, baseline: days };
  }
  return { trigger: false };
}

export function evaluateVolatilityAlert(
  alert: Extract<SmartAlert, { kind: "volatility" }>,
  ctx: EvalContext
): EvalResult {
  const lookback = Math.max(3, Math.min(alert.lookbackDays, 7));
  const closes = dailyClosesFromHistory(ctx.history, lookback, ctx.now);
  if (closes.length < 3) return { trigger: false };
  const absMoves: number[] = [];
  for (let i = 1; i < closes.length - 1; i++) {
    const prev = closes[i - 1];
    const cur = closes[i];
    if (prev > 0) absMoves.push(Math.abs((cur - prev) / prev) * 100);
  }
  if (absMoves.length === 0) return { trigger: false };
  const avg = absMoves.reduce((a, b) => a + b, 0) / absMoves.length;
  const prevClose = closes[closes.length - 2];
  if (!prevClose) return { trigger: false };
  const todayMove = Math.abs((ctx.currentPrice - prevClose) / prevClose) * 100;
  const threshold = avg * Math.max(1.5, alert.multiplier);
  if (todayMove >= threshold && todayMove > 0.1) {
    return { trigger: true, observed: todayMove, baseline: avg };
  }
  return { trigger: false };
}

export function evaluateAlert(alert: SmartAlert, ctx: EvalContext): EvalResult {
  switch (alert.kind) {
    case "price": return evaluatePriceAlert(alert, ctx);
    case "percent": return evaluatePercentAlert(alert, ctx);
    case "trend": return evaluateTrendAlert(alert, ctx);
    case "volatility": return evaluateVolatilityAlert(alert, ctx);
  }
}

export function canFireAlert(
  alert: SmartAlert,
  groups: AlertGroup[],
  now: number
): boolean {
  if (!alert.active) return false;
  if (alert.triggered && alert.kind === "price") return false;
  if (isMutedNow(alert, now)) return false;
  if (!isInWindow(alert.window, now)) return false;
  if (alert.lastTriggeredAt && now - alert.lastTriggeredAt < COOLDOWN_MS) return false;
  if (alert.groupId) {
    const g = groups.find((x) => x.id === alert.groupId);
    if (g?.muted) return false;
  }
  return true;
}

export interface EvaluateAllInput {
  alerts: SmartAlert[];
  groups: AlertGroup[];
  priceOf: (code: string) => number | null;
  historyOf: (code: string) => PricePoint[];
  now?: number;
}

export interface AlertFiring {
  alert: SmartAlert;
  result: EvalResult;
}

export function evaluateAlerts(input: EvaluateAllInput): AlertFiring[] {
  const now = input.now ?? Date.now();
  const fired: AlertFiring[] = [];
  for (const a of input.alerts) {
    if (!canFireAlert(a, input.groups, now)) continue;
    const price = input.priceOf(a.code);
    if (price == null) continue;
    const history = input.historyOf(a.code) ?? [];
    const result = evaluateAlert(a, { now, currentPrice: price, history });
    if (result.trigger) fired.push({ alert: a, result });
  }
  return fired;
}
