"use no memo";

import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { fetchAllPrices, mapPrices, type AssetRate } from "@/lib/haremApi";
import {
  PriceWidget,
  type PriceWidgetData,
  type WidgetRow,
  type WidgetSize,
} from "./PriceWidget";

const CACHE_KEY = "@carsi/widget-cache-v1";

async function readCache(): Promise<PriceWidgetData | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PriceWidgetData;
    if (!Array.isArray(parsed.rows) || parsed.rows.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeCache(data: PriceWidgetData): Promise<void> {
  try {
    if (!data.rows || data.rows.length === 0) return;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* no-op */
  }
}

const SHOWN_CODES: { code: string; label: string }[] = [
  { code: "USD", label: "USD" },
  { code: "EUR", label: "EUR" },
  { code: "ALTIN", label: "GRAM" },
  { code: "CEYREK", label: "ÇYREK" },
];

function fmtPrice(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "—";
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function loadingData(): PriceWidgetData {
  return {
    rows: [],
    updatedAt: fmtTime(new Date()),
    loading: true,
  };
}

function errorData(message: string): PriceWidgetData {
  return {
    rows: [],
    updatedAt: fmtTime(new Date()),
    error: message,
  };
}

async function buildData(): Promise<PriceWidgetData> {
  try {
    const raw = await fetchAllPrices();
    const rates = mapPrices(raw, {});
    const byCode = new Map<string, AssetRate>(rates.map((r) => [r.meta.code, r]));

    const rows: WidgetRow[] = SHOWN_CODES.map(({ code, label }) => {
      const r = byCode.get(code);
      if (!r) {
        return { label, value: "—", changePercent: 0 };
      }
      return {
        label,
        value: fmtPrice(r.sell),
        changePercent: r.changePercent,
      };
    });

    return { rows, updatedAt: fmtTime(new Date()) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bağlantı yok";
    return errorData(msg.length > 30 ? "Bağlantı yok" : msg);
  }
}

const TAG = "[CARSI-WIDGET]";

function safeRender(
  props: WidgetTaskHandlerProps,
  data: PriceWidgetData,
  size: WidgetSize,
  stage: string,
): void {
  try {
    props.renderWidget(PriceWidget({ data, size }));
    console.log(
      `${TAG} renderWidget OK stage=${stage} rows=${data.rows.length} loading=${!!data.loading} err=${data.error ?? "-"}`,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`${TAG} renderWidget THREW stage=${stage} err=${msg}`);
    try {
      props.renderWidget(
        PriceWidget({
          data: errorData("Widget hatası"),
          size,
        }),
      );
      console.log(`${TAG} fallback render OK`);
    } catch (e2) {
      const msg2 = e2 instanceof Error ? e2.message : String(e2);
      console.log(`${TAG} fallback render ALSO THREW err=${msg2}`);
    }
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  console.log(
    `${TAG} taskHandler ENTER action=${props.widgetAction} id=${props.widgetInfo?.widgetId} name=${props.widgetInfo?.widgetName} w=${props.widgetInfo?.width} h=${props.widgetInfo?.height}`,
  );

  // The native side reports widget dimensions via widgetInfo. On first add
  // these may be 0 if the launcher hasn't populated AppWidget options yet —
  // PriceWidget falls back to safe defaults in that case.
  const size: WidgetSize = {
    width: props.widgetInfo?.width ?? 0,
    height: props.widgetInfo?.height ?? 0,
  };

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
    case "WIDGET_CLICK": {
      // First, try to paint cached data instantly so the user never sees
      // a blank/loading widget if we have a recent snapshot. Cold-starting
      // the JS bundle + a remote fetch on first add can take 20–30 seconds,
      // which is unacceptable UX for a glanceable widget.
      const cached = await readCache();
      if (cached) {
        safeRender(props, cached, size, "cache");
      } else {
        safeRender(props, loadingData(), size, "loading");
      }

      // Then fetch and re-render with real data, persisting the result
      // so the next widget event (resize/update/etc.) can render instantly.
      console.log(`${TAG} fetching prices…`);
      const data = await buildData();
      console.log(
        `${TAG} fetched rows=${data.rows.length} err=${data.error ?? "-"}`,
      );
      if (data.rows.length > 0 && !data.error) {
        await writeCache(data);
      }
      safeRender(props, data, size, "data");
      break;
    }
    case "WIDGET_DELETED":
      console.log(`${TAG} widget deleted, no-op`);
      break;
    default:
      console.log(`${TAG} unknown action ${props.widgetAction}`);
      break;
  }
  console.log(`${TAG} taskHandler EXIT action=${props.widgetAction}`);
}
