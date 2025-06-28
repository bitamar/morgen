// Mock the current time before imports
const mockDate = new Date('2024-03-20T07:00:00');
import { vi } from 'vitest';
vi.setSystemTime(mockDate);

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChildView from '../Components/ChildView';
import { LanguageProvider } from '../Components/LanguageProvider';

// Test wrapper component that provides the LanguageProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('ChildView Bus Timing', () => {
  const mockChild = {
    id: 'test-child',
    name: 'Test Child',
    avatar: '👶',
    wakeUpTime: '07:00',
    busTime: '07:45',
    tasks: [
      { id: 'task1', title: 'Brush teeth', emoji: '🦷', done: false },
      { id: 'task2', title: 'Get dressed', emoji: '👕', done: false },
    ],
  };

  const mockOnUpdateChild = vi.fn();
  const mockOnEditMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(mockDate);
  });

  it('shows correct bus countdown', () => {
    render(
      <TestWrapper>
        <ChildView
          child={mockChild}
          onUpdateChild={mockOnUpdateChild}
          onEditMode={mockOnEditMode}
        />
      </TestWrapper>
    );

    // At 7:00 AM, bus is at 7:45 AM, should show "Bus in 45m 0s"
    expect(screen.getByText('Bus in 45m 0s')).toBeInTheDocument();
  });

  it('shows "Bus time!" when bus time is reached', () => {
    // Set time to 7:45 AM
    vi.setSystemTime(new Date('2024-03-20T07:45:00'));

    render(
      <TestWrapper>
        <ChildView
          child={mockChild}
          onUpdateChild={mockOnUpdateChild}
          onEditMode={mockOnEditMode}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Bus time!')).toBeInTheDocument();
  });

  it('shows "Bus has left" when bus time is more than 30 minutes past', () => {
    // Set time to 8:16 AM (more than 30 minutes after 7:45)
    vi.setSystemTime(new Date('2024-03-20T08:16:00'));

    render(
      <TestWrapper>
        <ChildView
          child={mockChild}
          onUpdateChild={mockOnUpdateChild}
          onEditMode={mockOnEditMode}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Bus has left')).toBeInTheDocument();
  });

  it('handles no bus time set', () => {
    const childWithoutBusTime = {
      ...mockChild,
      busTime: '',
    };

    render(
      <TestWrapper>
        <ChildView
          child={childWithoutBusTime}
          onUpdateChild={mockOnUpdateChild}
          onEditMode={mockOnEditMode}
        />
      </TestWrapper>
    );

    expect(screen.queryByText(/Bus in/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bus time!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bus has left/i)).not.toBeInTheDocument();
  });

  it('shows hours in countdown when more than an hour away', () => {
    // Set time to 6:00 AM
    vi.setSystemTime(new Date('2024-03-20T06:00:00'));

    render(
      <TestWrapper>
        <ChildView
          child={mockChild}
          onUpdateChild={mockOnUpdateChild}
          onEditMode={mockOnEditMode}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Bus in 1h 45m')).toBeInTheDocument();
  });

  it('shows only seconds when less than a minute away', () => {
    // Set time to 7:44:30 AM
    vi.setSystemTime(new Date('2024-03-20T07:44:30'));

    render(
      <TestWrapper>
        <ChildView
          child={mockChild}
          onUpdateChild={mockOnUpdateChild}
          onEditMode={mockOnEditMode}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/Bus in \d+s/)).toBeInTheDocument();
  });

  it('applies warning styles when bus time is approaching or passed', () => {
    // Set time to 7:45 AM
    vi.setSystemTime(new Date('2024-03-20T07:45:00'));

    render(
      <TestWrapper>
        <ChildView
          child={mockChild}
          onUpdateChild={mockOnUpdateChild}
          onEditMode={mockOnEditMode}
        />
      </TestWrapper>
    );

    const busBadge = screen.getByText('Bus time!').closest('.flex');
    expect(busBadge).toHaveClass('bg-red-100', 'text-red-700', 'border-red-300');
  });
});
