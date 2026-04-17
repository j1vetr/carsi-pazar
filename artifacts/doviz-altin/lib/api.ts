const FUNCTIONS_BASE =
  process.env.EXPO_PUBLIC_FUNCTIONS_BASE ||
  "https://europe-west1-carsi-pazar-16191.cloudfunctions.net";

export const FN = {
  getPrices: `${FUNCTIONS_BASE}/getPrices`,
  registerToken: `${FUNCTIONS_BASE}/registerToken`,
  listAlerts: `${FUNCTIONS_BASE}/listAlerts`,
  saveAlert: `${FUNCTIONS_BASE}/saveAlert`,
  deleteAlert: `${FUNCTIONS_BASE}/deleteAlert`,
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
