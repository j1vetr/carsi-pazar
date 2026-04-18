import React from "react";
import { View } from "react-native";
import { useColors } from "@/hooks/useColors";

// Placeholder route — tab press is intercepted in (tabs)/_layout.tsx
// to open the side drawer instead of navigating here.
export default function MenuPlaceholder() {
  const colors = useColors();
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
