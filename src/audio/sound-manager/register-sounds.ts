import { AudioKeys } from "./audio-keys";
import type { GameSoundManager } from "./sound-manager";
import type { LoadedSounds } from "./types";

export function registerSounds(
  soundManager: GameSoundManager,
  sounds: LoadedSounds
) {
  // MOVEMENT
  soundManager.createSoundPool(
    AudioKeys.SFX.PLAYER.MOVEMENT.FOOTSTEP,
    sounds.movement.footsteps,
    ["sfx"],
    0.4
  );

  soundManager.track(AudioKeys.SFX.PLAYER.MOVEMENT.JUMP, {
    sound: sounds.movement.jump,
    volume: 0.5,
    channels: ["sfx"],
  });

  soundManager.track(AudioKeys.SFX.PLAYER.MOVEMENT.DODGE, {
    sound: sounds.movement.dodge,
    volume: 0.5,
    channels: ["sfx"],
  });

  soundManager.track(AudioKeys.SFX.PLAYER.MOVEMENT.LAND, {
    sound: sounds.movement.land,
    volume: 0.5,
    channels: ["sfx"],
  });

  soundManager.track(AudioKeys.SFX.PLAYER.MOVEMENT.LAND, {
    sound: sounds.movement.land,
    volume: 0.5,
    channels: ["sfx"],
  });

  // COMBAT
  // SPELLS
  soundManager.track(AudioKeys.SFX.PLAYER.COMBAT.SPELLS.CHARGE, {
    sound: sounds.combat.spells.charge,
    volume: 0.5,
    channels: ["sfx"],
  });

  soundManager.track(AudioKeys.SFX.PLAYER.COMBAT.SPELLS.LAUNCH, {
    sound: sounds.combat.spells.launch,
    volume: 0.5,
    channels: ["sfx"],
  });

  soundManager.track(AudioKeys.SFX.PLAYER.COMBAT.SPELLS.IMPACT, {
    sound: sounds.combat.spells.impact,
    volume: 0.5,
    channels: ["sfx"],
  });

  // ITEMS
  // EQUIPMENT
  soundManager.trackWithPath(
    AudioKeys.SFX.PLAYER.ITEMS.EQUIPMENT.EQUIP,
    sounds.items.equipment.equip,
    ["sfx"],
    0.5,
    "/assets/audio/sfx/items/equipment/equip.wav"
  );

  soundManager.trackWithPath(
    AudioKeys.SFX.PLAYER.ITEMS.EQUIPMENT.UNEQUIP,
    sounds.items.equipment.unequip,
    ["sfx"],
    0.5,
    "/assets/audio/sfx/items/equipment/unequip.wav"
  );

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
