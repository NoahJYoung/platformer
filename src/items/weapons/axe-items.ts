import { WeaponResources } from "../../resources";
import type { ItemFactoryData } from "../types";

export const axeItems = new Map<string, ItemFactoryData>([
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
      reach: 10,
    } satisfies ItemFactoryData,
  ],
]);
