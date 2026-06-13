// Ortak UI parçaları: yükleniyor, boş-durum, skeleton, pull-to-refresh kancası.
// "Gerçek app" hissi için tutarlı yükleme/boş ekranları.
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

// Basit yükleniyor (ortalı spinner)
export function Loading({ color = COLORS.primary, style }) {
  return <View style={[u.loading, style]}><ActivityIndicator color={color} /></View>;
}

// Boş durum: yumuşak ikon dairesi + mesaj (+ alt açıklama)
export function EmptyState({ icon = 'cube-outline', text, sub, theme = COLORS.primary }) {
  return (
    <View style={u.empty}>
      <View style={[u.emptyIcon, { backgroundColor: theme + '14' }]}>
        <Ionicons name={icon} size={28} color={theme} />
      </View>
      {text ? <Text style={u.emptyText}>{text}</Text> : null}
      {sub ? <Text style={u.emptySub}>{sub}</Text> : null}
    </View>
  );
}

// Nabız gibi yanıp sönen yer-tutucu satırlar (içerik yüklenirken)
export function SkeletonList({ rows = 4, theme = COLORS.primary }) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.4, duration: 650, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <View style={u.skWrap}>
      {Array.from({ length: rows }, (_, i) => (
        <Animated.View key={i} style={[u.skRow, { opacity: pulse }]}>
          <View style={u.skDot} />
          <View style={{ flex: 1 }}>
            <View style={[u.skBar, { width: '60%' }]} />
            <View style={[u.skBar, { width: '35%', marginTop: 8, height: 10 }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

// Pull-to-refresh kancası: load() async döndüren fonksiyon.
export function useRefresh(loadFn) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadFn(); } catch {} finally { setRefreshing(false); }
  }, [loadFn]);
  return { refreshing, onRefresh };
}

const u = StyleSheet.create({
  loading: { marginTop: 40, alignItems: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, paddingHorizontal: 24 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyText: { fontSize: 15, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  emptySub: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  skWrap: { paddingTop: 8 },
  skRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  skDot: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#E8E8F0' },
  skBar: { height: 13, borderRadius: 6, backgroundColor: '#E8E8F0' },
});
