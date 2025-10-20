import * as ex from "excalibur";
import { CollisionGroups, SCALE } from "../config";
import type { Inventory } from "./inventory";
import type { EquipmentManager } from "./equipment-manager";
import type { EquipmentItem } from "./types";
import type { GameEngine } from "../../game-engine";
import { Player } from "../player/player";

export class LootDrop extends ex.Actor {
  public inventory: Inventory;
  public equipment: Map<string, EquipmentItem | null>;
  private interactionIndicator?: ex.Actor;
  private isPlayerNearby: boolean = false;

  constructor(
    pos: ex.Vector,
    inventory: Inventory,
    equipmentManager: EquipmentManager
  ) {
    super({
      name: "loot-drop",
      pos: ex.vec(pos.x, pos.y + 20 * SCALE),
      width: 16 * SCALE,
      height: 16 * SCALE,
      collisionType: ex.CollisionType.Passive,
      collisionGroup: CollisionGroups.Interactable,
    });

    this.inventory = inventory;
    this.equipment = equipmentManager.getAllEquipped();
  }

  onInitialize(engine: GameEngine) {
    const bagText = new ex.Text({
      text: "📦",
      font: new ex.Font({
        size: 16 * SCALE,
        family: "Arial",
      }),
    });
    this.graphics.use(bagText);

    this.interactionIndicator = new ex.Actor({
      pos: ex.vec(0, -20 * SCALE),
      width: 32 * SCALE,
      height: 16 * SCALE,
      collisionType: ex.CollisionType.PreventCollision,
    });

    const keyText = new ex.Text({
      text: "[F]",
      font: new ex.Font({
        size: 10 * SCALE,
        family: "Arial",
        bold: true,
        color: ex.Color.White,
        shadow: {
          offset: ex.vec(1, 1),
          color: ex.Color.Black,
        },
      }),
    });

    this.interactionIndicator.graphics.use(keyText);
    this.interactionIndicator.graphics.visible = false;
    this.addChild(this.interactionIndicator);

    this.on("collisionstart", (evt) => {
      const other = evt.other.owner as ex.Actor;

      if (other.name === "player") {
        this.isPlayerNearby = true;
        if (this.interactionIndicator) {
          this.interactionIndicator.graphics.visible = true;
        }
      }

      if (other instanceof Player) {
        other.setNearbyLootDrop(this);
      }
    });

    this.on("collisionend", (evt) => {
      const other = evt.other.owner as ex.Actor;
      if (other?.name === "player") {
        this.isPlayerNearby = false;
        if (this.interactionIndicator) {
          this.interactionIndicator.graphics.visible = false;
        }
      }

      if (other instanceof Player) {
        other.setNearbyLootDrop(null);
      }
    });
  }

  public getIsPlayerNearby(): boolean {
    return this.isPlayerNearby;
  }

  public getAllItems(): {
    inventory: Inventory;
    equipment: Map<string, EquipmentItem | null>;
  } {
    return {
      inventory: this.inventory,
      equipment: this.equipment,
    };
  }
}
