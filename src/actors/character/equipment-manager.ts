import type { AnimationController } from "./animation-controller";
import type {
  EquipmentItem,
  EquipmentSlot,
  WeaponItem,
  ArmorItem,
} from "./types";

export class EquipmentManager {
  private slots: Map<EquipmentSlot, EquipmentItem | null> = new Map();
  private animController: AnimationController;
  public equippedLightSources: EquipmentItem[] = [];

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
      "back",
    ];
    allSlots.forEach((slot) => this.slots.set(slot, null));
  }

  equip(item: EquipmentItem): EquipmentItem | null {
    const previousItem = this.slots.get(item.slot) || null;
    this.slots.set(item.slot, item);

    if (item.tags?.includes("light-source")) {
      this.equippedLightSources.push(item);
    }

    if (item.type === "weapon") {
      this.animController.equipWeapon(item as WeaponItem);
    } else if (item.type === "armor") {
      this.animController.equipArmor(item as ArmorItem);
    }

    return previousItem;
  }

  unequip(slot: EquipmentSlot): EquipmentItem | null {
    const item = this.slots.get(slot) || null;
    this.slots.set(slot, null);

    if (item?.tags?.includes("light-source")) {
      this.equippedLightSources = this.equippedLightSources.filter(
        (equippedItem) => equippedItem.id !== item.id
      );
    }

    if (item?.type === "weapon") {
      this.animController.unequipWeapon();
    } else if (item?.type === "armor") {
      this.animController.unequipArmor((item as ArmorItem).slot);
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

  getEquippedArmor(slot: ArmorItem["slot"]): ArmorItem | null {
    const armor = this.slots.get(slot);
    return armor && armor.type === "armor" ? (armor as ArmorItem) : null;
  }

  getAllEquipped(): Map<EquipmentSlot, EquipmentItem | null> {
    return new Map(this.slots);
  }

  getTotalPhysicalDefense(): number {
    let totalDefense = 0;

    this.slots.forEach((item) => {
      if (item && item.type === "armor") {
        const armorItem = item as ArmorItem;
        totalDefense += armorItem.defense || 0;
      }
    });

    return totalDefense;
  }

  getTotalElementalDefense() {
    return { fire: 0, water: 0, ice: 0, earth: 0 };
  }
}
