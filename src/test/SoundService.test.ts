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
  stop: () => void;
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
      stop: vi.fn(),
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
    // Initialize audio context
    soundService['audioContext'] = mockAudioContext as unknown as AudioContext;
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

      await soundService.initializeAudioContext();
      await soundService.playAlarm();

      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });

    it('should throw error when audio context initialization fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('AudioContext not supported');
      window.AudioContext = vi.fn(() => {
        throw mockError;
      }) as unknown as typeof AudioContext;

      const newSoundService = new SoundService();
      await expect(newSoundService.initializeAudioContext()).rejects.toThrow('AudioContext not supported');
      consoleSpy.mockRestore();
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

      await soundService.playAlarm(true);

      expect(mockBufferSource.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
      expect(mockBufferSource.start).toHaveBeenCalledWith(0);
      expect(mockBufferSource.loop).toBe(true);
    });

    it('should use cached audio buffer on subsequent playAlarm calls', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });
      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      // First call: loads and caches
      await soundService.playAlarm();

      // Second call: should hit cache, so fetch and decodeAudioData should not be called again
      const fetchSpy = vi.spyOn(window, 'fetch');
      const decodeSpy = vi.spyOn(mockAudioContext, 'decodeAudioData');
      await soundService.playAlarm();
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(decodeSpy).not.toHaveBeenCalled();
    });

    it('should stop alarm sound', async () => {
      // First play an alarm to set up the current alarm source
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });
      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      await soundService.playAlarm();
      soundService.stopAlarm();

      expect(mockBufferSource.stop).toHaveBeenCalled();
    });

    it('should handle errors when stopping alarm', async () => {
      // First play an alarm to set up the current alarm source
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });
      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      await soundService.playAlarm();
      
      // Mock the stop method to throw an error
      mockBufferSource.stop = vi.fn().mockImplementation(() => {
        throw new Error('Stop failed');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      soundService.stopAlarm();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to stop alarm sound:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should stop existing alarm when playing a new one', async () => {
      // First play an alarm
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockAudioBuffer = new ArrayBuffer(8) as unknown as AudioBuffer;

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });
      mockAudioContext.decodeAudioData.mockResolvedValueOnce(mockAudioBuffer);

      await soundService.playAlarm();

      // Reset mocks to verify new calls
      vi.clearAllMocks();

      // Play another alarm
      await soundService.playAlarm();

      // Verify the old alarm was stopped
      expect(mockBufferSource.stop).toHaveBeenCalled();
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

  describe('error handling', () => {
    it('should handle audio file loading failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Network error');

      (window.fetch as Mock).mockRejectedValueOnce(mockError);

      await expect(soundService.playAlarm()).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load audio file:', mockError);
      consoleSpy.mockRestore();
    });

    it('should handle audio decoding failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Invalid audio data');

      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });

      mockAudioContext.decodeAudioData.mockRejectedValueOnce(mockError);

      await expect(soundService.playAlarm()).rejects.toThrow('Invalid audio data');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load audio file:', mockError);
      consoleSpy.mockRestore();
    });

    it('should handle task completion sound failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Oscillator creation failed');

      mockAudioContext.createOscillator = vi.fn(() => {
        throw mockError;
      });

      await soundService.playTaskCompletion();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to play task completion sound:', mockError);
      consoleSpy.mockRestore();
    });

    it('should handle play alarm failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Playback failed');

      // Mock fetch to return a valid response
      (window.fetch as Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });

      // Mock decodeAudioData to return a valid buffer
      mockAudioContext.decodeAudioData.mockResolvedValueOnce(
        new ArrayBuffer(8) as unknown as AudioBuffer
      );

      // Mock createBufferSource to throw
      mockAudioContext.createBufferSource = vi.fn(() => {
        throw mockError;
      });

      await expect(soundService.playAlarm()).rejects.toThrow('Playback failed');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to play alarm sound:', mockError);
      consoleSpy.mockRestore();
    });

    it('should throw when audio context is not available for playAlarm', async () => {
      // Create a new instance with no audio context
      const newSoundService = new SoundService();
      // @ts-expect-error - Force audioContext to be null
      newSoundService.audioContext = null;

      await expect(newSoundService.playAlarm()).rejects.toThrow('Audio context not available');
    });

    it('should throw when audio context is not available for loadAudioFile', async () => {
      // Create a new instance with no audio context
      const newSoundService = new SoundService();
      // @ts-expect-error - Force audioContext to be null
      newSoundService.audioContext = null;

      await expect(newSoundService['loadAudioFile']('/morgen/sounds/alarm.mp3')).rejects.toThrow(
        'Audio context not available'
      );
    });
  });
});
