import { AudioKeys } from "./audio-keys";
import type { GameSoundManager } from "./sound-manager";
import type { LoadedSounds } from "./load-sounds";

export function registerSounds(
  soundManager: GameSoundManager,
  sounds: LoadedSounds
) {
  soundManager.createSoundPool(
    AudioKeys.SFX.PLAYER.FOOTSTEP,
    sounds.footsteps,
    ["sfx"],
    0.4
  );

  soundManager.track(AudioKeys.SFX.PLAYER.JUMP, {
    sound: sounds.jump,
    volume: 0.5,
    channels: ["sfx"],
  });

  soundManager.track(AudioKeys.SFX.PLAYER.DODGE, {
    sound: sounds.dodge,
    volume: 0.5,
    channels: ["sfx"],
  });

  soundManager.track(AudioKeys.SFX.PLAYER.LAND, {
    sound: sounds.land,
    volume: 0.5,
    channels: ["sfx"],
  });

  // soundManager.track(AudioKeys.SFX.PLAYER.HURT, {
  //   sound: allSounds[18],
  //   volume: 0.6,
  //   channels: ["sfx"],
  // });

  // soundManager.track(AudioKeys.SFX.PLAYER.DEATH, {
  //   sound: allSounds[19],
  //   volume: 0.7,
  //   channels: ["sfx"],
  // });

  // soundManager.track(AudioKeys.SFX.PLAYER.ATTACK, {
  //   sound: allSounds[20],
  //   volume: 0.5,
  //   channels: ["sfx"],
  // });
}
