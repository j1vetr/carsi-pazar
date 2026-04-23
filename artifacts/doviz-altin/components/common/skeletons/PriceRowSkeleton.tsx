import React from "react";
import { StyleSheet, View } from "react-native";

import { Skeleton, SkeletonGroup } from "@/components/common/Skeleton";
import { useColors } from "@/hooks/useColors";

type Props = {
  /** Adet. Varsayılan 8. */
  count?: number;
  /** Satır sol tarafında ad ikonu (yuvarlak) göster. */
  withIcon?: boolean;
};

function Row({ withIcon }: { withIcon: boolean }) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 13,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      }}
    >
      {withIcon ? <Skeleton width={30} height={30} radius={15} style={{ marginRight: 12 }} /> : null}
      <View style={{ flex: 1, gap: 7 }}>
        <Skeleton width={70} height={13} />
        <Skeleton width={120} height={10} radius={6} />
      </View>
      <View style={{ alignItems: "flex-end", gap: 7, width: 90 }}>
        <Skeleton width={80} height={13} />
        <Skeleton width={52} height={10} radius={6} />
      </View>
    </View>
  );
}

export function PriceRowSkeleton({ count = 8, withIcon = true }: Props) {
  return (
    <SkeletonGroup>
      {Array.from({ length: count }).map((_, i) => (
        <Row key={i} withIcon={withIcon} />
      ))}
    </SkeletonGroup>
  );
}

/** Favoriler ve parite ekranlarında kullanılan kart şekilli iskelet. */
export function PriceCardSkeleton({ count = 6 }: { count?: number }) {
  const colors = useColors();
  return (
    <SkeletonGroup>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.card,
            borderRadius: colors.radius ?? 14,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            padding: 14,
            marginHorizontal: 16,
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Skeleton width={36} height={36} radius={18} style={{ marginRight: 12 }} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width={90} height={14} />
            <Skeleton width={150} height={10} radius={6} />
          </View>
          <View style={{ alignItems: "flex-end", gap: 7 }}>
            <Skeleton width={80} height={14} />
            <Skeleton width={52} height={12} radius={6} />
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}
