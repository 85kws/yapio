// Kullanım Sözleşmesi ekranı. TR/EN geçişli, kaydırılabilir.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../src/theme';
import { TERMS, TERMS_VERSION, TERMS_EFFECTIVE } from '../src/legal/terms';

export default function Terms() {
  const router = useRouter();
  const [lang, setLang] = useState('tr');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          <Text style={s.back}>{lang === 'tr' ? 'Geri' : 'Back'}</Text>
        </TouchableOpacity>
        <View style={s.langToggle}>
          {['tr', 'en'].map((l) => (
            <TouchableOpacity key={l} style={[s.langBtn, lang === l && s.langActive]} onPress={() => setLang(l)}>
              <Text style={[s.langText, lang === l && s.langTextActive]}>{l.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }}>
        <Text style={s.title}>{lang === 'tr' ? 'Kullanım Sözleşmesi' : 'Terms of Service'}</Text>
        <Text style={s.meta}>{lang === 'tr' ? 'Sürüm' : 'Version'} {TERMS_VERSION} · {TERMS_EFFECTIVE}</Text>

        {TERMS.map((sec, i) => (
          <View key={i} style={s.section}>
            <Text style={s.secTitle}>{sec[lang].title}</Text>
            <Text style={s.secBody}>{sec[lang].body}</Text>
          </View>
        ))}

        <Text style={s.disclaimer}>
          {lang === 'tr'
            ? 'Bu metin bilgilendirme amaçlı bir taslaktır ve hukuki danışmanlık teşkil etmez.'
            : 'This text is an informational draft and does not constitute legal advice.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.pad, paddingVertical: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  langToggle: { flexDirection: 'row', backgroundColor: '#ECECF4', borderRadius: 10, padding: 3 },
  langBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  langActive: { backgroundColor: '#fff' },
  langText: { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  langTextActive: { color: COLORS.primary },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.muted, marginTop: 4, marginBottom: 16 },
  section: { marginBottom: 18 },
  secTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  secBody: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  disclaimer: { fontSize: 12, color: COLORS.muted, fontStyle: 'italic', marginTop: 10, lineHeight: 18 },
});
