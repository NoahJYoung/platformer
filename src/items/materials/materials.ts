import type { ItemFactoryData } from "../types";
import { woodItems } from "./wood-items";

export const materials = new Map<string, ItemFactoryData>([...woodItems]);
