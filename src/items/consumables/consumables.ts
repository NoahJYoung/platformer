import type { ItemFactoryData } from "../types";
import { foodItems } from "./food-items";
import { waterItems } from "./water-items";

export const consumables = new Map<string, ItemFactoryData>([
  ...foodItems,
  ...waterItems,
]);
