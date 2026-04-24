import "./_tokens.css";
import { useEffect, useState } from "react";
import { ChevronDown, Delete } from "lucide-react";

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatDateInput(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}.${d.slice(2)}`;
  return d;
}

export function CustomDate() {
  // Canlı yazıyormuş gibi animasyon
  const [digits, setDigits] = useState("09042026");
  const [caretOn, setCaretOn] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setCaretOn((v) => !v), 530);
    return () => clearInterval(t);
  }, []);

  const formatted = formatDateInput(digits);
  const isComplete = digits.length === 8;
  const histPrice = 3320.1;
  const todayPrice = 4486.5;
  const changePct = ((todayPrice - histPrice) / histPrice) * 100;

  const onKey = (k: string) => {
    if (k === "del") setDigits((d) => d.slice(0, -1));
    else if (digits.length < 8) setDigits((d) => d + k);
  };

  const KeyBtn = ({
    label,
    onPress,
    sub,
    big,
  }: {
    label: React.ReactNode;
    onPress: () => void;
    sub?: string;
    big?: boolean;
  }) => (
    <button
      onClick={onPress}
      className="rounded-[6px] flex flex-col items-center justify-center select-none transition-transform active:scale-95"
      style={{
        background: big ? "transparent" : "var(--key-bg)",
        boxShadow: big
          ? "none"
          : "0 1px 0 rgba(0,0,0,0.45), 0 0.5px 0 rgba(255,255,255,0.04) inset",
        color: "var(--key-fg)",
        height: 44,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        className="font-normal"
        style={{ fontSize: 22, lineHeight: 1, letterSpacing: 0.5 }}
      >
        {label}
      </div>
      {sub ? (
        <div
          className="font-medium mt-[2px]"
          style={{ fontSize: 9, color: "var(--key-sub)", letterSpacing: 1.5 }}
        >
          {sub}
        </div>
      ) : null}
    </button>
  );

  return (
    <div
      className="txm dark"
      style={{
        ["--key-bg" as never]: "#6B6B70",
        ["--key-fg" as never]: "#FFFFFF",
        ["--key-sub" as never]: "#E5E5E5",
        ["--kb-bg" as never]: "#2C2C2E",
      }}
    >
      <div
        className="mx-auto max-w-[420px]"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          paddingLeft: 18,
          paddingRight: 18,
          paddingTop: 10,
        }}
      >
        {/* Modal handle bar */}
        <div className="flex justify-center mb-1">
          <div
            className="w-9 h-1 rounded-full"
            style={{ background: "var(--border)" }}
          />
        </div>

        {/* Header — kompakt */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: "rgba(232,199,82,0.18)", color: "var(--gold)" }}
            >
              ATA
            </div>
            <div>
              <div
                className="text-[14px] font-bold leading-tight"
                style={{ color: "var(--fg)" }}
              >
                Cumhuriyet Altını
              </div>
              <div
                className="text-[10.5px] font-semibold mt-[1px]"
                style={{ color: "var(--muted)", letterSpacing: 0.4 }}
              >
                ALTIN · ATA
              </div>
            </div>
          </div>
          <div
            className="px-2.5 py-1 rounded-md text-[10.5px] font-bold num"
            style={{ background: "var(--secondary)", color: "var(--fg)" }}
          >
            ₺{fmtTL(todayPrice)}
          </div>
        </div>

        {/* Adet & Fiyat — yan yana kompakt */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label
              className="text-[10px] font-bold uppercase"
              style={{ color: "var(--muted)", letterSpacing: 0.5 }}
            >
              Adet
            </label>
            <div
              className="mt-1 rounded-lg px-3 py-2 text-[14px] font-semibold num"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--fg)",
              }}
            >
              2
            </div>
          </div>
          <div>
            <label
              className="text-[10px] font-bold uppercase"
              style={{ color: "var(--muted)", letterSpacing: 0.5 }}
            >
              Birim Fiyat (₺)
            </label>
            <div
              className="mt-1 rounded-lg px-3 py-2 text-[14px] font-semibold num"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--muted)",
              }}
            >
              0,00
            </div>
          </div>
        </div>

        {/* Tarih: chips */}
        <div className="mt-3">
          <label
            className="text-[10px] font-bold uppercase"
            style={{ color: "var(--muted)", letterSpacing: 0.5 }}
          >
            İşlem Tarihi
          </label>
          <div className="mt-1 flex gap-1.5">
            {[
              { k: "today", l: "Bugün" },
              { k: "yesterday", l: "Dün" },
              { k: "custom", l: "Özel" },
            ].map(({ k, l }) => {
              const active = k === "custom";
              return (
                <div
                  key={k}
                  className="flex-1 py-1.5 rounded-md text-[12px] font-semibold text-center"
                  style={{
                    background: active ? "var(--primary)" : "var(--card)",
                    color: active ? "var(--primary-fg)" : "var(--muted)",
                    border: active
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                  }}
                >
                  {l}
                </div>
              );
            })}
          </div>

          {/* Custom date input — FOKUSLU */}
          <div
            className="mt-2 rounded-lg px-3 py-2.5 flex items-center"
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--primary)",
              boxShadow: "0 0 0 3px rgba(91,141,239,0.18)",
            }}
          >
            <div
              className="text-[14px] font-semibold num"
              style={{
                color: digits ? "var(--fg)" : "var(--muted)",
                letterSpacing: 1,
                minWidth: 96,
              }}
            >
              {formatted || "GG.AA.YYYY"}
            </div>
            <div
              style={{
                width: 1.5,
                height: 16,
                marginLeft: 1,
                background: "var(--primary)",
                opacity: caretOn ? 1 : 0,
                transition: "opacity 80ms",
              }}
            />
            <div className="ml-auto flex items-center gap-1">
              <div
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(91,141,239,0.15)",
                  color: "var(--primary)",
                  letterSpacing: 0.4,
                }}
              >
                GG.AA.YYYY
              </div>
            </div>
          </div>

          {/* Geçmiş Fiyat kartı — tam tarih girince görünür */}
          {isComplete ? (
            <div
              className="mt-2 rounded-xl flex items-center justify-between"
              style={{
                background: "var(--secondary)",
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 12,
                paddingRight: 12,
              }}
            >
              <div className="flex-1 mr-2.5">
                <div
                  className="text-[10px] font-bold uppercase"
                  style={{ color: "var(--muted)", letterSpacing: 0.5 }}
                >
                  O GÜNKÜ PİYASA
                </div>
                <div
                  className="text-[15px] font-bold mt-[2px] num"
                  style={{ color: "var(--fg)", letterSpacing: -0.3 }}
                >
                  ₺{fmtTL(histPrice)}
                </div>
                <div
                  className="text-[10.5px] font-medium mt-[1px] num"
                  style={{ color: "var(--muted)" }}
                >
                  09.04.2026 &nbsp;·&nbsp; bugüne göre {changePct >= 0 ? "+" : "−"}%
                  {Math.abs(changePct).toFixed(2)}
                </div>
              </div>
              <div
                className="px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold"
                style={{
                  background: "var(--card)",
                  color: "var(--primary)",
                  border: "1px solid var(--border)",
                }}
              >
                Kullan
              </div>
            </div>
          ) : (
            <div
              className="mt-2 rounded-xl px-3 py-2.5 text-[11px] font-medium"
              style={{
                background: "var(--secondary)",
                color: "var(--muted)",
                letterSpacing: 0.2,
              }}
            >
              Tarihi tamamla → o günün piyasa fiyatı görünecek
            </div>
          )}
        </div>

        {/* Esnek boşluk — klavyeyi alta itmek için */}
        <div style={{ flex: 1, minHeight: 12 }} />

        {/* iOS numeric keyboard */}
        <div
          style={{
            background: "var(--kb-bg)",
            paddingTop: 6,
            paddingLeft: 4,
            paddingRight: 4,
            paddingBottom: 14,
            marginLeft: -18,
            marginRight: -18,
            borderTop: "1px solid rgba(0,0,0,0.5)",
          }}
        >
          {/* Predictive bar — "Done" ipucu */}
          <div
            className="flex items-center justify-between"
            style={{
              paddingLeft: 14,
              paddingRight: 14,
              paddingTop: 4,
              paddingBottom: 8,
            }}
          >
            <div
              className="text-[11px] font-medium"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Sayı tuş takımı
            </div>
            <button
              className="flex items-center gap-1 text-[12.5px] font-semibold"
              style={{ color: "#5BA3FF" }}
            >
              Bitti
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Tuş ızgarası */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 6,
              paddingLeft: 4,
              paddingRight: 4,
            }}
          >
            <KeyBtn label="1" onPress={() => onKey("1")} />
            <KeyBtn label="2" sub="A B C" onPress={() => onKey("2")} />
            <KeyBtn label="3" sub="D E F" onPress={() => onKey("3")} />
            <KeyBtn label="4" sub="G H I" onPress={() => onKey("4")} />
            <KeyBtn label="5" sub="J K L" onPress={() => onKey("5")} />
            <KeyBtn label="6" sub="M N O" onPress={() => onKey("6")} />
            <KeyBtn label="7" sub="P Q R S" onPress={() => onKey("7")} />
            <KeyBtn label="8" sub="T U V" onPress={() => onKey("8")} />
            <KeyBtn label="9" sub="W X Y Z" onPress={() => onKey("9")} />
            <KeyBtn label="" onPress={() => {}} big />
            <KeyBtn label="0" onPress={() => onKey("0")} />
            <KeyBtn
              big
              label={<Delete size={20} style={{ color: "#FFFFFF" }} />}
              onPress={() => onKey("del")}
            />
          </div>

          {/* Home indicator (iPhone X+) */}
          <div className="flex justify-center mt-3">
            <div
              style={{
                width: 130,
                height: 4,
                borderRadius: 999,
                background: "rgba(255,255,255,0.55)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomDate;
