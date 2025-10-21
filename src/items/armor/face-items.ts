import * as ex from "excalibur";
import { ClothingResources } from "../../resources/clothing-resources";
import type { ItemFactoryData } from "../types";

export const faceItems = new Map<string, ItemFactoryData>([
  [
    "brown_scarf",
    {
      iconUrl: "",
      name: "Brown Scarf",
      type: "armor",
      slot: "mask",
      description: "A brown scarf to cover your face",

      spriteSheets: {
        male: ClothingResources.face.male.brown_face_scarf,
        female: new ex.ImageSource(""),
      },
      defense: 1,
    } satisfies ItemFactoryData,
  ],
]);
