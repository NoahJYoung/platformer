import * as ex from "excalibur";

export interface LoadedSounds {
  footsteps: ex.Sound[];
  jump: ex.Sound;
  dodge: ex.Sound;
  land: ex.Sound;
  hurt: ex.Sound;
  death: ex.Sound;
  attack: ex.Sound;
  spellCast?: ex.Sound;
}

export function loadSounds(): LoadedSounds {
  const footsteps: ex.Sound[] = [];
  const footstepVariations = [
    "./assets/audio/sfx/movement/footsteps/footstep1.wav",
    "./assets/audio/sfx/movement/footsteps/footstep2.wav",
    "./assets/audio/sfx/movement/footsteps/footstep3.wav",
    "./assets/audio/sfx/movement/footsteps/footstep4.wav",
  ];

  footstepVariations.forEach((path) => {
    for (let i = 0; i < 2; i++) {
      footsteps.push(new ex.Sound(path));
    }
  });

  const jump = new ex.Sound("./assets/audio/sfx/movement/jump.wav");
  const dodge = new ex.Sound("./assets/audio/sfx/movement/dodge.wav");

  const land = new ex.Sound("./assets/audio/sfx/movement/land.wav");
  const hurt = new ex.Sound("./assets/audio/sfx/player/hurt.wav");
  const death = new ex.Sound("./assets/audio/sfx/player/death.wav");
  const attack = new ex.Sound("./assets/audio/sfx/combat/attack.wav");

  return {
    footsteps,
    jump,
    dodge,
    land,
    hurt,
    death,
    attack,
  };
}

export function getAllSoundsForLoader(loadedSounds: LoadedSounds): ex.Sound[] {
  const allSounds: ex.Sound[] = [];

  allSounds.push(...loadedSounds.footsteps);

  allSounds.push(
    loadedSounds.jump,
    loadedSounds.land,
    loadedSounds.hurt,
    loadedSounds.death,
    loadedSounds.attack
  );

  if (loadedSounds.spellCast) {
    allSounds.push(loadedSounds.spellCast);
  }

  return allSounds;
}
