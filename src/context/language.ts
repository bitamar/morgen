import { createContext, useContext } from 'react';

export interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  getLanguageInfo: () => { code: string; name: string; flag: string; direction: 'ltr' | 'rtl' };
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
