import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Configure test timeout
vi.setConfig({ testTimeout: 1000 });

// Cleanup after each test case
afterEach(() => {
  cleanup();
}); 