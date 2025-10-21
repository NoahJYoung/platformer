import * as ex from "excalibur";
import { ClothingResources } from "../../resources/clothing-resources";
import type { ItemFactoryData } from "../types";

export const bodyItems = new Map<string, ItemFactoryData>([
  [
    "blue_shirt",
    {
      iconUrl: "",
      name: "Blue Shirt",
      type: "armor",
      slot: "body",
      description: "A White shirt with blue trim",

      spriteSheets: {
        male: ClothingResources.body.male.blue_shirt,
        female: new ex.ImageSource(""),
      },
      defense: 5,
    } satisfies ItemFactoryData,
  ],
  [
    "dark_shirt",
    {
      iconUrl: "",
      name: "Dark Shirt",
      type: "armor",
      slot: "body",
      description: "A dark colored shirt",

      spriteSheets: {
        male: ClothingResources.body.male.black_shirt,
        female: new ex.ImageSource(""),
      },
      defense: 5,
    } satisfies ItemFactoryData,
  ],
]);
