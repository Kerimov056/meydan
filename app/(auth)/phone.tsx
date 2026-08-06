import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { AppScreen, Body, LogoMark, PrimaryButton, Title } from '@/src/components/ui';
import { colors, radii, spacing } from '@/src/theme';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const fullPhone = `+994${phone}`;
    setBusy(true);
    try {
      const response = await api.auth.sendOtp(fullPhone);
      router.push({ pathname: '/otp', params: { phone: fullPhone, expires: String(response?.expires_in ?? 300) } });
    } catch (error) {
      Alert.alert('Kod göndərilmədi', error instanceof Error ? error.message : 'Yenidən yoxlayın.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen scroll={false} contentStyle={styles.page}>
      <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={colors.text} /></Pressable>
      <View style={styles.main}>
        <LogoMark size={48} />
        <Title style={styles.title}>Meydana daxil ol</Title>
        <Body>Telefon nömrən hesabının təhlükəsizliyi və verified oyunlar üçün istifadə olunur.</Body>
        <View style={styles.inputWrap}>
          <View style={styles.prefix}><Text style={styles.flag}>🇦🇿</Text><Text style={styles.prefixText}>+994</Text></View>
          <TextInput value={phone} onChangeText={(text) => setPhone(text.replace(/\D/g, '').slice(0, 9))} keyboardType="phone-pad" placeholder="501234567" placeholderTextColor={colors.muted} style={styles.input} autoFocus />
        </View>
        <Text style={styles.helper}>SMS ilə 6 rəqəmli təsdiq kodu göndəriləcək.</Text>
      </View>
      <PrimaryButton label={busy ? 'Göndərilir...' : 'Kodu göndər'} disabled={phone.length !== 9 || busy} onPress={send} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  back: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, justifyContent: 'center', gap: spacing.md },
  title: { marginTop: spacing.sm },
  inputWrap: { height: 62, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  prefix: { height: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRightWidth: 1, borderRightColor: colors.border },
  flag: { fontSize: 19 },
  prefixText: { color: colors.text, fontSize: 15, fontWeight: '800' },
  input: { flex: 1, color: colors.text, fontSize: 17, fontWeight: '700', paddingHorizontal: 14 },
  helper: { color: colors.muted, fontSize: 11, lineHeight: 16 },
});
