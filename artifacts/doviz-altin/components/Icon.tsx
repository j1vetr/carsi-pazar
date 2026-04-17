import React from "react";
import {
  AlertCircle,
  ArrowDownUp,
  ArrowLeftRight,
  Bell,
  BellOff,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Flag,
  Gem,
  MoreHorizontal,
  Plus,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
  type LucideProps,
} from "lucide-react-native";

export type IconName =
  | "notifications"
  | "notifications-outline"
  | "notifications-off-outline"
  | "star"
  | "star-outline"
  | "trash-outline"
  | "checkmark-circle"
  | "arrow-back"
  | "arrow-forward"
  | "chevron-down"
  | "chevron-up"
  | "chevron-forward"
  | "chevron-back"
  | "close"
  | "trending-up"
  | "trending-down"
  | "swap-vertical"
  | "swap-horizontal"
  | "briefcase"
  | "briefcase-outline"
  | "diamond"
  | "add"
  | "ellipsis-horizontal"
  | "flag"
  | "alert-circle"
  | "caret-up"
  | "caret-down"
  | "x";

const MAP: Record<IconName, React.ComponentType<LucideProps>> = {
  "notifications": Bell,
  "notifications-outline": Bell,
  "notifications-off-outline": BellOff,
  "star": Star,
  "star-outline": Star,
  "trash-outline": Trash2,
  "checkmark-circle": CheckCircle2,
  "arrow-back": ChevronLeft,
  "arrow-forward": ChevronRight,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "chevron-forward": ChevronRight,
  "chevron-back": ChevronLeft,
  "close": X,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "swap-vertical": ArrowDownUp,
  "swap-horizontal": ArrowLeftRight,
  "briefcase": Briefcase,
  "briefcase-outline": Briefcase,
  "diamond": Gem,
  "add": Plus,
  "ellipsis-horizontal": MoreHorizontal,
  "flag": Flag,
  "alert-circle": AlertCircle,
  "caret-up": ChevronUp,
  "caret-down": ChevronDown,
  "x": X,
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

export function Icon({ name, size = 18, color = "#000", style }: IconProps) {
  const Cmp = MAP[name];
  if (!Cmp) return null;
  const isFilled = name === "star" || name === "notifications" || name === "briefcase";
  return (
    <Cmp
      size={size}
      color={color}
      strokeWidth={2}
      fill={isFilled ? color : "none"}
      style={style}
    />
  );
}
