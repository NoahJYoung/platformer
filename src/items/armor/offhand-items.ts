import * as ex from "excalibur";
import { ClothingResources } from "../../resources/clothing-resources";
import type { ItemFactoryData } from "../types";

export const offhandItems = new Map<string, ItemFactoryData>([
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
        male: ClothingResources.offhand.male.small_lantern,
        female: new ex.ImageSource(""),
      },
      defense: 0,
    } satisfies ItemFactoryData,
  ],
  [
    "torch",
    {
      iconUrl: "/assets/icons/armor/offhand/torch_icon.png",
      name: "Torch",
      type: "armor",
      slot: "offhand",
      description: "A torch to light your way",
      tags: ["light-source", "torch"],

      spriteSheets: {
        male: ClothingResources.offhand.male.torch,
        female: new ex.ImageSource(""),
      },
      defense: 0,
    } satisfies ItemFactoryData,
  ],
]);
