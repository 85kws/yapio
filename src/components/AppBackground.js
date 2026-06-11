// Mini app arka planı: düz renk / desen / özel foto. theme = businesses.theme_json.
// bg_type: 'solid'|'pattern'|'photo' ; bg_color ; bg_pattern: 'bubbles'|'rings'|'dots' ; bg_photo (path)
import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { mediaUrl } from '../api/client';

function Pattern({ name, color }) {
  const soft = color + '12';   // ~7% alpha
  const soft2 = color + '0A';  // ~4% alpha
  if (name === 'dots') {
    const dots = [];
    for (let r = 0; r < 18; r++) for (let c = 0; c < 8; c++) {
      dots.push(<View key={r + '-' + c} style={{ position: 'absolute', top: 20 + r * 46, left: 18 + c * 48, width: 6, height: 6, borderRadius: 3, backgroundColor: soft }} />);
    }
    return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{dots}</View>;
  }
  if (name === 'rings') {
    const ring = (s, t, l) => ({ position: 'absolute', width: s, height: s, borderRadius: s / 2, borderWidth: 22, borderColor: soft2, top: t, left: l });
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={ring(260, -60, -80)} /><View style={ring(180, 120, 220)} /><View style={ring(220, 520, -70)} /><View style={ring(160, 680, 230)} />
      </View>
    );
  }
  // bubbles (default)
  const b = (s, t, l, col) => ({ position: 'absolute', width: s, height: s, borderRadius: s / 2, backgroundColor: col, top: t, left: l });
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={b(220, -50, -40, soft)} /><View style={b(140, 180, 250, soft2)} /><View style={b(180, 460, -60, soft2)} /><View style={b(120, 600, 210, soft)} />
    </View>
  );
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
