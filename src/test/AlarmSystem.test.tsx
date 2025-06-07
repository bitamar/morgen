vi.mock('../services/SoundService', () => ({
  soundService: {
    playAlarm: vi.fn().mockResolvedValue(undefined),
    stopAlarm: vi.fn(),
    initializeAudioContext: vi.fn().mockResolvedValue(undefined),
  },
}));

import { type AlarmContextType, useAlarm } from '../context/alarm.ts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { AlarmProvider } from '../Components/AlarmSystem';
import { useEffect } from 'react';
import { soundService } from '../services/SoundService';

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

  it('triggers wake-up alarm at wake-up time', async () => {
    // Set time to 7:00 AM
    vi.setSystemTime(new Date('2024-03-20T07:00:00'));

    render(
      <AlarmProvider childData={mockChildData}>
        <TestComponent />
      </AlarmProvider>
    );

    // Advance timers to trigger alarm check
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('alarm-status').textContent).toBe('wakeup alarm for Test Child');
    expect(soundService.playAlarm).toHaveBeenCalledWith(true);
  });

  it('triggers bus warning 5 minutes before bus time', async () => {
    // Set time to 7:40 AM (5 minutes before 7:45)
    vi.setSystemTime(new Date('2024-03-20T07:40:00'));

    render(
      <AlarmProvider childData={mockChildData}>
        <TestComponent />
      </AlarmProvider>
    );

    // Advance timers to trigger alarm check
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('alarm-status').textContent).toBe('warning alarm for Test Child');
    expect(soundService.playAlarm).toHaveBeenCalledWith(true);
  });

  it('triggers bus departure alarm at bus time with incomplete tasks', async () => {
    // Set time to 7:45 AM
    vi.setSystemTime(new Date('2024-03-20T07:45:00'));

    render(
      <AlarmProvider childData={mockChildData}>
        <TestComponent />
      </AlarmProvider>
    );

    // Advance timers to trigger alarm check
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('alarm-status').textContent).toBe('departure alarm for Test Child');
    expect(soundService.playAlarm).toHaveBeenCalledWith(true);
  });

  it('dismisses alarm when dismiss button is clicked', async () => {
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
    expect(soundService.stopAlarm).toHaveBeenCalled();
  });

  it('stops alarm when component unmounts', async () => {
    let alarmContext: AlarmContextType | undefined;
    const { unmount } = render(
      <AlarmProvider childData={mockChildData}>
        <TestComponent
          onMount={context => {
            alarmContext = context;
          }}
        />
      </AlarmProvider>
    );

    if (!alarmContext) throw new Error('Alarm context not initialized');

    // Directly trigger the alarm
    await act(async () => {
      alarmContext?.triggerAlarm('wakeup', { id: '1', name: 'Test Child' });
    });

    // Assert alarm is active
    expect(screen.getByTestId('alarm-status').textContent).toBe('wakeup alarm for Test Child');
    expect(soundService.playAlarm).toHaveBeenCalledWith(true);

    // Unmount the component
    unmount();

    // Verify alarm is stopped
    expect(soundService.stopAlarm).toHaveBeenCalled();
  });
});
