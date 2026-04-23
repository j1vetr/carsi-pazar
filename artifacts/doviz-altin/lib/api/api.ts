const FUNCTIONS_BASE =
  process.env.EXPO_PUBLIC_FUNCTIONS_BASE ||
  "https://europe-west1-carsi-pazar-16191.cloudfunctions.net";

export const FN = {
  getPrices: `${FUNCTIONS_BASE}/getPrices`,
  registerToken: `${FUNCTIONS_BASE}/registerToken`,
  deleteToken: `${FUNCTIONS_BASE}/deleteToken`,
  listAlerts: `${FUNCTIONS_BASE}/listAlerts`,
  saveAlert: `${FUNCTIONS_BASE}/saveAlert`,
  deleteAlert: `${FUNCTIONS_BASE}/deleteAlert`,
  getNews: `${FUNCTIONS_BASE}/getNews`,
  setPrefs: `${FUNCTIONS_BASE}/setPrefs`,
  getPrefs: `${FUNCTIONS_BASE}/getPrefs`,
  setPortfolio: `${FUNCTIONS_BASE}/setPortfolio`,
  getPortfolio: `${FUNCTIONS_BASE}/getPortfolio`,
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`${r.status} ${text || r.statusText}`);
  }
  return (await r.json()) as T;
}

export type ServerAlert = {
  id: string;
  deviceId: string;
  code: string;
  type: "above" | "below";
  target: number;
  currency: string;
  name: string;
  nameTR: string;
  active: boolean;
  triggeredAt?: { _seconds: number; _nanoseconds: number };
  triggeredPrice?: number;
};

export async function apiRegisterToken(input: {
  deviceId: string;
  expoPushToken: string;
  platform: string;
}): Promise<void> {
  await postJson<{ ok: boolean }>(FN.registerToken, input);
}

export async function apiDeleteToken(input: { deviceId: string }): Promise<void> {
  await postJson<{ ok: boolean }>(FN.deleteToken, input);
}

export async function apiListAlerts(deviceId: string): Promise<ServerAlert[]> {
  const r = await fetch(`${FN.listAlerts}?deviceId=${encodeURIComponent(deviceId)}`);
  if (!r.ok) throw new Error(`${r.status}`);
  const j = (await r.json()) as { items: ServerAlert[] };
  return j.items ?? [];
}

export async function apiSaveAlert(input: {
  deviceId: string;
  code: string;
  type: "above" | "below";
  target: number;
  currency?: string;
  name?: string;
  nameTR?: string;
  id?: string;
}): Promise<{ id: string }> {
  return await postJson<{ id: string }>(FN.saveAlert, input);
}

export async function apiDeleteAlert(input: { deviceId: string; id: string }): Promise<void> {
  await postJson<{ ok: boolean }>(FN.deleteAlert, input);
}

export type ServerNewsItem = {
  hashId: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  imageUrl: string | null;
  publishedAt: number;
};

export async function apiGetNews(category?: string, limit = 50): Promise<ServerNewsItem[]> {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  params.set("limit", String(limit));
  const r = await fetch(`${FN.getNews}?${params.toString()}`);
  if (!r.ok) throw new Error(`${r.status}`);
  const j = (await r.json()) as { items: ServerNewsItem[] };
  return j.items ?? [];
}

export type UserPrefs = {
  newsEnabled: boolean;
  newsCategories: string[];
  briefingEnabled: boolean;
  movesEnabled: boolean;
  weeklyEnabled: boolean;
  favorites: string[];
  favoritesUpdatedAt: number;
};

export async function apiGetPrefs(deviceId: string): Promise<UserPrefs> {
  const r = await fetch(`${FN.getPrefs}?deviceId=${encodeURIComponent(deviceId)}`);
  if (!r.ok) throw new Error(`${r.status}`);
  return (await r.json()) as UserPrefs;
}

export async function apiSetPrefs(input: {
  deviceId: string;
  newsEnabled?: boolean;
  newsCategories?: string[];
  briefingEnabled?: boolean;
  movesEnabled?: boolean;
  weeklyEnabled?: boolean;
  favorites?: string[];
  favoritesUpdatedAt?: number;
}): Promise<void> {
  await postJson<{ ok: boolean }>(FN.setPrefs, input);
}

export type ServerPortfolioItem = {
  id: string;
  type: "currency" | "gold";
  code: string;
  name: string;
  nameTR: string;
  amount: number;
  purchasePrice: number;
  purchaseDate: string;
  side?: "buy" | "sell";
};

export async function apiGetPortfolio(
  deviceId: string
): Promise<{ items: ServerPortfolioItem[]; clientUpdatedAt: number }> {
  const r = await fetch(
    `${FN.getPortfolio}?deviceId=${encodeURIComponent(deviceId)}`
  );
  if (!r.ok) throw new Error(`${r.status}`);
  const j = (await r.json()) as {
    items: ServerPortfolioItem[];
    clientUpdatedAt: number;
  };
  return {
    items: Array.isArray(j.items) ? j.items : [],
    clientUpdatedAt: typeof j.clientUpdatedAt === "number" ? j.clientUpdatedAt : 0,
  };
}

export async function apiSetPortfolio(input: {
  deviceId: string;
  items: ServerPortfolioItem[];
  clientUpdatedAt: number;
}): Promise<void> {
  await postJson<{ ok: boolean }>(FN.setPortfolio, input);
}
