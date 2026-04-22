import { DetailScreen } from "./_shared/DetailScreen";

export function UsdDetail() {
  return (
    <DetailScreen
      symbol="USDTRY"
      nameTR="Amerikan Doları"
      description="ABD Doları / Türk Lirası serbest piyasa kuru"
      buy={38.4256}
      sell={38.4612}
      change={-0.1234}
      changePercent={-0.32}
      prevClose={38.5490}
      type="currency"
      iconText="USD"
      iconBg="linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)"
    />
  );
}
