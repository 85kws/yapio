import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Tek bloğu ekrana basar. Hem player'da hem builder önizlemesinde kullanılır.
// props:
//   block      — { type, props }
//   theme      — mini-app ana rengi (hex)
//   onNavigate — (pageId) => void   (buton 'page' aksiyonu)
//   onSubmit   — (data) => void     (form gönderimi)
export default function BlockRenderer({ block, theme = '#5B4BE7', onNavigate, onSubmit }) {
  const p = block.props || {};

  if (block.type === 'text') {
    const style = [
      s.text,
      p.size === 'h1' && s.h1,
      p.size === 'h2' && s.h2,
      { textAlign: p.align || 'left' },
    ];
    return <Text style={style}>{p.text}</Text>;
  }

  if (block.type === 'image') {
    if (p.uri) {
      return <Image source={{ uri: p.uri }} style={s.image} resizeMode="cover" />;
    }
    return (
      <View style={[s.image, s.imagePlaceholder]}>
        <Ionicons name="image-outline" size={28} color="#8A8AA3" />
        <Text style={s.imagePlaceholderText}>Foto yok</Text>
      </View>
    );
  }

  if (block.type === 'button') {
    const onPress = () => {
      if (p.action === 'link' && p.value) {
        Linking.openURL(p.value).catch(() => Alert.alert('Link açılamadı', p.value));
      } else if (p.action === 'phone' && p.value) {
        Linking.openURL(`tel:${p.value}`).catch(() => Alert.alert('Arama başlatılamadı'));
      } else if ((p.action === 'page' || p.action === 'module') && p.value) {
        onNavigate && onNavigate(p.value);
      }
    };
    return (
      <TouchableOpacity style={[s.button, { backgroundColor: theme }]} onPress={onPress} activeOpacity={0.85}>
        <Text style={s.buttonText}>{p.label || 'Buton'}</Text>
      </TouchableOpacity>
    );
  }

  if (block.type === 'form') {
    return <FormBlock p={p} theme={theme} onSubmit={onSubmit} />;
  }

  return null;
}

function FormBlock({ p, theme, onSubmit }) {
  const [values, setValues] = useState({});
  const fields = p.fields || [];

  const submit = () => {
    onSubmit && onSubmit(values);
    setValues({});
  };

  return (
    <View style={s.form}>
      {p.title ? <Text style={s.h2}>{p.title}</Text> : null}
      {fields.map((f, i) => (
        <View key={i} style={s.field}>
          <Text style={s.fieldLabel}>{f.label}</Text>
          <TextInput
            style={s.input}
            value={values[f.label] || ''}
            onChangeText={(t) => setValues((v) => ({ ...v, [f.label]: t }))}
            placeholder={f.label}
            placeholderTextColor="#B0B0C0"
            keyboardType={f.type === 'phone' ? 'phone-pad' : f.type === 'email' ? 'email-address' : 'default'}
          />
        </View>
      ))}
      <TouchableOpacity style={[s.button, { backgroundColor: theme }]} onPress={submit} activeOpacity={0.85}>
        <Text style={s.buttonText}>{p.submitLabel || 'Gönder'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  text: { fontSize: 16, lineHeight: 24, color: '#1A1A2E', marginVertical: 6 },
  h1: { fontSize: 30, lineHeight: 38, fontWeight: '800', marginVertical: 10 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700', marginVertical: 8 },
  image: { width: '100%', height: 200, borderRadius: 14, marginVertical: 8, backgroundColor: '#ECECF4' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  imagePlaceholderText: { color: '#8A8AA3', fontSize: 14 },
  button: { paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginVertical: 7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  form: { marginVertical: 8 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 14, color: '#8A8AA3', marginBottom: 6 },
  input: { backgroundColor: '#F1F1F7', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#1A1A2E' },
});
