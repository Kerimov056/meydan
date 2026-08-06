import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { useAuth } from '@/src/auth/AuthProvider';
import { FormField } from '@/src/components/forms';
import { AppScreen, IconButton, PrimaryButton, Title } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';

export default function EditProfileScreen() {
  const { user, reloadUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [district, setDistrict] = useState(user?.district ?? '');
  const [position, setPosition] = useState(user?.position ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '');
  const [busy, setBusy] = useState(false);
  const save = async () => { setBusy(true); try { await api.profile.update({ name, username, district, position, bio }); if (avatarUrl && avatarUrl !== user?.avatar_url) await api.auth.updateAvatar(avatarUrl); await reloadUser(); Alert.alert('Saxlanıldı', 'Profil məlumatları yeniləndi.', [{ text: 'OK', onPress: () => router.back() }]); } catch (error) { Alert.alert('Saxlanılmadı', error instanceof Error ? error.message : 'Məlumatları yoxlayın.'); } finally { setBusy(false); } };
  return <AppScreen><View style={styles.header}><IconButton icon="arrow-back" onPress={() => router.back()} /><Text style={styles.headerText}>EDIT PROFILE</Text><View style={{ width: 42 }} /></View><Title>Profili dəyiş</Title><View style={styles.form}><FormField label="Ad və soyad" value={name} onChangeText={setName} /><FormField label="Username" prefix="@" value={username} onChangeText={setUsername} autoCapitalize="none" /><FormField label="Rayon" value={district} onChangeText={setDistrict} /><FormField label="Mövqe" value={position} onChangeText={setPosition} /><FormField label="Avatar URL" value={avatarUrl} onChangeText={setAvatarUrl} autoCapitalize="none" /><FormField label="Bio" value={bio} onChangeText={setBio} multiline /></View><PrimaryButton label={busy ? 'Saxlanılır...' : 'Dəyişiklikləri saxla'} icon="save-outline" disabled={busy || !name} onPress={save} /></AppScreen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }, headerText: { color: colors.accent, fontSize: 10, fontWeight: '900' }, form: { marginTop: spacing.xl } });
