import React from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";

export default function PrivacyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === "android";
  const bottomPadding =
    Platform.OS === "web" ? 40 : (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom) + 24;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: bottomPadding },

    banner: {
      flexDirection: "row", gap: 12, padding: 16, borderRadius: 14,
      backgroundColor: colors.primary + "10",
      borderWidth: StyleSheet.hairlineWidth, borderColor: colors.primary + "44",
      marginBottom: 18,
    },
    bannerIcon: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.primary + "1F", alignItems: "center", justifyContent: "center",
    },
    bannerTitle: {
      fontSize: 14, fontFamily: "Inter_700Bold",
      color: colors.foreground, letterSpacing: -0.2, marginBottom: 4,
    },
    bannerText: {
      fontSize: 12.5, fontFamily: "Inter_500Medium",
      color: colors.mutedForeground, lineHeight: 18.5,
    },

    section: { marginBottom: 18 },
    h2: {
      fontSize: 13, fontFamily: "Inter_700Bold",
      color: colors.foreground, letterSpacing: 0.4, marginBottom: 8, textTransform: "uppercase",
    },
    p: {
      fontSize: 13.5, fontFamily: "Inter_400Regular",
      color: colors.foreground, lineHeight: 21, marginBottom: 8, opacity: 0.9,
    },
    bullet: { flexDirection: "row", gap: 10, marginBottom: 6 },
    bulletDot: {
      width: 5, height: 5, borderRadius: 3,
      backgroundColor: colors.primary, marginTop: 8,
    },
    bulletText: {
      flex: 1, fontSize: 13, fontFamily: "Inter_400Regular",
      color: colors.foreground, lineHeight: 20, opacity: 0.9,
    },

    rightsCard: {
      padding: 14, borderRadius: 12, backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
      marginBottom: 8,
    },
    rightsTitle: {
      fontSize: 13.5, fontFamily: "Inter_700Bold",
      color: colors.foreground, marginBottom: 4, letterSpacing: -0.2,
    },
    rightsText: {
      fontSize: 12, fontFamily: "Inter_400Regular",
      color: colors.mutedForeground, lineHeight: 18,
    },

    contactCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      padding: 14, borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
      marginTop: 6,
    },
    contactIcon: {
      width: 38, height: 38, borderRadius: 11,
      backgroundColor: colors.primary + "1A",
      alignItems: "center", justifyContent: "center",
    },
    contactLabel: {
      fontSize: 11.5, fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground, letterSpacing: 0.4, textTransform: "uppercase",
    },
    contactValue: {
      fontSize: 14, fontFamily: "Inter_700Bold",
      color: colors.primary, marginTop: 2, letterSpacing: -0.2,
    },

    footer: {
      marginTop: 8, paddingTop: 16,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    },
    footerText: {
      fontSize: 11.5, fontFamily: "Inter_500Medium",
      color: colors.mutedForeground, lineHeight: 17, textAlign: "center",
    },
  });

  const Bullet = ({ children }: { children: string }) => (
    <View style={styles.bullet}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );

  const onMail = () => {
    Haptics.selectionAsync().catch(() => {});
    Linking.openURL("mailto:kvkk@carsipiyasa.com").catch(() => {});
  };

  return (
    <View style={styles.container}>
      <ScreenHeader eyebrow="Gizlilik" title="KVKK Aydınlatma Metni" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Icon name="alert-circle" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Kişisel verileriniz hakkında</Text>
            <Text style={styles.bannerText}>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, Çarşı Piyasa uygulamasının
              kişisel verileri nasıl topladığını, işlediğini ve koruduğunu bu metinde bulabilirsiniz.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>1. Topladığımız Veriler</Text>
          <Bullet>
            Cihaz bildirim token'ı (push bildirimleri için, hesap kimliğinize bağlı değildir).
          </Bullet>
          <Bullet>
            Cihazınızda yerel olarak saklanan tercih verileri: favori varlıklar, portföy kayıtları, alarm tanımları,
            tema seçimi, widget ayarları (cihazda kalır, bizim sunucuya gönderilmez).
          </Bullet>
          <Bullet>
            Anonim kullanım verileri (hangi ekranların açıldığı, çökme raporları) — şahsi olarak sizi tanımlamaz.
          </Bullet>
          <Bullet>
            Hesap oluşturulduğunda (opsiyonel bulut yedekleme aktifse) e-posta adresiniz ve oturum bilgileriniz.
          </Bullet>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>2. Veri İşleme Amaçları</Text>
          <Bullet>Fiyat alarmları ve haber bildirimlerinin gönderilmesi.</Bullet>
          <Bullet>Uygulamanın stabil ve hızlı çalışmasının sağlanması (hata izleme).</Bullet>
          <Bullet>Kullanıcı tercihlerinin (tema, favoriler, portföy) kaydedilmesi.</Bullet>
          <Bullet>Yasal yükümlülüklerin yerine getirilmesi.</Bullet>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>3. Veri Saklama</Text>
          <Text style={styles.p}>
            Favori, portföy, alarm ve tema gibi tüm tercih verileriniz cihazınızda yerel olarak (AsyncStorage)
            saklanır. Bu veriler bizim sunucularımıza gönderilmez. Yalnızca bulut yedekleme özelliğini açtığınızda
            ilgili veriler güvenli olarak Firebase üzerinde depolanır ve hesabınızla ilişkilendirilir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>4. Veri Paylaşımı</Text>
          <Text style={styles.p}>
            Kişisel verileriniz hiçbir koşulda üçüncü taraflara satılmaz veya pazarlama amaçlı paylaşılmaz.
            Veriler yalnızca; (i) yasal bir zorunluluk halinde yetkili kamu kurumlarıyla, (ii) uygulamanın
            çalışması için zorunlu altyapı sağlayıcılarımızla (push bildirim servisi, bulut depolama)
            sınırlı şekilde paylaşılır.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>5. KVKK Madde 11 — Haklarınız</Text>
          <View style={styles.rightsCard}>
            <Text style={styles.rightsTitle}>Bilgi alma hakkı</Text>
            <Text style={styles.rightsText}>Verilerinizin işlenip işlenmediğini öğrenebilirsiniz.</Text>
          </View>
          <View style={styles.rightsCard}>
            <Text style={styles.rightsTitle}>Düzeltme & silme</Text>
            <Text style={styles.rightsText}>Verilerinizin düzeltilmesini veya silinmesini talep edebilirsiniz.</Text>
          </View>
          <View style={styles.rightsCard}>
            <Text style={styles.rightsTitle}>İşlemeye itiraz</Text>
            <Text style={styles.rightsText}>Verilerinizin işlenmesine itiraz hakkına sahipsiniz.</Text>
          </View>
          <View style={styles.rightsCard}>
            <Text style={styles.rightsTitle}>Tazminat hakkı</Text>
            <Text style={styles.rightsText}>Hukuka aykırı işleme nedeniyle uğradığınız zararın tazminini talep edebilirsiniz.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>6. Veri Güvenliği</Text>
          <Text style={styles.p}>
            Verilerinizin yetkisiz erişime karşı korunması için güncel teknik ve idari tedbirler alınmaktadır.
            Sunucu iletişimi HTTPS üzerinden şifrelenmiş olarak gerçekleştirilir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>7. İletişim</Text>
          <Text style={styles.p}>
            KVKK kapsamındaki taleplerinizi aşağıdaki e-posta adresine iletebilirsiniz. Talebiniz en geç 30
            gün içinde sonuçlandırılır.
          </Text>
          <Pressable onPress={onMail} style={styles.contactCard}>
            <View style={styles.contactIcon}>
              <Icon name="mail-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>KVKK Başvuru</Text>
              <Text style={styles.contactValue}>kvkk@carsipiyasa.com</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bu metin 6698 sayılı KVKK Kanunu uyarınca aydınlatma yükümlülüğümüz kapsamında hazırlanmıştır.{"\n"}
            Son güncelleme: Nisan 2026
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
