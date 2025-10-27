import * as ex from "excalibur";
import { SimpleAudioPlayer } from "./simple-audio-player";

type SoundName = string;
type ChannelName = "sfx" | "music" | "ambient";

interface SoundPoolEntry {
  sounds: ex.Sound[];
  currentIndex: number;
  lastPlayedIndex?: number;
}

export class GameSoundManager extends ex.SoundManager<ChannelName, SoundName> {
  private soundPools: Map<SoundName, SoundPoolEntry> = new Map();
  private simplePlayer: SimpleAudioPlayer;
  private soundPaths: Map<SoundName, string> = new Map();
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
}
