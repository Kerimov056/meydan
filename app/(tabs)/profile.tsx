import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { useAuth } from '@/src/auth/AuthProvider';
import { TeamAvatar } from '@/src/components/cards';
import { ErrorView, LoadingView } from '@/src/components/forms';
import { AppScreen, Card, Pill, PrimaryButton, SectionHeader } from '@/src/components/ui';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { colors, radii, spacing } from '@/src/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const state = useAsyncData(() => api.teams.mine(), []);
  if (state.loading) return <AppScreen><LoadingView /></AppScreen>;
  if (state.error) return <AppScreen><ErrorView message={state.error} onRetry={state.reload} /></AppScreen>;
  const initials = user?.name?.split(/\s+/).slice(0, 2).map((item) => item[0]).join('').toUpperCase() ?? 'M';
  return <AppScreen><View style={styles.top}><Text style={styles.pageTitle}>Profil</Text><Pressable onPress={() => router.push('/profile/edit')}><Ionicons name="create-outline" size={22} color={colors.text} /></Pressable></View><View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View><Text style={styles.name}>{user?.name}</Text><Text style={styles.handle}>{user?.username ? `@${user.username}` : user?.phone}</Text><View style={styles.badges}><Pill tone="accent" icon="shield-checkmark">Verified player</Pill>{user?.position ? <Pill>{user.position}</Pill> : null}</View></View>
    <SectionHeader title="Komandalarım" action="Yenilə" onAction={state.reload} />
    {state.data?.map((team) => <Pressable key={team.id} onPress={() => router.push(`/team/${team.id}`)}><Card style={styles.teamCard}><TeamAvatar team={team} /><View style={styles.teamMain}><Text style={styles.teamName}>{team.name}</Text><Text style={styles.role}>{team.formats.join(' & ')} · {team.membersCount} oyunçu</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Card></Pressable>)}
    <View style={styles.actions}><View style={styles.flex}><PrimaryButton label="Komanda yarat" icon="add" onPress={() => router.push('/team/create')} /></View><View style={styles.flex}><PrimaryButton label="Koda qoşul" secondary icon="enter-outline" onPress={() => router.push('/team/join')} /></View></View>
    {user?.role === 'super_admin' ? <View style={styles.admin}><PrimaryButton label="Stadion əlavə et" secondary icon="business-outline" onPress={() => router.push('/admin/stadiums/new')} /></View> : null}
    <Pressable onPress={logout} style={styles.logout}><Ionicons name="log-out-outline" size={18} color={colors.danger} /><Text style={styles.logoutText}>Hesabdan çıx</Text></Pressable>
  </AppScreen>;
}

const styles = StyleSheet.create({ top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, pageTitle: { color: colors.text, fontSize: 28, fontWeight: '900' }, identity: { alignItems: 'center', paddingVertical: spacing.xl }, avatar: { width: 88, height: 88, borderRadius: 30, backgroundColor: colors.accentDark, borderWidth: 1, borderColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.accent, fontSize: 27, fontWeight: '900' }, name: { color: colors.text, fontSize: 21, fontWeight: '900', marginTop: 14 }, handle: { color: colors.muted, fontSize: 12, marginTop: 4 }, badges: { flexDirection: 'row', gap: 7, marginTop: 12 }, teamCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }, teamMain: { flex: 1, marginLeft: 12 }, teamName: { color: colors.text, fontSize: 14, fontWeight: '800' }, role: { color: colors.muted, fontSize: 10, marginTop: 4 }, actions: { flexDirection: 'row', gap: 8, marginTop: spacing.md }, flex: { flex: 1 }, admin: { marginTop: spacing.sm }, logout: { height: 54, borderRadius: radii.md, borderWidth: 1, borderColor: '#4A2323', backgroundColor: '#251313', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.xl }, logoutText: { color: colors.danger, fontSize: 13, fontWeight: '800' } });
