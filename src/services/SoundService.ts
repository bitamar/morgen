export class SoundService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private currentAlarmSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.initializeAudioContext = this.initializeAudioContext.bind(this);
  }

  private async initializeAudioContext(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as typeof window.AudioContext))();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  private async loadAudioFile(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    if (this.audioBuffers.has(url)) {
      return this.audioBuffers.get(url)!;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Failed to load audio file:', error);
      throw error;
    }
  }

  public async playAlarm(loop: boolean = false): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    try {
      // Stop any existing alarm
      this.stopAlarm();
      
      const audioBuffer = await this.loadAudioFile('/sounds/alarm.mp3');
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      gainNode.gain.value = 0.8;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      if (loop) {
        source.loop = true;
      }

      this.currentAlarmSource = source;
      source.start(0);
    } catch (error) {
      console.error('Failed to play alarm sound:', error);
      throw error;
    }
  }

  public stopAlarm(): void {
    try {
      if (this.currentAlarmSource) {
        this.currentAlarmSource.stop();
        this.currentAlarmSource = null;
      }
    } catch (error) {
      console.error('Failed to stop alarm sound:', error);
    }
  }

  public async playTaskCompletion(): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    try {
      if (!this.audioContext) {
        throw new Error('Audio context not available');
      }
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Failed to play task completion sound:', error);
    }
  }
}

export const soundService = new SoundService();
