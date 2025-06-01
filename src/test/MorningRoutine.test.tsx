import { describe, it, expect, vi, beforeEach, beforeAll, MockInstance } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
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

const savedChildren = [
  {
    id: 'test-child',
    name: 'Test Child',
    avatar: '👶',
    wakeUpTime: '07:30',
    busTime: '08:00',
    tasks: [{ id: 'task1', title: 'Test Task', emoji: '🎯', done: false }],
  },
];

beforeAll(() => {
  class MockAudioContext {
    state = 'running';
    resume = vi.fn().mockResolvedValue(undefined);
    createOscillator = vi.fn().mockReturnValue({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      type: '',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    });
    createGain = vi.fn().mockReturnValue({
      connect: vi.fn(),
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    });
    destination = {};
  }
  // @ts-ignore
  window.AudioContext = MockAudioContext;
  // @ts-ignore
  window.webkitAudioContext = MockAudioContext;
  window.Audio = vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    currentTime: 0,
    loop: false,
    volume: 1,
  }));
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.setSystemTime(new Date('2024-03-20T07:00:00'));
  vi.useRealTimers();
});

describe('MorningRoutine', () => {
  it('loads default children when loadChildren returns defaults', async () => {
    console.log('Test: Loading default children');
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    render(<MorningRoutine />);
    console.log('Component rendered');

    await waitFor(() => {
      console.log('Checking for Maya and Brush teeth text');
      expect(screen.getByText(/Maya/i)).toBeInTheDocument();
      console.log('Found Maya');
      expect(screen.getByText(/Brush teeth/i)).toBeInTheDocument();
      console.log('Found Brush teeth');
    });
    console.log('waitFor completed');
  });

  it('loads persisted children when loadChildren provides them', async () => {
    console.log('Test: Loading persisted children');
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(savedChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    render(<MorningRoutine />);
    console.log('Component rendered');

    const testChild = await screen.findByText(/Test Child/i);
    console.log('Found Test Child:', !!testChild);
    expect(testChild).toBeInTheDocument();
    const testTask = screen.getByText(/Test Task/i);
    console.log('Found Test Task:', !!testTask);
    expect(testTask).toBeInTheDocument();
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
    console.log('Test: Opening child manager modal');
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    render(<MorningRoutine />);
    console.log('Component rendered');

    const usersButton = document.querySelector('.fixed.bottom-4.right-4 button')!;
    console.log('Found users button:', !!usersButton);
    await userEvent.click(usersButton);
    console.log('Clicked users button');

    const dialog = await screen.findByRole('dialog');
    console.log('Found dialog:', !!dialog);
    expect(dialog).toBeInTheDocument();
  });

  it('updates displayed time when time changes', async () => {
    console.log('Starting time update test');
    vi.useFakeTimers();
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    console.log('Rendering component');
    render(<MorningRoutine />);

    // Verify initial time
    console.log('Checking initial time');
    const initialTime = screen.getByText(/7:00 AM/i);
    console.log('Initial time element:', initialTime);
    expect(initialTime).toBeInTheDocument();

    // Advance time by 30 minutes
    console.log('Advancing time to 07:30');
    vi.setSystemTime(new Date('2024-03-20T07:30:00'));
    console.log('Current system time:', new Date().toLocaleTimeString());
    
    console.log('Advancing timers');
    vi.advanceTimersByTime(1000);
    console.log('Timers advanced');

    // Verify updated time
    console.log('Checking updated time');
    const updatedTime = screen.getByText(/7:30 AM/i);
    console.log('Updated time element:', updatedTime);
    expect(updatedTime).toBeInTheDocument();
  });

  it('calls saveChildren when a task is toggled', async () => {
    console.log('Test: Testing task toggle');
    (childrenService.loadChildren as unknown as MockInstance).mockReturnValue(defaultChildren);
    const MorningRoutine = (await import('../MorningRoutine')).default;

    render(<MorningRoutine />);
    console.log('Component rendered');

    const task = await screen.findByText(/Brush teeth/i);
    console.log('Found Brush teeth:', !!task);
    await userEvent.click(task);
    console.log('Clicked Brush teeth');

    await waitFor(() => {
      console.log('Checking if saveChildren was called');
      expect(childrenService.saveChildren).toHaveBeenCalled();
      const saved = (childrenService.saveChildren as unknown as MockInstance).mock.calls[0][0];
      expect(saved[0].tasks[0].done).toBe(true);
      console.log('saveChildren called and task marked done');
    });
    console.log('waitFor completed');
  });
});
