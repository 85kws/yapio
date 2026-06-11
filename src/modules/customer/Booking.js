// Müşteri randevu akışı: hizmet seç → TAKVİM (uçak-bileti tarzı: dolu gün soluk, boş gün açık)
// → uygun saat → onayla. + Randevularım.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, getEntries, createEntry, updateEntry, bookingSlots } from '../../api/client';
import { COLORS } from '../../theme';

const WD = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']; // pazartesi-başı
const DAYS_N = 28; // 4 hafta ileri
const fmtDate = (d) => d.toISOString().slice(0, 10);
const mondayIdx = (d) => (d.getDay() + 6) % 7; // Pzt=0 ... Paz=6

export default function Booking({ businessId, theme }) {
  const [services, setServices] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [date, setDate] = useState(fmtDate(new Date()));
  const [avail, setAvail] = useState({});        // { 'YYYY-MM-DD': string[] }  gün-başına boş saatler
  const [availLoading, setAvailLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  // bugünden başlayan 28 gün (sabit kimlik)
  const dates = useMemo(() => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Array.from({ length: DAYS_N }, (_, i) => { const d = new Date(t); d.setDate(d.getDate() + i); return d; });
  }, []);

  const load = useCallback(async () => {
    try {
      const [its, ent] = await Promise.all([getItems(businessId, 'booking'), getEntries(businessId, 'booking')]);
      setServices(its);
      setMine((ent.entries || []).filter((e) => e.status !== 'cancelled'));
    } catch (e) { console.warn(e?.message); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  // hizmet seçilince tüm günlerin müsaitliğini paralel çek
  const loadAvail = useCallback(async () => {
    if (!service) { setAvail({}); return; }
    setAvailLoading(true);
    try {
      const dur = service.data.duration_min || 30;
      const results = await Promise.all(dates.map(async (d) => {
        const ds = fmtDate(d);
        try { const r = await bookingSlots(businessId, ds, dur); return [ds, r.slots || []]; }
        catch { return [ds, []]; }
      }));
      const map = Object.fromEntries(results);
      setAvail(map);
      // ilk boş günü otomatik seç
      const firstFree = dates.map(fmtDate).find((ds) => map[ds]?.length > 0);
      setDate(firstFree || fmtDate(dates[0]));
    } finally { setAvailLoading(false); }
  }, [businessId, service, dates]);
  useEffect(() => { loadAvail(); }, [loadAvail]);

  const book = async (time) => {
    setBooking(true);
    try {
      await createEntry(businessId, 'booking', {
        service_id: service.id, service_name: service.data.name, price: service.data.price,
        duration_min: service.data.duration_min || 30, date, time,
      });
      Alert.alert('Randevu alındı', `${service.data.name} · ${date} ${time}`);
      setService(null); await load();
    } catch (e) { Alert.alert('Hata', e?.response?.data?.error || 'Randevu alınamadı'); }
    finally { setBooking(false); }
  };

  const cancel = (id) => Alert.alert('İptal', 'Randevu iptal edilsin mi?', [
    { text: 'Vazgeç', style: 'cancel' },
    { text: 'İptal Et', style: 'destructive', onPress: async () => { await updateEntry(businessId, 'booking', id, { status: 'cancelled' }); load(); } },
  ]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;

  // takvim hücreleri: ilk haftaya boşluk doldur (pazartesi hizalama)
  const lead = mondayIdx(dates[0]);
  const cells = [...Array(lead).fill(null), ...dates];
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const monthLabel = dates[0].toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const daySlots = avail[date] || [];

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      {/* Randevularım */}
      {mine.length > 0 && (
        <View style={s.block}>
          <Text style={s.h}>Randevularım</Text>
          {mine.map((e) => (
            <View key={e.id} style={s.appt}>
              <View style={[s.apptBar, { backgroundColor: theme }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.apptName}>{e.data.service_name}</Text>
                <Text style={s.apptMeta}>{e.data.date} · {e.data.time}{e.status === 'confirmed' ? ' · onaylandı' : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => cancel(e.id)}><Ionicons name="close-circle" size={24} color={COLORS.muted} /></TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Hizmet seç */}
      <Text style={s.h}>Hizmet seç</Text>
      {services.length === 0 && <Text style={s.empty}>Henüz hizmet eklenmemiş.</Text>}
      {services.map((sv) => (
        <TouchableOpacity key={sv.id} style={[s.svc, service?.id === sv.id && { borderColor: theme, borderWidth: 2 }]} onPress={() => setService(sv)}>
          <View style={{ flex: 1 }}>
            <Text style={s.svcName}>{sv.data.name}</Text>
            <Text style={s.svcMeta}>{sv.data.duration_min || 30} dk{sv.data.price ? ` · ${sv.data.price} ₺` : ''}</Text>
          </View>
          {service?.id === sv.id ? <Ionicons name="checkmark-circle" size={22} color={theme} /> : <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />}
        </TouchableOpacity>
      ))}

      {/* TAKVİM + saat */}
      {service && (
        <>
          <View style={s.calHead}>
            <Text style={s.h}>Tarih seç</Text>
            {availLoading ? <ActivityIndicator color={theme} size="small" /> : null}
          </View>
          <Text style={s.month}>{monthLabel}</Text>

          <View style={s.wdRow}>
            {WD.map((w) => <Text key={w} style={s.wd}>{w}</Text>)}
          </View>

          {weeks.map((week, wi) => (
            <View key={wi} style={s.weekRow}>
              {week.map((d, di) => {
                if (!d) return <View key={di} style={s.cell} />;
                const ds = fmtDate(d);
                const free = (avail[ds]?.length || 0) > 0;
                const active = ds === date;
                return (
                  <TouchableOpacity
                    key={di}
                    style={s.cell}
                    disabled={!free || availLoading}
                    activeOpacity={0.7}
                    onPress={() => setDate(ds)}
                  >
                    <View style={[s.dayInner, active && { backgroundColor: theme }, !free && s.dayFull]}>
                      <Text style={[s.dayNum, active && { color: '#fff' }, !free && s.dayNumFull]}>{d.getDate()}</Text>
                      {free && !active ? <View style={[s.dot, { backgroundColor: theme }]} /> : <View style={s.dot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          <View style={s.legend}>
            <View style={[s.dot, { backgroundColor: theme }]} /><Text style={s.legendText}>boş</Text>
            <View style={[s.dot, { backgroundColor: COLORS.border, marginLeft: 14 }]} /><Text style={s.legendText}>dolu/kapalı</Text>
          </View>

          <Text style={s.h}>Uygun saat</Text>
          {availLoading ? <ActivityIndicator color={theme} /> : daySlots.length === 0 ? (
            <Text style={s.empty}>Bu güne uygun saat yok.</Text>
          ) : (
            <View style={s.slots}>
              {daySlots.map((t) => (
                <TouchableOpacity key={t} style={[s.slot, { borderColor: theme }]} disabled={booking} onPress={() => book(t)}>
                  <Text style={[s.slotText, { color: theme }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  block: { marginBottom: 20 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 14, marginBottom: 10 },
  empty: { color: COLORS.muted, fontSize: 14 },
  appt: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, overflow: 'hidden' },
  apptBar: { width: 4, height: 36, borderRadius: 2 },
  apptName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  apptMeta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  svc: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  svcName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  svcMeta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  // takvim
  calHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  month: { fontSize: 14, fontWeight: '700', color: COLORS.muted, textTransform: 'capitalize', marginBottom: 8 },
  wdRow: { flexDirection: 'row', marginBottom: 4 },
  wd: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: COLORS.muted },
  weekRow: { flexDirection: 'row' },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 3 },
  dayInner: { width: '100%', flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F4F8' },
  dayFull: { backgroundColor: 'transparent' },
  dayNum: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  dayNumFull: { color: '#C8C8D0', fontWeight: '500' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 3, backgroundColor: 'transparent' },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  legendText: { fontSize: 12, color: COLORS.muted, marginLeft: 5 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  slotText: { fontWeight: '700', fontSize: 15 },
});
