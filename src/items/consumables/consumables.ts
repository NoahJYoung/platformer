import type { ItemFactoryData } from "../types";
import { foodItems } from "./food-items";

export const consumables = new Map<string, ItemFactoryData>([...foodItems]);
