import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { SoundService } from '../services/SoundService';

interface MockGainNode {
  connect: (destination: AudioDestinationNode) => void;
  gain: {
    value: number;
    setValueAtTime: (value: number, when: number) => void;
    exponentialRampToValueAtTime: (value: number, when: number) => void;
  };
}

interface MockBufferSource {
  connect: (destination: AudioNode) => void;
  start: (when?: number) => void;
  buffer: AudioBuffer | null;
}

interface MockAudioContext {
  createGain: () => MockGainNode;
  createBufferSource: () => MockBufferSource;
  decodeAudioData: ReturnType<typeof vi.fn>;
  destination: AudioDestinationNode;
  currentTime: number;
  createOscillator: () => MockOscillatorNode;
}

interface MockOscillatorNode {
  connect: (destination: AudioNode) => void;
  frequency: {
    setValueAtTime: (value: number, when: number) => void;
    exponentialRampToValueAtTime: (value: number, when: number) => void;
  };
  start: () => void;
  stop: () => void;
}

describe('SoundService', () => {
  let soundService: SoundService;
  let mockAudioContext: MockAudioContext;
  let mockGainNode: MockGainNode;
  let mockBufferSource: MockBufferSource;

  beforeEach(() => {
    // Mock AudioContext and its methods
    mockGainNode = {
      connect: vi.fn(),
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };

    mockBufferSource = {
      connect: vi.fn(),
      start: vi.fn(),
      buffer: null
    };

    mockAudioContext = {
      createGain: vi.fn(() => mockGainNode),
      createBufferSource: vi.fn(() => mockBufferSource),
      decodeAudioData: vi.fn(),
      destination: {} as AudioDestinationNode,
      currentTime: 0,
      createOscillator: vi.fn()
    };

    // Mock window AudioContext
    window.AudioContext = vi.fn(() => mockAudioContext) as unknown as typeof AudioContext;
    window.fetch = vi.fn();

    // Create new instance for each test
    soundService = new SoundService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize audio context on first play', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer)
      });

      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      await soundService.playSound('/sounds/test.mp3');

      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });
  });

  describe('playSound', () => {
    it('should play a sound file successfully', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer)
      });

      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      await soundService.playSound('/sounds/test.mp3');

      expect(mockBufferSource.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
      expect(mockBufferSource.start).toHaveBeenCalledWith(0);
    });

    it('should use cached audio buffer for repeated plays', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer)
      });

      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      // First play
      await soundService.playSound('/sounds/test.mp3');
      // Second play
      await soundService.playSound('/sounds/test.mp3');

      // Should only fetch and decode once
      expect(window.fetch).toHaveBeenCalledTimes(1);
      expect(mockAudioContext.decodeAudioData).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors gracefully', async () => {
      (window.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(soundService.playSound('/sounds/test.mp3')).rejects.toThrow('Network error');
    });

    it('should handle decode errors gracefully', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer)
      });

      mockAudioContext.decodeAudioData.mockRejectedValueOnce(new Error('Invalid audio data'));

      await expect(soundService.playSound('/sounds/test.mp3')).rejects.toThrow('Invalid audio data');
    });
  });

  describe('predefined sounds', () => {
    it('should play beep sound', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer)
      });

      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      await soundService.playBeep();

      expect(window.fetch).toHaveBeenCalledWith('/sounds/beep.mp3');
    });

    it('should play alarm sound', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer)
      });

      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      await soundService.playAlarm();

      expect(window.fetch).toHaveBeenCalledWith('/sounds/alarm.mp3');
    });

    it('should play notification sound', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer)
      });

      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      await soundService.playNotification();

      expect(window.fetch).toHaveBeenCalledWith('/sounds/notification.mp3');
    });

    it('should play task completion sound', async () => {
      const mockOscillator = {
        connect: vi.fn(),
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn()
        },
        start: vi.fn(),
        stop: vi.fn()
      };

      mockAudioContext.createOscillator = vi.fn(() => mockOscillator);

      await soundService.playTaskCompletion();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.connect).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
    });
  });

  describe('volume control', () => {
    it('should set correct volume level', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer)
      });

      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      await soundService.playSound('/sounds/test.mp3', 0.5);

      expect(mockGainNode.gain.value).toBe(0.5);
    });

    it('should use default volume if not specified', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer)
      });

      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      await soundService.playSound('/sounds/test.mp3');

      expect(mockGainNode.gain.value).toBe(0.7); // Default volume
    });
  });
}); 