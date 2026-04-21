import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Icon } from "@/components/Icon";
import { useColors } from "@/hooks/useColors";

export default function DisclaimerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === "android";
  const bottomPadding =
    Platform.OS === "web" ? 40 : (isAndroid ? Math.max(insets.bottom, 16) : insets.bottom) + 24;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: bottomPadding },
    banner: {
      flexDirection: "row",
      gap: 12,
      padding: 16,
      borderRadius: 14,
      backgroundColor: "#F59E0B14",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "#F59E0B55",
      marginBottom: 18,
    },
    bannerIcon: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: "#F59E0B22", alignItems: "center", justifyContent: "center",
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
    bullet: {
      flexDirection: "row", gap: 10, marginBottom: 6,
    },
    bulletDot: {
      width: 5, height: 5, borderRadius: 3,
      backgroundColor: colors.primary, marginTop: 8,
    },
    bulletText: {
      flex: 1, fontSize: 13, fontFamily: "Inter_400Regular",
      color: colors.foreground, lineHeight: 20, opacity: 0.9,
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

  return (
    <View style={styles.container}>
      <ScreenHeader eyebrow="Yasal" title="Yasal Uyarı" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Icon name="alert-circle" size={20} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Yatırım tavsiyesi değildir</Text>
            <Text style={styles.bannerText}>
              Çarşı Piyasa uygulamasında yer alan tüm fiyatlar, grafikler ve içerikler yalnızca bilgilendirme amaçlıdır.
              Hiçbir surette alım–satım önerisi, yatırım danışmanlığı veya finansal tavsiye niteliği taşımaz.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>1. Veri Kaynağı ve Doğruluk</Text>
          <Text style={styles.p}>
            Uygulamada gösterilen döviz, altın, gümüş, platin, paladyum ve parite verileri üçüncü taraf veri sağlayıcılarından
            (HaremAltın & ilgili API'lar) alınmaktadır. Veriler "olduğu gibi" sunulur; gecikme, hata veya kesinti yaşanabilir.
          </Text>
          <Bullet>Fiyatlar resmi bir kotasyon değildir; bilgilendirme niteliğindedir.</Bullet>
          <Bullet>Anlık piyasa hareketleri nedeniyle ekrandaki ve gerçek piyasa fiyatları arasında fark olabilir.</Bullet>
          <Bullet>Uygulamadaki veriler banka, sarraf veya kuyumcuların gerçek alım–satım fiyatlarını bağlamaz.</Bullet>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>2. Sorumluluk Reddi</Text>
          <Text style={styles.p}>
            Uygulama geliştiricisi; bu uygulamada sunulan bilgilerin doğruluğu, güncelliği veya kesintisizliği
            konusunda hiçbir garanti vermez. Bu bilgilere dayanılarak alınan kararlar ve doğabilecek doğrudan
            veya dolaylı zararlardan kullanıcı kendisi sorumludur.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>3. SPK & 6362 Sayılı Kanun Uyarısı</Text>
          <Text style={styles.p}>
            6362 sayılı Sermaye Piyasası Kanunu uyarınca yatırım danışmanlığı; aracı kurumlar, portföy yönetim
            şirketleri ve yatırım danışmanlığı yetki belgesine sahip kuruluşlarca verilebilir. Uygulamada yer alan
            içerikler bu kapsamda yatırım danışmanlığı sayılmaz; kişisel görüş ve tercihlerinize uygun olmayabilir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>4. Portföy & Alarm Özellikleri</Text>
          <Text style={styles.p}>
            Uygulama içindeki portföy takibi, ortalama maliyet hesabı ve fiyat alarmları yalnızca kullanıcının
            kendi takibini kolaylaştırmak amacıyla sunulan araçlardır. Bu hesaplamalar resmi kayıt veya
            muhasebe belgesi yerine geçmez.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>5. Marka & Telif</Text>
          <Text style={styles.p}>
            Uygulamada kullanılan tüm marka adları, logolar ve haber içerikleri ilgili sahiplerinin mülkiyetindedir.
            Haber özetleri ilgili haber kaynağından (Bloomberg HT, AA, TRT, Dünya, CNN Türk, BBC Türkçe) RSS yoluyla
            alınmakta olup tıklama ile orijinal kaynağa yönlendirilir.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bu uygulamayı kullanarak yukarıdaki şartları kabul etmiş sayılırsınız.{"\n"}
            Son güncelleme: Nisan 2026
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
