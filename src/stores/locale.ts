import { create } from 'zustand';

export const LOCALES = {
  en: 'en',
  es: 'es'
} as const;
const SUPPORTED_LOCALES = Object.values(LOCALES);
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
const DEFAULT_LOCALE = LOCALES.en;

interface LocaleStore {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

const useLocaleStore = create<LocaleStore>((set) => ({
  locale: DEFAULT_LOCALE, // Default locale
  setLocale: (locale: SupportedLocale) => set({ locale }),
}));

export const useChosenLocale = () => useLocaleStore((state) => state.locale);

export const setLocale = (locale: SupportedLocale) => {
  useLocaleStore.getState().setLocale(locale);
};

export const getLocale = () => useLocaleStore.getState().locale;