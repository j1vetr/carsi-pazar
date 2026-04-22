"use no memo";

import React from "react";
import {
  FlexWidget,
  ImageWidget,
  TextWidget,
} from "react-native-android-widget";

import type { PriceField, WidgetTheme } from "./config";

const LOGO_DARK = require("../assets/images/logo-dark.png");
const LOGO_LIGHT = require("../assets/images/logo-light.png");

export type AssetKind = "currency" | "gold";

export interface WidgetRow {
  label: string;
  buy: string;
  sell: string;
  changePercent: number;
  kind: AssetKind;
}

export interface PriceWidgetData {
  rows: WidgetRow[];
  updatedAt: string;
  error?: string;
  loading?: boolean;
  /** True while a refresh fetch is in flight; widget shows a "Yenileniyor…" hint. */
  refreshing?: boolean;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface RenderOptions {
  priceField: PriceField;
  theme: WidgetTheme;
}

type Hex = `#${string}`;

interface ThemePalette {
  bg: Hex;
  cardBg: Hex;
  border: Hex;
  divider: Hex;
  fg: Hex;
  muted: Hex;
  refreshBg: Hex;
  refreshFg: Hex;
  up: Hex;
  upBg: Hex;
  down: Hex;
  downBg: Hex;
  flat: Hex;
  flatBg: Hex;
  /** USD, EUR, GRAM, ÇEYREK accent tints – cycled in cell order. */
  tints: Hex[];
  logo: typeof LOGO_LIGHT;
}

const DARK: ThemePalette = {
  bg: "#05070E",
  cardBg: "#10172A",
  border: "#1F2A44",
  divider: "#1B2540",
  fg: "#F8FAFC",
  muted: "#94A3B8",
  refreshBg: "#2563EB",
  refreshFg: "#FFFFFF",
  up: "#4ADE80",
  upBg: "#22C55E33",
  down: "#FCA5A5",
  downBg: "#F8717133",
  flat: "#94A3B8",
  flatBg: "#94A3B833",
  tints: ["#60A5FA", "#2DD4BF", "#F59E0B", "#FB7185"],
  logo: LOGO_DARK,
};

const LIGHT: ThemePalette = {
  bg: "#F1F4FB",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  divider: "#EEF2F7",
  fg: "#0F172A",
  muted: "#64748B",
  refreshBg: "#0B1220",
  refreshFg: "#FFFFFF",
  up: "#15803D",
  upBg: "#16A34A26",
  down: "#B91C1C",
  downBg: "#DC262626",
  flat: "#64748B",
  flatBg: "#64748B26",
  tints: ["#1D4ED8", "#0F766E", "#B45309", "#BE123C"],
  logo: LOGO_LIGHT,
};

const FALLBACK_W = 360;
const FALLBACK_H = 130;

function fmtPercent(v: number): string {
  if (!Number.isFinite(v) || v === 0) return "0,00%";
  const abs = Math.abs(v).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${v > 0 ? "▲" : "▼"} ${abs}%`;
}

function priceForField(row: WidgetRow, field: PriceField): string {
  // Tercih edilen tarafı göster; o boş/"—" ise diğer tarafa düş.
  // (HaremAPI bazen sadece bid VEYA ask döndürüyor — özellikle SARRAFIYE'de.)
  const primary = field === "buy" ? row.buy : row.sell;
  const secondary = field === "buy" ? row.sell : row.buy;
  if (primary && primary !== "—") return primary;
  if (secondary && secondary !== "—") return secondary;
  return "—";
}

/* ─────────────────────────  PULSE LAYOUT  ───────────────────────── */

function PulseCell({
  row,
  theme,
  width,
  height,
  isFirst,
  tint,
  priceField,
}: {
  row: WidgetRow;
  theme: ThemePalette;
  width: number;
  height: number;
  isFirst: boolean;
  tint: Hex;
  priceField: PriceField;
}) {
  const up = row.changePercent > 0;
  const down = row.changePercent < 0;
  const changeColor = up ? theme.up : down ? theme.down : theme.flat;
  const changeBg = up ? theme.upBg : down ? theme.downBg : theme.flatBg;
  const value = priceForField(row, priceField);

  return (
    <FlexWidget
      style={{
        width,
        height,
        flexDirection: "row",
        alignItems: "center",
        borderLeftColor: isFirst ? "#00000000" : theme.divider,
        borderLeftWidth: isFirst ? 0 : 1,
        paddingHorizontal: 6,
      }}
    >
      {/* tint bar */}
      <FlexWidget
        style={{
          width: 3,
          height: height - 24,
          backgroundColor: tint,
          borderRadius: 2,
          marginRight: 6,
        }}
      />
      <FlexWidget style={{ flex: 1, flexDirection: "column" }}>
        <TextWidget
          text={row.label}
          maxLines={1}
          style={{
            fontSize: 9,
            fontWeight: "700",
            color: theme.muted,
          }}
        />
        <TextWidget
          text={value}
          maxLines={1}
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: theme.fg,
            fontFamily: "monospace",
            marginTop: 2,
          }}
        />
        <FlexWidget
          style={{
            flexDirection: "row",
            marginTop: 3,
          }}
        >
          <FlexWidget
            style={{
              backgroundColor: changeBg,
              borderRadius: 4,
              paddingHorizontal: 4,
              paddingVertical: 1,
            }}
          >
            <TextWidget
              text={fmtPercent(row.changePercent)}
              maxLines={1}
              style={{ fontSize: 8, fontWeight: "700", color: changeColor }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

function PulseView({
  data,
  theme,
  size,
  priceField,
}: {
  data: PriceWidgetData;
  theme: ThemePalette;
  size: WidgetSize;
  priceField: PriceField;
}) {
  const w = size.width > 0 ? size.width : FALLBACK_W;
  const h = size.height > 0 ? size.height : FALLBACK_H;

  const empty = (data.error || data.loading) && data.rows.length === 0;
  if (empty) return <EmptyView theme={theme} w={w} h={h} data={data} />;

  const padded: WidgetRow[] = [...data.rows];
  while (padded.length < 4) {
    padded.push({
      label: "—",
      buy: "—",
      sell: "—",
      changePercent: 0,
      kind: "currency",
    });
  }

  const logoW = 78;
  const refreshW = 60;
  const cellsW = Math.max(w - logoW - refreshW - 8, 120);
  const cellW = Math.floor(cellsW / 4);
  const innerH = h - 8;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        width: w,
        height: h,
        backgroundColor: theme.bg,
        borderRadius: 18,
        padding: 4,
      }}
    >
      <FlexWidget
        style={{
          width: w - 8,
          height: innerH,
          backgroundColor: theme.cardBg,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.border,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* LOGO */}
        <FlexWidget
          style={{
            width: logoW,
            height: innerH,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageWidget
            image={theme.logo}
            imageWidth={64}
            imageHeight={16}
          />
        </FlexWidget>

        {/* divider */}
        <FlexWidget
          style={{
            width: 1,
            height: innerH - 16,
            backgroundColor: theme.divider,
          }}
        />

        {/* CELLS */}
        <FlexWidget
          style={{
            width: cellW * 4,
            height: innerH,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {padded.slice(0, 4).map((row, i) => (
            <PulseCell
              key={`${row.label}-${i}`}
              row={row}
              theme={theme}
              width={cellW}
              height={innerH}
              isFirst={i === 0}
              tint={theme.tints[i] ?? theme.tints[0]}
              priceField={priceField}
            />
          ))}
        </FlexWidget>

        {/* REFRESH */}
        <FlexWidget
          clickAction="REFRESH"
          style={{
            width: refreshW,
            height: innerH,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FlexWidget
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: data.refreshing
                ? theme.muted
                : data.error
                  ? theme.down
                  : theme.refreshBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextWidget
              text={data.refreshing ? "…" : data.error ? "!" : "↻"}
              style={{
                fontSize: data.refreshing ? 22 : 18,
                fontWeight: "700",
                color: theme.refreshFg,
              }}
            />
          </FlexWidget>
          <TextWidget
            text={
              data.refreshing
                ? "Yenileniyor…"
                : data.error
                  ? "Tekrar dene"
                  : data.updatedAt
            }
            maxLines={1}
            style={{
              fontSize: 8,
              fontWeight: "700",
              color: data.error && !data.refreshing ? theme.down : theme.muted,
              fontFamily: "monospace",
              marginTop: 3,
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

/* ─────────────────────────  EMPTY  ───────────────────────── */

function EmptyView({
  theme,
  w,
  h,
  data,
}: {
  theme: ThemePalette;
  w: number;
  h: number;
  data: PriceWidgetData;
}) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: h,
        width: w,
        backgroundColor: theme.cardBg,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ImageWidget image={theme.logo} imageWidth={88} imageHeight={22} />
      <TextWidget
        text={data.error ?? "Yükleniyor…"}
        style={{
          fontSize: 11,
          fontWeight: "500",
          color: theme.muted,
          marginTop: 8,
        }}
      />
    </FlexWidget>
  );
}

/* ─────────────────────────  ENTRY  ───────────────────────── */

function pickPalette(theme: WidgetTheme): {
  light: ThemePalette;
  dark: ThemePalette;
} {
  if (theme === "dark") return { light: DARK, dark: DARK };
  if (theme === "light") return { light: LIGHT, dark: LIGHT };
  return { light: LIGHT, dark: DARK };
}

export function PriceWidget({
  data,
  size,
  options,
}: {
  data: PriceWidgetData;
  size: WidgetSize;
  options: RenderOptions;
}) {
  const palettes = pickPalette(options.theme);
  return {
    light: (
      <PulseView
        data={data}
        theme={palettes.light}
        size={size}
        priceField={options.priceField}
      />
    ),
    dark: (
      <PulseView
        data={data}
        theme={palettes.dark}
        size={size}
        priceField={options.priceField}
      />
    ),
  };
}
