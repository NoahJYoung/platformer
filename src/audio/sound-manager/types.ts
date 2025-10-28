import * as ex from "excalibur";

export interface LoadedSounds {
  movement: MovementSounds;
  combat: CombatSounds;
  items: ItemSounds;
  actions: ActionSounds;
  ambient: AmbientSounds;
}

export interface WeatherSounds {
  rain: ex.Sound;
  thunder: ex.Sound;
}

export interface AmbientSounds {
  forest: DayNightSounds;
  mountain: DayNightSounds;
  weather: WeatherSounds;
}

export interface DayNightSounds {
  day: ex.Sound;
  night: ex.Sound;
}

export interface MovementSounds {
  footsteps: ex.Sound[];
  jump: ex.Sound;
  dodge: ex.Sound;
  land: ex.Sound;
}

export interface CombatSounds {
  spells: SpellSounds;
  weapon: WeaponSounds;
}

export interface SpellSounds {
  charge: ex.Sound;
  launch: ex.Sound;
  impact: ex.Sound;
}

export interface WeaponSounds {
  swing: ex.Sound;
  hit: ex.Sound;
}

export interface ItemSounds {
  equipment: EquipmentSounds;
}

export interface EquipmentSounds {
  equip: ex.Sound;
  unequip: ex.Sound;
}

export interface ActionSounds {
  chop: ex.Sound;
  mine: ex.Sound;
}
