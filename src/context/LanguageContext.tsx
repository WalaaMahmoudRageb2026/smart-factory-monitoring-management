import React, { createContext, useContext, useState, useEffect } from 'react';
import { COUNTRY_LANGUAGES, CountryLanguageOption, TRANSLATIONS, TranslationKey } from '../lib/translations';

interface LanguageContextType {
  currentCountryLang: CountryLanguageOption;
  setCountryLang: (code: string) => void;
  autoDetectCountry: () => void;
  availableOptions: CountryLanguageOption[];
  t: (key: string, fallback?: string) => string;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectBestCountryMatch(): CountryLanguageOption {
  if (typeof window === 'undefined' || !navigator) {
    return COUNTRY_LANGUAGES[0]; // ar-SA default for Arabic priority or en-US
  }

  const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
  
  // Try exact match e.g. 'ar-sa', 'ar-eg', 'en-us'
  const exact = COUNTRY_LANGUAGES.find(c => c.code.toLowerCase() === browserLang);
  if (exact) return exact;

  // Try language prefix e.g. 'ar' -> 'ar-SA'
  const langPrefix = browserLang.split('-')[0];
  const byPrefix = COUNTRY_LANGUAGES.find(c => c.langCode.toLowerCase() === langPrefix);
  if (byPrefix) return byPrefix;

  // Default to English (or Arabic if in MENA timezone)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
    if (tz.includes('cairo') || tz.includes('riyadh') || tz.includes('dubai') || tz.includes('baghdad') || tz.includes('kuwait')) {
      return COUNTRY_LANGUAGES.find(c => c.code === 'ar-SA') || COUNTRY_LANGUAGES[0];
    }
  } catch {
    // Ignore timezone detection errors
  }

  return COUNTRY_LANGUAGES.find(c => c.code === 'en-US') || COUNTRY_LANGUAGES[0];
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCountryLang, setCurrentCountryLangState] = useState<CountryLanguageOption>(() => {
    const savedCode = localStorage.getItem('app_country_lang');
    if (savedCode) {
      const match = COUNTRY_LANGUAGES.find(c => c.code === savedCode);
      if (match) return match;
    }
    return detectBestCountryMatch();
  });

  const setCountryLang = (code: string) => {
    const option = COUNTRY_LANGUAGES.find(c => c.code === code);
    if (option) {
      setCurrentCountryLangState(option);
      localStorage.setItem('app_country_lang', option.code);
      localStorage.setItem('app_lang', option.langCode);
    }
  };

  const autoDetectCountry = () => {
    const detected = detectBestCountryMatch();
    setCurrentCountryLangState(detected);
    localStorage.setItem('app_country_lang', detected.code);
    localStorage.setItem('app_lang', detected.langCode);
  };

  // Sync dir and lang with <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', currentCountryLang.dir);
    root.setAttribute('lang', currentCountryLang.langCode);
    localStorage.setItem('app_country_lang', currentCountryLang.code);
    localStorage.setItem('app_lang', currentCountryLang.langCode);
  }, [currentCountryLang]);

  const t = (keyOrText: string, fallback?: string): string => {
    if (!keyOrText) return '';
    const lang = (currentCountryLang?.langCode || 'en') as keyof typeof TRANSLATIONS;
    const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;

    // 1. Direct exact key in active language
    if ((dictionary as any)[keyOrText] !== undefined) {
      return (dictionary as any)[keyOrText];
    }

    // 2. Trimmed lookup
    const trimmed = keyOrText.trim();
    if ((dictionary as any)[trimmed] !== undefined) {
      return (dictionary as any)[trimmed];
    }

    // 3. Lowercase lookup
    const lower = trimmed.toLowerCase();
    if ((dictionary as any)[lower] !== undefined) {
      return (dictionary as any)[lower];
    }

    // 4. Case-insensitive dictionary search
    const dictKeys = Object.keys(dictionary);
    const matchedKey = dictKeys.find(k => k.toLowerCase() === lower);
    if (matchedKey && (dictionary as any)[matchedKey] !== undefined) {
      return (dictionary as any)[matchedKey];
    }

    // 5. If a fallback string was provided, check if fallback exists in dictionary
    if (fallback) {
      if ((dictionary as any)[fallback] !== undefined) {
        return (dictionary as any)[fallback];
      }
      const trimmedFallback = fallback.trim().toLowerCase();
      const matchedFallback = dictKeys.find(k => k.toLowerCase() === trimmedFallback);
      if (matchedFallback && (dictionary as any)[matchedFallback] !== undefined) {
        return (dictionary as any)[matchedFallback];
      }
    }

    // 6. English dictionary fallback
    const enDict = TRANSLATIONS.en as any;
    if (enDict && enDict[keyOrText] !== undefined) {
      // If we are in another language, check if the English translation has an entry in current dictionary
      const enVal = enDict[keyOrText];
      if ((dictionary as any)[enVal] !== undefined) {
        return (dictionary as any)[enVal];
      }
      if (lang === 'en') {
        return enVal;
      }
    }

    return fallback !== undefined ? fallback : keyOrText;
  };

  const isRTL = currentCountryLang.dir === 'rtl';

  return (
    <LanguageContext.Provider
      value={{
        currentCountryLang,
        setCountryLang,
        autoDetectCountry,
        availableOptions: COUNTRY_LANGUAGES,
        t,
        dir: currentCountryLang.dir,
        isRTL
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
