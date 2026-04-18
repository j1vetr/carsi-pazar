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
}

type Hex = `#${string}`;

interface ThemePalette {
  bg: Hex;
  border: Hex;
  fg: Hex;
  muted: Hex;
  accent: Hex;
  up: Hex;
  down: Hex;
}

const LIGHT: ThemePalette = {
  bg: "#FFFFFF",
  border: "#E2E8F0",
  fg: "#0F172A",
  muted: "#64748B",
  accent: "#083C8F",
  up: "#16A34A",
  down: "#DC2626",
};

const DARK: ThemePalette = {
  bg: "#0B1220",
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

function Row({ row, theme }: { row: WidgetRow; theme: ThemePalette }) {
  const up = row.changePercent > 0;
  const down = row.changePercent < 0;
  const changeColor = up ? theme.up : down ? theme.down : theme.muted;

  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        width: "match_parent",
        height: 30,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <TextWidget
        text={row.label}
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: theme.fg,
          width: 48,
        }}
      />
      <TextWidget
        text={row.value}
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: theme.fg,
          textAlign: "right",
        }}
      />
      <TextWidget
        text={fmtPercent(row.changePercent)}
        style={{
          fontSize: 10,
          fontWeight: "600",
          color: changeColor,
          width: 56,
          textAlign: "right",
        }}
      />
    </FlexWidget>
  );
}

function WidgetView({ data, theme }: { data: PriceWidgetData; theme: ThemePalette }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: theme.bg,
        borderRadius: 18,
        padding: 10,
        flexDirection: "column",
      }}
    >
      <FlexWidget
        style={{
          flexDirection: "row",
          width: "match_parent",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <TextWidget
          text="Çarşı Piyasa"
          style={{
            fontSize: 11,
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

      <FlexWidget
        style={{
          width: "match_parent",
          height: 1,
          backgroundColor: theme.border,
          marginBottom: 4,
        }}
      />

      {data.error || data.rows.length === 0 ? (
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
        data.rows.map((r, i) => <Row key={i} row={r} theme={theme} />)
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
