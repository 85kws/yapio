import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/theme';
import { initNotifications, registerForPush } from '../../src/notifications/setup';
import { useLang } from '../../src/i18n';
import { useAuth } from '../../src/context/AuthContext';

const tabIcon = (name) => ({ color, size }) => <Ionicons name={name} size={size ?? 24} color={color} />;

export default function TabsLayout() {
  const { t } = useLang();
  const { user } = useAuth();
  const isMiniAdmin = user?.seller_status === 'approved' || user?.is_dev;
  useEffect(() => { initNotifications(); registerForPush().catch(() => {}); }, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: COLORS.border, height: 84, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="storefront" options={{ title: t('tab_storefront'), tabBarIcon: tabIcon('storefront-outline') }} />
      <Tabs.Screen name="my-apps" options={{ title: t('tab_myapps'), tabBarIcon: tabIcon('apps-outline') }} />
      <Tabs.Screen name="business" options={{ title: t('tab_business'), tabBarIcon: tabIcon('briefcase-outline'), href: isMiniAdmin ? undefined : null }} />
      <Tabs.Screen name="profile" options={{ title: t('tab_profile'), tabBarIcon: tabIcon('person-outline') }} />
    </Tabs>
  );
}
