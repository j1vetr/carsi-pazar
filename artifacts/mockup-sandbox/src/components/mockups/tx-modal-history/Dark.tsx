import "./_tokens.css";
import { useState } from "react";
import { X } from "lucide-react";

const fmtTL = (v: number) =>
  v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function Dark() {
  const [datePreset, setDatePreset] = useState<"today" | "yesterday" | "custom">("custom");
  const [price, setPrice] = useState("");
  const [used, setUsed] = useState(false);

  const todayPrice = 4486.5;
  const histPrice = 3320.1;
  const histDate = "09.04.2026";
  const changePct = ((todayPrice - histPrice) / histPrice) * 100;

  return (
    <div className="txm dark min-h-screen">
      <div className="mx-auto max-w-[420px] px-5 pt-3 pb-10">
        {/* Modal handle bar */}
        <div className="flex justify-center mb-1">
          <div
            className="w-9 h-1 rounded-full"
            style={{ background: "var(--border)" }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between py-3">
          <div>
            <div
              className="text-[11px] uppercase tracking-wider font-bold"
              style={{ color: "var(--muted)", letterSpacing: "0.7px" }}
            >
              Portföye Ekle
            </div>
            <div
              className="text-[20px] font-bold mt-0.5"
              style={{ color: "var(--fg)", letterSpacing: "-0.4px" }}
            >
              Cumhuriyet Altını
            </div>
          </div>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "var(--secondary)" }}
            aria-label="Kapat"
          >
            <X size={18} style={{ color: "var(--muted)" }} />
          </button>
        </div>

        {/* Buy / Sell segmented */}
        <div
          className="mt-2 p-1 rounded-xl flex gap-1"
          style={{ background: "var(--secondary)" }}
        >
          <div
            className="flex-1 py-2.5 rounded-lg text-center text-[13px] font-semibold"
            style={{ background: "var(--card)", color: "var(--fg)" }}
          >
            Aldım
          </div>
          <div
            className="flex-1 py-2.5 rounded-lg text-center text-[13px] font-semibold"
            style={{ color: "var(--muted)" }}
          >
            Sattım
          </div>
        </div>

        {/* Current price card */}
        <div
          className="mt-4 rounded-2xl p-4 flex items-center justify-between"
          style={{ background: "var(--secondary)" }}
        >
          <div>
            <div
              className="text-[10.5px] font-bold uppercase"
              style={{ color: "var(--muted)", letterSpacing: "0.5px" }}
            >
              GÜNCEL PİYASA
            </div>
            <div
              className="text-[18px] font-bold mt-1 num"
              style={{ color: "var(--fg)", letterSpacing: "-0.3px" }}
            >
              ₺{fmtTL(todayPrice)}
            </div>
          </div>
          <div
            className="px-2.5 py-1 rounded-md text-[11px] font-bold"
            style={{ background: "rgba(91,141,239,0.15)", color: "var(--primary)" }}
          >
            CANLI
          </div>
        </div>

        {/* Amount */}
        <div className="mt-5">
          <label
            className="text-[11px] font-bold uppercase"
            style={{ color: "var(--muted)", letterSpacing: "0.5px" }}
          >
            Adet
          </label>
          <div
            className="mt-2 rounded-xl px-3.5 py-3 text-[15px] font-semibold num"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          >
            2
          </div>
        </div>

        {/* Price */}
        <div className="mt-4">
          <label
            className="text-[11px] font-bold uppercase"
            style={{ color: "var(--muted)", letterSpacing: "0.5px" }}
          >
            Birim Fiyat (₺)
          </label>
          <div
            className="mt-2 rounded-xl px-3.5 py-3 text-[15px] font-semibold num"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: used ? "var(--fg)" : "var(--muted)",
            }}
          >
            {used ? fmtTL(histPrice) : "0,00"}
          </div>
        </div>

        {/* Date */}
        <div className="mt-4">
          <label
            className="text-[11px] font-bold uppercase"
            style={{ color: "var(--muted)", letterSpacing: "0.5px" }}
          >
            İşlem Tarihi
          </label>
          <div className="mt-2 flex gap-2">
            {(["today", "yesterday", "custom"] as const).map((p) => {
              const labels = { today: "Bugün", yesterday: "Dün", custom: "Özel" };
              const active = p === datePreset;
              return (
                <button
                  key={p}
                  onClick={() => setDatePreset(p)}
                  className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
                  style={{
                    background: active ? "var(--primary)" : "var(--card)",
                    color: active ? "var(--primary-fg)" : "var(--muted)",
                    border: active
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                  }}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {datePreset === "custom" && (
            <div
              className="mt-2 rounded-xl px-3.5 py-3 text-[15px] font-semibold num"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--fg)",
                letterSpacing: "1px",
              }}
            >
              {histDate}
            </div>
          )}

          {/* HISTORICAL PRICE CARD — yeni özellik */}
          {datePreset !== "today" && (
            <button
              onClick={() => {
                setPrice(String(histPrice));
                setUsed(true);
              }}
              className="mt-2.5 w-full rounded-xl flex items-center justify-between text-left transition-opacity active:opacity-85"
              style={{
                background: "var(--secondary)",
                paddingTop: 12,
                paddingBottom: 12,
                paddingLeft: 14,
                paddingRight: 14,
              }}
            >
              <div className="flex-1 mr-2.5">
                <div
                  className="text-[10.5px] font-bold uppercase"
                  style={{ color: "var(--muted)", letterSpacing: "0.5px" }}
                >
                  O GÜNKÜ PİYASA
                </div>
                <div
                  className="text-[16px] font-bold mt-[3px] num"
                  style={{ color: "var(--fg)", letterSpacing: "-0.3px" }}
                >
                  ₺{fmtTL(histPrice)}
                </div>
                <div
                  className="text-[11px] font-medium mt-[2px] num"
                  style={{ color: "var(--muted)" }}
                >
                  {histDate} &nbsp;·&nbsp; bugüne göre {changePct >= 0 ? "+" : "−"}%
                  {Math.abs(changePct).toFixed(2)}
                </div>
              </div>
              <div
                className="px-3 py-[7px] rounded-lg text-[12px] font-bold"
                style={{
                  background: "var(--card)",
                  color: "var(--primary)",
                  border: "1px solid var(--border)",
                  letterSpacing: "-0.1px",
                }}
              >
                {used ? "Uygulandı" : "Kullan"}
              </div>
            </button>
          )}
        </div>

        {/* Save button */}
        <button
          className="mt-7 w-full py-3.5 rounded-2xl text-[15px] font-bold"
          style={{
            background: "var(--primary)",
            color: "var(--primary-fg)",
            letterSpacing: "-0.2px",
          }}
        >
          Kaydet
        </button>

        {/* Annotation */}
        <div
          className="mt-6 rounded-xl p-3.5"
          style={{
            background: "rgba(91,141,239,0.08)",
            border: "1px dashed rgba(91,141,239,0.35)",
          }}
        >
          <div
            className="text-[11px] font-bold uppercase mb-1"
            style={{ color: "var(--primary)", letterSpacing: "0.5px" }}
          >
            Yeni
          </div>
          <div
            className="text-[12.5px] leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            Geçmiş bir tarih seçtiğinde, o günün piyasa fiyatını otomatik öner. Tek
            dokunuşla fiyat alanına işle.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dark;
