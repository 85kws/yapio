// Merkezi ikon haritası. Emoji yerine @expo/vector-icons (Ionicons).
// Sektör/modül anahtarından modern 2D ikon adına eşler.
import React from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './theme';
import { mediaUrl } from './api/client';

// Sektör anahtarı → Ionicons adı
export const SECTOR_ICON = {
  berber: 'cut', kuafor: 'color-wand', estetik: 'sparkles', diyetisyen: 'nutrition',
  restoran: 'restaurant', kafe: 'cafe', spor: 'barbell', pilates: 'body',
  ozel_ders: 'school', muzik: 'musical-notes', dovme: 'color-palette', veteriner: 'paw',
  oto: 'car-sport', fizyo: 'medkit', fotografci: 'camera',
  petshop: 'basket', eczane: 'medical', dogum: 'female', dis: 'happy', psikolog: 'heart', kresh: 'balloon',
  otel: 'bed', avukat: 'briefcase', muhasebe: 'calculator', emlak: 'home', optik: 'glasses',
  kurutemizleme: 'shirt', cicekci: 'flower', evhizmet: 'construct', spa: 'leaf', rentacar: 'car', pt: 'fitness',
};

// Modül anahtarı → Ionicons adı
export const MODULE_ICON = {
  booking: 'calendar', catalog: 'book', ordering: 'cart', campaigns: 'megaphone',
  loyalty: 'star', subscriptions: 'pricetags', payments: 'card', records: 'document-text',
  plans: 'clipboard', tracker: 'water', steps: 'walk', messaging: 'chatbubbles', push: 'notifications',
  gallery: 'images', profile: 'location', reviews: 'chatbox-ellipses', staff: 'people',
};

export const sectorIcon = (key) => SECTOR_ICON[key] || 'storefront';
export const moduleIcon = (key) => MODULE_ICON[key] || 'cube';

// Kısa ikon bileşeni
export function Icon({ name, size = 22, color = COLORS.text, style }) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}

// İşletme/uygulama ikonu: logo varsa foto, yoksa renkli kare + sektör ikonu
export function AppIcon({ sectorKey, color = COLORS.primary, size = 54, radius = 14, logo = null }) {
  if (logo) {
    return <Image source={{ uri: mediaUrl(logo) }} style={{ width: size, height: size, borderRadius: radius, backgroundColor: '#ECECF4' }} />;
  }
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={sectorIcon(sectorKey)} size={size * 0.5} color="#fff" />
    </View>
  );
}
