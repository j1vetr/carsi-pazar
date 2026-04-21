import React from "react";
import { PhoneShell, TopBar, Segments, TableHeader, Row, SectionTitle, type PriceRow } from "./_v2";

const ROWS: PriceRow[] = [
  { code: "GRAM",      name: "Gram Altın",          buy: "4.382,50", sell: "4.384,20", change:  0.82, flag: "🟡" },
  { code: "ÇEYREK",    name: "Çeyrek Altın",        buy: "7.230,00", sell: "7.245,00", change:  0.71, flag: "🟡", badge: "YENİ" },
  { code: "ÇEYREK",    name: "Çeyrek Altın",        buy: "7.175,00", sell: "7.190,00", change:  0.66, flag: "🟡", badge: "ESKİ" },
  { code: "YARIM",     name: "Yarım Altın",         buy: "14.350,00", sell: "14.380,00", change:  0.74, flag: "🟡", badge: "YENİ" },
  { code: "TAM",       name: "Tam Altın",           buy: "28.700,00", sell: "28.760,00", change:  0.78, flag: "🟡", badge: "YENİ" },
  { code: "CUMHUR.",   name: "Cumhuriyet Altını",   buy: "28.980,00", sell: "29.040,00", change:  0.79, flag: "🟡" },
  { code: "ATA",       name: "Ata Altın",           buy: "29.550,00", sell: "29.610,00", change:  0.81, flag: "🟡" },
  { code: "REŞAT",     name: "Reşat Altını",        buy: "31.150,00", sell: "31.220,00", change:  0.83, flag: "🟡" },
  { code: "22 AYAR",   name: "Bilezik (22 Ayar)",   buy: "4.018,00",  sell: "4.024,00",  change:  0.65, flag: "💍" },
  { code: "ONS",       name: "Ons (USD)",           buy: "2.611,80",  sell: "2.612,40",  change:  0.42, flag: "🌐" },
  { code: "GÜMÜŞ",     name: "Gümüş (gr)",          buy: "52,40",     sell: "52,68",     change: -0.12, flag: "⚪" },
];

export function GoldHomeV2Dark() {
  return (
    <PhoneShell theme="dark">
      <TopBar theme="dark" />
      <Segments theme="dark" items={["Hepsi", "Sarrafiye", "Külçe", "Madenler"]} active={0} />
      <SectionTitle theme="dark" title="Altın Fiyatları" meta="KAPALIÇARŞI" />
      <TableHeader theme="dark" />
      <div>
        {ROWS.map((r, i) => (
          <Row key={`${r.code}-${i}`} theme="dark" row={r} last={i === ROWS.length - 1} />
        ))}
      </div>
      <div style={{ height: 24 }} />
    </PhoneShell>
  );
}

export default GoldHomeV2Dark;
