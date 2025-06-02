export class SoundService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private audioBuffers: Map<string, AudioBuffer> = new Map();

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
      await this.initializeAudioContext();
    }

    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    // Check if we already have this audio file cached
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

  public async playSound(url: string, volume: number = 0.7): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    try {
      const audioBuffer = await this.loadAudioFile(url);
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
    } catch (error) {
      console.error('Failed to play sound:', error);
      throw error;
    }
  }

  public async playBeep(): Promise<void> {
    await this.playSound('/sounds/beep.mp3');
  }

  public async playAlarm(): Promise<void> {
    await this.playSound('/sounds/alarm.mp3');
  }

  public async playNotification(): Promise<void> {
    await this.playSound('/sounds/notification.mp3');
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
