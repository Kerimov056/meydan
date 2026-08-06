import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/src/auth/AuthProvider';
import { colors } from '@/src/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="team/[id]" />
            <Stack.Screen name="team/[id]/lineup" />
            <Stack.Screen name="team/create" options={{ presentation: 'modal' }} />
            <Stack.Screen name="team/join" options={{ presentation: 'modal' }} />
            <Stack.Screen name="match/[id]" />
            <Stack.Screen name="match/[id]/roster" />
            <Stack.Screen name="stadium/[id]" />
            <Stack.Screen name="profile/edit" />
            <Stack.Screen name="admin/stadiums/new" />
            <Stack.Screen name="admin/stadiums/[id]" />
            <Stack.Screen name="challenge/new" options={{ presentation: 'modal' }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
