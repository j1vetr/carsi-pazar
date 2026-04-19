import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import { refreshPriceWidget } from "@/widgets/refresh";

export const WIDGET_BACKGROUND_TASK = "carsi-widget-background-refresh";

type RemoteData = {
  type?: string;
  [key: string]: unknown;
};

function extractData(payload: unknown): RemoteData | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;
  // expo-notifications background task payload may wrap data in different shapes
  // depending on FCM/APNS pipeline. Check common locations.
  const candidates: unknown[] = [
    obj.data,
    (obj.notification as Record<string, unknown> | undefined)?.data,
    (obj.notification as Record<string, unknown> | undefined)?.request &&
      ((obj.notification as Record<string, unknown>).request as Record<string, unknown>)
        .content &&
      (
        ((obj.notification as Record<string, unknown>).request as Record<string, unknown>)
          .content as Record<string, unknown>
      ).data,
  ];
  for (const c of candidates) {
    if (c && typeof c === "object") return c as RemoteData;
  }
  return null;
}

// Module-level: register task definition exactly once when the JS bundle loads.
// expo-task-manager requires the task to be defined synchronously at startup so
// that the OS can dispatch background notifications to it.
if (!TaskManager.isTaskDefined(WIDGET_BACKGROUND_TASK)) {
  TaskManager.defineTask(WIDGET_BACKGROUND_TASK, async ({ data, error }) => {
    if (error) {
      console.warn("[widget-bg] task error", error);
      return;
    }
    try {
      const remote = extractData(data);
      if (remote?.type !== "widget_refresh") return;
      await refreshPriceWidget({ force: true });
      console.log("[widget-bg] refreshed via push");
    } catch (e) {
      console.warn("[widget-bg] refresh failed", e);
    }
  });
}

export async function registerWidgetBackgroundTask(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.registerTaskAsync(WIDGET_BACKGROUND_TASK);
  } catch (e) {
    console.warn("[widget-bg] registerTaskAsync failed", e);
  }
}
