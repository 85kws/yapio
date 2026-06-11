// Bildirim altyapısı: izin + Expo push token kaydı + yerel hatırlatıcılar.
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { registerPush } from '../api/client';

const PROJECT_ID = 'e78c3947-ad42-4b2a-8ef9-6df5663f7acc';

export function initNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

export async function registerForPush() {
  if (!Device.isDevice) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('yapio', {
      name: 'Yapio', importance: Notifications.AndroidImportance.MAX, vibrationPattern: [0, 250, 250, 250], lightColor: '#5B4BE7',
    });
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') { const { status } = await Notifications.requestPermissionsAsync(); final = status; }
  if (final !== 'granted') return;
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
    await registerPush(token);
  } catch (_) {}
}

// Su hatırlatıcı (10:00-20:00 arası 2 saatte bir)
export async function scheduleWaterReminders() {
  await cancelByType('water');
  for (const hour of [10, 12, 14, 16, 18, 20]) {
    await Notifications.scheduleNotificationAsync({
      content: { title: '💧 Su molası', body: 'Bir bardak su iç, hedefine yaklaş.', data: { type: 'water' }, sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0, channelId: 'yapio' },
    });
  }
}

// Tek randevu için yerel hatırlatıcı (randevu alınınca çağrılır)
export async function scheduleApptReminder(dateStr, timeStr, name) {
  const ds = String(dateStr).split('T')[0];
  const ts = (timeStr || '10:00').slice(0, 5);
  const [y, mo, d] = ds.split('-').map(Number);
  const [h, mi] = ts.split(':').map(Number);
  const apptMs = new Date(y, mo - 1, d, h, mi).getTime();
  const now = Date.now();
  for (const { ms, label } of [{ ms: 86400000, label: '1 gün' }, { ms: 2 * 3600000, label: '2 saat' }]) {
    const fireAt = apptMs - ms;
    if (fireAt <= now) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Yaklaşan Randevu', body: `${name} randevun ${label} sonra (${ts}).`, data: { type: 'appt' }, sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(fireAt), channelId: 'yapio' },
    });
  }
}

async function cancelByType(type) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) if (n.content.data?.type === type) await Notifications.cancelScheduledNotificationAsync(n.identifier);
}
export const cancelWaterReminders = () => cancelByType('water');
