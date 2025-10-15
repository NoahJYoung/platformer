export interface AppearanceOptions {
  sex: "male" | "female";
  skinTone: 1 | 2 | 3 | 4 | 5;
  hairStyle: 1 | 2 | 3 | 4 | 5;
}

export const Resources = {
  Health: "health",
  Stamina: "stamina",
  Mana: "mana",
} as const;

export const Attributes = {
  Strength: "strength",
  Agility: "agility",
  Intelligence: "intelligence",
  Vitality: "vitality",
} as const;

export interface StatConfig {
  baseValue: number;
  currentXP: number;
  xpToNextLevel: number;
  growthRate: number;
}

export type Stats = Record<
  (typeof Attributes)[keyof typeof Attributes],
  StatConfig
>;
export type Attribute = (typeof Attributes)[keyof typeof Attributes];
export type Resource = (typeof Resources)[keyof typeof Resources];

export interface InventoryItem {
  id: string;
  iconUrl: string;
  name: string;
  type: "weapon" | "armor" | "consumable";
  spriteSheet?: ex.ImageSource;
}

export type BuffableAttribute = Attribute | Resource;

export type EquipmentBuff = Partial<Record<BuffableAttribute, number>>;

export type AttributeRequirement = Partial<Record<Attribute, number>>;

export type EquipmentSlot =
  | "weapon"
  | "helmet"
  | "mask"
  | "body"
  | "legs"
  | "gloves"
  | "boots"
  | "ring1"
  | "ring2"
  | "amulet"
  | "back";

export interface EquipmentItem extends InventoryItem {
  slot: EquipmentSlot;
  spriteLayer?: number;
  buffs?: EquipmentBuff;
  requirements?: AttributeRequirement;
}

export interface WeaponItem extends EquipmentItem {
  damage: number;
  reach: number;
  type: "weapon";
  slot: "weapon";
}

export interface ArmorItem extends EquipmentItem {
  defense: number;
  type: "armor";
  slot: Exclude<EquipmentSlot, "weapon">;
}
