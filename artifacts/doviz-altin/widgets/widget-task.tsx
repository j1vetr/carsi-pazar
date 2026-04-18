import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { fetchAllPrices, mapPrices, type AssetRate } from "@/lib/haremApi";
import { PriceWidget, type PriceWidgetData, type WidgetRow } from "./PriceWidget";

const SHOWN_CODES: { code: string; label: string }[] = [
  { code: "USD", label: "USD" },
  { code: "EUR", label: "EUR" },
  { code: "ALTIN", label: "Gram" },
];

function fmtPrice(value: number, decimals: number): string {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

function fmtTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
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
      const decimals = Math.min(r.meta.decimals ?? 2, 2);
      return {
        label,
        value: fmtPrice(r.buy, decimals),
        changePercent: r.changePercent,
      };
    });

    return { rows, updatedAt: fmtTime(new Date()) };
  } catch (e) {
    return {
      rows: [],
      updatedAt: fmtTime(new Date()),
      error: "Veriler yüklenemedi",
    };
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
    case "WIDGET_CLICK": {
      const data = await buildData();
      props.renderWidget(PriceWidget({ data }));
      break;
    }
    case "WIDGET_DELETED":
    default:
      break;
  }
}
