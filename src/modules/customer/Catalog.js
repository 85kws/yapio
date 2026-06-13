// Müşteri menü/katalog görünümü: kategoriye göre gruplu ürün listesi.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { getItems } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { SkeletonList, EmptyState, useRefresh } from '../../components/ui';

export default function Catalog({ businessId, theme }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'catalog')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);
  const { refreshing, onRefresh } = useRefresh(load);

  const cats = {};
  items.forEach((it) => { const c = it.data.category || t('general'); (cats[c] = cats[c] || []).push(it); });

  return (
    <ScrollView
      contentContainerStyle={s.wrap}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme} colors={[theme]} />}
    >
      {loading ? (
        <SkeletonList theme={theme} />
      ) : items.length === 0 ? (
        <EmptyState icon="restaurant-outline" text={t('menu_preparing')} theme={theme} />
      ) : (
        Object.entries(cats).map(([cat, list]) => (
          <View key={cat} style={{ marginBottom: 18 }}>
            <Text style={[s.cat, { color: theme }]}>{cat}</Text>
            {list.map((it) => (
              <View key={it.id} style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{it.data.name}</Text>
                  {it.data.desc ? <Text style={s.desc}>{it.data.desc}</Text> : null}
                </View>
                {it.data.price ? <Text style={s.price}>{it.data.price} ₺</Text> : null}
              </View>
            ))}
          </View>
        ))
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18, flexGrow: 1 },
  cat: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  desc: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  price: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginLeft: 10 },
});
