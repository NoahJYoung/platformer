import type { InventoryItem } from "../actors/character/types";
import { items } from "./items";
import { v4 as uuid } from "uuid";

export const createItem = (
  key: string,
  sex: "male" | "female" = "male"
): InventoryItem => {
  const itemData: Record<string, any> | undefined = items.get(key);

  if (!itemData) {
    throw new Error(`No item data found for item: ${key}`);
  }

  if (itemData.spriteSheets) {
    return {
      id: itemData?.stackSize ? key : uuid(),
      spriteSheet: itemData?.spriteSheets[sex],
      ...itemData,
    } as InventoryItem;
  }

  return {
    id: itemData?.stackSize ? key : uuid(),
    ...itemData,
  } as InventoryItem;
};
