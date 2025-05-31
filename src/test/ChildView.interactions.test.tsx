// Mock the current time before imports
const mockDate = new Date('2024-03-20T07:00:00');
import { vi } from 'vitest';
vi.setSystemTime(mockDate);

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('opens edit mode when settings button is clicked', async () => {
    render(
      <ChildView
        child={mockChild}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(mockOnEditMode).toHaveBeenCalled();
  });

  it('opens edit mode when Add Tasks button is clicked', async () => {
    render(
      <ChildView
        child={{ ...mockChild, tasks: [] }}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /Add Tasks/i }));
    expect(mockOnEditMode).toHaveBeenCalled();
  });

  it('marks a task as done when clicked', async () => {
    render(
      <ChildView
        child={mockChild}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    await userEvent.click(screen.getByText('Brush teeth'));
    expect(mockOnUpdateChild).toHaveBeenCalledWith({
      ...mockChild,
      tasks: [
        { id: 'task1', title: 'Brush teeth', emoji: '🦷', done: true },
        { id: 'task2', title: 'Get dressed', emoji: '👕', done: false }
      ]
    });
  });

  it('marks a completed task as not done when clicked', async () => {
    render(
      <ChildView
        child={{
          ...mockChild,
          tasks: [
            { id: 'task1', title: 'Brush teeth', emoji: '🦷', done: true },
            { id: 'task2', title: 'Get dressed', emoji: '👕', done: false }
          ]
        }}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    await userEvent.click(screen.getByText('Brush teeth'));
    expect(mockOnUpdateChild).toHaveBeenCalledWith({
      ...mockChild,
      tasks: [
        { id: 'task1', title: 'Brush teeth', emoji: '🦷', done: false },
        { id: 'task2', title: 'Get dressed', emoji: '👕', done: false }
      ]
    });
  });

  it('dismisses completion celebration when clicked', async () => {
    render(
      <ChildView
        child={{
          ...mockChild,
          tasks: [{ id: 'task1', title: 'Brush teeth', emoji: '🦷', done: true }]
        }}
        onUpdateChild={mockOnUpdateChild}
        onEditMode={mockOnEditMode}
      />
    );

    // Click the celebration overlay
    await userEvent.click(screen.getByText(/All Done/i).closest('div[class*="fixed inset-0"]')!);
    
    // Wait for the celebration to be removed from the DOM
    await waitFor(() => {
      expect(screen.queryByText(/All Done/i)).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });
}); 