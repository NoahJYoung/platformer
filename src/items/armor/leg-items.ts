import * as ex from "excalibur";
import { ClothingResources } from "../../resources/clothing-resources";
import type { ItemFactoryData } from "../types";

export const legItems = new Map<string, ItemFactoryData>([
  [
    "blue_pants",
    {
      iconUrl: "/assets/icons/armor/legs/blue_pants_icon.png",
      name: "Blue Pants",
      type: "armor",
      slot: "legs",
      description: "A pair of blue pants",

      spriteSheets: {
        male: ClothingResources.legs.male.blue_pants,
        female: new ex.ImageSource(""),
      },
      defense: 5,
    } satisfies ItemFactoryData,
  ],
]);
