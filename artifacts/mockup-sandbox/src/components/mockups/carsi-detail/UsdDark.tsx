import { DetailScreen } from "./_shared/DetailScreen";

export function UsdDark() {
  return (
    <DetailScreen
      theme="dark"
      symbol="USDTRY"
      nameTR="Amerikan Doları"
      description="ABD Doları / Türk Lirası Serbest Piyasa Kuru"
      buy={38.4256}
      sell={38.4612}
      prevClose={38.5490}
      type="currency"
      todayChange={-0.1234}
      todayChangePct={-0.32}
    />
  );
}
