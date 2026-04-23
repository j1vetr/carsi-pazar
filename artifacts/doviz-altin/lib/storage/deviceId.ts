import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "deviceId_v1";

function uuid(): string {
  // RFC4122 v4-ish, no dependency
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let cached: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  const existing = await AsyncStorage.getItem(KEY);
  if (existing) {
    cached = existing;
    return existing;
  }
  const id = uuid();
  await AsyncStorage.setItem(KEY, id);
  cached = id;
  return id;
}
