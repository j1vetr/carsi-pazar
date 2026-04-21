import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "onboarding-seen-v1";

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
}

export async function resetOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
