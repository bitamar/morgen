import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  LANGUAGE_STORAGE_KEY,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  loadLanguageSettings,
  saveLanguageSettings,
  getLanguageInfo,
  type LanguageSettings,
} from '../services/languageStorage';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

describe('languageStorage', () => {
  describe('constants', () => {
    it('has correct storage key', () => {
      expect(LANGUAGE_STORAGE_KEY).toBe('morningRoutine.language.v1');
    });

    it('has correct default language', () => {
      expect(DEFAULT_LANGUAGE).toBe('en');
    });

    it('has supported languages with required properties', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(2);
      expect(SUPPORTED_LANGUAGES[0]).toEqual({
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
      });
      expect(SUPPORTED_LANGUAGES[1]).toEqual({
        code: 'he',
        name: 'עברית',
        flag: '🇮🇱',
      });
    });
  });

  describe('loadLanguageSettings', () => {
    it('returns default language when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const language = loadLanguageSettings();

      expect(localStorageMock.getItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY);
      expect(language).toBe(DEFAULT_LANGUAGE);
    });

    it('loads language from localStorage when valid data exists', () => {
      const savedData: LanguageSettings = {
        language: 'he',
        lastUpdated: '2023-01-01T00:00:00.000Z',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

      const language = loadLanguageSettings();

      expect(localStorageMock.getItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY);
      expect(language).toBe('he');
    });

    it('returns default language when stored language is not supported', () => {
      const savedData: LanguageSettings = {
        language: 'fr', // unsupported language
        lastUpdated: '2023-01-01T00:00:00.000Z',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

      const language = loadLanguageSettings();

      expect(language).toBe(DEFAULT_LANGUAGE);
    });

    it('returns default language when stored data has no language property', () => {
      const invalidData = { someOtherData: 'value' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidData));

      const language = loadLanguageSettings();

      expect(language).toBe(DEFAULT_LANGUAGE);
    });

    it('returns default language when stored language is not a string', () => {
      const invalidData = { language: 123 };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidData));

      const language = loadLanguageSettings();

      expect(language).toBe(DEFAULT_LANGUAGE);
    });

    it('handles JSON parse errors gracefully', () => {
      // Temporarily silence expected console error for this test
      const silentErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      localStorageMock.getItem.mockReturnValue('invalid-json{');

      const language = loadLanguageSettings();

      expect(language).toBe(DEFAULT_LANGUAGE);
      expect(silentErrorSpy).toHaveBeenCalledWith('loadLanguageSettings:', expect.any(SyntaxError));

      // Restore console.error
      silentErrorSpy.mockRestore();
    });

    it('handles localStorage access errors gracefully', () => {
      // Temporarily silence expected console error for this test
      const silentErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });

      const language = loadLanguageSettings();

      expect(language).toBe(DEFAULT_LANGUAGE);
      expect(silentErrorSpy).toHaveBeenCalledWith('loadLanguageSettings:', expect.any(Error));

      // Restore console.error
      silentErrorSpy.mockRestore();
    });
  });

  describe('saveLanguageSettings', () => {
    it('saves language to localStorage with timestamp', () => {
      const testLanguage = 'he';

      // Mock Date to ensure consistent timestamp
      const mockDate = '2023-01-01T00:00:00.000Z';
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);

      saveLanguageSettings(testLanguage);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        LANGUAGE_STORAGE_KEY,
        JSON.stringify({
          language: testLanguage,
          lastUpdated: mockDate,
        })
      );
    });

    it('handles localStorage setItem errors gracefully', () => {
      // Temporarily silence expected console error for this test
      const silentErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const testLanguage = 'en';

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
      });

      // Should not throw
      expect(() => saveLanguageSettings(testLanguage)).not.toThrow();

      expect(silentErrorSpy).toHaveBeenCalledWith('saveLanguageSettings:', expect.any(Error));

      // Restore console.error
      silentErrorSpy.mockRestore();
    });
  });

  describe('getLanguageInfo', () => {
    it('returns correct info for English', () => {
      const info = getLanguageInfo('en');

      expect(info).toEqual({
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
      });
    });

    it('returns correct info for Hebrew', () => {
      const info = getLanguageInfo('he');

      expect(info).toEqual({
        code: 'he',
        name: 'עברית',
        flag: '🇮🇱',
      });
    });

    it('returns default (English) info for unsupported language', () => {
      const info = getLanguageInfo('fr');

      expect(info).toEqual({
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
      });
    });

    it('returns default info for empty string', () => {
      const info = getLanguageInfo('');

      expect(info).toEqual({
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
      });
    });
  });
});
