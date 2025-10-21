import type { ItemFactoryData } from "../types";

export const woodItems = new Map<string, ItemFactoryData>([
  [
    "log",
    {
      iconUrl: "/assets/icons/materials/wood/log.png",
      name: "Log",
      type: "material",
      description: "A log cut from a tree",
    } satisfies ItemFactoryData,
  ],
  [
    "branch",
    {
      iconUrl: "/assets/icons/materials/wood/branch.png",
      name: "Branch",
      type: "material",
      description: "A sturdy tree branch",
    } satisfies ItemFactoryData,
  ],
  [
    "bark",
    {
      iconUrl: "/assets/icons/materials/wood/bark.png",
      name: "Bark",
      type: "material",
      description: "A piece of tree bark",
    } satisfies ItemFactoryData,
  ],
  [
    "plank",
    {
      iconUrl: "/assets/icons/materials/wood/plank.png",
      name: "Plank",
      type: "material",
      description: "A wooden plank",
    } satisfies ItemFactoryData,
  ],
  [
    "shaped_wood",
    {
      iconUrl: "/assets/icons/materials/wood/plank.png",
      name: "Shaped Wood",
      type: "material",
      description: "Masterfully Shaped Wood",
    } satisfies ItemFactoryData,
  ],
]);
