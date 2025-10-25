import type { Player } from "../../actors/player/player";
import type { ItemFactoryData } from "../types";

export const waterItems = new Map<string, ItemFactoryData>([
  [
    "leather_water_skin",
    {
      iconUrl: "/assets/icons/consumables/food/waterskin.png",
      name: "Water Flask",
      type: "consumable",
      subtype: "water",
      description: "A leather pouch for storing water",
      refillable: true,
      charges: 5,
      maxCharges: 5,
      onConsume: (player: Player) => {
        const healthRecovery = 10;
        const thirstRecovery = 40;
        player.heal(healthRecovery);
        player.updateThirst(thirstRecovery);
      },
    } satisfies ItemFactoryData,
  ],
]);
