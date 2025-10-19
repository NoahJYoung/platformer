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
      reach: 50,
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
    "dark_pants",
    {
      iconUrl: "",
      name: "Dark Pants",
      type: "armor",
      slot: "legs",
      description: "A pair of dark pants",

      spriteSheets: {
        male: ClothingResources.legs.male.black_pants,
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
    "dark_shirt",
    {
      iconUrl: "",
      name: "Dark Shirt",
      type: "armor",
      slot: "body",
      description: "A dark colored shirt",

      spriteSheets: {
        male: ClothingResources.body.male.black_shirt,
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
  [
    "dark_hood",
    {
      iconUrl: "",
      name: "Dark Hood",
      type: "armor",
      slot: "helmet",
      description: "A Dark Colored Hood",

      spriteSheets: {
        male: ClothingResources.head.male.black_hood,
        female: WeaponResources.female.iron_axe,
      },
      defense: 2,
    } satisfies ItemFactoryData,
  ],
  [
    "leather_boots",
    {
      iconUrl: "",
      name: "Leather Boots",
      type: "armor",
      slot: "boots",
      description: "A pair of boots made of leather",

      spriteSheets: {
        male: ClothingResources.feet.male.brown_boots,
        female: WeaponResources.female.iron_axe,
      },
      defense: 3,
    } satisfies ItemFactoryData,
  ],
  [
    "dark_boots",
    {
      iconUrl: "",
      name: "Dark Boots",
      type: "armor",
      slot: "boots",
      description: "A pair of dark boots",

      spriteSheets: {
        male: ClothingResources.feet.male.black_boots,
        female: WeaponResources.female.iron_axe,
      },
      defense: 3,
    } satisfies ItemFactoryData,
  ],
  [
    "brown_scarf",
    {
      iconUrl: "",
      name: "Brown Scarf",
      type: "armor",
      slot: "mask",
      description: "A brown scarf to cover your face",

      spriteSheets: {
        male: ClothingResources.face.male.brown_face_scarf,
        female: WeaponResources.female.iron_axe,
      },
      defense: 1,
    } satisfies ItemFactoryData,
  ],
  [
    "leather_gloves",
    {
      iconUrl: "",
      name: "Leather Gloves",
      type: "armor",
      slot: "gloves",
      description: "A Pair of leather gloves",

      spriteSheets: {
        male: ClothingResources.hands.male.brown_gloves,
        female: WeaponResources.female.iron_axe,
      },
      defense: 1,
    } satisfies ItemFactoryData,
  ],
  [
    "dark_gloves",
    {
      iconUrl: "",
      name: "Dark Gloves",
      type: "armor",
      slot: "gloves",
      description: "A Pair of dark gloves",

      spriteSheets: {
        male: ClothingResources.hands.male.black_gloves,
        female: WeaponResources.female.iron_axe,
      },
      defense: 1,
    } satisfies ItemFactoryData,
  ],
  [
    "small_lantern",
    {
      iconUrl: "",
      name: "Small Lantern",
      type: "armor",
      slot: "offhand",
      description: "A small lantern",
      tags: ["light-source"],

      spriteSheets: {
        male: ClothingResources.back.male.small_lantern,
        female: ClothingResources.back.female.small_lantern,
      },
      defense: 1,
    } satisfies ItemFactoryData,
  ],
]);
