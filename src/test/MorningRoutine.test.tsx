import { describe, it, expect, vi, beforeEach, MockInstance } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { LanguageProvider } from '../Components/LanguageProvider';

vi.mock('../services/peopleStorage', () => ({ loadChildren: vi.fn(), saveChildren: vi.fn() }));

vi.mock('framer-motion', () => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  return {
    motion: {
      div: ({ children, ...props }: { children: React.ReactNode; [_key: string]: unknown }) => {
        // Remove framer-motion specific props but keep HTML attributes
        const {
          initial,
          animate,
          exit,
          transition,
          whileHover,
          whileTap,
          whileInView,
          layout,
          layoutId,
          ...htmlProps
        } = props;
        return <div {...htmlProps}>{children}</div>;
      },
      button: ({ children, ...props }: { children: React.ReactNode; [_key: string]: unknown }) => {
        // Remove framer-motion specific props but keep HTML attributes
        const {
          initial,
          animate,
          exit,
          transition,
          whileHover,
          whileTap,
          whileInView,
          layout,
          layoutId,
          ...htmlProps
        } = props;
        return <button {...htmlProps}>{children}</button>;
      },
      span: ({ children, ...props }: { children: React.ReactNode; [_key: string]: unknown }) => {
        // Remove framer-motion specific props but keep HTML attributes
        const {
          initial,
          animate,
          exit,
          transition,
          whileHover,
          whileTap,
          whileInView,
          layout,
          layoutId,
          ...htmlProps
        } = props;
        return <span {...htmlProps}>{children}</span>;
      },
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

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

const renderWithProviders = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.setSystemTime(new Date('2024-03-20T07:00:00'));
  vi.useRealTimers();
});

describe('MorningRoutine', () => {
  it('loads default children when loadChildren returns defaults', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    await waitFor(() => {
      expect(screen.getByText(/Maya/i)).toBeInTheDocument();
      expect(screen.getByText(/Brush teeth/i)).toBeInTheDocument();
    });
  });

  it('shows loading screen when no children are available', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue([]);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    expect(screen.getByText('Loading Morning Routine...')).toBeInTheDocument();
    expect(screen.getByText('Setting up your day!')).toBeInTheDocument();
    expect(screen.getByText('🌅')).toBeInTheDocument();
  });

  it('navigates to next child when next button is clicked', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    // Verify initial child (Maya) is shown
    expect(await screen.findByText(/Maya/i)).toBeInTheDocument();

    // Click next button
    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    // Verify next child (Alex) is shown
    expect(await screen.findByText(/Alex/i)).toBeInTheDocument();
  });

  it('navigates when clicking on navigation dots', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    // Verify initial child (Maya) is shown
    expect(await screen.findByText(/Maya/i)).toBeInTheDocument();

    // Click on second dot to navigate to Alex
    const dots = document.querySelectorAll('.w-3.h-3.rounded-full');
    await userEvent.click(dots[1]);

    // Verify second child (Alex) is shown
    expect(await screen.findByText(/Alex/i)).toBeInTheDocument();
  });

  it('handles touch swipe right to go to next child', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    const container = document.querySelector('.min-h-screen.relative.overflow-hidden')!;

    // Verify initial child (Maya) is shown
    expect(await screen.findByText(/Maya/i)).toBeInTheDocument();

    // Simulate swipe right (start at x=100, end at x=0 - swipe distance > 50)
    fireEvent.touchStart(container, {
      touches: [{ clientX: 100, clientY: 0 }],
      targetTouches: [{ clientX: 100, clientY: 0 }],
      changedTouches: [{ clientX: 100, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 0, clientY: 0 }],
      targetTouches: [{ clientX: 0, clientY: 0 }],
      changedTouches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchEnd(container);

    // Should navigate to next child
    expect(await screen.findByText(/Alex/i)).toBeInTheDocument();
  });

  it('ignores swipe when distance is too small', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    const container = document.querySelector('.min-h-screen.relative.overflow-hidden')!;

    // Verify initial child (Maya) is shown
    expect(await screen.findByText(/Maya/i)).toBeInTheDocument();

    // Simulate small swipe (distance < 50)
    fireEvent.touchStart(container, {
      touches: [{ clientX: 25, clientY: 0 }],
      targetTouches: [{ clientX: 25, clientY: 0 }],
      changedTouches: [{ clientX: 25, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 0, clientY: 0 }],
      targetTouches: [{ clientX: 0, clientY: 0 }],
      changedTouches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchEnd(container);

    // Should still be on Maya
    expect(screen.getByText(/Maya/i)).toBeInTheDocument();
  });

  it('ignores swipe when only one child exists', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue([defaultChildren[0]]);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    const container = document.querySelector('.min-h-screen.relative.overflow-hidden')!;

    // Verify Maya is shown
    expect(await screen.findByText(/Maya/i)).toBeInTheDocument();

    // Simulate swipe
    fireEvent.touchStart(container, {
      touches: [{ clientX: 100, clientY: 0 }],
      targetTouches: [{ clientX: 100, clientY: 0 }],
      changedTouches: [{ clientX: 100, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 0, clientY: 0 }],
      targetTouches: [{ clientX: 0, clientY: 0 }],
      changedTouches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchEnd(container);

    // Should still be on Maya (no navigation when only one child)
    expect(screen.getByText(/Maya/i)).toBeInTheDocument();
  });

  it('ignores touch events when child manager is open', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    // Open child manager
    const usersButton = document.querySelector('.fixed.bottom-4.right-4 button')!;
    await userEvent.click(usersButton);

    const container = document.querySelector('.min-h-screen.relative.overflow-hidden')!;

    // Try to swipe while child manager is open
    fireEvent.touchStart(container, {
      touches: [{ clientX: 100, clientY: 0 }],
      targetTouches: [{ clientX: 100, clientY: 0 }],
      changedTouches: [{ clientX: 100, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 0, clientY: 0 }],
      targetTouches: [{ clientX: 0, clientY: 0 }],
      changedTouches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchEnd(container);

    // Should ignore swipe
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens edit mode when settings button is clicked', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    await userEvent.click(settingsButton);

    // Edit mode should open - check for edit form elements
    expect(screen.getByDisplayValue('Maya')).toBeInTheDocument();
  });

  it('opens the child-manager modal when the users button is clicked', async () => {
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    const usersButton = document.querySelector('.fixed.bottom-4.right-4 button')!;
    await userEvent.click(usersButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('calls saveChildren when a task is toggled', async () => {
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    const task = await screen.findByText(/Brush teeth/i);
    await userEvent.click(task);

    await waitFor(() => {
      expect(childrenService.saveChildren).toHaveBeenCalled();
      const saved = (childrenService.saveChildren as unknown as MockInstance).mock.calls[0][0];
      expect(saved[0].tasks[0].done).toBe(true);
    });
  });

  it('does not show navigation when there is only one child', async () => {
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue([defaultChildren[0]]);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    renderWithProviders(<MorningRoutine />);

    // Navigation buttons and dots should not be visible
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(document.querySelectorAll('.w-3.h-3.rounded-full')).toHaveLength(0);
  });
});
