import React from "react";

const COLORS = {
  bg: "#0B1220",
  card: "#111B30",
  secondary: "#1A2540",
  border: "#1E2A44",
  fg: "#F1F5F9",
  muted: "#94A3B8",
  brand: "#0B3D91",
  brandFg: "#FFFFFF",
  blueAccent: "#3B82F6",
  goldAccent: "#F59E0B",
  primary: "#6366F1",
};

const SF = "system-ui, -apple-system, 'Inter', sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

function StatusBar() {
  return (
    <div
      style={{
        height: 44,
        background: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        color: COLORS.fg,
        fontFamily: SF,
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      <span>14:32</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 11 }}>●●●●</span>
        <span style={{ fontSize: 11 }}>5G</span>
        <span
          style={{
            width: 22,
            height: 11,
            border: `1px solid ${COLORS.fg}`,
            borderRadius: 3,
            position: "relative",
            display: "inline-block",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 1,
              left: 1,
              right: 6,
              bottom: 1,
              background: COLORS.fg,
              borderRadius: 1,
            }}
          />
        </span>
      </div>
    </div>
  );
}

function ScreenHeader() {
  return (
    <div style={{ padding: "8px 20px 14px 20px", background: COLORS.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: COLORS.secondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.fg,
            fontSize: 18,
          }}
        >
          ‹
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.muted,
              letterSpacing: 1.4,
            }}
          >
            TERCİHLER
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: COLORS.fg,
              letterSpacing: -0.5,
              marginTop: 2,
            }}
          >
            Widget Ayarları
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        color: COLORS.muted,
        letterSpacing: 1.2,
        padding: "0 4px 10px",
      }}
    >
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 16,
        padding: 14,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
}: {
  options: { value: T; label: string; disabled?: boolean }[];
  value: T;
}) {
  return (
    <div
      style={{
        display: "flex",
        background: COLORS.secondary,
        borderRadius: 12,
        padding: 4,
        gap: 0,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <div
            key={opt.value}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 9,
              background: active ? COLORS.card : "transparent",
              textAlign: "center",
              fontSize: 12.5,
              fontWeight: active ? 800 : 600,
              color: active ? COLORS.fg : COLORS.muted,
              opacity: opt.disabled ? 0.4 : 1,
              letterSpacing: -0.1,
            }}
          >
            {opt.label}
          </div>
        );
      })}
    </div>
  );
}

function SymbolSlot({
  index,
  code,
  name,
  isGold,
}: {
  index: number;
  code: string;
  name: string;
  isGold: boolean;
}) {
  const accent = isGold ? COLORS.goldAccent : COLORS.blueAccent;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 12px",
        borderRadius: 12,
        background: COLORS.secondary,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: accent + "22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          fontSize: 11,
          fontWeight: 800,
        }}
      >
        {index + 1}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.fg, letterSpacing: -0.2 }}>
          {code}
        </div>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: COLORS.muted,
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>
      </div>
      <span style={{ color: COLORS.muted, fontSize: 18 }}>›</span>
    </div>
  );
}

function HelperText({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 11.5,
        fontWeight: 600,
        color: COLORS.muted,
        marginTop: 10,
        lineHeight: 1.45,
      }}
    >
      {children}
    </div>
  );
}

export function SettingsScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #1F2937 0%, #111827 60%, #030712 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "30px 20px",
        fontFamily: SF,
      }}
    >
      <div
        style={{
          width: 390,
          background: COLORS.bg,
          borderRadius: 36,
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)",
          border: "8px solid #0a0f1c",
        }}
      >
        <StatusBar />
        <ScreenHeader />
        <div style={{ padding: "12px 20px 28px 20px", background: COLORS.bg }}>
          <SectionLabel>ŞABLON</SectionLabel>
          <Card>
            <Segmented
              value="list"
              options={[
                { value: "list", label: "Liste · 4×2" },
                { value: "strip", label: "Şerit · 4×1" },
              ]}
            />
            <HelperText>4 satır liste · alış / satış · % değişim · güncelleme saati.</HelperText>
          </Card>

          <div style={{ height: 18 }} />
          <SectionLabel>SEMBOLLER · 4 ADET</SectionLabel>
          <Card>
            <SymbolSlot index={0} code="USD" name="Amerikan Doları" isGold={false} />
            <SymbolSlot index={1} code="EUR" name="Euro" isGold={false} />
            <SymbolSlot index={2} code="ALTIN" name="Gram Altın (Has)" isGold />
            <SymbolSlot index={3} code="CEYREK_YENI" name="Çeyrek Altın (Yeni)" isGold />
            <HelperText>
              68 sembol arasından seç. Para birimleri mavi, altın/maden amber renkli aksent ile gösterilir.
            </HelperText>
          </Card>

          <div style={{ height: 18 }} />
          <SectionLabel>FİYAT ALANI</SectionLabel>
          <Card>
            <Segmented
              value="both"
              options={[
                { value: "buy", label: "Alış" },
                { value: "sell", label: "Satış" },
                { value: "both", label: "İkisi" },
              ]}
            />
          </Card>

          <div style={{ height: 18 }} />
          <SectionLabel>TEMA</SectionLabel>
          <Card>
            <Segmented
              value="auto"
              options={[
                { value: "auto", label: "Otomatik" },
                { value: "dark", label: "Koyu" },
                { value: "light", label: "Açık" },
              ]}
            />
          </Card>

          <div style={{ height: 18 }} />
          <div
            style={{
              padding: "14px 0",
              borderRadius: 14,
              background: COLORS.brand,
              textAlign: "center",
              color: COLORS.brandFg,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: -0.2,
              boxShadow: "0 6px 18px rgba(11,61,145,0.45)",
            }}
          >
            ↻  Widget'ı Şimdi Yenile
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.muted,
              marginTop: 14,
              textAlign: "center",
              lineHeight: 1.45,
            }}
          >
            Android sistemi widget'ı 30 dakikada bir kendiliğinden günceller. Uygulamayı her açtığında da
            taze veri ile yenilenir.
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsScreen;
