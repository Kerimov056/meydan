import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '@/src/auth/AuthProvider';
import { colors } from '@/src/theme';

const icons: Record<string, { active: React.ComponentProps<typeof Ionicons>['name']; inactive: React.ComponentProps<typeof Ionicons>['name'] }> = {
  index: { active: 'home', inactive: 'home-outline' },
  explore: { active: 'compass', inactive: 'compass-outline' },
  matches: { active: 'football', inactive: 'football-outline' },
  rankings: { active: 'podium', inactive: 'podium-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export default function TabLayout() {
  const { authenticated, loading } = useAuth();

  if (loading) return null;
  if (!authenticated) return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          position: 'absolute',
          height: 76,
          paddingTop: 9,
          paddingBottom: 10,
          backgroundColor: '#091712F5',
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '800' },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons name={focused ? icons[route.name].active : icons[route.name].inactive} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Ana səhifə' }} />
      <Tabs.Screen name="explore" options={{ title: 'Kəşf et' }} />
      <Tabs.Screen name="matches" options={{ title: 'Oyunlar' }} />
      <Tabs.Screen name="rankings" options={{ title: 'Reytinq' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
