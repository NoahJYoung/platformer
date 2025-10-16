import { WeaponResources } from "../resources";
import { ClothingResources } from "../resources/clothing-resources";
import type { ItemFactoryData } from "./types";

export const items = new Map<string, ItemFactoryData>([
  [
    "iron_sword",
    {
      iconUrl: "/assets/icons/weapons/iron_sword_icon.png",
      name: "Iron Sword",
      type: "weapon",
      slot: "weapon",
      subtype: "sword",
      description: "A sword made of iron",
      spriteSheets: {
        male: WeaponResources.male.iron_sword,
        female: WeaponResources.female.iron_sword,
      },
      damage: 15,
      reach: 25,
    } satisfies ItemFactoryData,
  ],
  [
    "iron_axe",
    {
      iconUrl: "/assets/icons/weapons/iron_axe_icon.png",
      name: "Iron Axe",
      type: "weapon",
      slot: "weapon",
      subtype: "axe",
      description: "An axe made of iron",

      spriteSheets: {
        male: WeaponResources.male.iron_axe,
        female: WeaponResources.female.iron_axe,
      },
      damage: 5,
      reach: 25,
    } satisfies ItemFactoryData,
  ],
  [
    "blue_pants",
    {
      iconUrl: "",
      name: "Blue Pants",
      type: "armor",
      slot: "legs",
      description: "A pair of blue pants",

      spriteSheets: {
        male: ClothingResources.legs.male.blue_pants,
        female: WeaponResources.female.iron_axe,
      },
      defense: 5,
    } satisfies ItemFactoryData,
  ],
  [
    "blue_shirt",
    {
      iconUrl: "",
      name: "Blue Shirt",
      type: "armor",
      slot: "body",
      description: "A White shirt with blue trim",

      spriteSheets: {
        male: ClothingResources.body.male.blue_shirt,
        female: WeaponResources.female.iron_axe,
      },
      defense: 5,
    } satisfies ItemFactoryData,
  ],
  [
    "small_backpack",
    {
      iconUrl: "",
      name: "Small Backpack",
      type: "armor",
      slot: "back",
      description: "A small backpack",

      spriteSheets: {
        male: ClothingResources.back.male.small_backpack,
        female: WeaponResources.female.iron_axe,
      },
      defense: 1,
    } satisfies ItemFactoryData,
  ],
  [
    "blue_feather_hat",
    {
      iconUrl: "",
      name: "Blue Feathered Hat",
      type: "armor",
      slot: "helmet",
      description: "A blue hat with a feather",

      spriteSheets: {
        male: ClothingResources.head.male.blue_feather_hat,
        female: WeaponResources.female.iron_axe,
      },
      defense: 2,
    } satisfies ItemFactoryData,
  ],
]);
