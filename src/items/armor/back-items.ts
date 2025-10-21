import * as ex from "excalibur";
import { ClothingResources } from "../../resources/clothing-resources";
import type { ItemFactoryData } from "../types";

export const backItems = new Map<string, ItemFactoryData>([
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
        female: new ex.ImageSource(""),
      },
      defense: 1,
    } satisfies ItemFactoryData,
  ],
]);
