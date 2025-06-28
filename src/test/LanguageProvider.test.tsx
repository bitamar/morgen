import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LanguageProvider } from '../Components/LanguageProvider';
import { useLanguage } from '../context/language';
import * as languageStorage from '../services/languageStorage';

// Mock the language storage service
vi.mock('../services/languageStorage', () => ({
  loadLanguageSettings: vi.fn(),
  saveLanguageSettings: vi.fn(),
  getLanguageInfo: vi.fn(),
}));

// Test component that uses the useLanguage hook
const TestComponent = () => {
  const { currentLanguage, setLanguage, getLanguageInfo } = useLanguage();
  const languageInfo = getLanguageInfo();

  return (
    <div>
      <div data-testid="current-language">{currentLanguage}</div>
      <div data-testid="language-info">{JSON.stringify(languageInfo)}</div>
      <button data-testid="change-language" onClick={() => setLanguage('he')}>
        Change to Hebrew
      </button>
    </div>
  );
};

const TestComponentOutsideProvider = () => {
  try {
    useLanguage();
    return <div>Should not render</div>;
  } catch (error) {
    return <div data-testid="error">{(error as Error).message}</div>;
  }
};

beforeEach(() => {
  vi.clearAllMocks();

  // Setup default mocks
  vi.mocked(languageStorage.loadLanguageSettings).mockReturnValue('en');
  vi.mocked(languageStorage.getLanguageInfo).mockReturnValue({
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
  });
});

describe('LanguageProvider', () => {
  it('provides initial language from storage', () => {
    vi.mocked(languageStorage.loadLanguageSettings).mockReturnValue('he');
    vi.mocked(languageStorage.getLanguageInfo).mockReturnValue({
      code: 'he',
      name: 'עברית',
      flag: '🇮🇱',
    });

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-language')).toHaveTextContent('he');
    expect(languageStorage.loadLanguageSettings).toHaveBeenCalled();
  });

  it('saves language to storage when language changes', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    act(() => {
      screen.getByTestId('change-language').click();
    });

    expect(languageStorage.saveLanguageSettings).toHaveBeenCalledWith('he');
  });

  it('updates current language when setLanguage is called', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Initially should be 'en'
    expect(screen.getByTestId('current-language')).toHaveTextContent('en');

    // Change language
    act(() => {
      screen.getByTestId('change-language').click();
    });

    // Should update to 'he'
    expect(screen.getByTestId('current-language')).toHaveTextContent('he');
  });

  it('calls getLanguageInfo with current language', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Change language to trigger getLanguageInfo call
    act(() => {
      screen.getByTestId('change-language').click();
    });

    // Should call getLanguageInfo with the new language
    expect(languageStorage.getLanguageInfo).toHaveBeenCalledWith('he');
  });

  it('provides language info through getLanguageInfo function', () => {
    const mockLanguageInfo = {
      code: 'en',
      name: 'English',
      flag: '🇺🇸',
    };

    vi.mocked(languageStorage.getLanguageInfo).mockReturnValue(mockLanguageInfo);

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('language-info')).toHaveTextContent(JSON.stringify(mockLanguageInfo));
  });

  it('loads language settings on mount', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(languageStorage.loadLanguageSettings).toHaveBeenCalled();
  });

  it('saves language settings when language changes', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Clear initial calls
    vi.clearAllMocks();

    act(() => {
      screen.getByTestId('change-language').click();
    });

    expect(languageStorage.saveLanguageSettings).toHaveBeenCalledWith('he');
  });
});

describe('useLanguage hook', () => {
  it('throws error when used outside LanguageProvider', () => {
    render(<TestComponentOutsideProvider />);

    expect(screen.getByTestId('error')).toHaveTextContent(
      'useLanguage must be used within a LanguageProvider'
    );
  });

  it('returns context value when used within LanguageProvider', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Should not throw and should render the component
    expect(screen.getByTestId('current-language')).toBeInTheDocument();
    expect(screen.getByTestId('change-language')).toBeInTheDocument();
  });
});
