import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { useAuth } from '@/src/auth/AuthProvider';
import { AppScreen, Body, PrimaryButton, Title } from '@/src/components/ui';
import { colors, radii, spacing } from '@/src/theme';

export default function OtpScreen() {
  const { phone = '' } = useLocalSearchParams<{ phone?: string }>();
  const { finishLogin } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const verify = async () => {
    setBusy(true);
    try {
      const response = await api.auth.verifyOtp({ phone, otp: code });
      await finishLogin(response.token, response.user);
      router.replace(response.is_new_user ? '/profile-setup' : '/(tabs)');
    } catch (error) {
      Alert.alert('Kod təsdiqlənmədi', error instanceof Error ? error.message : 'Kodu yoxlayın.');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await api.auth.sendOtp(phone);
      Alert.alert('Kod göndərildi', 'Yeni OTP kodu SMS-lə göndərildi.');
    } catch (error) {
      Alert.alert('Göndərilmədi', error instanceof Error ? error.message : 'Yenidən yoxlayın.');
    }
  };

  return (
    <AppScreen scroll={false} contentStyle={styles.page}>
      <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={colors.text} /></Pressable>
      <View style={styles.main}>
        <View style={styles.iconWrap}><Ionicons name="chatbubble-ellipses" size={28} color={colors.accent} /></View>
        <Title>Təsdiq kodu</Title>
        <Body>{phone} nömrəsinə göndərilən 6 rəqəmli kodu daxil et.</Body>
        <TextInput value={code} onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} placeholder="• • • • • •" placeholderTextColor={colors.muted} style={styles.codeInput} textContentType="oneTimeCode" autoFocus />
        <Pressable onPress={resend}><Text style={styles.resend}>Kodu yenidən göndər</Text></Pressable>
      </View>
      <PrimaryButton label={busy ? 'Yoxlanılır...' : 'Təsdiqlə'} disabled={code.length !== 6 || busy} onPress={verify} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  back: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, justifyContent: 'center', gap: spacing.md },
  iconWrap: { width: 58, height: 58, borderRadius: 18, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  codeInput: { height: 70, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: 9, textAlign: 'center', marginTop: spacing.lg },
  resend: { color: colors.accent, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
