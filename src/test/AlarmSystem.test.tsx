// Mock AudioContext and Audio before importing the component
import { type AlarmContextType, useAlarm } from '../context/alarm.ts';

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
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
};

Object.defineProperty(window, 'AudioContext', {
  value: vi.fn(() => mockAudioContext),
});

const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
  loop: false,
  volume: 1,
};

Object.defineProperty(window, 'Audio', {
  value: vi.fn(() => mockAudio),
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { AlarmProvider } from '../Components/AlarmSystem';
import { useEffect } from 'react';

// Configure test timeout
vi.setConfig({ testTimeout: 10000 });

// Define types for our test data
interface Task {
  id: string;
  title: string;
  done: boolean;
}

interface Child {
  id: string;
  name: string;
  wakeUpTime?: string;
  busTime?: string;
  tasks?: Task[];
}

// Test component that uses the alarm context
const TestComponent = ({ onMount }: { onMount?: (context: AlarmContextType) => void }) => {
  const context = useAlarm();

  useEffect(() => {
    onMount?.(context);
  }, [context, onMount]);

  return (
    <div>
      <div data-testid="alarm-status">
        {context.currentAlarm
          ? `${context.currentAlarm.type} alarm for ${context.currentAlarm.child.name}`
          : 'No alarm'}
      </div>
      <button onClick={context.dismissAlarm} data-testid="dismiss-button">
        Dismiss
      </button>
      <button
        onClick={() => context.triggerAlarm('test', { id: '1', name: 'Test Child' })}
        data-testid="trigger-button"
      >
        Trigger Test Alarm
      </button>
    </div>
  );
};

describe('AlarmSystem', () => {
  const mockChildData: Child[] = [
    {
      id: '1',
      name: 'Test Child',
      wakeUpTime: '07:00',
      busTime: '07:45',
      tasks: [{ id: 'task1', title: 'Brush teeth', done: false }],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
  });

  it('initializes without an alarm', () => {
    render(
      <AlarmProvider childData={mockChildData}>
        <TestComponent />
      </AlarmProvider>
    );

    expect(screen.getByTestId('alarm-status').textContent).toBe('No alarm');
  });

  it('triggers wake-up alarm at wake-up time', () => {
    // Set time to 7:00 AM
    vi.setSystemTime(new Date('2024-03-20T07:00:00'));

    render(
      <AlarmProvider childData={mockChildData}>
        <TestComponent />
      </AlarmProvider>
    );

    // Simulate user interaction to initialize audio
    act(() => {
      document.dispatchEvent(new MouseEvent('click'));
    });

    // Advance timers to trigger alarm check
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('alarm-status').textContent).toBe('wakeup alarm for Test Child');
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it('triggers bus warning 5 minutes before bus time', () => {
    // Set time to 7:40 AM (5 minutes before 7:45)
    vi.setSystemTime(new Date('2024-03-20T07:40:00'));

    render(
      <AlarmProvider childData={mockChildData}>
        <TestComponent />
      </AlarmProvider>
    );

    // Simulate user interaction to initialize audio
    act(() => {
      document.dispatchEvent(new MouseEvent('click'));
    });

    // Advance timers to trigger alarm check
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('alarm-status').textContent).toBe('warning alarm for Test Child');
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it('triggers bus departure alarm at bus time with incomplete tasks', () => {
    // Set time to 7:45 AM
    vi.setSystemTime(new Date('2024-03-20T07:45:00'));

    render(
      <AlarmProvider childData={mockChildData}>
        <TestComponent />
      </AlarmProvider>
    );

    // Simulate user interaction to initialize audio
    act(() => {
      document.dispatchEvent(new MouseEvent('click'));
    });

    // Advance timers to trigger alarm check
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('alarm-status').textContent).toBe('departure alarm for Test Child');
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it('dismisses alarm when dismiss button is clicked', async () => {
    // Set time to a non-alarm time first (6:00 AM)
    vi.setSystemTime(new Date('2024-03-20T06:00:00'));

    let alarmContext: AlarmContextType | undefined;

    render(
      <AlarmProvider childData={mockChildData}>
        <TestComponent
          onMount={context => {
            alarmContext = context;
          }}
        />
      </AlarmProvider>
    );

    if (!alarmContext) {
      throw new Error('Alarm context not initialized');
    }

    // Initialize audio
    await act(async () => {
      document.dispatchEvent(new MouseEvent('click'));
    });

    // Set up an alarm to dismiss
    await act(async () => {
      alarmContext?.triggerAlarm('wakeup', { id: '1', name: 'Test Child' });
    });

    // Dismiss alarm using context
    await act(async () => {
      alarmContext?.dismissAlarm();
    });

    // Verify alarm is dismissed
    const alarmStatus = screen.getByTestId('alarm-status');
    expect(alarmStatus).toBeInTheDocument();
    expect(alarmStatus).toHaveTextContent('No alarm');
  });

  it('initializes with no alarm', () => {
    render(
      <AlarmProvider childData={mockChildData}>
        <TestComponent />
      </AlarmProvider>
    );

    const alarmStatus = screen.getByTestId('alarm-status');
    expect(alarmStatus).toBeInTheDocument();
    expect(alarmStatus).toHaveTextContent('No alarm');
  });

  it('triggers alarm with correct audio', async () => {
    let alarmContext: AlarmContextType | undefined;

    render(
      <AlarmProvider childData={mockChildData}>
        <TestComponent
          onMount={context => {
            alarmContext = context;
          }}
        />
      </AlarmProvider>
    );

    if (!alarmContext) {
      throw new Error('Alarm context not initialized');
    }

    // Initialize audio
    await act(async () => {
      document.dispatchEvent(new MouseEvent('click'));
    });

    // Trigger alarm
    await act(async () => {
      alarmContext?.triggerAlarm('wakeup', { id: '1', name: 'Test Child' });
    });

    // Verify alarm is triggered
    const alarmStatus = screen.getByTestId('alarm-status');
    expect(alarmStatus).toBeInTheDocument();
    expect(alarmStatus).toHaveTextContent('wakeup alarm for Test Child');
    expect(mockAudio.play).toHaveBeenCalledTimes(1);
  });
});
