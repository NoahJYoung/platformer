import * as ex from "excalibur";
import type { LoadedSounds } from "./types";

export function loadSounds(): LoadedSounds {
  // Movement
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

  // Spells
  const charge = new ex.Sound("./assets/audio/sfx/combat/spells/charge.mp3");
  const launch = new ex.Sound("./assets/audio/sfx/combat/spells/launch.wav");
  const impact = new ex.Sound("./assets/audio/sfx/combat/spells/impact.wav");

  // Weapon

  const swing = new ex.Sound("./assets/audio/sfx/combat/weapon/impact.wav");
  const hit = new ex.Sound("./assets/audio/sfx/combat/weapon/impact.wav");

  // Items
  const equip = new ex.Sound("./assets/audio/sfx/items/equipment/equip.wav");
  const unequip = new ex.Sound(
    "./assets/audio/sfx/items/equipment/unequip.wav"
  );

  return {
    movement: {
      jump,
      dodge,
      land,
      footsteps,
    },
    combat: {
      spells: {
        charge,
        launch,
        impact,
      },
      weapon: {
        swing,
        hit,
      },
    },
    items: {
      equipment: { equip, unequip },
    },
  };
}

export function getAllSoundsForLoader(loadedSounds: LoadedSounds): ex.Sound[] {
  const allSounds: ex.Sound[] = [];

  allSounds.push(...loadedSounds.movement.footsteps);

  allSounds.push(
    loadedSounds.movement.jump,
    loadedSounds.movement.land,
    loadedSounds.movement.dodge
  );

  allSounds.push(
    loadedSounds.combat.spells.charge,
    loadedSounds.combat.spells.launch,
    loadedSounds.combat.spells.impact
  );

  allSounds.push(
    loadedSounds.items.equipment.equip,
    loadedSounds.items.equipment.unequip
  );

  return allSounds;
}
