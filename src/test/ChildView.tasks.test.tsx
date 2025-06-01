import { vi } from 'vitest';

const mockDate = new Date('2024-03-20T07:00:00');
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChildView from '../Components/ChildView';

describe('ChildView Tasks', () => {
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
    vi.useRealTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('shows correct progress information', async () => {
    render(
      <ChildView child={mockChild} onUpdateChild={mockOnUpdateChild} onEditMode={mockOnEditMode} />
    );
    expect(await screen.findByText('Progress: 0/2 tasks')).toBeInTheDocument();
    expect(await screen.findByText('0%')).toBeInTheDocument();
  });

  it('updates progress when tasks are completed', async () => {
    render(
      <ChildView child={mockChild} onUpdateChild={mockOnUpdateChild} onEditMode={mockOnEditMode} />
    );

    const task = await screen.findByText('Brush teeth');
    await userEvent.click(task);
    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockOnUpdateChild).toHaveBeenCalledWith({
        ...mockChild,
        tasks: [
          { id: 'task1', title: 'Brush teeth', emoji: '🦷', done: true },
          { id: 'task2', title: 'Get dressed', emoji: '👕', done: false },
        ],
      });
    });
  });

  it('triggers completion celebration when all tasks are done', async () => {
    const childWithOneTask = {
      ...mockChild,
      tasks: [{ id: 'task1', title: 'Brush teeth', emoji: '🦷', done: false }],
    };

    render(
      <ChildView
        child={childWithOneTask}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    const task = await screen.findByText('Brush teeth');
    await userEvent.click(task);
    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockOnUpdateChild).toHaveBeenCalledWith({
        ...childWithOneTask,
        tasks: [{ id: 'task1', title: 'Brush teeth', emoji: '🦷', done: true }],
      });
    });
  });

  it('displays completion celebration UI when all tasks are done', async () => {
    const childWithCompletedTask = {
      ...mockChild,
      tasks: [{ id: 'task1', title: 'Brush teeth', emoji: '🦷', done: true }],
    };

    render(
      <ChildView
        child={childWithCompletedTask}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    expect(await screen.findByText(/All Done/i)).toBeInTheDocument();
    expect(await screen.findByText(/Fantastic work!/i)).toBeInTheDocument();
  });

  it('handles empty tasks array', async () => {
    const childWithEmptyTasks = {
      ...mockChild,
      tasks: [],
    };

    render(
      <ChildView
        child={childWithEmptyTasks}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    expect(await screen.findByText('No tasks yet!')).toBeInTheDocument();
  });

  it('handles task toggle with empty tasks array', async () => {
    const childWithEmptyTasks = {
      ...mockChild,
      tasks: [],
    };

    render(
      <ChildView
        child={childWithEmptyTasks}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    const addTasksBtn = await screen.findByRole('button', { name: /add tasks/i });
    await userEvent.click(addTasksBtn);
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockOnEditMode).toHaveBeenCalled();
  });

  it('shows correct progress percentage for partial completion', async () => {
    const childWithPartialCompletion = {
      ...mockChild,
      tasks: [
        { id: 'task1', title: 'Brush teeth', emoji: '🦷', done: true },
        { id: 'task2', title: 'Get dressed', emoji: '👕', done: false },
      ],
    };

    render(
      <ChildView
        child={childWithPartialCompletion}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    expect(await screen.findByText('Progress: 1/2 tasks')).toBeInTheDocument();
    expect(await screen.findByText('50%')).toBeInTheDocument();
  });

  it('hides progress bar when no tasks exist', async () => {
    const childWithoutTasks = {
      ...mockChild,
      tasks: [],
    };

    render(
      <ChildView
        child={childWithoutTasks}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    await waitFor(async () => {
      expect(screen.queryByText(/Progress:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });
  });
});
