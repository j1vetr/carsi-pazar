import type { PortfolioItem } from "@/contexts/AppContext";

export type AllocationBucket = "currency" | "gold" | "metal" | "parity";

export interface Transaction {
  id: string;
  code: string;
  type: "currency" | "gold";
  name: string;
  nameTR: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  date: string;
}

export interface Holding {
  key: string;
  code: string;
  type: "currency" | "gold";
  name: string;
  nameTR: string;
  amount: number;
  costBasis: number;
  avgPrice: number;
  realized: number;
  currentPrice: number;
  currentValue: number;
  unrealized: number;
  unrealizedPercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  transactions: Transaction[];
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  unrealized: number;
  unrealizedPercent: number;
  realized: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  buckets: Record<AllocationBucket, number>;
}

const EPS = 1e-9;

export function txFromItem(item: PortfolioItem): Transaction {
  return {
    id: item.id,
    code: item.code,
    type: item.type,
    name: item.name,
    nameTR: item.nameTR,
    side: item.side === "sell" ? "sell" : "buy",
    amount: item.amount,
    price: item.purchasePrice,
    date: item.purchaseDate,
  };
}

export function aggregateHoldings(
  items: PortfolioItem[],
  getRate: (code: string) => { buy: number; prevClose?: number } | undefined,
): Holding[] {
  const groups = new Map<string, Transaction[]>();
  for (const it of items) {
    const key = `${it.type}:${it.code}`;
    const arr = groups.get(key);
    if (arr) arr.push(txFromItem(it));
    else groups.set(key, [txFromItem(it)]);
  }

  const out: Holding[] = [];
  for (const [key, txs] of groups) {
    txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = txs[0];

    let amount = 0;
    let cost = 0;
    let realized = 0;

    for (const tx of txs) {
      if (tx.side === "buy") {
        amount += tx.amount;
        cost += tx.amount * tx.price;
      } else {
        const avg = amount > EPS ? cost / amount : tx.price;
        const sellAmt = Math.min(tx.amount, amount);
        realized += sellAmt * (tx.price - avg);
        cost -= sellAmt * avg;
        amount -= sellAmt;
        if (amount < EPS) {
          amount = 0;
          cost = 0;
        }
      }
    }

    const rate = getRate(first.code);
    const currentPrice = rate?.buy ?? (amount > 0 ? cost / amount : first.price);
    const prevClose = rate?.prevClose ?? currentPrice;
    const currentValue = amount * currentPrice;
    const unrealized = currentValue - cost;
    const unrealizedPercent = cost > EPS ? (unrealized / cost) * 100 : 0;
    const dayChange = amount * (currentPrice - prevClose);
    const dayChangePercent =
      prevClose > EPS ? ((currentPrice - prevClose) / prevClose) * 100 : 0;
    const totalReturn = realized + unrealized;
    const totalCostEverInvested = txs
      .filter((t) => t.side === "buy")
      .reduce((s, t) => s + t.amount * t.price, 0);
    const totalReturnPercent =
      totalCostEverInvested > EPS ? (totalReturn / totalCostEverInvested) * 100 : 0;

    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    out.push({
      key,
      code: first.code,
      type: first.type,
      name: first.name,
      nameTR: first.nameTR,
      amount,
      costBasis: cost,
      avgPrice: amount > EPS ? cost / amount : 0,
      realized,
      currentPrice,
      currentValue,
      unrealized,
      unrealizedPercent,
      totalReturn,
      totalReturnPercent,
      dayChange,
      dayChangePercent,
      transactions: txs,
    });
  }

  out.sort((a, b) => b.currentValue - a.currentValue);
  return out;
}

export function bucketForCode(
  code: string,
  type: "currency" | "gold",
  group?: string,
): AllocationBucket {
  if (group === "parity" || group === "gold-parity" || group === "ratio") return "parity";
  if (group === "metal" || group === "silver") return "metal";
  if (type === "gold") return "gold";
  return "currency";
}

export function summarizePortfolio(
  holdings: Holding[],
  bucketFn: (h: Holding) => AllocationBucket,
): PortfolioStats {
  let totalValue = 0;
  let totalCost = 0;
  let unrealized = 0;
  let realized = 0;
  let dayChange = 0;
  let prevValue = 0;
  const buckets: Record<AllocationBucket, number> = {
    currency: 0,
    gold: 0,
    metal: 0,
    parity: 0,
  };
  for (const h of holdings) {
    totalValue += h.currentValue;
    totalCost += h.costBasis;
    unrealized += h.unrealized;
    realized += h.realized;
    dayChange += h.dayChange;
    prevValue += h.currentValue - h.dayChange;
    buckets[bucketFn(h)] += h.currentValue;
  }
  const unrealizedPercent = totalCost > EPS ? (unrealized / totalCost) * 100 : 0;
  const totalReturn = realized + unrealized;
  const totalInvested = holdings.reduce(
    (s, h) =>
      s +
      h.transactions
        .filter((t) => t.side === "buy")
        .reduce((x, t) => x + t.amount * t.price, 0),
    0,
  );
  const totalReturnPercent = totalInvested > EPS ? (totalReturn / totalInvested) * 100 : 0;
  const dayChangePercent = prevValue > EPS ? (dayChange / prevValue) * 100 : 0;
  return {
    totalValue,
    totalCost,
    unrealized,
    unrealizedPercent,
    realized,
    totalReturn,
    totalReturnPercent,
    dayChange,
    dayChangePercent,
    buckets,
  };
}

export function availableToSell(items: PortfolioItem[], code: string, type: "currency" | "gold"): number {
  let amount = 0;
  for (const it of items) {
    if (it.code !== code || it.type !== type) continue;
    if (it.side === "sell") amount -= it.amount;
    else amount += it.amount;
  }
  return Math.max(0, amount);
}
