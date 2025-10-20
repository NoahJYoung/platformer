import type { EquipmentSlot } from "../../../actors/character/types";

export const getPlaceholderImageUrl = (slot: EquipmentSlot) => {
  const slotToUrlMap: Record<EquipmentSlot, string> = {
    back: "/assets/icons/slots/back",
    offhand: "/assets/icons/slots/offhand",
    amulet: "/assets/icons/slots/amulet",
    body: "/assets/icons/slots/body",
    boots: "/assets/icons/slots/boots",
    gloves: "/assets/icons/slots/gloves",
    helmet: "/assets/icons/slots/helmet",
    legs: "/assets/icons/slots/legs",
    mask: "/assets/icons/slots/mask",
    ring1: "/assets/icons/slots/ring",
    ring2: "/assets/icons/slots/ring",
    weapon: "/assets/icons/slots/weapon",
  };

  return `${slotToUrlMap[slot]}.png`;
};
