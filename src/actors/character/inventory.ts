// inventory.ts
export interface InventoryItem {
  id: string;
  name: string;
  type: "weapon" | "armor" | "consumable";
  spriteSheet?: ex.ImageSource;
  damage?: number; // Weapon damage
  reach?: number; // Weapon hitbox width
}

export class Inventory {
  private items: Map<number, InventoryItem | null> = new Map();
  private maxSlots: number = 10;

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

  getItem(slot: number): InventoryItem | null {
    return this.items.get(slot) || null;
  }
}
