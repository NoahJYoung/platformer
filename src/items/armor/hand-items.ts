import * as ex from "excalibur";
import { ClothingResources } from "../../resources/clothing-resources";
import type { ItemFactoryData } from "../types";

export const handItems = new Map<string, ItemFactoryData>([
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
        female: new ex.ImageSource(""),
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
        female: new ex.ImageSource(""),
      },
      defense: 1,
    } satisfies ItemFactoryData,
  ],
]);
