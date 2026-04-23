import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import type { SmartAlert, AlertGroup } from "@/lib/alertTypes";
import { alertKindBadge, alertKindLabel, alertKindShort } from "@/lib/alertTypes";
import { formatAlertRule } from "@/lib/alertFormat";

function mutedStatusLabel(mutedUntil?: number): string | null {
  if (!mutedUntil) return null;
  const now = Date.now();
  if (mutedUntil <= now) return null;
  const diffMin = Math.round((mutedUntil - now) / 60000);
  if (diffMin < 60) return `${diffMin} dk sustur.`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} saat susturuldu`;
  const diffD = Math.round(diffH / 24);
  return `${diffD} gün susturuldu`;
}

function AlertTypeBadge({ kind, colors }: { kind: SmartAlert["kind"]; colors: any }) {
  const b = alertKindBadge(kind);
  return (
    <View style={{
      paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
      backgroundColor: b.color + "20",
      flexDirection: "row", alignItems: "center", gap: 4,
    }}>
      <Text style={{ fontSize: 10, color: b.color, lineHeight: 12 }}>{b.glyph}</Text>
      <Text style={{ fontSize: 10.5, fontFamily: "Inter_700Bold", color: b.color, letterSpacing: 0.3 }}>
        {alertKindShort(kind).toLocaleUpperCase("tr-TR")}
      </Text>
    </View>
  );
}

function AlertCard({
  alert, group, colors, onLongPress, onToggleActive, onDelete,
}: {
  alert: SmartAlert;
  group: AlertGroup | undefined;
  colors: any;
  onLongPress: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const muted = mutedStatusLabel(alert.mutedUntil);
  const inactive = !alert.active || !!muted || group?.muted;
  return (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={400}
      accessibilityRole="button"
      accessibilityLabel={`${alert.nameTR} alarmı. ${alertKindLabel(alert.kind)}. Uzun bas: seçenekler.`}
      style={{
        backgroundColor: colors.card,
        borderRadius: colors.radius,
        padding: 14,
        borderWidth: 1,
        borderColor: alert.triggered ? colors.primary + "50" : colors.border,
        opacity: inactive ? 0.6 : 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground }}>
              {alert.nameTR}
            </Text>
            <AlertTypeBadge kind={alert.kind} colors={colors} />
            {group && (
              <View style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.secondary }}>
                <Text style={{ fontSize: 10.5, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>
                  {group.name}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 12.5, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 17 }}>
            {formatAlertRule(alert)}
          </Text>
          {alert.window && (
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 4 }}>
              Pencere: {alert.window.start} – {alert.window.end}
            </Text>
          )}
          {muted && (
            <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.fall, marginTop: 4 }}>
              ⏸ {muted}
            </Text>
          )}
          {group?.muted && (
            <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 4 }}>
              Grup susturulmuş
            </Text>
          )}
          {alert.triggered && (
            <View style={{ marginTop: 8, backgroundColor: colors.primary + "15", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
              <Icon name="checkmark-circle" size={14} color={colors.primary} />
              <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.primary }}>Tetiklendi</Text>
            </View>
          )}
        </View>
        <Switch
          value={alert.active}
          onValueChange={onToggleActive}
          accessibilityLabel={alert.active ? "Alarmı pasifleştir" : "Alarmı etkinleştir"}
        />
        <Pressable onPress={onDelete} style={{ padding: 8, marginLeft: 4 }} accessibilityRole="button" accessibilityLabel="Alarmı sil">
          <Icon name="trash-outline" size={18} color={colors.fall} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function GroupCard({
  group, alertCount, colors, onToggleMute, onRename, onDelete,
}: {
  group: AlertGroup;
  alertCount: number;
  colors: any;
  onToggleMute: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={{
      backgroundColor: colors.card, borderRadius: colors.radius,
      padding: 14, borderWidth: 1, borderColor: colors.border,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground }}>
            {group.name}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>
            {alertCount} alarm {group.muted ? "· susturulmuş" : ""}
          </Text>
        </View>
        <Switch
          value={!group.muted}
          onValueChange={onToggleMute}
          accessibilityLabel={group.muted ? "Grubu aç" : "Grubu sustur"}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <Pressable
          onPress={onRename}
          style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.secondary }}
          accessibilityRole="button" accessibilityLabel="Grubu yeniden adlandır"
        >
          <Text style={{ fontSize: 12.5, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
            Yeniden Adlandır
          </Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.fall + "15" }}
          accessibilityRole="button" accessibilityLabel="Grubu sil"
        >
          <Text style={{ fontSize: 12.5, fontFamily: "Inter_600SemiBold", color: colors.fall }}>
            Sil
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function EmptyAlerts({ colors }: { colors: any }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
      <Icon name="notifications-off-outline" size={64} color={colors.mutedForeground} />
      <Text style={{ fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 20, textAlign: "center" }}>
        Aktif Alarm Yok
      </Text>
      <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
        Döviz veya altın fiyatlarını takip etmek için alarm kurun. Detay ekranından yeni alarm ekleyebilirsiniz.
      </Text>
      <Pressable
        onPress={() => router.back()}
        style={{ marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 25 }}
      >
        <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.primaryForeground }}>
          Fiyatlara Dön
        </Text>
      </Pressable>
    </View>
  );
}

function EmptyGroups({ colors, onCreate }: { colors: any; onCreate: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
      <Icon name="apps-outline" size={56} color={colors.mutedForeground} />
      <Text style={{ fontSize: 17, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 18, textAlign: "center" }}>
        Henüz Grup Yok
      </Text>
      <Text style={{ fontSize: 13.5, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 6, textAlign: "center", lineHeight: 19 }}>
        Benzer alarmları bir grup altında toplayın, tek dokunuşla hepsini susturun.
      </Text>
      <Pressable
        onPress={onCreate}
        style={{ marginTop: 20, backgroundColor: colors.foreground, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 22 }}
      >
        <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.background }}>
          Yeni Grup Oluştur
        </Text>
      </Pressable>
    </View>
  );
}

function nextMorningNine(): number {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.getTime();
}

function endOfToday(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export default function AlertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    alerts, removeAlert, updateAlert,
    alertGroups, createAlertGroup, renameAlertGroup, deleteAlertGroup, toggleAlertGroupMute,
  } = useApp();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const [tab, setTab] = useState<"alerts" | "groups">("alerts");

  // Rename / create group modal
  const [groupModal, setGroupModal] = useState<null | { mode: "create" } | { mode: "rename"; id: string; initial: string }>(null);
  const [groupDraft, setGroupDraft] = useState("");

  const openCreateGroup = () => { setGroupDraft(""); setGroupModal({ mode: "create" }); };
  const openRenameGroup = (g: AlertGroup) => { setGroupDraft(g.name); setGroupModal({ mode: "rename", id: g.id, initial: g.name }); };
  const closeGroupModal = () => setGroupModal(null);

  const submitGroupModal = async () => {
    const v = groupDraft.trim();
    if (!v) return;
    if (groupModal?.mode === "create") {
      await createAlertGroup(v);
    } else if (groupModal?.mode === "rename") {
      await renameAlertGroup(groupModal.id, v);
    }
    closeGroupModal();
  };

  const alertCountByGroup = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of alerts) if (a.groupId) map.set(a.groupId, (map.get(a.groupId) ?? 0) + 1);
    return map;
  }, [alerts]);

  const groupOf = (id?: string) => (id ? alertGroups.find((g) => g.id === id) : undefined);

  const openAlertActions = (alert: SmartAlert) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const muteOptions: { label: string; until?: number; reset?: boolean }[] = [
      { label: "1 Saat Sustur", until: Date.now() + 60 * 60 * 1000 },
      { label: "Bugün Sustur", until: endOfToday() },
      { label: "Yarına Kadar Sustur", until: nextMorningNine() },
    ];
    if (alert.mutedUntil) muteOptions.push({ label: "Susturmayı Kaldır", reset: true });

    const groupButtons = alertGroups.map((g) => ({
      text: alert.groupId === g.id ? `✓ ${g.name}` : g.name,
      onPress: () => updateAlert(alert.id, { groupId: alert.groupId === g.id ? undefined : g.id } as any),
    }));
    if (alert.groupId) {
      groupButtons.unshift({ text: "Gruptan Çıkar", onPress: () => updateAlert(alert.id, { groupId: undefined } as any) });
    }

    Alert.alert(
      alert.nameTR,
      formatAlertRule(alert),
      [
        ...muteOptions.map((o) => ({
          text: o.label,
          onPress: () => {
            if (o.reset) updateAlert(alert.id, { mutedUntil: undefined } as any);
            else updateAlert(alert.id, { mutedUntil: o.until } as any);
          },
        })),
        ...(groupButtons.length > 0 ? [{ text: "Gruba Taşı…", onPress: () => openGroupPicker(alert) }] : []),
        {
          text: alert.active ? "Alarmı Durdur" : "Alarmı Etkinleştir",
          onPress: () => updateAlert(alert.id, { active: !alert.active } as any),
        },
        { text: "Alarmı Sil", style: "destructive", onPress: () => confirmDelete(alert.id) },
        { text: "İptal", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const openGroupPicker = (alert: SmartAlert) => {
    const opts: { text: string; onPress?: () => void; style?: "cancel" | "destructive" }[] = [];
    if (alert.groupId) {
      opts.push({ text: "Gruptan Çıkar", onPress: () => updateAlert(alert.id, { groupId: undefined } as any) });
    }
    for (const g of alertGroups) {
      opts.push({
        text: alert.groupId === g.id ? `✓ ${g.name}` : g.name,
        onPress: () => updateAlert(alert.id, { groupId: g.id } as any),
      });
    }
    opts.push({ text: "İptal", style: "cancel" });
    Alert.alert("Gruba Taşı", alert.nameTR, opts);
  };

  const confirmDelete = (id: string) => {
    Alert.alert("Alarmı Sil", "Bu alarmı silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          removeAlert(id);
        },
      },
    ]);
  };

  const confirmDeleteGroup = (g: AlertGroup) => {
    Alert.alert("Grubu Sil", `"${g.name}" grubunu silmek istediğinize emin misiniz? Alarmlar silinmez, sadece gruptan çıkarılır.`, [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => deleteAlertGroup(g.id) },
    ]);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topPadding + 8, paddingHorizontal: 20, paddingBottom: 8, flexDirection: "row", alignItems: "center" },
    backBtn: { padding: 8, marginLeft: -8, marginRight: 8 },
    headerTitle: { flex: 1, fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground },
    tabs: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: colors.secondary },
    tabOn: { backgroundColor: colors.foreground },
    tabTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    tabTxtOn: { color: colors.background },
    listContent: { paddingHorizontal: 16, paddingBottom: bottomPadding + 20, gap: 10 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Geri dön">
          <Icon name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={styles.headerTitle}>Fiyat Alarmları</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab("alerts")} style={[styles.tab, tab === "alerts" && styles.tabOn]} accessibilityRole="button">
          <Text style={[styles.tabTxt, tab === "alerts" && styles.tabTxtOn]}>Tüm Alarmlar · {alerts.length}</Text>
        </Pressable>
        <Pressable onPress={() => setTab("groups")} style={[styles.tab, tab === "groups" && styles.tabOn]} accessibilityRole="button">
          <Text style={[styles.tabTxt, tab === "groups" && styles.tabTxtOn]}>Gruplar · {alertGroups.length}</Text>
        </Pressable>
      </View>

      {tab === "alerts" ? (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertCard
              alert={item}
              group={groupOf(item.groupId)}
              colors={colors}
              onLongPress={() => openAlertActions(item)}
              onToggleActive={() => updateAlert(item.id, { active: !item.active } as any)}
              onDelete={() => confirmDelete(item.id)}
            />
          )}
          ListEmptyComponent={<EmptyAlerts colors={colors} />}
          contentContainerStyle={[styles.listContent, alerts.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={alertGroups}
          keyExtractor={(g) => g.id}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              alertCount={alertCountByGroup.get(item.id) ?? 0}
              colors={colors}
              onToggleMute={() => toggleAlertGroupMute(item.id)}
              onRename={() => openRenameGroup(item)}
              onDelete={() => confirmDeleteGroup(item)}
            />
          )}
          ListEmptyComponent={<EmptyGroups colors={colors} onCreate={openCreateGroup} />}
          ListFooterComponent={
            alertGroups.length > 0 ? (
              <Pressable
                onPress={openCreateGroup}
                style={{
                  backgroundColor: colors.secondary, paddingVertical: 14,
                  borderRadius: 12, alignItems: "center", marginTop: 4,
                  borderWidth: 1, borderColor: colors.border, borderStyle: "dashed",
                }}
                accessibilityRole="button" accessibilityLabel="Yeni grup oluştur"
              >
                <Text style={{ fontSize: 13.5, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                  + Yeni Grup
                </Text>
              </Pressable>
            ) : null
          }
          contentContainerStyle={[styles.listContent, alertGroups.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={groupModal !== null} transparent animationType="fade" onRequestClose={closeGroupModal}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 32 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, gap: 14 }}>
            <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground }}>
              {groupModal?.mode === "create" ? "Yeni Grup" : "Grubu Yeniden Adlandır"}
            </Text>
            <TextInput
              value={groupDraft}
              onChangeText={setGroupDraft}
              placeholder="Grup adı (örn. Çalışma Saati)"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              style={{
                backgroundColor: colors.secondary, borderRadius: 10,
                padding: 12, fontSize: 15, color: colors.foreground,
                fontFamily: "Inter_500Medium",
              }}
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={closeGroupModal}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.secondary, alignItems: "center" }}
              >
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>İptal</Text>
              </Pressable>
              <Pressable
                onPress={submitGroupModal}
                disabled={!groupDraft.trim()}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.foreground, alignItems: "center", opacity: groupDraft.trim() ? 1 : 0.5 }}
              >
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.background }}>
                  {groupModal?.mode === "create" ? "Oluştur" : "Kaydet"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
