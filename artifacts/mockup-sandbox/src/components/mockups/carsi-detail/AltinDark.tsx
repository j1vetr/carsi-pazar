import { DetailScreen } from "./_shared/DetailScreen";

export function AltinDark() {
  return (
    <DetailScreen
      theme="dark"
      symbol="ALTIN"
      nameTR="Gram Altın"
      description="Saf Altının Gram Bazında Piyasa Fiyatı"
      buy={6948.42}
      sell={6961.18}
      prevClose={6936.10}
      type="gold"
      todayChange={12.32}
      todayChangePct={0.18}
    />
  );
}
