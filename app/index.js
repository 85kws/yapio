// Giriş kapısı: token yoksa login'e, varsa sekmelere yönlendir.
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { COLORS } from '../src/theme';

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: COLORS.bg }}><ActivityIndicator color={COLORS.primary} /></View>;
  }
  return <Redirect href={user ? '/(tabs)/storefront' : '/login'} />;
}
