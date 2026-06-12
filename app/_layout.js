import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { LanguageProvider } from '../src/i18n';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7F7FB' } }} />
        </SafeAreaProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
