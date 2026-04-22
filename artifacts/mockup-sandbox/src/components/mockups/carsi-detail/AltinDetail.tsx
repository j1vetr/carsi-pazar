import { DetailScreen } from "./_shared/DetailScreen";

export function AltinDetail() {
  return (
    <DetailScreen
      symbol="ALTIN"
      nameTR="Gram Altın"
      description="Saf altının gram bazında piyasa fiyatı"
      buy={4234.56}
      sell={4239.12}
      change={12.34}
      changePercent={0.29}
      prevClose={4222.22}
      type="gold"
      iconText="ALT"
      iconBg="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
    />
  );
}
