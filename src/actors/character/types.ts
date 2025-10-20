import { Color } from "excalibur";

export interface AppearanceOptions {
  sex: "male" | "female";
  skinTone: 1 | 2 | 3 | 4 | 5;
  hairStyle: 1 | 2 | 3 | 4 | 5;
  displayName: string;
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

export interface AttributesConfig {
  [Attributes.Vitality]: number;
  [Attributes.Strength]: number;
  [Attributes.Agility]: number;
  [Attributes.Intelligence]: number;
}

export interface StatConfig {
  baseValue: number;
  currentXP: number;
  xpToNextLevel: number;
}

export type Element = "fire" | "water" | "earth" | "wind";

export const ElementColors = {
  fire: {
    primary: Color.Orange,
    secondary: Color.Red,
    hexPrimary: "#ffa500",
    hexSecondary: "#ff0000",
  },
  water: {
    primary: Color.Azure,
    secondary: Color.Cyan,
    hexPrimary: "#007fff",
    hexSecondary: "#00ffff",
  },
  earth: {
    primary: Color.Green,
    secondary: Color.Brown,
    hexPrimary: "#00ff00",
    hexSecondary: "#964b00",
  },
  wind: {
    primary: Color.White,
    secondary: Color.Gray,
    hexPrimary: "#ffffff",
    hexSecondary: "#808080",
  },
};

export type Stats = Record<
  (typeof Attributes)[keyof typeof Attributes],
  StatConfig
>;
export type Attribute = (typeof Attributes)[keyof typeof Attributes];
export type Resource = (typeof Resources)[keyof typeof Resources];

export type ItemType = "weapon" | "armor" | "consumable" | "material" | "quest";

export type ItemTag = "light-source";

export interface InventoryItem {
  id: string;
  iconUrl: string;
  name: string;
  type: ItemType;
  description: string;
  spriteSheet?: ex.ImageSource;
  tags?: ItemTag[];
}

export type BuffableAttribute = Attribute | Resource | "temperature";

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
  | "back"
  | "offhand";

export interface EquipmentItem extends InventoryItem {
  slot: EquipmentSlot;
  spriteLayer?: number;
  buffs?: EquipmentBuff;
  requirements?: AttributeRequirement;
}

export type WeaponSubType = "sword" | "axe" | "pickaxe" | "sickle" | "hammer";

export interface WeaponItem extends EquipmentItem {
  damage: number;
  reach: number;
  type: "weapon";
  subtype: WeaponSubType;
  slot: "weapon";
}

export interface ArmorItem extends EquipmentItem {
  defense: number;
  type: "armor";
  slot: Exclude<EquipmentSlot, "weapon">;
}
