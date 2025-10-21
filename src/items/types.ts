import type {
  EquipmentBuff,
  AttributeRequirement,
  WeaponSubType,
  EquipmentSlot,
  ItemTag,
  ConsumableSubType,
  ConsumableEffect,
} from "../actors/character/types";
import type * as ex from "excalibur";

interface BaseItemFactoryData {
  iconUrl: string;
  name: string;
  description: string;
  tags?: ItemTag[];
}

export interface WeaponFactoryData extends BaseItemFactoryData {
  type: "weapon";
  slot: "weapon";
  subtype: WeaponSubType;
  damage: number;
  reach: number;
  spriteLayer?: number;
  buffs?: EquipmentBuff;
  spriteSheets: { male: ex.ImageSource; female: ex.ImageSource };
  requirements?: AttributeRequirement;
}

export interface ArmorFactoryData extends BaseItemFactoryData {
  type: "armor";
  slot: Exclude<EquipmentSlot, "weapon">;
  defense: number;
  spriteLayer?: number;
  buffs?: EquipmentBuff;
  spriteSheets: { male: ex.ImageSource; female: ex.ImageSource };
  requirements?: AttributeRequirement;
}

export interface ConsumableFactoryData extends BaseItemFactoryData {
  type: "consumable";
  subtype: ConsumableSubType;
  effect: ConsumableEffect;
}

export interface MaterialFactoryData extends BaseItemFactoryData {
  type: "material";
}

export type ItemFactoryData =
  | WeaponFactoryData
  | ArmorFactoryData
  | ConsumableFactoryData
  | MaterialFactoryData;
