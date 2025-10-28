import type { ConsumableItem, InventoryItem, InventorySlot } from "./types";

export class Inventory {
  private items: Map<number, InventorySlot | null> = new Map();
  public maxSlots: number = 20;
  public onRemoveItem?: () => void;

  constructor(onRemoveItem?: () => void) {
    this.onRemoveItem = onRemoveItem;
    for (let i = 0; i < this.maxSlots; i++) {
      this.items.set(i, null);
    }
  }

  refillWater() {
    if (!this.hasUnfilledWaterContainers) {
      return;
    }
    const waterContainers = this.getWaterContainers();
    if (waterContainers.length) {
      waterContainers.forEach((item) => {
        item.charges = item.maxCharges;
      });
    }
  }

  private getWaterContainers = () => {
    return Array.from(this.items)
      .filter(([, slot]) => (slot?.item as ConsumableItem)?.subtype === "water")
      .map(([, slot]) => slot?.item as ConsumableItem);
  };

  addItem(slot: number, item: InventoryItem, quantity: number = 1): boolean {
    if (slot >= this.maxSlots || quantity <= 0) return false;

    if (item.stackSize) {
      let remainingQuantity = quantity;

      for (let i = 0; i < this.maxSlots && remainingQuantity > 0; i++) {
        const existingSlot = this.items.get(i);
        if (
          existingSlot &&
          existingSlot.item.id === item.id &&
          existingSlot.quantity < (item.stackSize || 99)
        ) {
          const maxStackSize = item.stackSize || 99;
          const spaceInStack = maxStackSize - existingSlot.quantity;
          const amountToAdd = Math.min(spaceInStack, remainingQuantity);

          existingSlot.quantity += amountToAdd;
          remainingQuantity -= amountToAdd;
        }
      }

      if (remainingQuantity > 0) {
        const slots = this.findEmptySlots(slot);
        for (const emptySlot of slots) {
          if (remainingQuantity <= 0) break;

          const maxStackSize = item.stackSize || 99;
          const amountToAdd = Math.min(maxStackSize, remainingQuantity);

          this.items.set(emptySlot, {
            item: { ...item },
            quantity: amountToAdd,
          });

          remainingQuantity -= amountToAdd;
        }
      }

      return remainingQuantity === 0;
    }

    if (this.items.get(slot) !== null) {
      for (let i = slot; i < this.maxSlots; i++) {
        if (this.items.get(i) === null) {
          this.items.set(i, { item: { ...item }, quantity: 1 });
          return true;
        }
      }
      for (let i = 0; i < slot; i++) {
        if (this.items.get(i) === null) {
          this.items.set(i, { item: { ...item }, quantity: 1 });
          return true;
        }
      }
      return false;
    }

    this.items.set(slot, { item: { ...item }, quantity: 1 });
    return true;
  }

  /**
   * Helper to find empty slots starting from a preferred slot
   */
  private findEmptySlots(preferredSlot: number): number[] {
    const emptySlots: number[] = [];

    for (let i = preferredSlot; i < this.maxSlots; i++) {
      if (this.items.get(i) === null) emptySlots.push(i);
    }

    for (let i = 0; i < preferredSlot; i++) {
      if (this.items.get(i) === null) emptySlots.push(i);
    }

    return emptySlots;
  }

  /**
   * Remove items from a slot
   * @param slot - Slot to remove from
   * @param quantity - How many to remove (default: all)
   * @returns The removed items, or null if slot is empty
   */
  removeItem(slot: number, quantity?: number): InventorySlot | null {
    const slotData = this.items.get(slot);
    if (!slotData) return null;

    const removeAmount = quantity ?? slotData.quantity;

    if (removeAmount >= slotData.quantity) {
      this.items.set(slot, null);
      this.onRemoveItem?.();
      return slotData;
    } else {
      slotData.quantity -= removeAmount;
      this.onRemoveItem?.();
      return {
        item: { ...slotData.item },
        quantity: removeAmount,
      };
    }
  }

  removeItemByReference(
    item: InventoryItem,
    quantity: number = 1
  ): InventorySlot | null {
    let remainingToRemove = quantity;
    const removedItems: InventorySlot[] = [];

    for (const [slot, slotData] of this.items.entries()) {
      if (remainingToRemove <= 0) break;
      if (!slotData || slotData.item.id !== item.id) continue;

      const amountToRemove = Math.min(slotData.quantity, remainingToRemove);
      const removed = this.removeItem(slot, amountToRemove);

      if (removed) {
        removedItems.push(removed);
        remainingToRemove -= amountToRemove;
      }
    }

    if (removedItems.length === 0) return null;

    const totalRemoved = removedItems.reduce(
      (sum, slot) => sum + slot.quantity,
      0
    );

    return {
      item: removedItems[0].item,
      quantity: totalRemoved,
    };
  }

  getItem(slot: number): InventorySlot | null {
    return this.items.get(slot) || null;
  }

  getAllItems() {
    return this.items;
  }

  getSlotFromItem(item: InventoryItem): number {
    const entry = Array.from(this.items.entries()).find(
      ([, slotData]) => slotData?.item.id === item.id
    );

    return entry ? entry[0] : -1;
  }

  /**
   * Get total quantity of an item across all slots
   */
  getTotalQuantity(itemId: string): number {
    let total = 0;
    for (const slotData of this.items.values()) {
      if (slotData && slotData.item.id === itemId) {
        total += slotData.quantity;
      }
    }
    return total;
  }

  moveItemToSlot(fromSlot: number, toSlot: number): boolean {
    if (fromSlot >= this.maxSlots || toSlot >= this.maxSlots) return false;
    if (fromSlot < 0 || toSlot < 0) return false;
    if (fromSlot === toSlot) return true;

    const itemToMove = this.items.get(fromSlot);
    const itemAtDestination = this.items.get(toSlot);

    if (itemToMove === null) return false;

    if (
      itemAtDestination &&
      itemToMove?.item.id === itemAtDestination.item.id &&
      !!itemToMove.item.stackSize
    ) {
      const maxStackSize = itemToMove.item.stackSize || 99;
      const spaceInDestination = maxStackSize - itemAtDestination.quantity;

      if (spaceInDestination > 0) {
        const amountToMove = Math.min(spaceInDestination, itemToMove.quantity);
        itemAtDestination.quantity += amountToMove;
        itemToMove.quantity -= amountToMove;

        if (itemToMove.quantity <= 0) {
          this.items.set(fromSlot, null);
        }
        return true;
      }
    }

    if (itemToMove) {
      if (itemAtDestination) {
        this.items.set(toSlot, itemToMove);
        this.items.set(fromSlot, itemAtDestination);
      } else {
        this.items.set(toSlot, itemToMove);
        this.items.set(fromSlot, null);
      }
    }

    return true;
  }

  get hasUnfilledWaterContainers() {
    const containers = this.getWaterContainers();

    return (
      containers.length > 0 &&
      containers.some((item) => item?.charges !== item?.maxCharges)
    );
  }
}
