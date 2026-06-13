// Yerel (cihaz saatine göre) YYYY-MM-DD.
// toISOString().slice(0,10) UTC'ye çevirip Türkiye'de (UTC+3) günü kaydırıyordu →
// randevu/takip/ölçüm yanlış güne düşüyordu. Bunu kullan.
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
