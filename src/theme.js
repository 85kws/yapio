// yapp tasarım sabitleri — uygulamanın kendi arayüzü (builder/home) için.
// Kullanıcının yaptığı mini-app'ler kendi themeColor'ını kullanır.

export const COLORS = {
  primary: '#5B4BE7',     // mor — yapp ana rengi
  primaryDark: '#4334C4',
  bg: '#F7F7FB',          // açık gri zemin
  card: '#FFFFFF',
  text: '#1A1A2E',
  muted: '#8A8AA3',
  border: '#E6E6F0',
  danger: '#E5484D',
  success: '#30A46C',
};

// Kullanıcının mini-app'i için seçebileceği hazır renkler.
export const APP_COLORS = [
  '#5B4BE7', // mor
  '#E5484D', // kırmızı
  '#F76808', // turuncu
  '#30A46C', // yeşil
  '#0091FF', // mavi
  '#E93D82', // pembe
  '#1A1A2E', // siyah
  '#8B6914', // kahve (FormLab teması)
];

export const SIZES = {
  radius: 16,
  pad: 16,
};
