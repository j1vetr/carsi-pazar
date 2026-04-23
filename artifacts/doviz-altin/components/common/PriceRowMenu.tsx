import React, { useMemo } from "react";
import { Share, Platform } from "react-native";
import { router } from "expo-router";
import { ActionSheet, type ActionSheetItem } from "@/components/common/ActionSheet";
import { useApp, type CurrencyRate, type GoldRate } from "@/contexts/AppContext";
import { haptics } from "@/lib/haptics";

type RowItem = CurrencyRate | GoldRate;

interface Props {
  item: RowItem | null;
  type: "currency" | "gold";
  visible: boolean;
  onClose: () => void;
}

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

/**
 * Tek noktadan satır bağlam menüsü — Favorile / Alarm Kur / Detayı Aç /
 * Karşılaştır / Paylaş. Her ekran kendi long-press eventini bu menüye
 * yönlendirir; eylemlerin tutarlı olması garanti.
 */
export function PriceRowMenu({ item, type, visible, onClose }: Props) {
  const { favorites, toggleFavorite } = useApp();

  const items: ActionSheetItem[] = useMemo(() => {
    if (!item) return [];
    const isFav = favorites.includes(item.code);
    return [
      {
        key: "favorite",
        label: isFav ? "Favoriden Çıkar" : "Favorilere Ekle",
        icon: isFav ? "star" : "star-outline",
        onPress: () => {
          haptics.tap();
          toggleFavorite(item.code).catch(() => {});
        },
      },
      {
        key: "alert",
        label: "Alarm Kur",
        icon: "notifications-outline",
        hint: "Hedef fiyat alarm tanımla",
        onPress: () => {
          router.push({
            pathname: "/alerts",
            params: { code: item.code, type },
          });
        },
      },
      {
        key: "detail",
        label: "Detayı Aç",
        icon: "trending-up",
        onPress: () => {
          router.push({
            pathname: "/detail/[code]",
            params: { code: item.code, type },
          });
        },
      },
      {
        key: "compare",
        label: "Karşılaştırmaya Ekle",
        icon: "swap-horizontal",
        onPress: () => {
          router.push({
            pathname: "/tools/compare",
            params: { left: item.code },
          });
        },
      },
      {
        key: "share",
        label: "Paylaş",
        icon: "ellipsis-horizontal",
        onPress: () => {
          const message =
            `${item.code} • ${item.nameTR}\n` +
            `Alış: ${fmt(item.buy)} · Satış: ${fmt(item.sell)}\n` +
            `Değişim: ${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toFixed(2)}%\n` +
            (Platform.OS === "web" ? "" : "Çarşı Piyasa");
          Share.share({ message }).catch(() => {});
        },
      },
    ];
  }, [item, favorites, toggleFavorite, type]);

  return (
    <ActionSheet
      visible={visible}
      title={item ? `${item.code}` : undefined}
      subtitle={item ? item.nameTR : undefined}
      items={items}
      onClose={onClose}
    />
  );
}
