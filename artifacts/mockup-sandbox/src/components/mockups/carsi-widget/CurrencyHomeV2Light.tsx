import React from "react";
import { PhoneShell, TopBar, Segments, TableHeader, Row, SectionTitle, type PriceRow } from "./_v2";

const ROWS: PriceRow[] = [
  { code: "USD", name: "Amerikan Doları",       buy: "41,8542", sell: "41,9120", change:  0.34, flag: "🇺🇸" },
  { code: "EUR", name: "Euro",                  buy: "47,2520", sell: "47,3088", change: -0.18, flag: "🇪🇺" },
  { code: "GBP", name: "İngiliz Sterlini",      buy: "53,1900", sell: "53,2500", change:  0.41, flag: "🇬🇧" },
  { code: "CHF", name: "İsviçre Frangı",        buy: "47,8780", sell: "47,9400", change:  0.12, flag: "🇨🇭" },
  { code: "AUD", name: "Avustralya Doları",     buy: "27,4220", sell: "27,4720", change:  0.55, flag: "🇦🇺" },
  { code: "CAD", name: "Kanada Doları",         buy: "30,1740", sell: "30,2200", change: -0.06, flag: "🇨🇦" },
  { code: "JPY", name: "Japon Yeni",            buy: "0,2748",  sell: "0,2752",  change: -0.22, flag: "🇯🇵" },
  { code: "SAR", name: "Suudi Riyali",          buy: "11,1640", sell: "11,1890", change:  0.34, flag: "🇸🇦" },
  { code: "DKK", name: "Danimarka Kronu",       buy: "6,3120",  sell: "6,3220",  change:  0.08, flag: "🇩🇰" },
  { code: "SEK", name: "İsveç Kronu",           buy: "4,4080",  sell: "4,4180",  change: -0.31, flag: "🇸🇪" },
  { code: "NOK", name: "Norveç Kronu",          buy: "3,8920",  sell: "3,9020",  change:  0.14, flag: "🇳🇴" },
  { code: "RUB", name: "Rus Rublesi",           buy: "0,4810",  sell: "0,4830",  change: -0.45, flag: "🇷🇺" },
];

export function CurrencyHomeV2Light() {
  return (
    <PhoneShell theme="light">
      <TopBar theme="light" />
      <Segments theme="light" items={["Tümü", "Favoriler", "Pariteler", "Çapraz"]} active={0} />
      <SectionTitle theme="light" title="Döviz Kurları" meta="CANLI" />
      <TableHeader theme="light" />
      <div>
        {ROWS.map((r, i) => (
          <Row key={r.code} theme="light" row={r} last={i === ROWS.length - 1} />
        ))}
      </div>
      <div style={{ height: 24 }} />
    </PhoneShell>
  );
}

export default CurrencyHomeV2Light;
