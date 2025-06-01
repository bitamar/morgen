// Mock localStorage before importing the component
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MorningRoutine from '../MorningRoutine';

// Mock the current time
const mockDate = new Date('2024-03-20T07:00:00');
vi.setSystemTime(mockDate);

describe('MorningRoutine', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<MorningRoutine />);
    expect(screen.getByText('Loading Morning Routine...')).toBeInTheDocument();
  });

  it('loads default children when no data in localStorage', () => {
    render(<MorningRoutine />);

    // Wait for the default children to load
    expect(screen.getByText('Maya')).toBeInTheDocument();
    expect(screen.getByText('Brush teeth')).toBeInTheDocument();
  });

  it('loads saved children from localStorage', () => {
    const savedData = {
      children: [
        {
          id: 'test-child',
          name: 'Test Child',
          avatar: '👶',
          wakeUpTime: '07:30',
          busTime: '08:00',
          tasks: [{ id: 'task1', title: 'Test Task', emoji: '🎯', done: false }],
        },
      ],
      lastUpdated: new Date().toISOString(),
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

    render(<MorningRoutine />);
    expect(screen.getByText('Test Child')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('navigates between children using buttons', async () => {
    render(<MorningRoutine />);

    // Wait for children to load
    const nextButton = screen.getByRole('button', { name: /next/i });
    const prevButton = screen.getByRole('button', { name: /previous/i });

    // Click next button
    await userEvent.click(nextButton);
    expect(screen.getByText('Alex')).toBeInTheDocument();

    // Click previous button
    await userEvent.click(prevButton);
    expect(screen.getByText('Maya')).toBeInTheDocument();
  });

  it('handles touch swipe navigation', () => {
    render(<MorningRoutine />);

    const container = screen.getByRole('main');

    // Simulate left swipe
    fireEvent.touchStart(container, { touches: [{ clientX: 300 }] });
    fireEvent.touchMove(container, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(container);

    expect(screen.getByText('Alex')).toBeInTheDocument();

    // Simulate right swipe
    fireEvent.touchStart(container, { touches: [{ clientX: 100 }] });
    fireEvent.touchMove(container, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(container);

    expect(screen.getByText('Maya')).toBeInTheDocument();
  });

  it('opens child manager when users button is clicked', async () => {
    render(<MorningRoutine />);

    const usersButton = screen.getByRole('button', { name: /users/i });
    await userEvent.click(usersButton);

    // Check if child manager is opened
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('updates current time display', () => {
    render(<MorningRoutine />);

    // Initial time should be 7:00 AM
    expect(screen.getByText('7:00 AM')).toBeInTheDocument();

    // Update time to 7:30 AM
    vi.setSystemTime(new Date('2024-03-20T07:30:00'));
    act(() => {
      // Force a re-render
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('7:30 AM')).toBeInTheDocument();
  });

  it('saves changes to localStorage when child is updated', async () => {
    render(<MorningRoutine />);

    // Wait for children to load
    const task = screen.getByText('Brush teeth');
    await userEvent.click(task);

    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.children[0].tasks[0].done).toBe(true);
  });
});
