import React from "react";
import { PhoneShell, T, SANS, MONO, type Theme } from "../carsi-widget/_v2";

const THEME: Theme = "light";
const t = T[THEME];

/* ========== Shared chrome ========== */

function PageIndicator({ active, total }: { active: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i === active ? 22 : 6,
            height: 3,
            borderRadius: 2,
            background: i === active ? t.ink : t.hairlineStrong,
            transition: "all .2s",
          }}
        />
      ))}
    </div>
  );
}

function ChevronRight({ size = 14, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Footer({
  active,
  total,
  ctaLabel,
  showSkip,
}: {
  active: number;
  total: number;
  ctaLabel: string;
  showSkip: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 28,
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ width: 60, display: "flex", alignItems: "center" }}>
        {showSkip && (
          <span
            style={{
              fontSize: 13,
              color: t.muted,
              fontWeight: 500,
              letterSpacing: 0.2,
            }}
          >
            Atla
          </span>
        )}
      </div>
      <PageIndicator active={active} total={total} />
      <button
        style={{
          background: t.ink,
          color: "#fff",
          border: "none",
          borderRadius: 999,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: -0.1,
          fontFamily: SANS,
          cursor: "default",
          boxShadow: "0 6px 18px rgba(14,17,22,0.18)",
        }}
      >
        {ctaLabel}
        <ChevronRight />
      </button>
    </div>
  );
}

function HeaderCrumb({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 22,
        left: 28,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.4,
        color: t.muted,
        fontFamily: SANS,
      }}
    >
      {label}
    </div>
  );
}

function PageBody({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "70px 28px 110px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.6,
          color: t.gold,
          fontFamily: SANS,
          marginBottom: 14,
        }}
      >
        {eyebrow}
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: 36,
          lineHeight: 1.05,
          letterSpacing: -1.2,
          fontWeight: 700,
          color: t.ink,
          fontFamily: SANS,
        }}
      >
        {title}
      </h1>
      <div
        style={{
          marginTop: 12,
          fontSize: 14,
          lineHeight: 1.45,
          color: t.inkSoft,
          maxWidth: 280,
          letterSpacing: -0.1,
        }}
      >
        {body}
      </div>
      <div
        style={{
          flex: 1,
          marginTop: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ========== Visuals ========== */

function LogoMark({ size = 96 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: `linear-gradient(135deg, ${t.accent} 0%, #06182A 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 14px 30px rgba(10,37,64,0.30), inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path d="M3 17 L9 11 L13 14 L21 6" stroke={t.gold} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="19" width="3" height="2.5" fill={t.gold} opacity={0.85} />
        <rect x="8" y="16" width="3" height="5.5" fill={t.gold} opacity={0.85} />
        <rect x="13" y="13" width="3" height="8.5" fill={t.gold} opacity={0.85} />
      </svg>
    </div>
  );
}

function PriceTicker({ items }: { items: { code: string; price: string; dir: "up" | "down" }[] }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        fontFamily: MONO,
        fontSize: 11,
        color: t.muted,
        letterSpacing: -0.2,
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: 280,
      }}
    >
      {items.map((it) => (
        <span key={it.code} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontWeight: 700, color: t.muted }}>{it.code}</span>
          <span style={{ fontWeight: 700, color: t.ink }}>{it.price}</span>
          <span style={{ color: it.dir === "up" ? t.up : t.down, fontWeight: 700 }}>
            {it.dir === "up" ? "▲" : "▼"}
          </span>
        </span>
      ))}
    </div>
  );
}

/* Visual: Widget on phone home grid */
function WidgetVisual() {
  return (
    <div
      style={{
        position: "relative",
        width: 270,
        height: 320,
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 24px 48px rgba(14,17,22,0.18), inset 0 0 0 1px rgba(14,17,22,0.06)",
        background: "linear-gradient(160deg,#cdd5dd 0%, #a4afba 100%)",
      }}
    >
      {/* faux app icons grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(5, 1fr)",
          padding: 14,
          gap: 12,
          opacity: 0.55,
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            style={{
              borderRadius: 10,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.18))",
            }}
          />
        ))}
      </div>
      {/* widget card overlay */}
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          top: 70,
          background: t.surface,
          borderRadius: 18,
          padding: "14px 16px",
          boxShadow: "0 10px 24px rgba(14,17,22,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: t.muted, letterSpacing: 1.4 }}>
            ÇARŞI · 14:32
          </span>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: t.up }} />
        </div>
        {[
          { code: "USD", price: "44,93", dir: "up" as const, pct: "0,02" },
          { code: "EUR", price: "52,72", dir: "down" as const, pct: "0,18" },
          { code: "ALTIN", price: "6.877", dir: "down" as const, pct: "0,35" },
          { code: "GBP", price: "60,61", dir: "down" as const, pct: "0,09" },
        ].map((r, i, arr) => (
          <div
            key={r.code}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 0",
              borderBottom: i === arr.length - 1 ? "none" : `1px solid ${t.hairline}`,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: t.ink, letterSpacing: -0.1 }}>{r.code}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: t.ink, letterSpacing: -0.3 }}>
                {r.price}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  color: r.dir === "up" ? t.up : t.down,
                  minWidth: 36,
                  textAlign: "right",
                }}
              >
                {r.dir === "up" ? "▲" : "▼"} %{r.pct}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Visual: Notification shade snippet */
function NotifVisual() {
  return (
    <div
      style={{
        position: "relative",
        width: 280,
        padding: 18,
        borderRadius: 26,
        background: "linear-gradient(180deg,#9AA8B5 0%,#7E8C9A 100%)",
        boxShadow: "0 24px 48px rgba(14,17,22,0.20)",
      }}
    >
      <div
        style={{
          fontSize: 10,
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
          borderRadius: 18,
          padding: "12px 14px",
          color: "#fff",
          boxShadow: "0 6px 14px rgba(11,61,145,0.40)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
              <path d="M3 17 L9 11 L13 14 L21 6" stroke="#0B3D91" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </span>
          <span style={{ fontSize: 11, fontWeight: 700 }}>Çarşı Piyasa</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.6)", fontFamily: MONO }}>
            14:32
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: MONO,
            fontSize: 11,
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
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 9.5 }}>{r.c}</span>
              <span>{r.p}</span>
              <span style={{ color: r.col }}>{r.d}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Visual: Price alert card */
function AlertVisual() {
  return (
    <div
      style={{
        width: 280,
        background: t.surface,
        borderRadius: 22,
        padding: "18px 18px 16px",
        boxShadow: "0 24px 48px rgba(14,17,22,0.16), inset 0 0 0 1px rgba(14,17,22,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 12,
          borderBottom: `1px solid ${t.hairline}`,
        }}
      >
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: t.muted, letterSpacing: 1.4 }}>
            HEDEF
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: t.ink,
              letterSpacing: -0.4,
              marginTop: 2,
            }}
          >
            Dolar / TL
          </div>
        </div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: t.upBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <path d="M12 6v6l4 2" stroke={t.up} strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke={t.up} strokeWidth="2.2" />
          </svg>
        </div>
      </div>

      {/* alert rows */}
      {[
        { dir: "≥", val: "45,00", state: "Aktif", on: true },
        { dir: "≤", val: "44,50", state: "Aktif", on: true },
        { dir: "≥", val: "46,20", state: "Tetiklendi", on: false },
      ].map((a, i, arr) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderBottom: i === arr.length - 1 ? "none" : `1px solid ${t.hairline}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 22,
                borderRadius: 6,
                background: t.pillBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: t.inkSoft,
              }}
            >
              {a.dir}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 15,
                fontWeight: 700,
                color: t.ink,
                letterSpacing: -0.4,
              }}
            >
              {a.val} ₺
            </span>
          </div>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: 0.6,
              color: a.on ? t.up : t.muted,
              padding: "3px 8px",
              borderRadius: 999,
              background: a.on ? t.upBg : t.pillBg,
            }}
          >
            {a.state.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ========== Pages ========== */

function Page1() {
  return (
    <PhoneShell theme={THEME}>
      <HeaderCrumb label="ÇARŞI · 01 / 04" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "70px 28px 110px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
          }}
        >
          <LogoMark size={92} />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.6,
                color: t.gold,
                marginBottom: 12,
              }}
            >
              ÇARŞI PİYASA
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 38,
                lineHeight: 1.0,
                letterSpacing: -1.4,
                fontWeight: 700,
                color: t.ink,
                fontFamily: SANS,
              }}
            >
              Pazar her an
              <br />
              cebinde.
            </h1>
            <div
              style={{
                marginTop: 14,
                fontSize: 13.5,
                color: t.inkSoft,
                letterSpacing: -0.1,
              }}
            >
              Döviz, altın, parite — tek bir bakışta.
            </div>
          </div>
          <div style={{ marginTop: 4 }}>
            <PriceTicker
              items={[
                { code: "USD", price: "44,93", dir: "up" },
                { code: "EUR", price: "52,72", dir: "down" },
                { code: "ALTIN", price: "6.877", dir: "down" },
              ]}
            />
          </div>
        </div>
      </div>
      <Footer active={0} total={4} ctaLabel="Başla" showSkip={false} />
    </PhoneShell>
  );
}

function Page2() {
  return (
    <PhoneShell theme={THEME}>
      <HeaderCrumb label="01 · ANA EKRAN" />
      <PageBody
        eyebrow="WIDGET"
        title={"Ana ekranda,\ndokunmadan."}
        body="Telefonunu açar açmaz son fiyatlar gözünün önünde."
      >
        <WidgetVisual />
      </PageBody>
      <Footer active={1} total={4} ctaLabel="Devam" showSkip />
    </PhoneShell>
  );
}

function Page3() {
  return (
    <PhoneShell theme={THEME}>
      <HeaderCrumb label="02 · BİLDİRİM" />
      <PageBody
        eyebrow="CANLI BİLDİRİM"
        title={"Bildirim çubuğunda,\nher zaman."}
        body="Ekranı açmaya bile gerek yok. Bir bakışta gör."
      >
        <NotifVisual />
      </PageBody>
      <Footer active={2} total={4} ctaLabel="Devam" showSkip />
    </PhoneShell>
  );
}

function Page4() {
  return (
    <PhoneShell theme={THEME}>
      <HeaderCrumb label="03 · ALARM" />
      <PageBody
        eyebrow="FİYAT ALARMI"
        title={"Hedefini söyle,\nseni biz bulalım."}
        body="Beklediğin fiyat geldiğinde haber veririz."
      >
        <AlertVisual />
      </PageBody>
      <Footer active={3} total={4} ctaLabel="Hadi başlayalım" showSkip={false} />
    </PhoneShell>
  );
}

/* ========== Stage ========== */

export default function OnboardingV2() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#E8E8E3 0%,#D6D6D0 100%)",
        padding: "30px 18px 60px",
        display: "flex",
        gap: 20,
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
