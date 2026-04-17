const FUNCTIONS_BASE =
  process.env.EXPO_PUBLIC_FUNCTIONS_BASE ||
  "https://europe-west1-carsi-pazar-16191.cloudfunctions.net";

export const FN = {
  getPrices: `${FUNCTIONS_BASE}/getPrices`,
  registerToken: `${FUNCTIONS_BASE}/registerToken`,
  listAlerts: `${FUNCTIONS_BASE}/listAlerts`,
  saveAlert: `${FUNCTIONS_BASE}/saveAlert`,
  deleteAlert: `${FUNCTIONS_BASE}/deleteAlert`,
  getNews: `${FUNCTIONS_BASE}/getNews`,
  setPrefs: `${FUNCTIONS_BASE}/setPrefs`,
  getPrefs: `${FUNCTIONS_BASE}/getPrefs`,
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

export type UserPrefs = { newsEnabled: boolean; newsCategories: string[] };

export async function apiGetPrefs(deviceId: string): Promise<UserPrefs> {
  const r = await fetch(`${FN.getPrefs}?deviceId=${encodeURIComponent(deviceId)}`);
  if (!r.ok) throw new Error(`${r.status}`);
  return (await r.json()) as UserPrefs;
}

export async function apiSetPrefs(input: {
  deviceId: string;
  newsEnabled?: boolean;
  newsCategories?: string[];
}): Promise<void> {
  await postJson<{ ok: boolean }>(FN.setPrefs, input);
}
