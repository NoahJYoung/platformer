/**
 * SimpleAudioPlayer - Uses native Web Audio API to play sounds
 * This works even when the Excalibur engine is stopped/paused
 */
export class SimpleAudioPlayer {
  private audioContext: AudioContext;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private volume: number = 1.0;

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }

  async loadSound(key: string, url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(key, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound: ${key} from ${url}`, error);
    }
  }

  play(key: string, volume?: number): void {
    const buffer = this.audioBuffers.get(key);

    if (!buffer) {
      console.warn(`Sound not loaded: ${key}`);
      return;
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;

    const finalVolume = (volume ?? 1.0) * this.volume;
    gainNode.gain.value = finalVolume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  async resume(): Promise<void> {
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }
}
