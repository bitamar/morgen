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
  loop: boolean;
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
      buffer: null,
      loop: false,
    };

    mockAudioContext = {
      createGain: vi.fn(() => mockGainNode),
      createBufferSource: vi.fn(() => mockBufferSource),
      decodeAudioData: vi.fn(),
      destination: {} as AudioDestinationNode,
      currentTime: 0,
      createOscillator: vi.fn(),
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
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });

      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      await soundService.playAlarm();

      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });
  });

  describe('alarm sounds', () => {
    it('should play alarm sound with looping', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });

      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      const source = await soundService.playAlarm(true);

      expect(mockBufferSource.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
      expect(mockBufferSource.start).toHaveBeenCalledWith(0);
      expect(mockBufferSource.loop).toBe(true);
      expect(source).toBe(mockBufferSource);
    });

    it('should stop alarm sound', async () => {
      const mockSource = {
        stop: vi.fn(),
      };

      soundService.stopAlarm(mockSource as unknown as AudioBufferSourceNode);

      expect(mockSource.stop).toHaveBeenCalled();
    });

    it('should handle errors when stopping alarm', async () => {
      const mockSource = {
        stop: vi.fn().mockImplementation(() => {
          throw new Error('Stop failed');
        }),
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      soundService.stopAlarm(mockSource as unknown as AudioBufferSourceNode);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to stop alarm sound:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('task completion sound', () => {
    it('should play task completion sound', async () => {
      const mockOscillator = {
        connect: vi.fn(),
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        start: vi.fn(),
        stop: vi.fn(),
      };

      mockAudioContext.createOscillator = vi.fn(() => mockOscillator);

      await soundService.playTaskCompletion();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.connect).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
    });
  });
});
