import React from "react";

/* =============================================================
   ÇARŞI PİYASA — Onboarding (Modern / Editorial)
   Marka: navy #0B3D91, gold #C9A227, ink #0B1F3A
   ============================================================= */

const C = {
  paper: "#FBFAF7",
  paperDeep: "#F2EFE8",
  ink: "#0B1F3A",
  inkSoft: "#3F4B62",
  muted: "#7A8499",
  hairline: "rgba(11,31,58,0.10)",
  hairlineSoft: "rgba(11,31,58,0.06)",
  navy: "#0B3D91",
  navyDeep: "#082B66",
  navyLight: "#1E5BC6",
  gold: "#C9A227",
  goldDeep: "#8A6E14",
  goldSoft: "#F5EBC4",
  rise: "#0E9F6E",
  riseSoft: "#E5F4EE",
  fall: "#D43A3A",
  fallSoft: "#FBEAEA",
};

const SANS =
  "ui-sans-serif, system-ui, -apple-system, 'SF Pro Text', Inter, sans-serif";
const SERIF =
  "'Source Serif Pro', 'Iowan Old Style', Georgia, 'Times New Roman', serif";
const MONO =
  "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace";

const W = 360;
const H = 740;

/* ============================================================
   Phone shell
   ============================================================ */
function Phone({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      <div
        style={{
          width: W + 18,
          height: H + 18,
          padding: 9,
          background: "linear-gradient(180deg,#1A2233 0%,#0B1325 100%)",
          borderRadius: 46,
          boxShadow:
            "0 30px 70px rgba(11,31,58,0.22), inset 0 0 0 1px rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            width: W,
            height: H,
            background: C.paper,
            borderRadius: 38,
            overflow: "hidden",
            color: C.ink,
            fontFamily: SANS,
          }}
        >
          {/* Status bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 44,
              padding: "0 26px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 13,
              fontWeight: 700,
              color: C.ink,
              letterSpacing: -0.2,
              zIndex: 4,
            }}
          >
            <span>9:41</span>
            <span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, opacity: 0.85 }}>
              <span>●●●●</span>
              <span style={{ fontWeight: 700 }}>5G</span>
              <span
                style={{
                  display: "inline-block",
                  width: 22,
                  height: 11,
                  borderRadius: 2.5,
                  border: `1.4px solid ${C.ink}`,
                  position: "relative",
                }}
              >
                <span style={{ position: "absolute", inset: 1.5, background: C.ink }} />
              </span>
            </span>
          </div>
          {/* Notch */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 110,
              height: 26,
              borderRadius: 14,
              background: "#0B1325",
              zIndex: 5,
            }}
          />
          {children}
        </div>
      </div>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 1.6,
          color: C.muted,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ============================================================
   Bottom — dots + CTA
   ============================================================ */

function Dots({ active }: { active: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          style={{
            width: i === active ? 22 : 6,
            height: 4,
            borderRadius: 2,
            background: i === active ? C.navy : "rgba(11,31,58,0.15)",
          }}
        />
      ))}
    </div>
  );
}

function PrimaryCta({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <button
      style={{
        width: "100%",
        height: 54,
        background: C.ink,
        color: "#fff",
        border: "none",
        borderRadius: 16,
        fontSize: 15.5,
        fontWeight: 700,
        fontFamily: SANS,
        letterSpacing: -0.2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        boxShadow: "0 12px 28px rgba(11,31,58,0.30)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ============================================================
   Visual building blocks
   ============================================================ */

function GoldRule({ width = 28 }: { width?: number }) {
  return <div style={{ width, height: 2, background: C.gold, borderRadius: 1 }} />;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <GoldRule width={18} />
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: 2,
          color: C.goldDeep,
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
    </div>
  );
}

/* ============== Page 1 — hero ticker ============== */
function HeroTicker() {
  const items = [
    { c: "USD", p: "44,93", d: "▲", v: "0,18" },
    { c: "EUR", p: "52,72", d: "▼", v: "0,21" },
    { c: "ALTIN", p: "6.877", d: "▼", v: "0,35" },
  ];
  return (
    <div
      style={{
        display: "flex",
        background: C.paperDeep,
        borderRadius: 16,
        padding: "14px 16px",
        gap: 14,
        border: `1px solid ${C.hairlineSoft}`,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {items.map((it, i) => (
        <React.Fragment key={it.c}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: 1.2,
                color: C.muted,
                marginBottom: 4,
              }}
            >
              {it.c}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 16,
                fontWeight: 700,
                color: C.ink,
                letterSpacing: -0.5,
                marginBottom: 2,
              }}
            >
              {it.p}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 700,
                color: it.d === "▲" ? C.rise : C.fall,
                letterSpacing: -0.2,
              }}
            >
              {it.d} %{it.v}
            </div>
          </div>
          {i < items.length - 1 && (
            <div style={{ width: 1, background: C.hairline, alignSelf: "stretch" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ============== Page 2 — Widget on home screen ============== */
function HomeWithWidget() {
  return (
    <div
      style={{
        position: "relative",
        width: 250,
        height: 320,
        borderRadius: 30,
        overflow: "hidden",
        background: "linear-gradient(160deg,#3B526E 0%, #1F3554 60%, #0F2240 100%)",
        boxShadow: "0 24px 48px rgba(11,31,58,0.30), inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 14,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridAutoRows: 44,
          gap: 12,
          opacity: 0.5,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              borderRadius: 11,
              background:
                "linear-gradient(135deg,rgba(255,255,255,0.40),rgba(255,255,255,0.10))",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10)",
            }}
          />
        ))}
      </div>

      {/* Widget */}
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          top: 110,
          background: C.paper,
          borderRadius: 18,
          padding: "12px 14px",
          boxShadow: "0 16px 32px rgba(0,0,0,0.32), inset 0 0 0 1px rgba(11,31,58,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 8,
            borderBottom: `1px solid ${C.hairlineSoft}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <img
              src="/__mockup/carsi-icon.png"
              alt=""
              style={{ width: 14, height: 14, borderRadius: 3.5 }}
            />
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: 1.1,
                color: C.muted,
              }}
            >
              ÇARŞI · CANLI
            </span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 9, color: C.muted, fontWeight: 700 }}>
            9:41
          </span>
        </div>
        {[
          { c: "USD/TRY", p: "44,93", d: "▲", col: C.rise, pct: "0,18" },
          { c: "EUR/TRY", p: "52,72", d: "▼", col: C.fall, pct: "0,21" },
          { c: "ALTIN", p: "6.877", d: "▼", col: C.fall, pct: "0,35" },
          { c: "GBP/TRY", p: "60,61", d: "▼", col: C.fall, pct: "0,09" },
        ].map((r, i, a) => (
          <div
            key={r.c}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "7px 0",
              borderBottom: i === a.length - 1 ? "none" : `1px solid ${C.hairlineSoft}`,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: C.ink, letterSpacing: -0.2 }}>
              {r.c}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>
                {r.p}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: r.col,
                  minWidth: 38,
                  textAlign: "right",
                }}
              >
                {r.d} %{r.pct}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Dock */}
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 14,
          height: 56,
          borderRadius: 18,
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 12px",
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0.18))",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ============== Page 3 — Live notification on lock screen ============== */
function LockNotification() {
  return (
    <div style={{ position: "relative", width: 280 }}>
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 700,
            color: C.muted,
            letterSpacing: -0.1,
          }}
        >
          Çarşamba, 9 Nisan
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 64,
            fontWeight: 200,
            color: C.ink,
            letterSpacing: -3,
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          9:41
        </div>
      </div>

      <div
        style={{
          background: C.paper,
          borderRadius: 18,
          padding: "12px 14px 13px",
          boxShadow: "0 18px 38px rgba(11,31,58,0.20), inset 0 0 0 1px rgba(11,31,58,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
          <img
            src="/__mockup/carsi-icon.png"
            alt=""
            style={{ width: 22, height: 22, borderRadius: 5.5 }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: C.ink, letterSpacing: -0.1 }}>
            Çarşı Piyasa
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: MONO,
              fontSize: 9.5,
              color: C.muted,
              fontWeight: 700,
            }}
          >
            şimdi
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 14px",
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: -0.2,
          }}
        >
          {[
            { c: "USD", p: "44,93", d: "▲", col: C.rise },
            { c: "EUR", p: "52,72", d: "▼", col: C.fall },
            { c: "ALTIN", p: "6.877", d: "▼", col: C.fall },
            { c: "GBP", p: "60,61", d: "▼", col: C.fall },
          ].map((r) => (
            <div
              key={r.c}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontFamily: SANS, fontSize: 10.5, color: C.inkSoft, fontWeight: 700 }}>
                {r.c}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: C.ink }}>{r.p}</span>
                <span style={{ color: r.col }}>{r.d}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============== Page 4 — Alarm card ============== */
function AlarmCard() {
  return (
    <div
      style={{
        width: 280,
        background: C.paper,
        borderRadius: 18,
        padding: "16px 16px 14px",
        boxShadow: "0 20px 42px rgba(11,31,58,0.16), inset 0 0 0 1px rgba(11,31,58,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingBottom: 12,
          borderBottom: `1px solid ${C.hairlineSoft}`,
        }}
      >
        <div>
          <Eyebrow>Hedef</Eyebrow>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              fontWeight: 600,
              color: C.ink,
              letterSpacing: -0.5,
              marginTop: 6,
            }}
          >
            Dolar / TL
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: C.muted,
              fontWeight: 700,
              marginTop: 2,
            }}
          >
            şu an · 44,93 ₺
          </div>
        </div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: C.goldSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3a7 7 0 0 0-7 7c0 5-2 7-2 7h18s-2-2-2-7a7 7 0 0 0-7-7z"
              stroke={C.goldDeep}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M10 19a2 2 0 0 0 4 0" stroke={C.goldDeep} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {[
        { d: "≥", v: "45,50", state: "AKTİF", color: C.rise, bg: C.riseSoft },
        { d: "≤", v: "44,50", state: "AKTİF", color: C.rise, bg: C.riseSoft },
        { d: "≥", v: "46,20", state: "TETİKLENDİ", color: C.muted, bg: "rgba(11,31,58,0.06)" },
      ].map((a, i, arr) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "11px 0",
            borderBottom: i === arr.length - 1 ? "none" : `1px solid ${C.hairlineSoft}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span
              style={{
                width: 28,
                height: 24,
                borderRadius: 7,
                background: "rgba(11,31,58,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 800,
                color: C.inkSoft,
                fontFamily: MONO,
              }}
            >
              {a.d}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 15,
                fontWeight: 700,
                color: C.ink,
                letterSpacing: -0.4,
              }}
            >
              {a.v} ₺
            </span>
          </div>
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: 0.7,
              color: a.color,
              padding: "4px 9px",
              borderRadius: 999,
              background: a.bg,
            }}
          >
            {a.state}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   PAGES
   ============================================================ */

function Page1() {
  return (
    <Phone label="01 · Hoş geldiniz">
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "70px 30px 170px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div
          style={{
            marginTop: 30,
            padding: 14,
            background: C.paperDeep,
            borderRadius: 28,
            boxShadow: "inset 0 0 0 1px rgba(11,31,58,0.06)",
          }}
        >
          <img
            src="/__mockup/carsi-icon.png"
            alt="Çarşı"
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              display: "block",
              boxShadow: "0 14px 30px rgba(11,31,58,0.18)",
            }}
          />
        </div>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontSize: 40,
              fontWeight: 600,
              lineHeight: 1.0,
              letterSpacing: -1.4,
              color: C.ink,
            }}
          >
            Çarşı Piyasa
          </h1>
          <div
            style={{
              marginTop: 14,
              fontSize: 14.5,
              color: C.inkSoft,
              letterSpacing: -0.2,
              fontWeight: 500,
            }}
          >
            Anlık piyasa, cebinizde.
          </div>
        </div>

        {/* Ticker */}
        <HeroTicker />
      </div>

      <div style={{ position: "absolute", left: 26, right: 26, bottom: 30 }}>
        <div style={{ marginBottom: 18 }}>
          <Dots active={1} />
        </div>
        <PrimaryCta label="Başla" />
      </div>
    </Phone>
  );
}

function Page2() {
  return (
    <Phone label="02 · Widget">
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "80px 30px 170px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Eyebrow>Widget</Eyebrow>
        <h2
          style={{
            margin: "12px 0 0",
            fontFamily: SERIF,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: -1.2,
            lineHeight: 1.0,
            color: C.ink,
          }}
        >
          Ana ekranda.
        </h2>
        <div
          style={{
            margin: "10px 0 0",
            fontSize: 14,
            color: C.inkSoft,
            letterSpacing: -0.2,
          }}
        >
          Tek bakışta gör.
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 6,
          }}
        >
          <HomeWithWidget />
        </div>
      </div>

      <div style={{ position: "absolute", left: 26, right: 26, bottom: 30 }}>
        <div style={{ marginBottom: 18 }}>
          <Dots active={2} />
        </div>
        <PrimaryCta label="Devam" />
      </div>
    </Phone>
  );
}

function Page3() {
  return (
    <Phone label="03 · Bildirim · İZİN">
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "80px 30px 220px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Eyebrow>Bildirim</Eyebrow>
        <h2
          style={{
            margin: "12px 0 0",
            fontFamily: SERIF,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: -1.2,
            lineHeight: 1.0,
            color: C.ink,
          }}
        >
          Hep elinin altında.
        </h2>
        <div
          style={{
            margin: "10px 0 0",
            fontSize: 14,
            color: C.inkSoft,
            letterSpacing: -0.2,
          }}
        >
          Ekranı açmadan.
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LockNotification />
        </div>
      </div>

      <div style={{ position: "absolute", left: 26, right: 26, bottom: 30 }}>
        <div style={{ marginBottom: 16 }}>
          <Dots active={3} />
        </div>
        <PrimaryCta
          label="Bildirimleri Aç"
          icon={
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3a7 7 0 0 0-7 7c0 5-2 7-2 7h18s-2-2-2-7a7 7 0 0 0-7-7z"
                stroke="#fff"
                strokeWidth="1.9"
                strokeLinejoin="round"
              />
              <path d="M10 19a2 2 0 0 0 4 0" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
          }
        />
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            fontSize: 13,
            color: C.muted,
            fontWeight: 600,
            letterSpacing: -0.1,
          }}
        >
          Şimdi değil
        </div>
      </div>
    </Phone>
  );
}

function Page4() {
  return (
    <Phone label="04 · Alarm">
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "80px 30px 170px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Eyebrow>Alarm</Eyebrow>
        <h2
          style={{
            margin: "12px 0 0",
            fontFamily: SERIF,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: -1.2,
            lineHeight: 1.0,
            color: C.ink,
          }}
        >
          Hedefini söyle.
        </h2>
        <div
          style={{
            margin: "10px 0 0",
            fontSize: 14,
            color: C.inkSoft,
            letterSpacing: -0.2,
          }}
        >
          Sen seyret.
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 6,
          }}
        >
          <AlarmCard />
        </div>
      </div>

      <div style={{ position: "absolute", left: 26, right: 26, bottom: 30 }}>
        <div style={{ marginBottom: 18 }}>
          <Dots active={4} />
        </div>
        <PrimaryCta label="Hadi başlayalım" />
      </div>
    </Phone>
  );
}

/* ============================================================
   STAGE
   ============================================================ */

export default function OnboardingV2() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "radial-gradient(ellipse at top, #ECEAE3 0%, #DDD9CF 100%)",
        padding: "60px 24px 80px",
        display: "flex",
        gap: 32,
        justifyContent: "center",
        alignItems: "flex-start",
        flexWrap: "wrap",
        fontFamily: SANS,
        boxSizing: "border-box",
      }}
    >
      <Page1 />
      <Page2 />
      <Page3 />
      <Page4 />
    </div>
  );
}
