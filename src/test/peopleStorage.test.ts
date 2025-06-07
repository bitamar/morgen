import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEY,
  getDefaultChildren,
  loadChildren,
  saveChildren,
  type Child,
} from '../services/peopleStorage';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock console.error to avoid noise in tests
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

describe('peopleStorage', () => {
  describe('STORAGE_KEY', () => {
    it('has the correct storage key', () => {
      expect(STORAGE_KEY).toBe('morningRoutine.v1');
    });
  });

  describe('getDefaultChildren', () => {
    it('returns default children array', () => {
      const children = getDefaultChildren();

      expect(children).toHaveLength(2);
      expect(children[0]).toEqual({
        id: 'maya',
        name: 'Maya',
        avatar: '👧',
        wakeUpTime: '07:00',
        busTime: '07:45',
        tasks: [
          { id: 'brush', title: 'Brush teeth', emoji: '🦷', done: false },
          { id: 'dress', title: 'Get dressed', emoji: '👕', done: false },
          { id: 'breakfast', title: 'Eat breakfast', emoji: '🥣', done: false },
          { id: 'backpack', title: 'Pack backpack', emoji: '🎒', done: false },
        ],
      });
      expect(children[1]).toEqual({
        id: 'alex',
        name: 'Alex',
        avatar: '👦',
        wakeUpTime: '07:15',
        busTime: '08:00',
        tasks: [
          { id: 'wash', title: 'Wash face', emoji: '🧼', done: false },
          { id: 'dress2', title: 'Get dressed', emoji: '👕', done: false },
          { id: 'breakfast2', title: 'Eat breakfast', emoji: '🥞', done: false },
          { id: 'shoes', title: 'Put on shoes', emoji: '👟', done: false },
        ],
      });
    });

    it('returns new instances each time', () => {
      const children1 = getDefaultChildren();
      const children2 = getDefaultChildren();

      expect(children1).not.toBe(children2);
      expect(children1[0]).not.toBe(children2[0]);
    });
  });

  describe('loadChildren', () => {
    it('returns default children when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const children = loadChildren();

      expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(children).toEqual(getDefaultChildren());
    });

    it('loads children from localStorage when valid data exists', () => {
      const savedData = {
        children: [
          {
            id: 'test-child',
            name: 'Test Child',
            avatar: '🧒',
            wakeUpTime: '06:30',
            busTime: '07:30',
            tasks: [{ id: 'task1', title: 'Test task', emoji: '✅', done: true }],
          },
        ],
        lastUpdated: '2023-01-01T00:00:00.000Z',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

      const children = loadChildren();

      expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(children).toEqual(savedData.children);
    });

    it('returns default children when stored data has no children array', () => {
      const invalidData = { someOtherData: 'value' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidData));

      const children = loadChildren();

      expect(children).toEqual(getDefaultChildren());
    });

    it('returns default children when stored data has empty children array', () => {
      const invalidData = { children: [] };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidData));

      const children = loadChildren();

      expect(children).toEqual(getDefaultChildren());
    });

    it('returns default children when stored data children is not an array', () => {
      const invalidData = { children: 'not-an-array' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidData));

      const children = loadChildren();

      expect(children).toEqual(getDefaultChildren());
    });

    it('handles JSON parse errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json{');

      const children = loadChildren();

      expect(children).toEqual(getDefaultChildren());
      expect(consoleErrorSpy).toHaveBeenCalledWith('loadChildren:', expect.any(SyntaxError));
    });

    it('handles localStorage access errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });

      const children = loadChildren();

      expect(children).toEqual(getDefaultChildren());
      expect(consoleErrorSpy).toHaveBeenCalledWith('loadChildren:', expect.any(Error));
    });
  });

  describe('saveChildren', () => {
    it('saves children to localStorage with timestamp', () => {
      const testChildren: Child[] = [
        {
          id: 'test-child',
          name: 'Test Child',
          avatar: '🧒',
          wakeUpTime: '06:30',
          busTime: '07:30',
          tasks: [{ id: 'task1', title: 'Test task', emoji: '✅', done: true }],
        },
      ];

      // Mock Date to ensure consistent timestamp
      const mockDate = '2023-01-01T00:00:00.000Z';
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);

      saveChildren(testChildren);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify({
          children: testChildren,
          lastUpdated: mockDate,
        })
      );
    });

    it('handles localStorage setItem errors gracefully', () => {
      const testChildren: Child[] = getDefaultChildren();

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
      });

      // Should not throw
      expect(() => saveChildren(testChildren)).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith('saveChildren:', expect.any(Error));
    });

    it('saves empty array when provided', () => {
      const emptyChildren: Child[] = [];

      saveChildren(emptyChildren);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('"children":[]')
      );
    });
  });

  describe('integration tests', () => {
    it('can save and load children roundtrip', () => {
      const testChildren: Child[] = [
        {
          id: 'roundtrip-child',
          name: 'Roundtrip Child',
          avatar: '🔄',
          wakeUpTime: '05:45',
          busTime: '06:45',
          tasks: [
            { id: 'task1', title: 'Morning task', emoji: '🌅', done: false },
            { id: 'task2', title: 'Completed task', emoji: '✅', done: true },
          ],
        },
      ];

      // Save children
      saveChildren(testChildren);

      // Get what was saved to localStorage
      const savedCall = localStorageMock.setItem.mock.calls[0];
      const savedData = savedCall[1];

      // Mock localStorage to return the saved data
      localStorageMock.getItem.mockReturnValue(savedData);

      // Load children
      const loadedChildren = loadChildren();

      expect(loadedChildren).toEqual(testChildren);
    });
  });
});
