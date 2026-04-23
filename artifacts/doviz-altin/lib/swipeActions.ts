import { router } from "expo-router";
import type { SwipeAction } from "@/components/common/SwipeableRow";

interface RowLike {
  code: string;
  nameTR?: string;
}

/**
 * Symbol satırı için sol-swipe aksiyon seti: Favori, Alarm, Portföye Ekle.
 * Renkler ekran tarafından (theme-aware) verilir.
 */
export function symbolLeftActions(args: {
  item: RowLike;
  type: "currency" | "gold";
  isFavorite: boolean;
  toggleFavorite: (code: string) => void;
  colors: {
    primary: string;
    gold: string;
    rise: string;
    mutedForeground: string;
  };
}): SwipeAction[] {
  const { item, type, isFavorite, toggleFavorite, colors } = args;
  return [
    {
      label: isFavorite ? "Favoriden Çıkar" : "Favori",
      icon: isFavorite ? "star" : "star-outline",
      color: colors.gold,
      onPress: () => toggleFavorite(item.code),
    },
    {
      label: "Alarm",
      icon: "notifications-outline",
      color: colors.primary,
      onPress: () =>
        router.push({ pathname: "/alerts", params: { code: item.code, type } }),
    },
    {
      label: "Portföye Ekle",
      icon: "briefcase-outline",
      color: colors.rise,
      onPress: () =>
        router.push({
          pathname: "/(tabs)/portfolio",
          params: { addCode: item.code, addType: type },
        }),
    },
  ];
}
