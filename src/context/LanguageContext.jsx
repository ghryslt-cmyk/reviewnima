import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'id'
    const saved = localStorage.getItem('language');
    console.log('LanguageProvider: Initial language from localStorage:', saved);
    // Only use saved value if it's valid
    if (saved && ['id', 'en', 'jp'].includes(saved)) {
      return saved;
    }
    return 'id';
  });

  useEffect(() => {
    // Save language preference to localStorage
    console.log('LanguageProvider: Saving language to localStorage:', language);
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = useCallback((lang) => {
    console.log('LanguageProvider: changeLanguage called with:', lang);
    setLanguage(lang);
  }, []);

  const value = useMemo(() => ({
    language,
    changeLanguage
  }), [language, changeLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
