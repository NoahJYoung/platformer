import { WeaponResources } from "../../resources";
import type { ItemFactoryData } from "../types";

export const foodItems = new Map<string, ItemFactoryData>([
  [
    "apple",
    {
      iconUrl: "/assets/icons/consumables/food/apple.png",
      name: "Apple",
      type: "consumable",
      subtype: "food",
      description: "A delicious red apple",
      spriteSheets: {
        male: WeaponResources.male.iron_sword,
        female: WeaponResources.female.iron_sword,
      },
      effect: { health: 25, hunger: 1 },
    } satisfies ItemFactoryData,
  ],
]);
