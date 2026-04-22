import React from "react";

/* ========== Tokens (light theme, marka diliyle uyumlu) ========== */
const C = {
  bg: "#F7F7F5",
  surface: "#FFFFFF",
  ink: "#0E1116",
  inkSoft: "#3A3F47",
  muted: "#8A8E96",
  hairline: "rgba(14,17,22,0.08)",
  hairlineStrong: "rgba(14,17,22,0.14)",
  pillBg: "rgba(14,17,22,0.04)",
  accent: "#0A2540",
  gold: "#A87515",
  up: "#127A4A",
  upBg: "rgba(18,122,74,0.08)",
  down: "#C0392B",
  downBg: "rgba(192,57,43,0.08)",
};
const SANS = "ui-sans-serif, system-ui, -apple-system, 'SF Pro Text', Inter, sans-serif";
const MONO = "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace";

const PHONE_W = 360;
const PHONE_H = 720;

/* ========== Phone container (sabit boyut, viewport-bağımsız) ========== */
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: PHONE_W + 20,
        height: PHONE_H + 20,
        padding: 10,
        background: "#1B1F26",
        borderRadius: 44,
        boxShadow:
          "0 30px 60px rgba(15,23,42,0.18), inset 0 0 0 1px rgba(255,255,255,0.04)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          width: PHONE_W,
          height: PHONE_H,
          background: C.bg,
          borderRadius: 36,
          overflow: "hidden",
          color: C.ink,
          fontFamily: SANS,
        }}
      >
        {/* status bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 38,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 22px",
            color: C.ink,
            fontSize: 12.5,
            fontWeight: 600,
            opacity: 0.85,
            zIndex: 2,
          }}
        >
          <span>14:32</span>
          <span style={{ fontSize: 10.5, opacity: 0.7 }}>●●●● 5G ▮</span>
        </div>
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 96,
            height: 22,
            borderRadius: 12,
            background: "#1B1F26",
            zIndex: 3,
          }}
        />
        {children}
      </div>
    </div>
  );
}

/* ========== Shared components ========== */

function Crumb({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        left: 24,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: 1.4,
        color: C.muted,
      }}
    >
      {label}
    </div>
  );
}

function Indicator({ active, total }: { active: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i === active ? 22 : 6,
            height: 3,
            borderRadius: 2,
            background: i === active ? C.ink : C.hairlineStrong,
          }}
        />
      ))}
    </div>
  );
}

function Chevron({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Footer({
  active,
  total,
  cta,
  showSkip,
}: {
  active: number;
  total: number;
  cta: string;
  showSkip: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 26,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ width: 50 }}>
        {showSkip && (
          <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 500 }}>Atla</span>
        )}
      </div>
      <Indicator active={active} total={total} />
      <div
        style={{
          background: C.ink,
          color: "#fff",
          borderRadius: 999,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: -0.1,
          boxShadow: "0 6px 18px rgba(14,17,22,0.18)",
        }}
      >
        {cta}
        <Chevron />
      </div>
    </div>
  );
}

function PageContent({
  eyebrow,
  title,
  body,
  visual,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  visual: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "78px 24px 110px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 1.6,
          color: C.gold,
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: 32,
          lineHeight: 1.05,
          letterSpacing: -1.0,
          fontWeight: 700,
          color: C.ink,
        }}
      >
        {title}
      </h1>
      <div
        style={{
          marginTop: 10,
          fontSize: 13,
          lineHeight: 1.45,
          color: C.inkSoft,
          maxWidth: 280,
          letterSpacing: -0.1,
        }}
      >
        {body}
      </div>
      <div
        style={{
          flex: 1,
          marginTop: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {visual}
      </div>
    </div>
  );
}

/* ========== Visuals ========== */

function LogoMark({ size = 84 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: `linear-gradient(135deg, ${C.accent} 0%, #06182A 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 14px 30px rgba(10,37,64,0.30), inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path d="M3 17 L9 11 L13 14 L21 6" stroke={C.gold} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="19" width="3" height="2.5" fill={C.gold} opacity={0.85} />
        <rect x="8" y="16" width="3" height="5.5" fill={C.gold} opacity={0.85} />
        <rect x="13" y="13" width="3" height="8.5" fill={C.gold} opacity={0.85} />
      </svg>
    </div>
  );
}

function Ticker({ items }: { items: { c: string; p: string; d: "up" | "down" }[] }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        fontFamily: MONO,
        fontSize: 11,
        color: C.muted,
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: 280,
      }}
    >
      {items.map((it) => (
        <span key={it.c} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontWeight: 700 }}>{it.c}</span>
          <span style={{ fontWeight: 700, color: C.ink }}>{it.p}</span>
          <span style={{ color: it.d === "up" ? C.up : C.down, fontWeight: 700 }}>
            {it.d === "up" ? "▲" : "▼"}
          </span>
        </span>
      ))}
    </div>
  );
}

function WidgetVisual() {
  return (
    <div
      style={{
        position: "relative",
        width: 240,
        height: 290,
        borderRadius: 26,
        overflow: "hidden",
        background: "linear-gradient(160deg,#cdd5dd 0%, #a4afba 100%)",
        boxShadow: "0 20px 40px rgba(14,17,22,0.18), inset 0 0 0 1px rgba(14,17,22,0.06)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(5, 1fr)",
          padding: 12,
          gap: 10,
          opacity: 0.55,
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            style={{
              borderRadius: 9,
              background: "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.18))",
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          top: 60,
          background: C.surface,
          borderRadius: 16,
          padding: "12px 14px",
          boxShadow: "0 10px 24px rgba(14,17,22,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.4 }}>
            ÇARŞI · 14:32
          </span>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: C.up }} />
        </div>
        {[
          { c: "USD", p: "44,93", d: "up" as const, pct: "0,02" },
          { c: "EUR", p: "52,72", d: "down" as const, pct: "0,18" },
          { c: "ALTIN", p: "6.877", d: "down" as const, pct: "0,35" },
          { c: "GBP", p: "60,61", d: "down" as const, pct: "0,09" },
        ].map((r, i, a) => (
          <div
            key={r.c}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 0",
              borderBottom: i === a.length - 1 ? "none" : `1px solid ${C.hairline}`,
            }}
          >
            <span style={{ fontSize: 11.5, fontWeight: 600, color: C.ink }}>{r.c}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>
                {r.p}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: r.d === "up" ? C.up : C.down,
                  minWidth: 34,
                  textAlign: "right",
                }}
              >
                {r.d === "up" ? "▲" : "▼"} %{r.pct}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotifVisual() {
  return (
    <div
      style={{
        width: 260,
        padding: 16,
        borderRadius: 24,
        background: "linear-gradient(180deg,#9AA8B5 0%,#7E8C9A 100%)",
        boxShadow: "0 20px 40px rgba(14,17,22,0.20)",
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          color: "rgba(255,255,255,0.75)",
          letterSpacing: 1.2,
          fontWeight: 600,
          padding: "0 4px 8px",
        }}
      >
        CANLI BİLDİRİMLER
      </div>
      <div
        style={{
          background: "linear-gradient(180deg,#1E5BC6 0%, #0B3D91 100%)",
          borderRadius: 16,
          padding: "10px 12px",
          color: "#fff",
          boxShadow: "0 6px 14px rgba(11,61,145,0.40)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <path d="M3 17 L9 11 L13 14 L21 6" stroke="#0B3D91" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </span>
          <span style={{ fontSize: 10.5, fontWeight: 700 }}>Çarşı Piyasa</span>
          <span style={{ marginLeft: "auto", fontSize: 9.5, color: "rgba(255,255,255,0.6)", fontFamily: MONO }}>
            14:32
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: MONO,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: -0.2,
          }}
        >
          {[
            { c: "USD", p: "44,93", d: "▲", col: "#7CFFC0" },
            { c: "EUR", p: "52,72", d: "▼", col: "#FFB3A8" },
            { c: "ALTIN", p: "6.877", d: "▼", col: "#FFB3A8" },
            { c: "GBP", p: "60,61", d: "▼", col: "#FFB3A8" },
          ].map((r) => (
            <span key={r.c} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 9 }}>{r.c}</span>
              <span>{r.p}</span>
              <span style={{ color: r.col }}>{r.d}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertVisual() {
  return (
    <div
      style={{
        width: 260,
        background: C.surface,
        borderRadius: 22,
        padding: "16px 16px 14px",
        boxShadow: "0 20px 40px rgba(14,17,22,0.16), inset 0 0 0 1px rgba(14,17,22,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 12,
          borderBottom: `1px solid ${C.hairline}`,
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.4 }}>HEDEF</div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: C.ink,
              letterSpacing: -0.4,
              marginTop: 2,
            }}
          >
            Dolar / TL
          </div>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            background: C.upBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={C.up} strokeWidth="2.2" />
            <path d="M12 6v6l4 2" stroke={C.up} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {[
        { d: "≥", v: "45,00", s: "Aktif", on: true },
        { d: "≤", v: "44,50", s: "Aktif", on: true },
        { d: "≥", v: "46,20", s: "Tetiklendi", on: false },
      ].map((a, i, arr) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "11px 0",
            borderBottom: i === arr.length - 1 ? "none" : `1px solid ${C.hairline}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                width: 26,
                height: 22,
                borderRadius: 6,
                background: C.pillBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12.5,
                fontWeight: 700,
                color: C.inkSoft,
              }}
            >
              {a.d}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 700,
                color: C.ink,
                letterSpacing: -0.3,
              }}
            >
              {a.v} ₺
            </span>
          </div>
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 0.6,
              color: a.on ? C.up : C.muted,
              padding: "3px 8px",
              borderRadius: 999,
              background: a.on ? C.upBg : C.pillBg,
            }}
          >
            {a.s.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ========== Pages ========== */

function Page1() {
  return (
    <Phone>
      <Crumb label="ÇARŞI · 01 / 04" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "78px 24px 110px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
        }}
      >
        <LogoMark size={84} />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: 1.6,
              color: C.gold,
              marginBottom: 12,
            }}
          >
            ÇARŞI PİYASA
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.0,
              letterSpacing: -1.2,
              fontWeight: 700,
              color: C.ink,
            }}
          >
            Pazar her an
            <br />
            cebinde.
          </h1>
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: C.inkSoft,
              letterSpacing: -0.1,
            }}
          >
            Döviz, altın, parite — tek bir bakışta.
          </div>
        </div>
        <Ticker
          items={[
            { c: "USD", p: "44,93", d: "up" },
            { c: "EUR", p: "52,72", d: "down" },
            { c: "ALTIN", p: "6.877", d: "down" },
          ]}
        />
      </div>
      <Footer active={0} total={4} cta="Başla" showSkip={false} />
    </Phone>
  );
}

function Page2() {
  return (
    <Phone>
      <Crumb label="01 · ANA EKRAN" />
      <PageContent
        eyebrow="WIDGET"
        title={
          <>
            Ana ekranda,
            <br />
            dokunmadan.
          </>
        }
        body="Telefonunu açar açmaz son fiyatlar gözünün önünde."
        visual={<WidgetVisual />}
      />
      <Footer active={1} total={4} cta="Devam" showSkip />
    </Phone>
  );
}

function Page3() {
  return (
    <Phone>
      <Crumb label="02 · BİLDİRİM" />
      <PageContent
        eyebrow="CANLI BİLDİRİM"
        title={
          <>
            Bildirim çubuğunda,
            <br />
            her zaman.
          </>
        }
        body="Ekranı açmaya bile gerek yok. Bir bakışta gör."
        visual={<NotifVisual />}
      />
      <Footer active={2} total={4} cta="Devam" showSkip />
    </Phone>
  );
}

function Page4() {
  return (
    <Phone>
      <Crumb label="03 · ALARM" />
      <PageContent
        eyebrow="FİYAT ALARMI"
        title={
          <>
            Hedefini söyle,
            <br />
            seni biz bulalım.
          </>
        }
        body="Beklediğin fiyat geldiğinde haber veririz."
        visual={<AlertVisual />}
      />
      <Footer active={3} total={4} cta="Hadi başlayalım" showSkip={false} />
    </Phone>
  );
}

/* ========== Stage ========== */

export default function OnboardingV2() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#E8E8E3 0%,#D6D6D0 100%)",
        padding: "40px 20px",
        display: "flex",
        gap: 24,
        justifyContent: "center",
        alignItems: "flex-start",
        flexWrap: "wrap",
        fontFamily: SANS,
      }}
    >
      <Page1 />
      <Page2 />
      <Page3 />
      <Page4 />
    </div>
  );
}
