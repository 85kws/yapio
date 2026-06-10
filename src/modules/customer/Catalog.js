// Müşteri menü/katalog görünümü: kategoriye göre gruplu ürün listesi.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { getItems } from '../../api/client';
import { COLORS } from '../../theme';

export default function Catalog({ businessId, theme }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'catalog')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  if (items.length === 0) return <View style={s.empty}><Text style={s.emptyText}>Menü henüz hazırlanıyor.</Text></View>;

  const cats = {};
  items.forEach((it) => { const c = it.data.category || 'Genel'; (cats[c] = cats[c] || []).push(it); });

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      {Object.entries(cats).map(([cat, list]) => (
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
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.muted, fontSize: 15 },
  cat: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  desc: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  price: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginLeft: 10 },
});
