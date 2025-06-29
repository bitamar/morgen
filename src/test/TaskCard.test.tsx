import { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '../Components/TaskCard';
import { LanguageProvider } from '../Components/LanguageProvider';

// Test wrapper component that provides the LanguageProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

// Silence Framer Motion's enter/exit animations by mocking both `motion.div` and `AnimatePresence` so they render instantly and remove instantly.
vi.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    },
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

// Mock the sound service
vi.mock('../services/SoundService', () => ({
  soundService: {
    playTaskCompletion: vi.fn(),
  },
}));

describe('TaskCard', () => {
  const mockTask = {
    id: 'task1',
    title: 'Brush teeth',
    emoji: '🦷',
    done: false,
  };

  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders task information correctly', () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} onToggle={mockOnToggle} />
      </TestWrapper>
    );

    expect(screen.getByText('Brush teeth')).toBeInTheDocument();
    expect(screen.getByText('🦷')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    vi.useRealTimers();
    render(
      <TestWrapper>
        <TaskCard task={mockTask} onToggle={mockOnToggle} />
      </TestWrapper>
    );

    const card = screen.getByTestId('task-card');
    await userEvent.click(card);

    expect(mockOnToggle).toHaveBeenCalledWith('task1');
  });

  it('shows completion state when task is done', () => {
    const completedTask = { ...mockTask, done: true };
    render(
      <TestWrapper>
        <TaskCard task={completedTask} onToggle={mockOnToggle} />
      </TestWrapper>
    );

    expect(screen.getByText('Great job! ✨')).toBeInTheDocument();
    expect(screen.getByText('Brush teeth')).toHaveClass('line-through');
  });

  it('does not trigger celebration when marking task as incomplete', async () => {
    vi.useRealTimers();
    const completedTask = { ...mockTask, done: true };
    const { rerender } = render(
      <TestWrapper>
        <TaskCard task={completedTask} onToggle={mockOnToggle} />
      </TestWrapper>
    );

    const card = screen.getByTestId('task-card');
    await userEvent.click(card);

    expect(mockOnToggle).toHaveBeenCalledWith('task1');

    // Simulate parent updating the task to incomplete
    rerender(
      <TestWrapper>
        <TaskCard task={{ ...mockTask, done: false }} onToggle={mockOnToggle} />
      </TestWrapper>
    );

    // No celebration image should be shown
    expect(screen.queryByAltText('celebration')).not.toBeInTheDocument();
    // "Great job!" text should be removed
    expect(screen.queryByText('Great job! ✨')).not.toBeInTheDocument();
  });

  it('triggers celebration when marking task as complete', async () => {
    vi.useRealTimers();
    render(
      <TestWrapper>
        <TaskCard task={mockTask} onToggle={mockOnToggle} />
      </TestWrapper>
    );

    const card = screen.getByTestId('task-card');
    await userEvent.click(card);

    // Celebration image should be shown
    expect(screen.getByAltText('celebration')).toBeInTheDocument();

    // Wait for the celebration to be removed
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    // Celebration should be removed after timeout
    expect(screen.queryByAltText('celebration')).not.toBeInTheDocument();
  }, 3000);

  it('is disabled when disabled prop is true', async () => {
    vi.useRealTimers();
    render(
      <TestWrapper>
        <TaskCard task={mockTask} onToggle={mockOnToggle} disabled={true} />
      </TestWrapper>
    );

    const card = screen.getByTestId('task-card');
    expect(card).toHaveClass('opacity-50');
    expect(card).toHaveClass('cursor-not-allowed');

    await userEvent.click(card);
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('shows different background colors for completed and incomplete tasks', () => {
    const { rerender } = render(
      <TestWrapper>
        <TaskCard task={mockTask} onToggle={mockOnToggle} />
      </TestWrapper>
    );

    // Incomplete task should have blue gradient
    const card = screen.getByTestId('task-card');
    expect(card).toHaveClass('from-blue-50');
    expect(card).toHaveClass('to-indigo-50');

    // Complete task should have green gradient
    const completedTask = { ...mockTask, done: true };
    rerender(
      <TestWrapper>
        <TaskCard task={completedTask} onToggle={mockOnToggle} />
      </TestWrapper>
    );
    expect(card).toHaveClass('from-green-100');
    expect(card).toHaveClass('to-emerald-100');
  });

  it('shows checkmark icon when task is completed', () => {
    const completedTask = { ...mockTask, done: true };
    render(
      <TestWrapper>
        <TaskCard task={completedTask} onToggle={mockOnToggle} />
      </TestWrapper>
    );

    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('shows empty circle when task is incomplete', () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} onToggle={mockOnToggle} />
      </TestWrapper>
    );

    expect(screen.getByTestId('empty-circle')).toBeInTheDocument();
  });
});
