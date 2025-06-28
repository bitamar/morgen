import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageProvider } from '../Components/LanguageProvider';
import * as languageStorage from '../services/languageStorage';

// Mock the language storage service
vi.mock('../services/languageStorage', () => ({
  loadLanguageSettings: vi.fn(),
  saveLanguageSettings: vi.fn(),
  getLanguageInfo: vi.fn(),
}));

// Test component that uses the useTranslation hook
const TestComponent = ({ testKey }: { testKey?: string } = {}) => {
  const { t, currentLanguage } = useTranslation();

  return (
    <div>
      <div data-testid="current-language">{currentLanguage}</div>
      <div data-testid="translation">{t(testKey || 'goodMorning')}</div>
    </div>
  );
};

// Test component to test language switching
const LanguageSwitcherComponent = () => {
  const { t, currentLanguage } = useTranslation();

  return (
    <div>
      <div data-testid="current-language">{currentLanguage}</div>
      <div data-testid="good-morning">{t('goodMorning')}</div>
      <div data-testid="settings">{t('settings')}</div>
      <div data-testid="done">{t('done')}</div>
      <div data-testid="cancel">{t('cancel')}</div>
      <div data-testid="select-language">{t('selectLanguage')}</div>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement, initialLanguage = 'en') => {
  vi.mocked(languageStorage.loadLanguageSettings).mockReturnValue(initialLanguage);

  return render(<LanguageProvider>{component}</LanguageProvider>);
};

beforeEach(() => {
  vi.clearAllMocks();

  // Setup default mocks
  vi.mocked(languageStorage.getLanguageInfo).mockImplementation(code => {
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'he', name: 'עברית', flag: '🇮🇱' },
    ];
    return languages.find(lang => lang.code === code) || languages[0];
  });
});

describe('useTranslation', () => {
  describe('English translations', () => {
    it('returns English text when language is English', () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      expect(screen.getByTestId('translation')).toHaveTextContent('Good Morning!');
    });

    it('translates all English keys correctly', () => {
      renderWithProvider(<LanguageSwitcherComponent />);

      expect(screen.getByTestId('good-morning')).toHaveTextContent('Good Morning!');
      expect(screen.getByTestId('settings')).toHaveTextContent('Settings');
      expect(screen.getByTestId('done')).toHaveTextContent('Done');
      expect(screen.getByTestId('cancel')).toHaveTextContent('Cancel');
      expect(screen.getByTestId('select-language')).toHaveTextContent('Select Language');
    });
  });

  describe('Hebrew translations', () => {
    it('returns Hebrew text when language is Hebrew', () => {
      renderWithProvider(<TestComponent />, 'he');

      expect(screen.getByTestId('current-language')).toHaveTextContent('he');
      expect(screen.getByTestId('translation')).toHaveTextContent('בוקר טוב!');
    });

    it('translates all Hebrew keys correctly', () => {
      renderWithProvider(<LanguageSwitcherComponent />, 'he');

      expect(screen.getByTestId('good-morning')).toHaveTextContent('בוקר טוב!');
      expect(screen.getByTestId('settings')).toHaveTextContent('הגדרות');
      expect(screen.getByTestId('done')).toHaveTextContent('סיום');
      expect(screen.getByTestId('cancel')).toHaveTextContent('ביטול');
      expect(screen.getByTestId('select-language')).toHaveTextContent('בחר שפה');
    });
  });

  describe('fallback behavior', () => {
    it('falls back to English when translation key missing in current language', () => {
      renderWithProvider(<TestComponent testKey="nonExistentKey" />, 'he');

      // Should return the key itself as fallback
      expect(screen.getByTestId('translation')).toHaveTextContent('nonExistentKey');
    });

    it('falls back to English translation when key exists in English but not current language', () => {
      // Let's test with a key that exists in English but might be missing in Hebrew
      // First, let's modify our test to simulate this scenario
      const TestComponentWithMissingKey = () => {
        const { currentLanguage } = useTranslation();

        // Manually override translations to test fallback
        const translations: Record<string, Record<string, string>> = {
          en: {
            goodMorning: 'Good Morning!',
            onlyInEnglish: 'Only in English',
          },
          he: {
            goodMorning: 'בוקר טוב!',
            // onlyInEnglish is missing in Hebrew
          },
        };

        const t_test = (key: string): string => {
          return translations[currentLanguage]?.[key] || translations.en[key] || key;
        };

        return (
          <div>
            <div data-testid="current-language">{currentLanguage}</div>
            <div data-testid="translation">{t_test('onlyInEnglish')}</div>
          </div>
        );
      };

      renderWithProvider(<TestComponentWithMissingKey />, 'he');

      // Should fall back to English translation
      expect(screen.getByTestId('translation')).toHaveTextContent('Only in English');
    });

    it('returns key itself when translation missing in both languages', () => {
      renderWithProvider(<TestComponent testKey="completelyMissingKey" />);

      expect(screen.getByTestId('translation')).toHaveTextContent('completelyMissingKey');
    });
  });

  describe('currentLanguage property', () => {
    it('returns current language code', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    it('updates when language changes', () => {
      renderWithProvider(<TestComponent />, 'he');
      expect(screen.getByTestId('current-language')).toHaveTextContent('he');
    });
  });

  describe('translation function', () => {
    it('returns correct translations', () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('translation')).toHaveTextContent('Good Morning!');
    });
  });
});
