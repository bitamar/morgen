// Mock AudioContext and Audio before importing the component
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  })),
  destination: {},
  currentTime: 0,
};

Object.defineProperty(window, 'AudioContext', {
  value: vi.fn(() => mockAudioContext),
});
Object.defineProperty(window, 'Audio', {
  value: vi.fn(() => ({ play: vi.fn(), pause: vi.fn() })),
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '../Components/TaskCard';

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
  });

  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} onToggle={mockOnToggle} />);

    expect(screen.getByText('Brush teeth')).toBeInTheDocument();
    expect(screen.getByText('🦷')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    render(<TaskCard task={mockTask} onToggle={mockOnToggle} />);

    const card = screen.getByText('Brush teeth').closest('div[role="button"]');
    await userEvent.click(card!);

    expect(mockOnToggle).toHaveBeenCalledWith('task1');
  });

  it('shows completion state when task is done', () => {
    const completedTask = { ...mockTask, done: true };
    render(<TaskCard task={completedTask} onToggle={mockOnToggle} />);

    expect(screen.getByText('Great job! ✨')).toBeInTheDocument();
    expect(screen.getByText('Brush teeth')).toHaveClass('line-through');
  });

  it('does not trigger celebration when marking task as incomplete', async () => {
    const completedTask = { ...mockTask, done: true };
    render(<TaskCard task={completedTask} onToggle={mockOnToggle} />);

    const card = screen.getByText('Brush teeth').closest('div[role="button"]');
    await userEvent.click(card!);

    expect(mockOnToggle).toHaveBeenCalledWith('task1');
    // No celebration emoji should be shown
    expect(screen.queryByText(/[🎉✨🌟🎊💫🎈]/)).not.toBeInTheDocument();
  });

  it('triggers celebration when marking task as complete', async () => {
    render(<TaskCard task={mockTask} onToggle={mockOnToggle} />);

    const card = screen.getByText('Brush teeth').closest('div[role="button"]');
    await userEvent.click(card!);

    // Celebration emoji should be shown
    expect(screen.getByText(/[🎉✨🌟🎊💫🎈]/)).toBeInTheDocument();
  });

  it('plays sound when marking task as complete', async () => {
    render(<TaskCard task={mockTask} onToggle={mockOnToggle} />);

    const card = screen.getByText('Brush teeth').closest('div[role="button"]');
    await userEvent.click(card!);

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', async () => {
    render(<TaskCard task={mockTask} onToggle={mockOnToggle} disabled={true} />);

    const card = screen.getByText('Brush teeth').closest('div[role="button"]');
    expect(card).toHaveClass('opacity-50');
    expect(card).toHaveClass('cursor-not-allowed');

    await userEvent.click(card!);
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('shows different background colors for completed and incomplete tasks', () => {
    const { rerender } = render(<TaskCard task={mockTask} onToggle={mockOnToggle} />);

    // Incomplete task should have blue gradient
    const card = screen.getByText('Brush teeth').closest('div[role="button"]');
    expect(card).toHaveClass('from-blue-50');
    expect(card).toHaveClass('to-indigo-50');

    // Complete task should have green gradient
    const completedTask = { ...mockTask, done: true };
    rerender(<TaskCard task={completedTask} onToggle={mockOnToggle} />);
    expect(card).toHaveClass('from-green-100');
    expect(card).toHaveClass('to-emerald-100');
  });

  it('shows checkmark icon when task is completed', () => {
    const completedTask = { ...mockTask, done: true };
    render(<TaskCard task={completedTask} onToggle={mockOnToggle} />);

    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('shows empty circle when task is incomplete', () => {
    render(<TaskCard task={mockTask} onToggle={mockOnToggle} />);

    expect(screen.getByTestId('empty-circle')).toBeInTheDocument();
  });
});
