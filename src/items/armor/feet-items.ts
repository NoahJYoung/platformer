import * as ex from "excalibur";
import { ClothingResources } from "../../resources/clothing-resources";
import type { ItemFactoryData } from "../types";

export const feetItems = new Map<string, ItemFactoryData>([
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
        female: new ex.ImageSource(""),
      },
      defense: 3,
    } satisfies ItemFactoryData,
  ],
]);
