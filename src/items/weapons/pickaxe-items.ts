import { WeaponResources } from "../../resources";
import type { ItemFactoryData } from "../types";

export const pickaxeItems = new Map<string, ItemFactoryData>([
  [
    "iron_pickaxe",
    {
      iconUrl: "/assets/icons/weapons/iron_pickaxe_icon.png",
      name: "Iron Pickaxe",
      type: "weapon",
      slot: "weapon",
      subtype: "pickaxe",
      description: "A pickaxe made of iron",

      spriteSheets: {
        male: WeaponResources.male.iron_pickaxe,
        female: WeaponResources.female.iron_pickaxe,
      },
      damage: 5,
      reach: 10,
    } satisfies ItemFactoryData,
  ],
]);
