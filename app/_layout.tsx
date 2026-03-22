import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="manga/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ presentation: 'modal', title: 'Login / Register' }} />
      </Stack>
    </AuthProvider>
  );
}
