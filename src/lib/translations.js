import { useCallback } from 'react';
import idTranslations from '../locales/id.json';
import enTranslations from '../locales/en.json';
import jpTranslations from '../locales/jp.json';

const translations = {
  id: idTranslations,
  en: enTranslations,
  jp: jpTranslations
};

export const getTranslation = (language, key) => {
  const keys = key.split('.');
  let value = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation not found
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return the key if not found
        }
      }
      break;
    }
  }
  
  return value;
};

export const useTranslation = (language) => {
  const t = useCallback((key) => getTranslation(language, key), [language]);
  return { t };
};
