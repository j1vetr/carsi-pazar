import React from "react";
import { StyleSheet, View } from "react-native";

import { Skeleton, SkeletonGroup } from "@/components/common/Skeleton";
import { useColors } from "@/hooks/useColors";

export function NewsFeaturedSkeleton() {
  const colors = useColors();
  return (
    <View
      style={{
        borderRadius: 22,
        padding: 22,
        backgroundColor: colors.card,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        gap: 14,
      }}
    >
      <Skeleton width={90} height={18} radius={999} />
      <View style={{ gap: 8 }}>
        <Skeleton height={22} />
        <Skeleton height={22} width="82%" />
        <Skeleton height={22} width="46%" />
      </View>
      <View style={{ gap: 7, marginTop: 4 }}>
        <Skeleton height={13} radius={6} />
        <Skeleton height={13} radius={6} width="88%" />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingTop: 14,
        }}
      >
        <Skeleton width={60} height={11} radius={4} />
        <Skeleton width={50} height={11} radius={4} />
      </View>
    </View>
  );
}

export function NewsListSkeleton({ count = 6 }: { count?: number }) {
  const colors = useColors();
  return (
    <SkeletonGroup>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            paddingVertical: 16,
            paddingHorizontal: 4,
            borderBottomWidth: i < count - 1 ? StyleSheet.hairlineWidth : 0,
            borderBottomColor: colors.border,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Skeleton width={22} height={22} radius={6} />
            <Skeleton width={80} height={11} radius={4} />
            <Skeleton width={60} height={11} radius={4} />
          </View>
          <Skeleton height={16} />
          <Skeleton height={16} width="78%" />
          <Skeleton height={12} width="60%" radius={6} />
        </View>
      ))}
    </SkeletonGroup>
  );
}
