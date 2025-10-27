import * as ex from "excalibur";

export interface LoadedSounds {
  movement: MovementSounds;
  combat: CombatSounds;
  items: ItemSounds;
}

export interface MovementSounds {
  footsteps: ex.Sound[];
  jump: ex.Sound;
  dodge: ex.Sound;
  land: ex.Sound;
}

interface CombatSounds {
  spells: SpellSounds;
  weapon: WeaponSounds;
}

interface SpellSounds {
  charge: ex.Sound;
  launch: ex.Sound;
  impact: ex.Sound;
}

interface WeaponSounds {
  swing: ex.Sound;
  hit: ex.Sound;
}

interface ItemSounds {
  equipment: EquipmentSounds;
}

interface EquipmentSounds {
  equip: ex.Sound;
  unequip: ex.Sound;
}
