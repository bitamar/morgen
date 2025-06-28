export const LANGUAGE_STORAGE_KEY = 'morningRoutine.language.v1';

export interface LanguageSettings {
  language: string;
  lastUpdated: string;
}

export const DEFAULT_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
];

/** Load language settings from localStorage with safe fallbacks */
export function loadLanguageSettings(): string {
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!raw) return DEFAULT_LANGUAGE;

    const parsed: LanguageSettings = JSON.parse(raw);
    if (parsed.language && typeof parsed.language === 'string') {
      // Validate that the language is supported
      const isSupported = SUPPORTED_LANGUAGES.some(lang => lang.code === parsed.language);
      return isSupported ? parsed.language : DEFAULT_LANGUAGE;
    }
  } catch (err) {
    console.error('loadLanguageSettings:', err);
  }
  return DEFAULT_LANGUAGE;
}

/** Save language settings to localStorage */
export function saveLanguageSettings(language: string) {
  try {
    const settings: LanguageSettings = {
      language,
      lastUpdated: new Date().toISOString(),
    };
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('saveLanguageSettings:', err);
  }
}

/** Get language display information */
export function getLanguageInfo(languageCode: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode) || SUPPORTED_LANGUAGES[0];
}
