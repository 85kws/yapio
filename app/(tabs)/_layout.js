import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/theme';
import { initNotifications, registerForPush } from '../../src/notifications/setup';

const tabIcon = (name) => ({ color, size }) => <Ionicons name={name} size={size ?? 24} color={color} />;

export default function TabsLayout() {
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
      <Tabs.Screen name="storefront" options={{ title: 'Vitrin', tabBarIcon: tabIcon('storefront-outline') }} />
      <Tabs.Screen name="my-apps" options={{ title: "App'lerim", tabBarIcon: tabIcon('apps-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: tabIcon('person-outline') }} />
    </Tabs>
  );
}
