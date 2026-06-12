// Dil altyapısı: cihaz dili TR ise TR, değilse EN. Ayarlardan değiştirilir, SecureStore'da saklanır.
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

const STRINGS = {
  tr: {
    tagline: 'İşletmeler için uygulama dükkanı',
    register_title: 'Hesap Oluştur', login_title: 'Giriş Yap',
    name: 'İsmin', name_ph: 'Adın', password: 'Şifre',
    password_ph_login: 'Şifren', password_ph_register: 'Bir şifre belirle (en az 4)',
    register_btn: 'Kayıt Ol', login_btn: 'Giriş Yap',
    have_account: 'Zaten bir hesabın var mı? ', no_account: 'Hesabın yok mu? ',
    login_link: 'Giriş yap', register_link: 'Kayıt ol',
    or: 'veya', apple_login: 'Apple ile Giriş', google_login: 'Google ile Giriş',
    accept_pre: '', terms: 'Kullanım Sözleşmesi', accept_post: "'ni okudum ve kabul ediyorum.",
    need_accept_title: 'Onay gerekli', need_accept_body: 'Devam için Kullanım Sözleşmesi\'ni kabul etmelisin.',
    name_required: 'Adını gir.', password_required_login: 'Şifreni gir.', password_required_register: 'Bir şifre belirle.',
    soon: 'Yakında',
    tab_storefront: 'Vitrin', tab_myapps: "App'lerim", tab_profile: 'Profil', tab_business: 'İşletmem',
    language: 'Dil', back: 'Geri', settings: 'Ayarlar',
    messages: 'Mesajlar', manage: 'Yönet', user: 'Kullanıcı', new: 'Yeni',
    my_businesses: 'İşletmelerim', my_businesses_desc: "App'lerini yönet, yeni işletme ekle.",
    first_app_title: "İlk işletme app'ini kur", first_app_desc: 'Sektörünü seç, hazır şablonla dakikalar içinde kendi uygulamanı yayınla.',
    start_now: 'Hemen Başla', no_business_yet: 'Henüz işletmen yok. İlk uygulamanı kur.',
    st_draft: 'Taslak', st_active: 'Yayında', st_suspended: 'Askıda',
    welcome: 'Hoş geldin! 👋', guide_intro: 'İlk uygulamanı kurmadan önce nasıl çalıştığını oku.', got_it: 'Anladım, Başlayalım',
    business: 'İşletme', help_legal: 'Yardım & Yasal',
    open_business: 'İşletme Hesabı Aç', open_business_desc: 'Kendi uygulamanı yap ve hizmet sat. Başvuru gerekir.',
    pending_title: 'Başvurun inceleniyor', pending_desc: "Onaylanınca işletme app'i kurabilirsin.",
    rejected_title: 'Başvurun reddedildi', reapply: 'Tekrar Başvur', reapply_desc: 'Bilgileri güncelleyip yeniden gönder.',
    guide_card: 'Kılavuz', guide_card_desc: 'Tüm özellikler nasıl kullanılır.',
    admin_mgmt: 'Yönetim', super_admin: 'Süper Admin',
    seller_apps: 'Satıcı Başvuruları', seller_apps_desc: 'Bekleyen başvuruları onayla/reddet.',
    all_businesses: 'Tüm İşletmeler', all_businesses_desc: 'Askıya al / aktifleştir / denetle.',
    support: 'Destek & Geri Bildirim', support_desc: 'Bize yaz', terms_card: 'Kullanım Sözleşmesi', terms_desc: 'Şartlar ve koşullar.',
    logout: 'Çıkış Yap', badge_seller: 'Satıcı', badge_admin: 'Yönetici',
    preview: 'Önizle', app_name_ph: 'App adı', error: 'Hata', not_saved: 'Kaydedilemedi', save: 'Kaydet', delete: 'Sil', cancel: 'Vazgeç',
    permission_required: 'İzin gerekli', gallery_permission: 'Galeriye erişim izni verin.', image_upload_failed: 'Görsel yüklenemedi', could_not_delete: 'Silinemedi',
    theme_bg: 'Tema & Arka Plan', theme_bg_sub: 'Uygulamanın rengi ve arka planı.', theme_color: 'Tema rengi', apply: 'Uygula',
    invalid_code: 'Geçersiz kod', invalid_code_body: '6 haneli renk kodu gir (örn. 5B4BE7).',
    background: 'Arka plan', bg_solid: 'Düz Renk', bg_pattern: 'Desen', bg_photo: 'Foto',
    change_photo: 'Fotoğrafı Değiştir', pick_bg_photo: 'Arka Plan Fotoğrafı Seç', bg_note: 'Desen ve foto arka plan, Dev+ ve Pro pakette aktif olur.',
    access: 'Erişim', access_sub: 'Herkese açık mı, yoksa sadece onayladığın üyeler mi kullanabilsin?', public: 'Herkese Açık', private: 'Özel (kayıt sistemi)',
    join_code: 'Katılım Kodu', users: 'Kullanıcılar', publish: 'Yayınla', published_title: 'Yayında!', published_body: 'App vitrinde görünüyor artık.',
    store_images: 'Mağaza Görselleri', store_images_sub: 'Vitrindeki mağaza sayfanda görünür (ekran görüntüleri, tanıtım).', add: 'Ekle',
    features: 'Özellikler', features_sub: "App'inde hangi modüller olsun?", saving: 'kaydediliyor',
    guide_link: 'Kılavuz · Nasıl kullanılır?', design_page: 'Sayfayı Tasarla — sürükle bırak', delete_business: 'İşletmeyi Sil',
    delete_q: 'silinsin mi?',
    mod_booking: 'Randevu', mod_catalog: 'Menü / Katalog', mod_ordering: 'Sipariş', mod_campaigns: 'Kampanya', mod_loyalty: 'Sadakat', mod_subscriptions: 'Üyelik', mod_records: 'Ölçüm / Kayıt', mod_plans: 'Program', mod_tracker: 'Su & Kalori', mod_steps: 'Adım Sayar', mod_messaging: 'Mesaj', mod_push: 'Bildirim', mod_gallery: 'Galeri', mod_profile: 'Profil / Konum', mod_reviews: 'Yorumlar', mod_staff: 'Ekip',
    home: 'Ana Sayfa', private_app: 'Özel uygulama', join_prompt: 'Bu uygulamayı kullanmak için işletmenin verdiği katılım kodunu gir.', join_code_ph: 'KATILIM KODU', join: 'Katıl', no_code_request: 'Kodum yok — katılım isteği gönder', request_sent: 'İsteğin gönderildi, onay bekleniyor.', request_sent_title: 'İstek gönderildi', request_sent_body: 'İşletme onayladığında erişebileceksin.', not_found: 'Bulunamadı', app_load_fail: 'App yüklenemedi',
  },
  en: {
    tagline: 'App store for businesses',
    register_title: 'Create Account', login_title: 'Sign In',
    name: 'Your name', name_ph: 'Name', password: 'Password',
    password_ph_login: 'Your password', password_ph_register: 'Set a password (min 4)',
    register_btn: 'Sign Up', login_btn: 'Sign In',
    have_account: 'Already have an account? ', no_account: "Don't have an account? ",
    login_link: 'Sign in', register_link: 'Sign up',
    or: 'or', apple_login: 'Sign in with Apple', google_login: 'Sign in with Google',
    accept_pre: 'I have read and accept the ', terms: 'Terms of Service', accept_post: '.',
    need_accept_title: 'Consent required', need_accept_body: 'You must accept the Terms of Service to continue.',
    name_required: 'Enter your name.', password_required_login: 'Enter your password.', password_required_register: 'Set a password.',
    soon: 'Coming soon',
    tab_storefront: 'Discover', tab_myapps: 'My Apps', tab_profile: 'Profile', tab_business: 'My Business',
    language: 'Language', back: 'Back', settings: 'Settings',
    messages: 'Messages', manage: 'Manage', user: 'User', new: 'New',
    my_businesses: 'My Businesses', my_businesses_desc: 'Manage your apps, add a new business.',
    first_app_title: 'Create your first business app', first_app_desc: 'Pick your sector and publish your own app in minutes with a ready template.',
    start_now: 'Get Started', no_business_yet: 'No business yet. Create your first app.',
    st_draft: 'Draft', st_active: 'Live', st_suspended: 'Suspended',
    welcome: 'Welcome! 👋', guide_intro: 'Read how it works before creating your first app.', got_it: "Got it, let's start",
    business: 'Business', help_legal: 'Help & Legal',
    open_business: 'Open Business Account', open_business_desc: 'Build your own app and sell services. Application required.',
    pending_title: 'Your application is under review', pending_desc: 'Once approved you can build a business app.',
    rejected_title: 'Your application was rejected', reapply: 'Reapply', reapply_desc: 'Update your info and resubmit.',
    guide_card: 'Guide', guide_card_desc: 'How to use all features.',
    admin_mgmt: 'Management', super_admin: 'Super Admin',
    seller_apps: 'Seller Applications', seller_apps_desc: 'Approve/reject pending applications.',
    all_businesses: 'All Businesses', all_businesses_desc: 'Suspend / activate / audit.',
    support: 'Support & Feedback', support_desc: 'Write to us', terms_card: 'Terms of Service', terms_desc: 'Terms and conditions.',
    logout: 'Sign Out', badge_seller: 'Seller', badge_admin: 'Admin',
    preview: 'Preview', app_name_ph: 'App name', error: 'Error', not_saved: 'Could not save', save: 'Save', delete: 'Delete', cancel: 'Cancel',
    permission_required: 'Permission required', gallery_permission: 'Grant access to your gallery.', image_upload_failed: 'Could not upload image', could_not_delete: 'Could not delete',
    theme_bg: 'Theme & Background', theme_bg_sub: "Your app's color and background.", theme_color: 'Theme color', apply: 'Apply',
    invalid_code: 'Invalid code', invalid_code_body: 'Enter a 6-digit color code (e.g. 5B4BE7).',
    background: 'Background', bg_solid: 'Solid', bg_pattern: 'Pattern', bg_photo: 'Photo',
    change_photo: 'Change Photo', pick_bg_photo: 'Choose Background Photo', bg_note: 'Pattern & photo backgrounds are available on Dev+ and Pro plans.',
    access: 'Access', access_sub: 'Open to everyone, or only members you approve?', public: 'Public', private: 'Private (registration)',
    join_code: 'Join Code', users: 'Users', publish: 'Publish', published_title: 'Published!', published_body: 'Your app is now live in the storefront.',
    store_images: 'Store Images', store_images_sub: 'Shown on your storefront page (screenshots, promo).', add: 'Add',
    features: 'Features', features_sub: 'Which modules should your app have?', saving: 'saving',
    guide_link: 'Guide · How to use', design_page: 'Design Page — drag & drop', delete_business: 'Delete Business',
    delete_q: 'delete?',
    mod_booking: 'Booking', mod_catalog: 'Menu / Catalog', mod_ordering: 'Ordering', mod_campaigns: 'Campaigns', mod_loyalty: 'Loyalty', mod_subscriptions: 'Membership', mod_records: 'Measurements', mod_plans: 'Programs', mod_tracker: 'Water & Calories', mod_steps: 'Step Counter', mod_messaging: 'Messages', mod_push: 'Notifications', mod_gallery: 'Gallery', mod_profile: 'Profile / Location', mod_reviews: 'Reviews', mod_staff: 'Team',
    home: 'Home', private_app: 'Private app', join_prompt: 'Enter the join code given by the business to use this app.', join_code_ph: 'JOIN CODE', join: 'Join', no_code_request: "I don't have a code — send a join request", request_sent: 'Your request was sent, awaiting approval.', request_sent_title: 'Request sent', request_sent_body: 'You can access once the business approves.', not_found: 'Not found', app_load_fail: 'Could not load app',
  },
};

function deviceLang() {
  try {
    const locs = (Localization.getLocales && Localization.getLocales()) || [];
    const code = (locs[0]?.languageCode || Localization.locale || 'en').toLowerCase();
    return code.startsWith('tr') ? 'tr' : 'en';
  } catch { return 'tr'; }
}

const LangCtx = createContext({ lang: 'tr', t: (k) => k, setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(deviceLang());
  useEffect(() => { (async () => { try { const saved = await SecureStore.getItemAsync('yapio_lang'); if (saved === 'tr' || saved === 'en') setLangState(saved); } catch {} })(); }, []);
  const setLang = useCallback(async (l) => { setLangState(l); try { await SecureStore.setItemAsync('yapio_lang', l); } catch {} }, []);
  const t = useCallback((k) => (STRINGS[lang] && STRINGS[lang][k]) || STRINGS.tr[k] || k, [lang]);
  return <LangCtx.Provider value={{ lang, t, setLang }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
