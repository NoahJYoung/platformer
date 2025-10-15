import type { EquipmentItem, InventoryItem } from "./types";

export class Inventory {
  private items: Map<number, InventoryItem | null> = new Map();
  public maxSlots: number = 20;

  constructor() {
    for (let i = 0; i < this.maxSlots; i++) {
      this.items.set(i, null);
    }
  }

  addItem(slot: number, item: InventoryItem): boolean {
    if (slot >= this.maxSlots) return false;
    this.items.set(slot, item);
    return true;
  }

  removeItem(slot: number): InventoryItem | null {
    const item = this.items.get(slot) || null;
    this.items.set(slot, null);
    return item;
  }

  removeItemByReference(item: InventoryItem): InventoryItem | null {
    const itemInInventory = Array.from(this.items.entries()).find(
      ([slot, inventoryItem]) => inventoryItem?.id === item.id
    );

    if (itemInInventory) {
      const [slot, foundItem] = itemInInventory;
      this.items.set(slot, null);
      return foundItem;
    }

    return null;
  }

  getItem(slot: number): InventoryItem | EquipmentItem | null {
    return this.items.get(slot) || null;
  }
}
