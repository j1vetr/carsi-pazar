import React from "react";
import { StyleSheet, View } from "react-native";

import { Skeleton, SkeletonGroup } from "@/components/common/Skeleton";
import { useColors } from "@/hooks/useColors";

/** Detail ekranı için hero + chart + satır iskeleti. */
export function DetailSkeleton() {
  const colors = useColors();
  return (
    <SkeletonGroup style={{ flex: 1 }}>
      {/* Hero */}
      <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18, gap: 10 }}>
        <Skeleton width={160} height={22} />
        <Skeleton width={220} height={12} radius={6} />
        <Skeleton width={200} height={38} style={{ marginTop: 12 }} />
        <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
          <Skeleton width={100} height={20} radius={6} />
          <Skeleton width={60} height={20} radius={6} />
        </View>
      </View>

      {/* Range picker */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Skeleton height={36} radius={10} />
      </View>

      {/* Chart */}
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 16,
          paddingBottom: 18,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Skeleton height={180} radius={12} />
      </View>

      {/* Details */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 12 }}>
        <Skeleton width={110} height={11} radius={4} />
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 4,
              borderBottomWidth: i < 4 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.border,
              paddingBottom: 14,
            }}
          >
            <Skeleton width={110} height={13} radius={4} />
            <Skeleton width={80} height={13} radius={4} />
          </View>
        ))}
      </View>
    </SkeletonGroup>
  );
}
