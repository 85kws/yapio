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
    tab_storefront: 'Vitrin', tab_myapps: "App'lerim", tab_profile: 'Profil',
    language: 'Dil', back: 'Geri', settings: 'Ayarlar',
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
    tab_storefront: 'Discover', tab_myapps: 'My Apps', tab_profile: 'Profile',
    language: 'Language', back: 'Back', settings: 'Settings',
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
