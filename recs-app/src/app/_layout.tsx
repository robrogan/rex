import { useFonts, CrimsonPro_300Light } from '@expo-google-fonts/crimson-pro';
import { GoudyBookletter1911_400Regular } from '@expo-google-fonts/goudy-bookletter-1911';
import { Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { PixelifySans_400Regular } from '@expo-google-fonts/pixelify-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '../lib/auth';
import { queryClient } from '../lib/queryClient';
import { colors, fonts } from '../lib/theme';

/**
 * Redirects based on auth state — but ONLY once Supabase is configured, so the
 * placeholder screens stay freely navigable during early/parallel dev (A3).
 */
function AuthGate() {
  const { session, loading, configured } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!configured || loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inDevGroup = segments[0] === 'dev'; // hidden gallery — reachable without auth
    const inItemRoute = segments[0] === 'item'; // public share page (A9) — viewable signed-out
    if (!session && !inAuthGroup && !inDevGroup && !inItemRoute) router.replace('/sign-in');
    else if (session && inAuthGroup) router.replace('/tbr');
  }, [configured, loading, session, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.font,
        headerTitleStyle: { fontFamily: fonts.action },
        contentStyle: { backgroundColor: colors.bg },
      }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="share" options={{ presentation: 'modal', title: 'Share' }} />
      <Stack.Screen name="status" options={{ presentation: 'modal', title: 'Update status' }} />
      <Stack.Screen name="dev/components" options={{ title: 'Components' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    CrimsonPro_300Light,
    Manrope_500Medium,
    Manrope_700Bold,
    PixelifySans_400Regular,
    GoudyBookletter1911_400Regular,
  });
  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <AuthGate />
      </AuthProvider>
    </QueryClientProvider>
  );
}
