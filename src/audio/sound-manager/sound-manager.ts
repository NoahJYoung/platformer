import * as ex from "excalibur";
import { SimpleAudioPlayer } from "./simple-audio-player";

type SoundName = string;
type ChannelName = "sfx" | "music" | "ambient";

interface SoundPoolEntry {
  sounds: ex.Sound[];
  currentIndex: number;
  lastPlayedIndex?: number;
}

interface FadeOperation {
  intervalId: number;
  soundKey: string;
}

export class GameSoundManager extends ex.SoundManager<ChannelName, SoundName> {
  private soundPools: Map<SoundName, SoundPoolEntry> = new Map();
  private simplePlayer: SimpleAudioPlayer;
  private soundPaths: Map<SoundName, string> = new Map();
  private activeFades: Map<string, FadeOperation> = new Map();

  private playingBeforePause: Map<
    SoundName,
    { volume: number; loop: boolean }
  > = new Map();

  constructor() {
    super({
      channels: ["sfx", "music", "ambient"],
      sounds: {},
    });

    this.channel.setVolume("sfx", 0.8);
    this.channel.setVolume("music", 0.7);
    this.channel.setVolume("ambient", 0.5);
    this.simplePlayer = new SimpleAudioPlayer();
  }

  createSoundPool(
    name: SoundName,
    sounds: ex.Sound[],
    channels: ChannelName[],
    volume: number = 1
  ) {
    sounds.forEach((sound, index) => {
      const poolSoundName = `${name}_pool_${index}`;
      this.track(poolSoundName, {
        sound,
        volume,
        channels,
      });
    });

    this.soundPools.set(name, {
      sounds,
      currentIndex: 0,
      lastPlayedIndex: undefined,
    });
  }

  public trackWithPath(
    name: SoundName,
    sound: ex.Sound,
    channels: ChannelName[],
    volume: number = 1,
    path?: string
  ): void {
    this.track(name, {
      sound,
      volume,
      channels,
    });

    if (path) {
      this.soundPaths.set(name, path);
      this.simplePlayer.loadSound(name, path);
    }
  }

  createSoundPoolWithPaths(
    name: SoundName,
    soundsWithPaths: Array<{ sound: ex.Sound; path: string }>,
    channels: ChannelName[],
    volume: number = 1
  ) {
    const sounds: ex.Sound[] = [];

    soundsWithPaths.forEach(({ sound, path }, index) => {
      const poolSoundName = `${name}_pool_${index}`;
      this.trackWithPath(poolSoundName, sound, channels, volume, path);
      sounds.push(sound);
    });

    this.soundPools.set(name, {
      sounds,
      currentIndex: 0,
      lastPlayedIndex: undefined,
    });
  }

  async play(name: SoundName, volume: number = 1): Promise<void> {
    const pool = this.soundPools.get(name);

    if (pool) {
      let randomIndex: number;

      if (pool.sounds.length > 1 && pool.lastPlayedIndex !== undefined) {
        do {
          randomIndex = Math.floor(Math.random() * pool.sounds.length);
        } while (randomIndex === pool.lastPlayedIndex);
      } else {
        randomIndex = Math.floor(Math.random() * pool.sounds.length);
      }

      pool.lastPlayedIndex = randomIndex;
      const poolSoundName = `${name}_pool_${randomIndex}`;
      await super.play(poolSoundName, volume);
    } else {
      await super.play(name, volume);
    }
  }

  async playLooped(
    name: SoundName,
    volume: number = 0.5,
    loop: boolean = true
  ): Promise<void> {
    const config = (this as any)._nameToConfig?.get(name);
    const sound = config?.sound;

    if (!sound) {
      console.error("Sound not found:", name);
      return;
    }

    if (sound.isPlaying()) {
      sound.loop = loop;
      sound.volume = volume === 0 ? 0.01 : volume;
      if (volume === 0) {
        sound.volume = 0;
      }
      return;
    }

    if (loop) {
      sound.loop = true;
    }

    const startVolume = volume === 0 ? 0.01 : volume;

    this.play(name, startVolume).catch((err) => {
      console.error("Error playing sound:", err);
    });

    if (volume === 0) {
      sound.volume = 0;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  public stop(name: SoundName): void {
    const config = (this as any)._nameToConfig?.get(name);
    if (config?.sound) {
      config.sound.stop();
    }
  }

  public getSound(name: SoundName): ex.Sound | undefined {
    const config = (this as any)._nameToConfig?.get(name);
    return config?.sound;
  }

  public fadeOut(
    soundKey: string,
    duration: number,
    onComplete?: () => void
  ): void {
    this.cancelFade(soundKey);

    const sound = this.getSound(soundKey);

    if (!sound || !sound.isPlaying()) {
      onComplete?.();
      return;
    }

    const startVolume = sound.volume;
    const startTime = Date.now();

    const fadeInterval = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      const newVolume = startVolume * (1 - progress);
      sound.volume = newVolume;

      if (progress >= 1) {
        this.cancelFade(soundKey);
        sound.volume = 0;
        onComplete?.();
      }
    }, 16);

    this.activeFades.set(soundKey, {
      intervalId: fadeInterval,
      soundKey,
    });
  }

  public fadeIn(
    soundKey: string,
    duration: number,
    targetVolume: number = 1.0
  ): void {
    this.cancelFade(soundKey);

    const sound = this.getSound(soundKey);

    if (!sound || !sound.isPlaying()) {
      return;
    }

    sound.volume = 0;
    const startTime = Date.now();

    const fadeInterval = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      const newVolume = targetVolume * progress;
      sound.volume = newVolume;

      if (progress >= 1) {
        this.cancelFade(soundKey);
        sound.volume = targetVolume;
      }
    }, 16);

    this.activeFades.set(soundKey, {
      intervalId: fadeInterval,
      soundKey,
    });
  }

  public async crossfade(
    fadeOutKey: string,
    fadeInKey: string,
    duration: number,
    targetVolume: number = 1.0
  ): Promise<void> {
    this.fadeOut(fadeOutKey, duration, () => {
      this.stop(fadeOutKey);
    });

    await this.playLooped(fadeInKey, 0, true);
    this.fadeIn(fadeInKey, duration, targetVolume);
  }

  private cancelFade(soundKey: string): void {
    const fade = this.activeFades.get(soundKey);
    if (fade) {
      window.clearInterval(fade.intervalId);
      this.activeFades.delete(soundKey);
    }
  }

  public cancelAllFades(): void {
    this.activeFades.forEach((fade) => {
      window.clearInterval(fade.intervalId);
    });
    this.activeFades.clear();
  }

  public playWhilePaused(name: SoundName, volume: number = 1): void {
    const pool = this.soundPools.get(name);

    if (pool) {
      let randomIndex: number;

      if (pool.sounds.length > 1 && pool.lastPlayedIndex !== undefined) {
        do {
          randomIndex = Math.floor(Math.random() * pool.sounds.length);
        } while (randomIndex === pool.lastPlayedIndex);
      } else {
        randomIndex = Math.floor(Math.random() * pool.sounds.length);
      }

      pool.lastPlayedIndex = randomIndex;
      const poolSoundName = `${name}_pool_${randomIndex}`;

      this.simplePlayer.play(poolSoundName, volume);
    } else {
      this.simplePlayer.play(name, volume);
    }
  }

  public async resumeSimplePlayer(): Promise<void> {
    await this.simplePlayer.resume();
  }

  public updateSimplePlayerVolume(volume: number = 0.3): void {
    this.simplePlayer.setVolume(volume);
  }

  isPooledSound(name: SoundName): boolean {
    return this.soundPools.has(name);
  }

  getPoolSize(name: SoundName): number {
    return this.soundPools.get(name)?.sounds.length ?? 0;
  }

  public cleanup(): void {
    this.cancelAllFades();
    this.playingBeforePause.clear();
  }
}
