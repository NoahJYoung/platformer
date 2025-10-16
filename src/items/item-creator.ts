import type { InventoryItem } from "../actors/character/types";
import { items } from "./items";
import { v4 as uuid } from "uuid";

export const createItem = (
  key: string,
  sex: "male" | "female"
): InventoryItem => {
  const itemData = items.get(key);

  if (!itemData) {
    throw new Error(`No item data found for item: ${key}`);
  }

  const { spriteSheets, ...rest } = itemData;

  return { ...rest, id: uuid(), spriteSheet: spriteSheets[sex] };
};
