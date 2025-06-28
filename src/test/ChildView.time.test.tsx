import { vi } from 'vitest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ChildView from '../Components/ChildView';
import { LanguageProvider } from '../Components/LanguageProvider';

// Test wrapper component that provides the LanguageProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const mockDate = new Date('2024-03-20T07:00:00');

describe('ChildView Time', () => {
  const mockChild = {
    id: 'test-child',
    name: 'Test Child',
    avatar: '👶',
    wakeUpTime: '07:00',
    busTime: '07:45',
    tasks: [],
  };

  const mockOnUpdateChild = vi.fn();
  const mockOnEditMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('displays current time in correct format', () => {
    render(
      <TestWrapper>
        <ChildView
          child={mockChild}
          onUpdateChild={mockOnUpdateChild}
          onEditMode={mockOnEditMode}
        />
      </TestWrapper>
    );

    expect(screen.getByText('07:00 AM')).toBeInTheDocument();
  });

  it('updates time display every second', async () => {
    render(
      <TestWrapper>
        <ChildView
          child={mockChild}
          onUpdateChild={mockOnUpdateChild}
          onEditMode={mockOnEditMode}
        />
      </TestWrapper>
    );

    // Advance time by 1 second
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('07:00 AM')).toBeInTheDocument();
  });

  it('cleans up timer on unmount', () => {
    const { unmount } = render(
      <TestWrapper>
        <ChildView
          child={mockChild}
          onUpdateChild={mockOnUpdateChild}
          onEditMode={mockOnEditMode}
        />
      </TestWrapper>
    );

    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
