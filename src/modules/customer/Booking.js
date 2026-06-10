// Müşteri randevu akışı: hizmet seç → tarih → uygun saat → onayla. + Randevularım.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, getEntries, createEntry, updateEntry, bookingSlots } from '../../api/client';
import { COLORS } from '../../theme';

const DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const fmtDate = (d) => d.toISOString().slice(0, 10);
const next14 = () => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });

export default function Booking({ businessId, theme }) {
  const [services, setServices] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [date, setDate] = useState(fmtDate(new Date()));
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const load = useCallback(async () => {
    try {
      const [its, ent] = await Promise.all([getItems(businessId, 'booking'), getEntries(businessId, 'booking')]);
      setServices(its);
      setMine((ent.entries || []).filter((e) => e.status !== 'cancelled'));
    } catch (e) { console.warn(e?.message); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const loadSlots = useCallback(async () => {
    if (!service) return;
    setSlotsLoading(true);
    try { setSlots((await bookingSlots(businessId, date, service.data.duration_min || 30)).slots); }
    catch { setSlots([]); } finally { setSlotsLoading(false); }
  }, [businessId, date, service]);
  useEffect(() => { loadSlots(); }, [loadSlots]);

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

      {/* Tarih + saat */}
      {service && (
        <>
          <Text style={s.h}>Tarih</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {next14().map((d) => {
              const ds = fmtDate(d); const active = ds === date;
              return (
                <TouchableOpacity key={ds} style={[s.day, active && { backgroundColor: theme }]} onPress={() => setDate(ds)}>
                  <Text style={[s.dayDow, active && { color: '#fff' }]}>{DAYS[d.getDay()]}</Text>
                  <Text style={[s.dayNum, active && { color: '#fff' }]}>{d.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={s.h}>Uygun saat</Text>
          {slotsLoading ? <ActivityIndicator color={theme} /> : slots.length === 0 ? (
            <Text style={s.empty}>Bu güne uygun saat yok.</Text>
          ) : (
            <View style={s.slots}>
              {slots.map((t) => (
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
  day: { width: 56, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center' },
  dayDow: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  dayNum: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  slotText: { fontWeight: '700', fontSize: 15 },
});
