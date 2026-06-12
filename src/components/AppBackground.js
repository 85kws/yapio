// Mini app arka planı: düz renk / desen (10 çeşit) / özel foto. theme = businesses.theme_json.
// bg_type: 'solid'|'pattern'|'photo' ; bg_color ; bg_pattern (key) ; bg_photo (path)
import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { mediaUrl } from '../api/client';

// 10 desen — havalı isimler. Editörde önizleme + runtime'da arka plan.
export const PATTERNS = [
  { key: 'bubbles', name: 'Baloncuk' },
  { key: 'rings', name: 'Hâle' },
  { key: 'dots', name: 'Nokta' },
  { key: 'grid', name: 'Izgara' },
  { key: 'diagonal', name: 'Eğik Çizgi' },
  { key: 'confetti', name: 'Konfeti' },
  { key: 'waves', name: 'Dalga' },
  { key: 'stardust', name: 'Yıldız Tozu' },
  { key: 'orbit', name: 'Yörünge' },
  { key: 'mist', name: 'Sis' },
];

// Desen çizimi (View tabanlı, düşük opaklık). scale=küçük önizleme için.
export function Pattern({ name, color = '#5B4BE7', scale = 1 }) {
  const a1 = color + '14', a2 = color + '0A', a3 = color + '20';
  const S = (n) => n * scale;
  const els = [];
  const circle = (k, s, t, l, col, border) => (
    <View key={k} pointerEvents="none" style={{ position: 'absolute', width: S(s), height: S(s), borderRadius: S(s) / 2, top: S(t), left: S(l), backgroundColor: border ? 'transparent' : col, borderWidth: border ? S(border) : 0, borderColor: col }} />
  );
  const rect = (k, w, h, t, l, col, rot) => (
    <View key={k} pointerEvents="none" style={{ position: 'absolute', width: S(w), height: S(h), top: S(t), left: S(l), backgroundColor: col, transform: rot ? [{ rotate: rot }] : undefined, borderRadius: S(h) / 2 }} />
  );

  if (name === 'bubbles') {
    [[220, -50, -40, a1], [140, 180, 250, a2], [180, 460, -60, a2], [120, 600, 210, a1], [90, 320, 120, a2]].forEach((c, i) => els.push(circle('b' + i, c[0], c[1], c[2], c[3])));
  } else if (name === 'rings') {
    [[260, -60, -80], [180, 120, 220], [220, 520, -70], [160, 680, 230]].forEach((c, i) => els.push(circle('r' + i, c[0], c[1], c[2], a2, 18)));
  } else if (name === 'dots') {
    for (let r = 0; r < 16; r++) for (let c = 0; c < 7; c++) els.push(circle('d' + r + '-' + c, 6, 24 + r * 50, 22 + c * 54, a1));
  } else if (name === 'grid') {
    for (let r = 0; r < 18; r++) els.push(rect('gh' + r, 9999, 1, 30 + r * 46, 0, a1));
    for (let c = 0; c < 9; c++) els.push(rect('gv' + c, 1, 9999, 0, 24 + c * 44, a1));
  } else if (name === 'diagonal') {
    for (let i = -6; i < 14; i++) els.push(rect('dg' + i, 4, 1400, -200, i * 70, a1, '45deg'));
  } else if (name === 'confetti') {
    const pts = [[20, 60], [120, 180], [240, 90], [60, 300], [200, 360], [300, 240], [40, 520], [180, 600], [280, 680], [120, 760], [320, 460], [90, 160]];
    pts.forEach((p, i) => els.push(rect('c' + i, 12, 12, p[1], p[0], i % 2 ? a3 : a1, (i * 27) + 'deg')));
  } else if (name === 'waves') {
    for (let r = 0; r < 9; r++) for (let c = -1; c < 8; c++) els.push(circle('w' + r + '-' + c, 70, 40 + r * 90 + (c % 2 ? 18 : 0), -10 + c * 56, a2, 7));
  } else if (name === 'stardust') {
    const seed = [13, 47, 91, 23, 67, 5, 88, 31, 72, 19, 55, 3, 99, 41, 77, 28, 63, 9, 84, 36];
    for (let i = 0; i < 40; i++) { const x = (seed[i % 20] * 17 + i * 53) % 340; const y = (seed[(i + 7) % 20] * 29 + i * 71) % 760; els.push(circle('s' + i, i % 5 === 0 ? 7 : 3, y, x, i % 3 ? a1 : a3)); }
  } else if (name === 'orbit') {
    els.push(circle('o0', 360, 200, -100, a2, 14));
    els.push(circle('o1', 220, 280, -30, a2, 12));
    els.push(circle('o2', 120, 330, 30, a3, 10));
    els.push(circle('o3', 18, 384, 84, a3));
  } else if (name === 'mist') {
    [[320, -80, -120, a2], [280, 300, 160, a2], [340, 600, -140, a2], [240, 760, 180, a2]].forEach((c, i) => els.push(circle('m' + i, c[0], c[1], c[2], c[3])));
  }
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{els}</View>;
}

export default function AppBackground({ theme = {}, children }) {
  const base = theme.bg_color || '#FFFFFF';
  const accent = theme.color || '#5B4BE7';
  if (theme.bg_type === 'photo' && theme.bg_photo) {
    return (
      <ImageBackground source={{ uri: mediaUrl(theme.bg_photo) }} style={{ flex: 1 }} resizeMode="cover">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.80)' }]} />
        {children}
      </ImageBackground>
    );
  }
  if (theme.bg_type === 'pattern') {
    return (
      <View style={{ flex: 1, backgroundColor: base }}>
        <Pattern name={theme.bg_pattern} color={accent} />
        {children}
      </View>
    );
  }
  return <View style={{ flex: 1, backgroundColor: base }}>{children}</View>;
}
