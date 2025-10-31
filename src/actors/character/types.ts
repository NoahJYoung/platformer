import { Color } from "excalibur";
import type { Player } from "../player/player";

export type HairOptions =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35;

export type SkinToneOptions = 1 | 2 | 3 | 4 | 5;

type MaleAppearance = {
  sex: "male";
  hairStyle: HairOptions;
  skinTone: SkinToneOptions;
  displayName: string;
};

type FemaleAppearance = {
  sex: "female";
  hairStyle: HairOptions;
  skinTone: SkinToneOptions;
  displayName: string;
};

export type AppearanceOptions = MaleAppearance | FemaleAppearance;

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

export type ItemTag = "light-source" | "torch";

export interface InventoryItem {
  id: string;
  iconUrl: string;
  name: string;
  type: ItemType;
  description: string;
  spriteSheet?: ex.ImageSource;
  tags?: ItemTag[];
  stackSize?: number | null;
}

export interface InventorySlot {
  item: InventoryItem;
  quantity: number;
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

export interface ConsumableItem extends InventoryItem {
  type: "consumable";
  subtype: ConsumableSubType;
  refillable?: boolean;
  onConsume: (player: Player) => void;
  charges?: number;
  maxCharges?: number;
}

export type ConsumableSubType = "potion" | "food" | "water";

export type WeaponSubType =
  | "sword"
  | "axe"
  | "pickaxe"
  | "sickle"
  | "hammer"
  | "knife";

export interface WeaponItem extends EquipmentItem {
  damage: number;
  reach: number;
  type: "weapon";
  subtype: WeaponSubType;
  slot: "weapon";
  stackSize: null;
}

export interface ArmorItem extends EquipmentItem {
  defense: number;
  type: "armor";
  slot: Exclude<EquipmentSlot, "weapon">;
  stackSize: null;
}
