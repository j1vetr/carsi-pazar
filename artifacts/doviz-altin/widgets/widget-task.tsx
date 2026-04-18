import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { fetchAllPrices, mapPrices, type AssetRate } from "@/lib/haremApi";
import {
  PriceWidget,
  type PriceWidgetData,
  type WidgetRow,
  type WidgetSize,
} from "./PriceWidget";

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

function safeRender(
  props: WidgetTaskHandlerProps,
  data: PriceWidgetData,
  size: WidgetSize,
): void {
  try {
    props.renderWidget(PriceWidget({ data, size }));
  } catch (e) {
    // Last-ditch fallback: render plain error so the widget never stays blank.
    try {
      props.renderWidget(
        PriceWidget({
          data: errorData("Widget hatası"),
          size,
        }),
      );
    } catch {
      // Nothing more we can do; the OS will keep the previous bitmap.
    }
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
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
      // First, paint a loading state immediately so the user always
      // sees something (no blank widget), even on a slow network.
      safeRender(props, loadingData(), size);

      // Then fetch and re-render with real data.
      const data = await buildData();
      safeRender(props, data, size);
      break;
    }
    case "WIDGET_DELETED":
    default:
      break;
  }
}
