import * as ex from "excalibur";
import { ClothingResources } from "../../resources/clothing-resources";
import type { ItemFactoryData } from "../types";

export const bodyItems = new Map<string, ItemFactoryData>([
  [
    "blue_trimmed_white_shirt",
    {
      iconUrl: "",
      name: "Blue Shirt",
      type: "armor",
      slot: "body",
      description: "A White shirt with blue trim",

      spriteSheets: {
        male: ClothingResources.body.male.blue_trimmed_white_shirt,
        female: new ex.ImageSource(""),
      },
      defense: 5,
    } satisfies ItemFactoryData,
  ],
  [
    "black_leather_banded_mail",
    {
      iconUrl: "",
      name: "Black Leather Banded Mail",
      type: "armor",
      slot: "body",
      description: "Chain mail with black leather bands",

      spriteSheets: {
        male: ClothingResources.body.male.black_leather_mail,
        female: new ex.ImageSource(""),
      },
      defense: 5,
    } satisfies ItemFactoryData,
  ],
]);
