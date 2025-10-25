import type { Player } from "../../actors/player/player";
import type { ItemFactoryData } from "../types";

export const foodItems = new Map<string, ItemFactoryData>([
  [
    "apple",
    {
      iconUrl: "/assets/icons/consumables/food/apple.png",
      name: "Apple",
      type: "consumable",
      subtype: "food",
      description: "A delicious red apple",
      onConsume: (player: Player) => {
        const healthRecovery = 25;
        const hungerRecovery = 15;
        player.heal(healthRecovery);
        player.updateHunger(hungerRecovery);
      },
    } satisfies ItemFactoryData,
  ],
]);
