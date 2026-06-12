// Canva editöründe kurulan serbest tasarımı (landing_canvas) runtime'da render eder (ölçekli, salt-okunur).
import React from 'react';
import { View, Text, Image, TouchableOpacity, Linking, Alert, Dimensions } from 'react-native';

export default function CanvasView({ canvas, theme = '#5B4BE7', onNavigate }) {
  if (!canvas?.elements?.length) return null;
  const avail = Dimensions.get('window').width - 40;
  const baseW = canvas.width || avail;
  const scale = avail / baseW;
  const h = (canvas.height || 560) * scale;

  const press = (el) => {
    if (el.action === 'phone' && el.value) Linking.openURL(`tel:${el.value}`).catch(() => {});
    else if (el.action === 'link' && el.value) Linking.openURL(el.value).catch(() => Alert.alert('Link açılamadı'));
    else if (el.action === 'module' && el.value) onNavigate && onNavigate(el.value);
  };

  return (
    <View style={{ width: avail, height: h }}>
      {canvas.elements.map((el) => {
        const st = { position: 'absolute', left: el.x * scale, top: el.y * scale, width: el.w * scale, height: el.h * scale };
        if (el.type === 'text') return <Text key={el.id} style={[st, { fontSize: (el.size || 18) * scale, color: el.color || '#1A1A2E', fontWeight: el.bold ? '800' : '400', textAlign: el.align || 'left' }]}>{el.text}</Text>;
        if (el.type === 'image') return el.uri ? <Image key={el.id} source={{ uri: el.uri }} style={[st, { borderRadius: 10 * scale }]} resizeMode="cover" /> : null;
        return (
          <TouchableOpacity key={el.id} style={st} activeOpacity={0.85} onPress={() => press(el)}>
            <View style={{ flex: 1, backgroundColor: el.bg || theme, borderRadius: 12 * scale, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 * scale }} numberOfLines={1}>{el.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
