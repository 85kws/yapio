// Dokunsal geri bildirim sarmalayıcı (expo-haptics). Hata yutulur (web/izin yok).
import * as Haptics from 'expo-haptics';

export const tap = () => { try { Haptics.selectionAsync(); } catch {} };
export const light = () => { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {} };
export const success = () => { try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {} };
export const warn = () => { try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {} };
export const error = () => { try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {} };
