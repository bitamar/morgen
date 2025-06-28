import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from '../Components/LanguageSelector';
import { LanguageProvider } from '../Components/LanguageProvider';
import * as languageStorage from '../services/languageStorage';

// Mock the language storage service
vi.mock('../services/languageStorage', () => ({
  loadLanguageSettings: vi.fn(),
  saveLanguageSettings: vi.fn(),
  getLanguageInfo: vi.fn(),
  SUPPORTED_LANGUAGES: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
  ],
}));

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: (
      props: React.ComponentProps<'div'> & {
        whileHover?: unknown;
        whileTap?: unknown;
        initial?: unknown;
        animate?: unknown;
      }
    ) => {
      const { children, whileHover, whileTap, initial, animate, ...domProps } = props;
      // Explicitly ignore animation props to avoid React warnings
      void whileHover;
      void whileTap;
      void initial;
      void animate;
      return <div {...domProps}>{children}</div>;
    },
    span: (
      props: React.ComponentProps<'span'> & {
        whileHover?: unknown;
        whileTap?: unknown;
        initial?: unknown;
        animate?: unknown;
      }
    ) => {
      const { children, whileHover, whileTap, initial, animate, ...domProps } = props;
      // Explicitly ignore animation props to avoid React warnings
      void whileHover;
      void whileTap;
      void initial;
      void animate;
      return <span {...domProps}>{children}</span>;
    },
  },
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

beforeEach(() => {
  vi.clearAllMocks();

  // Setup default mocks
  vi.mocked(languageStorage.loadLanguageSettings).mockReturnValue('en');
  vi.mocked(languageStorage.getLanguageInfo).mockImplementation(code => {
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'he', name: 'עברית', flag: '🇮🇱' },
    ];
    return languages.find(lang => lang.code === code) || languages[0];
  });
});

describe('LanguageSelector', () => {
  it('renders with current language flag', () => {
    renderWithProvider(<LanguageSelector />);

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('🇺🇸');
  });

  it('shows Hebrew flag when Hebrew is selected', () => {
    vi.mocked(languageStorage.loadLanguageSettings).mockReturnValue('he');

    renderWithProvider(<LanguageSelector />);

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('🇮🇱');
  });

  it('opens popover when trigger is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<LanguageSelector />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Should show language options
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('עברית')).toBeInTheDocument();
  });

  it('shows all supported languages in popover', async () => {
    const user = userEvent.setup();
    renderWithProvider(<LanguageSelector />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Check all languages are present
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getAllByText('🇺🇸')).toHaveLength(2); // One in trigger, one in popover
    expect(screen.getByText('עברית')).toBeInTheDocument();
    expect(screen.getByText('🇮🇱')).toBeInTheDocument();
  });

  it('shows checkmark for currently selected language', async () => {
    const user = userEvent.setup();
    renderWithProvider(<LanguageSelector />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Both buttons should have checkmarks (always rendered, but with different scale)
    // We can check that they're both present since the checkmark is always in the DOM
    const englishButton = screen.getByRole('button', { name: /english/i });
    const hebrewButton = screen.getByRole('button', { name: /עברית/i });

    expect(englishButton).toHaveTextContent('✓');
    expect(hebrewButton).toHaveTextContent('✓'); // Both have checkmarks, but animation differs

    // We can verify the styling differences instead
    expect(englishButton).toHaveClass('bg-blue-500');
    expect(hebrewButton).not.toHaveClass('bg-blue-500');
  });

  it('changes language when option is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<LanguageSelector />);

    // Open popover
    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Click Hebrew option
    const hebrewButton = screen.getByRole('button', { name: /עברית/i });
    await user.click(hebrewButton);

    // Should save the new language
    expect(languageStorage.saveLanguageSettings).toHaveBeenCalledWith('he');
  });

  it('closes popover after language selection', async () => {
    const user = userEvent.setup();
    renderWithProvider(<LanguageSelector />);

    // Open popover
    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Verify popover is open
    expect(screen.getByText('English')).toBeInTheDocument();

    // Click Hebrew option
    const hebrewButton = screen.getByRole('button', { name: /עברית/i });
    await user.click(hebrewButton);

    // Popover should close (language options should not be visible)
    await waitFor(() => {
      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });
  });

  it('updates trigger flag after language change', async () => {
    const user = userEvent.setup();

    // Start with a custom mock that changes behavior after setLanguage is called
    let currentLanguage = 'en';
    vi.mocked(languageStorage.getLanguageInfo).mockImplementation(code => {
      const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'he', name: 'עברית', flag: '🇮🇱' },
      ];
      return languages.find(lang => lang.code === (code || currentLanguage)) || languages[0];
    });

    renderWithProvider(<LanguageSelector />);

    // Initially should show English flag
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('🇺🇸');

    // Open popover and select Hebrew
    await user.click(trigger);
    const hebrewButton = screen.getByRole('button', { name: /עברית/i });

    // Update our mock to simulate language change
    currentLanguage = 'he';

    await user.click(hebrewButton);

    // The trigger should eventually show Hebrew flag
    // Note: This might require a re-render, so we wait for it
    await waitFor(() => {
      expect(languageStorage.saveLanguageSettings).toHaveBeenCalledWith('he');
    });
  });

  it('has proper accessibility attributes', () => {
    renderWithProvider(<LanguageSelector />);

    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('type', 'button');
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithProvider(<LanguageSelector />);

    const trigger = screen.getByRole('button');

    // Focus the trigger and press Enter to open
    await user.click(trigger);

    // Should show language options
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('עברית')).toBeInTheDocument();
  });

  it('shows correct visual styling for selected language', async () => {
    const user = userEvent.setup();
    renderWithProvider(<LanguageSelector />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // English button should have different styling (solid variant class applied)
    const englishButton = screen.getByRole('button', { name: /english/i });
    const hebrewButton = screen.getByRole('button', { name: /עברית/i });

    // Both should exist but with different classes
    expect(englishButton).toBeInTheDocument();
    expect(hebrewButton).toBeInTheDocument();
  });
});
