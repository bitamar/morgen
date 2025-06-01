import { describe, it, expect, vi, beforeEach, MockInstance } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../services/peopleStorage', () => ({
  loadChildren: vi.fn(),
  saveChildren: vi.fn(),
}));
import * as childrenService from '../services/peopleStorage';

const defaultChildren = [
  {
    id: 'maya',
    name: 'Maya',
    avatar: '👧',
    wakeUpTime: '07:00',
    busTime: '07:45',
    tasks: [
      { id: 'brush', title: 'Brush teeth', emoji: '🦷', done: false },
      { id: 'dress', title: 'Get dressed', emoji: '👕', done: false },
    ],
  },
  {
    id: 'alex',
    name: 'Alex',
    avatar: '👦',
    wakeUpTime: '07:15',
    busTime: '08:00',
    tasks: [{ id: 'wash', title: 'Wash face', emoji: '🧼', done: false }],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.setSystemTime(new Date('2024-03-20T07:00:00'));
  vi.useRealTimers();
});

describe('MorningRoutine', () => {
  it('loads default children when loadChildren returns defaults', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    render(<MorningRoutine />);

    await waitFor(() => {
      expect(screen.getByText(/Maya/i)).toBeInTheDocument();
      expect(screen.getByText(/Brush teeth/i)).toBeInTheDocument();
    });
  });

  it('navigates to next child when next button is clicked', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    render(<MorningRoutine />);

    // Verify initial child (Maya) is shown
    expect(await screen.findByText(/Maya/i)).toBeInTheDocument();

    // Click next button
    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    // Verify next child (Alex) is shown
    expect(await screen.findByText(/Alex/i)).toBeInTheDocument();
  });

  it('opens the child-manager modal when the users button is clicked', async () => {
    const MorningRoutine = (await import('../MorningRoutine')).default;

    render(<MorningRoutine />);

    const usersButton = document.querySelector('.fixed.bottom-4.right-4 button')!;
    await userEvent.click(usersButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('calls saveChildren when a task is toggled', async () => {
    const MorningRoutine = (await import('../MorningRoutine')).default;

    render(<MorningRoutine />);

    const task = await screen.findByText(/Brush teeth/i);
    await userEvent.click(task);

    await waitFor(() => {
      expect(childrenService.saveChildren).toHaveBeenCalled();
      const saved = (childrenService.saveChildren as unknown as MockInstance).mock.calls[0][0];
      expect(saved[0].tasks[0].done).toBe(true);
    });
  });
});
