import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { mapUser } from '@/src/api/mappers';
import { useAuth } from '@/src/auth/AuthProvider';
import { FormField } from '@/src/components/forms';
import { AppScreen, IconButton, PrimaryButton, SegmentedControl, Title } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';

export default function EmailAuthScreen() {
  const { finishLogin } = useAuth();
  const [mode, setMode] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const response = mode === 'Login'
        ? await api.auth.login({ email, password })
        : await api.auth.register({ name, email, password, password_confirmation: password });
      const token = response?.token ?? response?.access_token ?? response?.data?.token;
      const user = mapUser(response?.user ?? response?.data?.user);
      if (!token) throw new Error('Backend token qaytarmadı.');
      await finishLogin(token, user);
      router.replace(mode === 'Login' ? '/(tabs)' : '/profile-setup');
    } catch (error) {
      Alert.alert('Giriş alınmadı', error instanceof Error ? error.message : 'Məlumatları yoxlayın.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen>
      <View style={styles.header}><IconButton icon="arrow-back" onPress={() => router.back()} /><Text style={styles.headerText}>ACCOUNT</Text><View style={{ width: 42 }} /></View>
      <Title>Email ilə daxil ol</Title>
      <View style={styles.segment}><SegmentedControl options={['Login', 'Register']} value={mode} onChange={setMode} /></View>
      {mode === 'Register' ? <FormField label="Ad və soyad" value={name} onChangeText={setName} /> : null}
      <FormField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <FormField label="Şifrə" value={password} onChangeText={setPassword} secureTextEntry />
      <PrimaryButton label={busy ? 'Gözləyin...' : mode === 'Login' ? 'Daxil ol' : 'Hesab yarat'} disabled={!email || !password || (mode === 'Register' && !name) || busy} onPress={submit} />
      <Pressable onPress={() => router.replace('/phone')}><Text style={styles.phone}>Telefon OTP ilə davam et</Text></Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  headerText: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  segment: { marginVertical: spacing.xl },
  phone: { color: colors.accent, fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: spacing.lg },
});
