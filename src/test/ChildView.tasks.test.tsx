// Mock the current time before imports
const mockDate = new Date('2024-03-20T07:00:00');
import { vi } from 'vitest';
vi.setSystemTime(mockDate);

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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
      { id: 'task2', title: 'Get dressed', emoji: '👕', done: false }
    ]
  };

  const mockOnUpdateChild = vi.fn();
  const mockOnEditMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(mockDate);
  });

  it('shows correct progress information', () => {
    render(
      <ChildView
        child={mockChild}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    expect(screen.getByText('Progress: 0/2 tasks')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('updates progress when tasks are completed', async () => {
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
  });

  it('triggers completion celebration when all tasks are done', async () => {
    const childWithOneTask = {
      ...mockChild,
      tasks: [{ id: 'task1', title: 'Brush teeth', emoji: '🦷', done: false }]
    };

    render(
      <ChildView
        child={childWithOneTask}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    const task = screen.getByText('Brush teeth');
    await userEvent.click(task);

    expect(mockOnUpdateChild).toHaveBeenCalledWith({
      ...childWithOneTask,
      tasks: [{ id: 'task1', title: 'Brush teeth', emoji: '🦷', done: true }]
    });
  });

  it('displays completion celebration UI when all tasks are done', () => {
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

    expect(screen.getByText(/All Done/i)).toBeInTheDocument();
    expect(screen.getByText(/Fantastic work!/i)).toBeInTheDocument();
  });

  it('handles empty tasks array', () => {
    const childWithEmptyTasks = {
      ...mockChild,
      tasks: []
    };

    render(
      <ChildView
        child={childWithEmptyTasks}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    expect(screen.getByText('No tasks yet!')).toBeInTheDocument();
  });

  it('handles task toggle with empty tasks array', async () => {
    const childWithEmptyTasks = {
      ...mockChild,
      tasks: []
    };

    render(
      <ChildView
        child={childWithEmptyTasks}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    // Should not throw when trying to toggle tasks
    await act(async () => {
      await userEvent.click(screen.getByText('Add Tasks'));
    });

    expect(mockOnEditMode).toHaveBeenCalled();
  });

  it('shows correct progress percentage for partial completion', () => {
    const childWithPartialCompletion = {
      ...mockChild,
      tasks: [
        { id: 'task1', title: 'Brush teeth', emoji: '🦷', done: true },
        { id: 'task2', title: 'Get dressed', emoji: '👕', done: false }
      ]
    };

    render(
      <ChildView
        child={childWithPartialCompletion}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    expect(screen.getByText('Progress: 1/2 tasks')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('hides progress bar when no tasks exist', () => {
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

    expect(screen.queryByText(/Progress:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('dismisses completion celebration after timeout', async () => {
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

    // Advance time by 3 seconds
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Celebration should be dismissed
    expect(screen.queryByText(/All Done/i)).not.toBeInTheDocument();
  });
}); 