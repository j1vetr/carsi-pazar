"use no memo";

import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

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
}

export interface WidgetSize {
  width: number;
  height: number;
}

type Hex = `#${string}`;

interface ThemePalette {
  bg: Hex;
  header: Hex;
  divider: Hex;
  rowAlt: Hex;
  fg: Hex;
  muted: Hex;
  brand: Hex;
  currencyAccent: Hex;
  goldAccent: Hex;
  up: Hex;
  upBg: Hex;
  down: Hex;
  downBg: Hex;
  flat: Hex;
  flatBg: Hex;
}

const DARK: ThemePalette = {
  bg: "#0B1220",
  header: "#0F1B30",
  divider: "#1E2A44",
  rowAlt: "#0E1828",
  fg: "#F1F5F9",
  muted: "#94A3B8",
  brand: "#60A5FA",
  currencyAccent: "#3B82F6",
  goldAccent: "#F59E0B",
  up: "#22C55E",
  upBg: "#22C55E26",
  down: "#F87171",
  downBg: "#F8717126",
  flat: "#94A3B8",
  flatBg: "#94A3B826",
};

const LIGHT: ThemePalette = {
  bg: "#FFFFFF",
  header: "#F4F7FB",
  divider: "#E5EAF1",
  rowAlt: "#F9FAFC",
  fg: "#0F172A",
  muted: "#64748B",
  brand: "#083C8F",
  currencyAccent: "#1E40AF",
  goldAccent: "#B45309",
  up: "#16A34A",
  upBg: "#16A34A1F",
  down: "#DC2626",
  downBg: "#DC26261F",
  flat: "#64748B",
  flatBg: "#64748B1F",
};

const FALLBACK_WIDTH = 320;
const FALLBACK_HEIGHT = 130;

function fmtPercent(v: number): string {
  if (!Number.isFinite(v) || v === 0) return "0,0%";
  const abs = Math.abs(v).toLocaleString("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${v > 0 ? "▲" : "▼"} ${abs}%`;
}

function Row({
  row,
  theme,
  zebra,
  isLast,
  height,
}: {
  row: WidgetRow;
  theme: ThemePalette;
  zebra: boolean;
  isLast: boolean;
  height: number;
}) {
  const up = row.changePercent > 0;
  const down = row.changePercent < 0;
  const changeColor = up ? theme.up : down ? theme.down : theme.flat;
  const changeBg = up ? theme.upBg : down ? theme.downBg : theme.flatBg;
  const accentColor =
    row.kind === "gold" ? theme.goldAccent : theme.currencyAccent;

  return (
    <FlexWidget
      style={{
        width: "match_parent",
        height,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: zebra ? theme.rowAlt : theme.bg,
        borderBottomColor: isLast ? "#00000000" : theme.divider,
        borderBottomWidth: isLast ? 0 : 1,
      }}
    >
      {/* Left accent bar */}
      <FlexWidget
        style={{
          width: 3,
          height: height - 6,
          backgroundColor: accentColor,
          marginLeft: 6,
          marginRight: 8,
          borderRadius: 2,
        }}
      />

      {/* Symbol label */}
      <FlexWidget style={{ width: 56 }}>
        <TextWidget
          text={row.label}
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: theme.fg,
          }}
        />
      </FlexWidget>

      {/* Buy / Sell prices, monospace-ish via tabular alignment */}
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          marginRight: 8,
        }}
      >
        <TextWidget
          text={row.buy}
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: theme.muted,
            fontFamily: "monospace",
          }}
        />
        <TextWidget
          text="  "
          style={{ fontSize: 12, color: theme.muted }}
        />
        <TextWidget
          text={row.sell}
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: theme.fg,
            fontFamily: "monospace",
          }}
        />
      </FlexWidget>

      {/* Change % badge */}
      <FlexWidget
        style={{
          width: 64,
          backgroundColor: changeBg,
          borderRadius: 6,
          paddingHorizontal: 6,
          paddingVertical: 2,
          marginRight: 8,
          alignItems: "center",
        }}
      >
        <TextWidget
          text={fmtPercent(row.changePercent)}
          style={{
            fontSize: 10,
            fontWeight: "700",
            color: changeColor,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

function Header({
  theme,
  width,
  updatedAt,
}: {
  theme: ThemePalette;
  width: number;
  updatedAt: string;
}) {
  return (
    <FlexWidget
      style={{
        width,
        height: 20,
        backgroundColor: theme.header,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        borderBottomColor: theme.divider,
        borderBottomWidth: 1,
      }}
    >
      <TextWidget
        text="ÇARŞI PİYASA"
        style={{
          fontSize: 9,
          fontWeight: "700",
          color: theme.brand,
        }}
      />
      <TextWidget
        text={updatedAt}
        style={{
          fontSize: 9,
          fontWeight: "500",
          color: theme.muted,
          fontFamily: "monospace",
        }}
      />
    </FlexWidget>
  );
}

function WidgetView({
  data,
  theme,
  size,
}: {
  data: PriceWidgetData;
  theme: ThemePalette;
  size: WidgetSize;
}) {
  const w = size.width > 0 ? size.width : FALLBACK_WIDTH;
  const h = size.height > 0 ? size.height : FALLBACK_HEIGHT;

  const empty = (data.error || data.loading) && data.rows.length === 0;

  if (empty) {
    return (
      <FlexWidget
        clickAction="OPEN_APP"
        style={{
          height: h,
          width: w,
          backgroundColor: theme.bg,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TextWidget
          text="ÇARŞI PİYASA"
          style={{
            fontSize: 10,
            fontWeight: "700",
            color: theme.brand,
            marginBottom: 6,
          }}
        />
        <TextWidget
          text={data.error ?? "Yükleniyor…"}
          style={{
            fontSize: 12,
            color: theme.muted,
            textAlign: "center",
          }}
        />
      </FlexWidget>
    );
  }

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

  // Distribute remaining height equally across 4 rows after the 20dp header.
  const rowsArea = Math.max(h - 20, 60);
  const rowHeight = Math.floor(rowsArea / 4);

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: h,
        width: w,
        backgroundColor: theme.bg,
        borderRadius: 16,
        flexDirection: "column",
      }}
    >
      <Header theme={theme} width={w} updatedAt={data.updatedAt} />
      <Row
        row={padded[0]}
        theme={theme}
        zebra={false}
        isLast={false}
        height={rowHeight}
      />
      <Row
        row={padded[1]}
        theme={theme}
        zebra
        isLast={false}
        height={rowHeight}
      />
      <Row
        row={padded[2]}
        theme={theme}
        zebra={false}
        isLast={false}
        height={rowHeight}
      />
      <Row
        row={padded[3]}
        theme={theme}
        zebra
        isLast
        height={rowHeight}
      />
    </FlexWidget>
  );
}

export function PriceWidget({
  data,
  size,
}: {
  data: PriceWidgetData;
  size: WidgetSize;
}) {
  return {
    light: <WidgetView data={data} theme={LIGHT} size={size} />,
    dark: <WidgetView data={data} theme={DARK} size={size} />,
  };
}
