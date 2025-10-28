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

  // Spells
  const charge = new ex.Sound("./assets/audio/sfx/combat/spells/charge.mp3");
  const launch = new ex.Sound("./assets/audio/sfx/combat/spells/launch.wav");
  const impact = new ex.Sound("./assets/audio/sfx/combat/spells/impact.wav");

  // Weapon

  const swing = new ex.Sound("./assets/audio/sfx/combat/weapon/swing.wav");
  const hit = new ex.Sound("./assets/audio/sfx/combat/weapon/hit.wav");

  // Items
  const equip = new ex.Sound("./assets/audio/sfx/items/equipment/equip.wav");
  const unequip = new ex.Sound(
    "./assets/audio/sfx/items/equipment/unequip.wav"
  );

  // Actions
  const chop = new ex.Sound("./assets/audio/sfx/actions/chop.wav");
  const mine = new ex.Sound("./assets/audio/sfx/actions/mine.wav");

  const forestDay = new ex.Sound("./assets/audio/ambient/forest/day.ogg");
  const forestNight = new ex.Sound("./assets/audio/ambient/forest/night.ogg");
  const mountainDay = new ex.Sound(
    "./assets/audio/ambient/mountain/mountains.ogg"
  );
  const mountainNight = new ex.Sound(
    "./assets/audio/ambient/mountain/mountains.ogg"
  );

  const rain = new ex.Sound("./assets/audio/ambient/weather/rain.ogg");
  const thunder = new ex.Sound("./assets/audio/ambient/weather/thunder.mp3");

  return {
    movement: {
      jump,
      dodge,
      land,
      footsteps,
    },
    actions: {
      chop,
      mine,
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
    ambient: {
      forest: {
        day: forestDay,
        night: forestNight,
      },
      mountain: {
        day: mountainDay,
        night: mountainNight,
      },
      weather: {
        rain,
        thunder,
      },
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
    loadedSounds.combat.weapon.swing,
    loadedSounds.combat.weapon.hit
  );

  allSounds.push(
    loadedSounds.items.equipment.equip,
    loadedSounds.items.equipment.unequip
  );

  allSounds.push(loadedSounds.actions.chop, loadedSounds.actions.mine);

  allSounds.push(
    loadedSounds.ambient.forest.day,
    loadedSounds.ambient.forest.night,
    loadedSounds.ambient.mountain.day,
    loadedSounds.ambient.mountain.night,
    loadedSounds.ambient.weather.rain,
    loadedSounds.ambient.weather.thunder
  );

  return allSounds;
}
