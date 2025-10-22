import type { ItemFactoryData } from "../types";
import { axeItems } from "./axe-items";
import { knifeItems } from "./knife-items";
import { swordItems } from "./sword-items";

export const weapons = new Map<string, ItemFactoryData>([
  ...axeItems,
  ...swordItems,
  ...knifeItems,
]);
