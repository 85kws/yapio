// Müşteri randevu akışı: hizmet seç → TAKVİM (uçak-bileti tarzı: dolu gün soluk, boş gün açık)
// → uygun saat → onayla. + Randevularım.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, getEntries, createEntry, updateEntry, bookingSlots } from '../../api/client';
import { scheduleApptReminder } from '../../notifications/setup';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { useRefresh } from '../../components/ui';
import { success, warn } from '../../haptics';

const WD_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const WD_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_N = 28; // 4 hafta ileri
// YEREL tarih damgası — toISOString() UTC'ye kaydırıp Türkiye'de (UTC+3) günü bir
// geri alıyordu (randevu yanlış güne düşüyordu). Yerel y/a/g ile üret.
const pad2 = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const mondayIdx = (d) => (d.getDay() + 6) % 7; // Pzt=0 ... Paz=6

export default function Booking({ businessId, theme }) {
  const { t, lang } = useLang();
  const WD = lang === 'en' ? WD_EN : WD_TR;
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
  const { refreshing, onRefresh } = useRefresh(load);

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
      scheduleApptReminder(date, time, service.data.name).catch(() => {});
      success();
      Alert.alert(t('booked'), `${service.data.name} · ${date} ${time}`);
      setService(null); await load();
    } catch (e) {
      warn();
      Alert.alert(t('error'), e?.response?.data?.error || t('booking_failed'));
      loadAvail(); // saat az önce dolduysa müsaitliği tazele
    }
    finally { setBooking(false); }
  };

  const cancel = (id) => Alert.alert(t('cancel_short'), t('cancel_appt_q'), [
    { text: t('cancel'), style: 'cancel' },
    { text: t('cancel_yes'), style: 'destructive', onPress: async () => { await updateEntry(businessId, 'booking', id, { status: 'cancelled' }); load(); } },
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
    <ScrollView
      contentContainerStyle={s.wrap}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme} colors={[theme]} />}
    >
      {/* Randevularım */}
      {mine.length > 0 && (
        <View style={s.block}>
          <Text style={s.h}>{t('my_appointments')}</Text>
          {mine.map((e) => (
            <View key={e.id} style={s.appt}>
              <View style={[s.apptBar, { backgroundColor: theme }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.apptName}>{e.data.service_name}</Text>
                <Text style={s.apptMeta}>{e.data.date} · {e.data.time}{e.status === 'confirmed' ? ` · ${t('confirmed')}` : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => cancel(e.id)}><Ionicons name="close-circle" size={24} color={COLORS.muted} /></TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Hizmet seç */}
      <Text style={s.h}>{t('select_service')}</Text>
      {services.length === 0 && <Text style={s.empty}>{t('no_service_yet')}</Text>}
      {services.map((sv) => (
        <TouchableOpacity key={sv.id} style={[s.svc, service?.id === sv.id && { borderColor: theme, borderWidth: 2 }]} onPress={() => setService(sv)}>
          <View style={{ flex: 1 }}>
            <Text style={s.svcName}>{sv.data.name}</Text>
            <Text style={s.svcMeta}>{sv.data.duration_min || 30} {t('dk')}{sv.data.price ? ` · ${sv.data.price} ₺` : ''}</Text>
          </View>
          {service?.id === sv.id ? <Ionicons name="checkmark-circle" size={22} color={theme} /> : <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />}
        </TouchableOpacity>
      ))}

      {/* TAKVİM + saat */}
      {service && (
        <>
          <View style={s.calHead}>
            <Text style={s.h}>{t('select_date')}</Text>
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
            <View style={[s.dot, { backgroundColor: theme }]} /><Text style={s.legendText}>{t('free')}</Text>
            <View style={[s.dot, { backgroundColor: COLORS.border, marginLeft: 14 }]} /><Text style={s.legendText}>{t('full_closed')}</Text>
          </View>

          <Text style={s.h}>{t('available_time')}</Text>
          {availLoading ? <ActivityIndicator color={theme} /> : daySlots.length === 0 ? (
            <Text style={s.empty}>{t('no_slot')}</Text>
          ) : (
            <View style={s.slots}>
              {daySlots.map((tm) => (
                <TouchableOpacity key={tm} style={[s.slot, { borderColor: theme }]} disabled={booking} onPress={() => book(tm)}>
                  <Text style={[s.slotText, { color: theme }]}>{tm}</Text>
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
