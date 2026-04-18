import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export interface WidgetRow {
  label: string;
  value: string;
  changePercent: number;
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
  cell: Hex;
  fg: Hex;
  muted: Hex;
  accent: Hex;
  up: Hex;
  down: Hex;
}

const LIGHT: ThemePalette = {
  bg: "#FFFFFF",
  cell: "#F4F7FB",
  fg: "#0F172A",
  muted: "#64748B",
  accent: "#083C8F",
  up: "#16A34A",
  down: "#DC2626",
};

const DARK: ThemePalette = {
  bg: "#0B1220",
  cell: "#152844",
  fg: "#F1F5F9",
  muted: "#94A3B8",
  accent: "#60A5FA",
  up: "#22C55E",
  down: "#F87171",
};

const FALLBACK_WIDTH = 320;
const FALLBACK_HEIGHT = 80;

function fmtPercent(v: number): string {
  if (!Number.isFinite(v) || v === 0) return "0,0%";
  const abs = Math.abs(v).toLocaleString("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${v > 0 ? "▲" : "▼"}${abs}%`;
}

function Cell({ row, theme }: { row: WidgetRow; theme: ThemePalette }) {
  const up = row.changePercent > 0;
  const down = row.changePercent < 0;
  const changeColor = up ? theme.up : down ? theme.down : theme.muted;

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: "column",
        backgroundColor: theme.cell,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginHorizontal: 2,
        justifyContent: "center",
      }}
    >
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextWidget
          text={row.label}
          style={{ fontSize: 9, fontWeight: "700", color: theme.muted }}
        />
        <TextWidget
          text={fmtPercent(row.changePercent)}
          style={{ fontSize: 8, fontWeight: "700", color: changeColor }}
        />
      </FlexWidget>
      <TextWidget
        text={row.value}
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: theme.fg,
          marginTop: 1,
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
  const empty = (data.error || data.loading) && data.rows.length === 0;

  const padded: WidgetRow[] = [...data.rows];
  while (padded.length < 4) padded.push({ label: "—", value: "—", changePercent: 0 });

  // CRITICAL: Use explicit pixel sizes instead of "match_parent" because
  // some launchers don't populate OPTION_APPWIDGET_MAX_HEIGHT on first add,
  // causing the bitmap to be rendered at 0×0 (transparent widget).
  const w = size.width > 0 ? size.width : FALLBACK_WIDTH;
  const h = size.height > 0 ? size.height : FALLBACK_HEIGHT;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: h,
        width: w,
        backgroundColor: theme.bg,
        borderRadius: 14,
        padding: 4,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {empty ? (
        <FlexWidget
          style={{
            flex: 1,
            height: h,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextWidget
            text={data.error ?? "Yükleniyor…"}
            style={{ fontSize: 11, color: theme.muted, textAlign: "center" }}
          />
        </FlexWidget>
      ) : (
        <>
          <Cell row={padded[0]} theme={theme} />
          <Cell row={padded[1]} theme={theme} />
          <Cell row={padded[2]} theme={theme} />
          <Cell row={padded[3]} theme={theme} />
        </>
      )}
    </FlexWidget>
  );
}

/**
 * Returns a themed widget representation. We intentionally render the SAME
 * tree for light and dark slots (using the dark palette as a default) — most
 * Android launchers display the bitmap on a translucent surface where dark
 * works well. Returning a single tree (not {light, dark}) avoids double
 * bitmap rasterisation that can race when widget dimensions are not yet
 * populated by the host.
 */
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
