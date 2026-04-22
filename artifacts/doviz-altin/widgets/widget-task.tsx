"use no memo";

import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import {
  PriceWidget,
  type PriceWidgetData,
  type RenderOptions,
  type WidgetSize,
} from "./PriceWidget";
import {
  buildData,
  errorData,
  loadingData,
  readWidgetCache,
  writeWidgetCache,
} from "./buildData";
import {
  DEFAULT_WIDGET_CONFIG,
  readWidgetConfig,
  type WidgetConfig,
} from "./config";

const TAG = "[CARSI-WIDGET]";

function optionsFromConfig(cfg: WidgetConfig): RenderOptions {
  return {
    priceField: cfg.priceField,
    theme: cfg.theme,
  };
}

function safeRender(
  props: WidgetTaskHandlerProps,
  data: PriceWidgetData,
  size: WidgetSize,
  options: RenderOptions,
  stage: string,
): void {
  try {
    props.renderWidget(PriceWidget({ data, size, options }));
    console.log(
      `${TAG} renderWidget OK stage=${stage} field=${options.priceField} rows=${data.rows.length} loading=${!!data.loading} err=${data.error ?? "-"}`,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`${TAG} renderWidget THREW stage=${stage} err=${msg}`);
    try {
      props.renderWidget(
        PriceWidget({
          data: errorData("Widget hatası"),
          size,
          options,
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

  const size: WidgetSize = {
    width: props.widgetInfo?.width ?? 0,
    height: props.widgetInfo?.height ?? 0,
  };

  let config: WidgetConfig;
  try {
    config = await readWidgetConfig();
  } catch {
    config = DEFAULT_WIDGET_CONFIG;
  }
  const options = optionsFromConfig(config);

  const isRefreshClick =
    props.widgetAction === "WIDGET_CLICK" &&
    (props.clickAction === "REFRESH" ||
      (props as unknown as { clickActionData?: { type?: string } })
        .clickActionData?.type === "REFRESH");

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
    case "WIDGET_CLICK": {
      // 1) Cache varsa HER ZAMAN önce onu render et (refresh tıklamasında bile).
      //    Böylece kullanıcı asla boş "Yükleniyor..." görmez; en kötü ihtimalle
      //    eski veri görür ama yenisi gelince üstüne yazılır.
      //    Refresh tıklamasında "Yenileniyor…" işareti basılır ki kullanıcı
      //    butona bastığını görsel olarak hissetsin.
      const cached = await readWidgetCache();
      if (cached) {
        safeRender(
          props,
          isRefreshClick ? { ...cached, refreshing: true } : cached,
          size,
          options,
          isRefreshClick ? "cache+refreshing" : "cache",
        );
      } else {
        // İlk kurulumda cache yoksa zorunlu olarak loading göster.
        safeRender(props, loadingData(), size, options, "loading");
      }

      console.log(`${TAG} fetching prices… codes=${config.codes.join(",")}`);
      const data = await buildData(config.codes);
      console.log(
        `${TAG} fetched rows=${data.rows.length} err=${data.error ?? "-"}`,
      );
      if (data.rows.length > 0 && !data.error) {
        await writeWidgetCache(data);
        safeRender(props, data, size, options, "data");
      } else if (cached) {
        // Fetch başarısız ama cache zaten ekranda — tekrar render etmeye gerek
        // yok. Sadece ufak bir "Bağlantı yok" işareti için cache + error karması:
        safeRender(
          props,
          { ...cached, error: data.error ?? "Bağlantı yok" },
          size,
          options,
          "stale",
        );
      } else {
        // Ne cache var ne de fetch — gerçek hata göster.
        safeRender(props, data, size, options, "error");
      }
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
