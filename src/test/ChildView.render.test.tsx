// Mock the current time before imports
const mockDate = new Date('2024-03-20T07:00:00');
import { vi } from 'vitest';
vi.setSystemTime(mockDate);

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChildView from '../Components/ChildView';

describe('ChildView Rendering', () => {
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

  it('renders child information correctly', () => {
    render(
      <ChildView child={mockChild} onUpdateChild={mockOnUpdateChild} onEditMode={mockOnEditMode} />
    );

    expect(screen.getByText("Test Child's Morning!")).toBeInTheDocument();
    expect(screen.getByText('Brush teeth')).toBeInTheDocument();
    expect(screen.getByText('Get dressed')).toBeInTheDocument();
    expect(screen.getByText('👶')).toBeInTheDocument();
  });

  it('shows empty state when no tasks are present', () => {
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

    expect(screen.getByText('No tasks yet!')).toBeInTheDocument();
    expect(screen.getByText('Add Tasks')).toBeInTheDocument();
  });
});
