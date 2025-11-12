import { ImageSource } from "excalibur";
import { WeaponResources } from "../../resources";
import type { ItemFactoryData } from "../types";

export const knifeItems = new Map<string, ItemFactoryData>([
  [
    "iron_knife",
    {
      iconUrl: "/assets/icons/weapons/iron_knife_icon.png",
      name: "Iron Knife",
      type: "weapon",
      slot: "weapon",
      subtype: "knife",
      description: "A knife made of iron",
      spriteSheets: {
        male: WeaponResources.male.iron_knife,
        female: new ImageSource(""),
      },
      damage: 8,
      reach: 8,
    } satisfies ItemFactoryData,
  ],
]);
