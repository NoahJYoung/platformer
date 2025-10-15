import type { AnimationController } from "./animation-controller";
import type { EquipmentItem, EquipmentSlot, WeaponItem } from "./types";

export class EquipmentManager {
  private slots: Map<EquipmentSlot, EquipmentItem | null> = new Map();
  private animController: AnimationController;

  constructor(animController: AnimationController) {
    this.animController = animController;
    const allSlots: EquipmentSlot[] = [
      "weapon",
      "helmet",
      "mask",
      "body",
      "legs",
      "gloves",
      "boots",
      "ring1",
      "ring2",
      "amulet",
    ];
    allSlots.forEach((slot) => this.slots.set(slot, null));
  }

  equip(item: EquipmentItem): EquipmentItem | null {
    const previousItem = this.slots.get(item.slot) || null;
    this.slots.set(item.slot, item);
    if (item.type === "weapon") {
      this.animController.equipWeapon(item as WeaponItem);
    }
    return previousItem;
  }

  unequip(slot: EquipmentSlot): EquipmentItem | null {
    const item = this.slots.get(slot) || null;
    this.slots.set(slot, null);

    if (item?.type === "weapon") {
      this.animController.unequipWeapon();
    }

    return item;
  }

  getEquipped(slot: EquipmentSlot): EquipmentItem | null {
    return this.slots.get(slot) || null;
  }

  getEquippedWeapon(): WeaponItem | null {
    const weapon = this.slots.get("weapon");
    return weapon && weapon.type === "weapon" ? (weapon as WeaponItem) : null;
  }

  getAllEquipped(): Map<EquipmentSlot, EquipmentItem | null> {
    return new Map(this.slots);
  }
}
