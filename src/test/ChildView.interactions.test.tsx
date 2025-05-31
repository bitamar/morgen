// Mock the current time before imports
const mockDate = new Date('2024-03-20T07:00:00');
import { vi } from 'vitest';
vi.setSystemTime(mockDate);

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChildView from '../Components/ChildView';

describe('ChildView Interactions', () => {
  const mockChild = {
    id: 'test-child',
    name: 'Test Child',
    avatar: '👶',
    wakeUpTime: '07:00',
    busTime: '07:45',
    tasks: [
      { id: 'task1', title: 'Brush teeth', emoji: '🦷', done: false },
      { id: 'task2', title: 'Get dressed', emoji: '👕', done: false }
    ]
  };

  const mockOnUpdateChild = vi.fn();
  const mockOnEditMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(mockDate);
  });

  it('calls onEditMode when settings button is clicked', async () => {
    render(
      <ChildView
        child={mockChild}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await userEvent.click(settingsButton);

    expect(mockOnEditMode).toHaveBeenCalled();
  });

  it('calls onEditMode when Add Tasks button is clicked in empty state', async () => {
    const childWithoutTasks = {
      ...mockChild,
      tasks: []
    };

    render(
      <ChildView
        child={childWithoutTasks}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    const addTasksButton = screen.getByRole('button', { name: /Add Tasks/i });
    await userEvent.click(addTasksButton);

    expect(mockOnEditMode).toHaveBeenCalled();
  });

  it('dismisses completion celebration when clicked', async () => {
    const childWithCompletedTask = {
      ...mockChild,
      tasks: [{ id: 'task1', title: 'Brush teeth', emoji: '🦷', done: true }]
    };

    render(
      <ChildView
        child={childWithCompletedTask}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    // Celebration should be visible initially
    expect(screen.getByText(/All Done/i)).toBeInTheDocument();

    // Click the celebration overlay to dismiss
    const celebrationOverlay = screen.getByRole('presentation');
    await userEvent.click(celebrationOverlay);

    // Celebration should be dismissed
    expect(screen.queryByText(/All Done/i)).not.toBeInTheDocument();
  });

  it('toggles task completion on click', async () => {
    render(
      <ChildView
        child={mockChild}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    const task = screen.getByText('Brush teeth');
    await userEvent.click(task);

    expect(mockOnUpdateChild).toHaveBeenCalledWith({
      ...mockChild,
      tasks: [
        { id: 'task1', title: 'Brush teeth', emoji: '🦷', done: true },
        { id: 'task2', title: 'Get dressed', emoji: '👕', done: false }
      ]
    });

    // Click again to toggle back
    await userEvent.click(task);

    expect(mockOnUpdateChild).toHaveBeenCalledWith({
      ...mockChild,
      tasks: [
        { id: 'task1', title: 'Brush teeth', emoji: '🦷', done: false },
        { id: 'task2', title: 'Get dressed', emoji: '👕', done: false }
      ]
    });
  });
}); 