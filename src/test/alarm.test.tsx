import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAlarm, AlarmContext } from '../context/alarm';
import React from 'react';

describe('alarm context', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error when useAlarm is used outside of AlarmProvider', () => {
    const silentErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Render the hook outside of any provider
    expect(() => {
      renderHook(() => useAlarm());
    }).toThrow('useAlarm must be used within an AlarmProvider');

    silentErrorSpy.mockRestore();
  });

  it('works correctly when used within AlarmProvider', () => {
    const mockContextValue = {
      currentAlarm: null,
      dismissAlarm: () => {},
      triggerAlarm: () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AlarmContext.Provider value={mockContextValue}>{children}</AlarmContext.Provider>
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
        avatar: 'cat.png',
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
      <AlarmContext.Provider value={mockContextValue}>{children}</AlarmContext.Provider>
    );

    const { result } = renderHook(() => useAlarm(), { wrapper });

    expect(result.current.currentAlarm).toBe(mockAlarm);
    expect(result.current.currentAlarm?.type).toBe('wakeup');
    expect(result.current.currentAlarm?.child.name).toBe('Test Child');
  });
});
