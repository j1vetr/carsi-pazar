import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AlertGroup } from "./alertTypes";

const KEY = "alert_groups_v1";

export async function loadAlertGroups(): Promise<AlertGroup[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (g): g is AlertGroup =>
        g &&
        typeof g.id === "string" &&
        typeof g.name === "string" &&
        typeof g.muted === "boolean",
    );
  } catch {
    return [];
  }
}

export async function saveAlertGroups(groups: AlertGroup[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(groups));
  } catch {}
}

export function newGroupId(): string {
  return `grp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
