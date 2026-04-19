"use no memo";

import { Platform } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";

import { PriceWidget, type WidgetSize } from "./PriceWidget";
import { buildData, writeWidgetCache } from "./buildData";

const TAG = "[CARSI-WIDGET]";

const FALLBACK_WIDTH = 320;
const FALLBACK_HEIGHT = 80;

let inFlight: Promise<void> | null = null;
let lastRefreshAt = 0;
const MIN_INTERVAL_MS = 5_000;

/**
 * Manually refresh all PriceWidget instances on the home screen with fresh
 * data. Safe to call from app code (e.g. on AppState change). No-ops on
 * non-Android platforms and is debounced so rapid calls don't pile up.
 */
export async function refreshPriceWidget(): Promise<void> {
  if (Platform.OS !== "android") return;
  if (inFlight) return inFlight;

  const now = Date.now();
  if (now - lastRefreshAt < MIN_INTERVAL_MS) return;
  lastRefreshAt = now;

  inFlight = (async () => {
    try {
      const data = await buildData();
      if (data.rows.length > 0 && !data.error) {
        await writeWidgetCache(data);
      }
      await requestWidgetUpdate({
        widgetName: "PriceWidget",
        renderWidget: (info) => {
          const size: WidgetSize = {
            width: info.width > 0 ? info.width : FALLBACK_WIDTH,
            height: info.height > 0 ? info.height : FALLBACK_HEIGHT,
          };
          return PriceWidget({ data, size });
        },
        widgetNotFound: () => {
          console.log(`${TAG} refresh: no widgets on home screen`);
        },
      });
      console.log(
        `${TAG} refresh OK rows=${data.rows.length} err=${data.error ?? "-"}`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`${TAG} refresh FAILED err=${msg}`);
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
