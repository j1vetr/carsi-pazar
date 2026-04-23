import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";

const KEY = "onboarding-seen-v1";

export const ONBOARDING_DONE_EVENT = "onboarding:done";

export async function isOnboardingSeen(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === "1";
  } catch {
    return false;
  }
}

export async function setOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, "1");
  } catch {}
  try {
    DeviceEventEmitter.emit(ONBOARDING_DONE_EVENT);
  } catch {}
}

export async function resetOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
