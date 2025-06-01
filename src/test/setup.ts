import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Configure test timeout
vi.setConfig({ testTimeout: 1000 });

// Mock AudioContext
class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };
  }
  createGain() {
    return {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };
  }
}

// Add AudioContext to window
window.AudioContext = MockAudioContext as unknown as typeof AudioContext;

// Cleanup after each test case
afterEach(() => {
  cleanup();
});
