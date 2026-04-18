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

type Hex = `#${string}`;

interface ThemePalette {
  bg: Hex;
  cell: Hex;
  border: Hex;
  fg: Hex;
  muted: Hex;
  accent: Hex;
  up: Hex;
  down: Hex;
}

const LIGHT: ThemePalette = {
  bg: "#FFFFFF",
  cell: "#F4F7FB",
  border: "#E2E8F0",
  fg: "#0F172A",
  muted: "#64748B",
  accent: "#083C8F",
  up: "#16A34A",
  down: "#DC2626",
};

const DARK: ThemePalette = {
  bg: "#0B1220",
  cell: "#152844",
  border: "#1F2A44",
  fg: "#F1F5F9",
  muted: "#94A3B8",
  accent: "#60A5FA",
  up: "#22C55E",
  down: "#F87171",
};

function fmtPercent(v: number): string {
  if (!Number.isFinite(v) || v === 0) return "0,00%";
  const abs = Math.abs(v).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${v > 0 ? "▲" : "▼"} ${abs}%`;
}

// ─── Single cell — one asset in a 2x2 grid ────────────────────────────────
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
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 6,
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
          style={{
            fontSize: 10,
            fontWeight: "700",
            color: theme.muted,
          }}
        />
        <TextWidget
          text={fmtPercent(row.changePercent)}
          style={{
            fontSize: 9,
            fontWeight: "700",
            color: changeColor,
          }}
        />
      </FlexWidget>
      <TextWidget
        text={row.value}
        style={{
          fontSize: 15,
          fontWeight: "700",
          color: theme.fg,
          marginTop: 2,
        }}
      />
    </FlexWidget>
  );
}

// ─── Row of 2 cells ───────────────────────────────────────────────────────
function PairRow({
  a, b, theme,
}: {
  a: WidgetRow; b: WidgetRow; theme: ThemePalette;
}) {
  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        width: "match_parent",
        flex: 1,
        marginVertical: 2,
      }}
    >
      <Cell row={a} theme={theme} />
      <Cell row={b} theme={theme} />
    </FlexWidget>
  );
}

// ─── Full widget view ─────────────────────────────────────────────────────
function WidgetView({ data, theme }: { data: PriceWidgetData; theme: ThemePalette }) {
  const empty = (data.error || data.loading) && data.rows.length === 0;

  // Pad rows to 4 (2x2 grid)
  const padded: WidgetRow[] = [...data.rows];
  while (padded.length < 4) padded.push({ label: "—", value: "—", changePercent: 0 });

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: theme.bg,
        borderRadius: 16,
        padding: 8,
        flexDirection: "column",
      }}
    >
      {/* Compact header */}
      <FlexWidget
        style={{
          flexDirection: "row",
          width: "match_parent",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
          paddingHorizontal: 4,
        }}
      >
        <TextWidget
          text="Çarşı Piyasa"
          style={{
            fontSize: 10,
            fontWeight: "700",
            color: theme.accent,
          }}
        />
        <TextWidget
          text={data.updatedAt}
          style={{
            fontSize: 9,
            color: theme.muted,
          }}
        />
      </FlexWidget>

      {empty ? (
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
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
          <PairRow a={padded[0]} b={padded[1]} theme={theme} />
          <PairRow a={padded[2]} b={padded[3]} theme={theme} />
        </>
      )}
    </FlexWidget>
  );
}

export function PriceWidget({ data }: { data: PriceWidgetData }) {
  return {
    light: <WidgetView data={data} theme={LIGHT} />,
    dark: <WidgetView data={data} theme={DARK} />,
  };
}
