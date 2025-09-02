
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations, LanguageCode, languageList } from '../localization/translations';

type TranslationKeys = keyof typeof translations.en;

type TranslationContextType = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKeys, params?: { [key: string]: string | number }) => string;
  dir: 'ltr' | 'rtl';
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageCode>('en');

  const t = useCallback((key: TranslationKeys, params?: { [key: string]: string | number }) => {
    let text = (translations[language]?.[key]) || translations.en[key] || key;

    if (params) {
        Object.keys(params).forEach(pKey => {
            text = text.replace(new RegExp(`{{${pKey}}}`, 'g'), String(params[pKey]));
        });
    }

    return text;
  }, [language]);
  
  const dir = languageList.find(l => l.code === language)?.dir || 'ltr';

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
