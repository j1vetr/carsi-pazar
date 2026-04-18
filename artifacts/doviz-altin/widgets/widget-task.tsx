import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { fetchAllPrices, mapPrices, type AssetRate } from "@/lib/haremApi";
import { PriceWidget, type PriceWidgetData, type WidgetRow } from "./PriceWidget";

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
  } catch {
    return {
      rows: [],
      updatedAt: fmtTime(new Date()),
      error: "Bağlantı yok",
    };
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
    case "WIDGET_CLICK": {
      // First, paint a loading state immediately so the user always
      // sees something (no blank widget), even on a slow network.
      try {
        props.renderWidget(PriceWidget({ data: loadingData() }));
      } catch {}

      // Then fetch and re-render with real data.
      const data = await buildData();
      props.renderWidget(PriceWidget({ data }));
      break;
    }
    case "WIDGET_DELETED":
    default:
      break;
  }
}
