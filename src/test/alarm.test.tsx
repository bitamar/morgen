import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAlarm, AlarmContext } from '../context/alarm';
import React from 'react';

describe('alarm context', () => {
  beforeEach(() => {
    // Suppress console errors during error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error when useAlarm is used outside of AlarmProvider', () => {
    // Render the hook outside of any provider
    expect(() => {
      renderHook(() => useAlarm());
    }).toThrow('useAlarm must be used within an AlarmProvider');
  });

  it('works correctly when used within AlarmProvider', () => {
    const mockContextValue = {
      currentAlarm: null,
      dismissAlarm: () => {},
      triggerAlarm: () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AlarmContext.Provider value={mockContextValue}>
        {children}
      </AlarmContext.Provider>
    );

    const { result } = renderHook(() => useAlarm(), { wrapper });

    expect(result.current).toBe(mockContextValue);
    expect(result.current.currentAlarm).toBe(null);
    expect(typeof result.current.dismissAlarm).toBe('function');
    expect(typeof result.current.triggerAlarm).toBe('function');
  });

  it('returns the correct context value when alarm is present', () => {
    const mockAlarm = {
      type: 'wakeup',
      child: {
        id: 'test-child',
        name: 'Test Child',
        avatar: '👧',
        wakeUpTime: '07:00',
        busTime: '08:00',
        tasks: [],
      },
    };

    const mockContextValue = {
      currentAlarm: mockAlarm,
      dismissAlarm: () => {},
      triggerAlarm: () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AlarmContext.Provider value={mockContextValue}>
        {children}
      </AlarmContext.Provider>
    );

    const { result } = renderHook(() => useAlarm(), { wrapper });

    expect(result.current.currentAlarm).toBe(mockAlarm);
    expect(result.current.currentAlarm?.type).toBe('wakeup');
    expect(result.current.currentAlarm?.child.name).toBe('Test Child');
  });
}); 