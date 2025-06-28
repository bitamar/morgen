import React, { useState, useEffect, ReactNode } from 'react';
import { LanguageContext } from '../context/language';
import {
  loadLanguageSettings,
  saveLanguageSettings,
  getLanguageInfo,
} from '../services/languageStorage';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => loadLanguageSettings());

  useEffect(() => {
    saveLanguageSettings(currentLanguage);

    // Apply direction to HTML element
    const languageInfo = getLanguageInfo(currentLanguage);
    document.documentElement.dir = languageInfo.direction;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
  };

  const getLanguageDisplayInfo = () => {
    return getLanguageInfo(currentLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        getLanguageInfo: getLanguageDisplayInfo,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
