import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoMark, PrimaryButton } from '@/src/components/ui';
import { useAuth } from '@/src/auth/AuthProvider';
import { colors, radii, spacing } from '@/src/theme';

export default function WelcomeScreen() {
  const { authenticated, loading } = useAuth();
  const [language, setLanguage] = useState<'AZ' | 'EN'>('AZ');

  useEffect(() => {
    if (!loading && authenticated) router.replace('/(tabs)');
  }, [authenticated, loading]);

  return (
    <LinearGradient colors={[colors.background, '#0C2118', colors.background]} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <LogoMark size={38} />
            <Text style={styles.brandName}>MEYDAN</Text>
          </View>
          <View style={styles.languageSwitch}>
            {(['AZ', 'EN'] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => setLanguage(item)}
                style={[styles.languageItem, language === item && styles.languageItemActive]}
              >
                <Text style={[styles.languageText, language === item && styles.languageTextActive]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.heroVisual}>
          <View style={styles.glow} />
          <View style={styles.pitch}>
            <View style={styles.halfLine} />
            <View style={styles.centerCircle} />
            <View style={[styles.box, styles.boxTop]} />
            <View style={[styles.box, styles.boxBottom]} />
            <View style={styles.rankCard}>
              <Text style={styles.rankTiny}>BAKU RANKING</Text>
              <View style={styles.rankRow}>
                <Text style={styles.rankNumber}>#1</Text>
                <View>
                  <Text style={styles.rankTeam}>Baku Lions</Text>
                  <Text style={styles.rankRating}>1,284 rating</Text>
                </View>
              </View>
            </View>
            <View style={styles.verifiedChip}>
              <Ionicons name="checkmark-circle" size={15} color={colors.accent} />
              <Text style={styles.verifiedText}>Verified match</Text>
            </View>
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>BAKININ FUTBOL MEYDANI</Text>
          <Text style={styles.title}>Komandanı qur. Rəqibini tap. Zirvəyə çıx.</Text>
          <Text style={styles.subtitle}>
            5v5 və 6v6 oyunlarını təşkil et, nəticəni təsdiqlə və Bakı reytinqində yüksəl.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Başla" onPress={() => router.push('/phone')} />
          <Pressable onPress={() => router.push('/email')} style={styles.demoButton}>
            <Text style={styles.demoText}>Email və şifrə ilə daxil ol</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, maxWidth: 760, width: '100%', alignSelf: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { color: colors.text, fontSize: 16, fontWeight: '900', letterSpacing: 2.2 },
  languageSwitch: { flexDirection: 'row', padding: 3, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  languageItem: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9 },
  languageItemActive: { backgroundColor: colors.surfaceLight },
  languageText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  languageTextActive: { color: colors.text },
  heroVisual: { flex: 1, minHeight: 270, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#2CF66B12' },
  pitch: { width: 230, height: 290, borderRadius: 30, backgroundColor: '#113D27', borderWidth: 1.5, borderColor: '#76F78B66', transform: [{ rotate: '-8deg' }], overflow: 'hidden' },
  halfLine: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: '#76F78B55' },
  centerCircle: { position: 'absolute', width: 76, height: 76, borderRadius: 38, borderWidth: 1, borderColor: '#76F78B55', left: 76, top: 107 },
  box: { position: 'absolute', width: 104, height: 58, borderWidth: 1, borderColor: '#76F78B55', left: 62 },
  boxTop: { top: -1, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  boxBottom: { bottom: -1, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  rankCard: { position: 'absolute', left: 17, right: 17, top: 75, padding: 14, borderRadius: 18, backgroundColor: '#06100DE8', borderWidth: 1, borderColor: colors.border, transform: [{ rotate: '8deg' }] },
  rankTiny: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  rankNumber: { color: colors.accent, fontSize: 27, fontWeight: '900' },
  rankTeam: { color: colors.text, fontSize: 13, fontWeight: '800' },
  rankRating: { color: colors.muted, fontSize: 9, marginTop: 2 },
  verifiedChip: { position: 'absolute', bottom: 57, right: 11, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 7, transform: [{ rotate: '8deg' }] },
  verifiedText: { color: colors.textSoft, fontSize: 9, fontWeight: '800' },
  copy: { marginBottom: spacing.lg },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  title: { color: colors.text, fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1.5 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 12, maxWidth: 480 },
  actions: { gap: 13 },
  demoButton: { alignItems: 'center', paddingVertical: 7 },
  demoText: { color: colors.textSoft, fontSize: 13, fontWeight: '700' },
});
