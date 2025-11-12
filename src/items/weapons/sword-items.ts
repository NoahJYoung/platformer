import { WeaponResources } from "../../resources";
import type { ItemFactoryData } from "../types";

export const swordItems = new Map<string, ItemFactoryData>([
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
      reach: 15,
    } satisfies ItemFactoryData,
  ],
]);
