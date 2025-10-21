import type { EquipmentItem, InventoryItem } from "./types";

export class Inventory {
  private items: Map<number, InventoryItem | null> = new Map();
  public maxSlots: number = 20;
  public onRemoveItem?: () => void;

  constructor(onRemoveItem?: () => void) {
    this.onRemoveItem = onRemoveItem;
    for (let i = 0; i < this.maxSlots; i++) {
      this.items.set(i, null);
    }
  }

  addItem(slot: number, item: InventoryItem): boolean {
    if (slot >= this.maxSlots) return false;

    // Check if the requested slot is occupied
    if (this.items.get(slot) !== null) {
      for (let i = slot; i < this.maxSlots; i++) {
        if (this.items.get(i) === null) {
          this.items.set(i, item);
          return true;
        }
      }
      for (let i = 0; i < slot; i++) {
        if (this.items.get(i) === null) {
          this.items.set(i, item);
          return true;
        }
      }
      return false;
    }

    this.items.set(slot, item);
    return true;
  }

  removeItem(slot: number): InventoryItem | null {
    const item = this.items.get(slot) || null;
    this.items.set(slot, null);
    this.onRemoveItem?.();
    return item;
  }

  removeItemByReference(item: InventoryItem): InventoryItem | null {
    const itemInInventory = Array.from(this.items.entries()).find(
      ([, inventoryItem]) => inventoryItem?.id === item.id
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

  getAllItems() {
    return this.items;
  }

  getSlotFromItem(item: InventoryItem): number {
    const entry = Array.from(this.items.entries()).find(
      ([, inventoryItem]) => inventoryItem?.id === item.id
    );

    return entry ? entry[0] : -1;
  }

  moveItemToSlot(fromSlot: number, toSlot: number): boolean {
    if (fromSlot >= this.maxSlots || toSlot >= this.maxSlots) return false;
    if (fromSlot < 0 || toSlot < 0) return false;
    if (fromSlot === toSlot) return true; // Nothing to do

    const itemToMove = this.items.get(fromSlot);
    const itemAtDestination = this.items.get(toSlot);

    if (itemToMove === null) return false;

    if (itemAtDestination !== null) {
      this.items.set(toSlot, itemToMove || null);
      this.items.set(fromSlot, itemAtDestination || null);
    } else {
      this.items.set(toSlot, itemToMove || null);
      this.items.set(fromSlot, null);
    }

    return true;
  }
}
