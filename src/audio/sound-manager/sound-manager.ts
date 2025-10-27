import * as ex from "excalibur";

type SoundName = string;
type ChannelName = "sfx" | "music" | "ambient";

interface SoundPoolEntry {
  sounds: ex.Sound[];
  currentIndex: number;
  lastPlayedIndex?: number;
}

export class GameSoundManager extends ex.SoundManager<ChannelName, SoundName> {
  private soundPools: Map<SoundName, SoundPoolEntry> = new Map();

  constructor() {
    super({
      channels: ["sfx", "music", "ambient"],
      sounds: {},
    });

    this.channel.setVolume("sfx", 0.8);
    this.channel.setVolume("music", 0.7);
    this.channel.setVolume("ambient", 0.5);
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

  isPooledSound(name: SoundName): boolean {
    return this.soundPools.has(name);
  }

  getPoolSize(name: SoundName): number {
    return this.soundPools.get(name)?.sounds.length ?? 0;
  }
}
