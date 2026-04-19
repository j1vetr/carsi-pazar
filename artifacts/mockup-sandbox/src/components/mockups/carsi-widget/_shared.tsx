import React from "react";

export type Hex = `#${string}`;

export interface Palette {
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

export const DARK: Palette = {
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

export const LIGHT: Palette = {
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

export type Kind = "currency" | "gold";

export interface Row {
  label: string;
  buy: string;
  sell: string;
  changePercent: number;
  kind: Kind;
}

export const SAMPLE_ROWS: Row[] = [
  { label: "USD", buy: "41,8542", sell: "41,9120", changePercent: 0.34, kind: "currency" },
  { label: "EUR", buy: "47,2310", sell: "47,3088", changePercent: -0.18, kind: "currency" },
  { label: "ALTIN", buy: "4.382,50", sell: "4.384,20", changePercent: 0.82, kind: "gold" },
  { label: "ÇEYREK", buy: "7.124,00", sell: "7.245,00", changePercent: 0.71, kind: "gold" },
];

export function fmtPercent(v: number): string {
  if (!Number.isFinite(v) || v === 0) return "0,0%";
  const abs = Math.abs(v).toLocaleString("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${v > 0 ? "▲" : "▼"} ${abs}%`;
}

export const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export function ThemeLabel({ children, dark }: { children: string; dark: boolean }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.4,
        color: dark ? "#94A3B8" : "#64748B",
        marginBottom: 10,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {children}
    </div>
  );
}

export function PhoneFrame({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark: boolean;
}) {
  return (
    <div
      style={{
        background: dark
          ? "linear-gradient(160deg, #1F2937 0%, #111827 60%, #030712 100%)"
          : "linear-gradient(160deg, #E0E7FF 0%, #C7D2FE 50%, #A5B4FC 100%)",
        padding: 18,
        borderRadius: 28,
        boxShadow: dark
          ? "0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)"
          : "0 20px 50px rgba(15,23,42,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)",
      }}
    >
      {children}
    </div>
  );
}
