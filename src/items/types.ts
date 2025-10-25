import type {
  EquipmentBuff,
  AttributeRequirement,
  WeaponSubType,
  EquipmentSlot,
  ItemTag,
  ConsumableSubType,
} from "../actors/character/types";
import type * as ex from "excalibur";
import type { Player } from "../actors/player/player";

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
  onConsume: (player: Player) => void;
}

export interface MaterialFactoryData extends BaseItemFactoryData {
  type: "material";
}

export type ItemFactoryData =
  | WeaponFactoryData
  | ArmorFactoryData
  | ConsumableFactoryData
  | MaterialFactoryData;
