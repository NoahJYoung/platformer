import * as ex from "excalibur";
import { CollisionGroups, SCALE } from "../config";
import type { Inventory } from "./inventory";
import type { EquipmentManager } from "./equipment-manager";
import type { EquipmentItem } from "./types";
import type { GameEngine } from "../../engine/game-engine";
import { Player } from "../player/player";

export class LootDrop extends ex.Actor {
  public inventory: Inventory;
  public equipment: Map<string, EquipmentItem | null> | null;
  private interactionIndicator?: ex.Actor;
  private isPlayerNearby: boolean = false;
  private deathTimer: ex.Timer;

  constructor(
    pos: ex.Vector,
    inventory: Inventory,
    equipmentManager: EquipmentManager | null
  ) {
    super({
      name: "loot-drop",
      pos: ex.vec(pos.x, pos.y + 20),
      width: 16,
      height: 16,
      collisionType: ex.CollisionType.Passive,
      collisionGroup: CollisionGroups.Interactable,
    });

    this.inventory = inventory;
    this.equipment = equipmentManager?.getAllEquipped() || null;
  }

  onInitialize(engine: GameEngine) {
    this.deathTimer = new ex.Timer({
      repeats: false,
      interval: 30 * 1000,
      fcn: () => this.die(),
    });
    this.scene?.add(this.deathTimer);
    this.deathTimer.start();

    const bagText = new ex.Text({
      text: "📦",
      font: new ex.Font({
        size: 16,
        family: "Arial",
      }),
    });
    this.graphics.use(bagText);

    this.interactionIndicator = new ex.Actor({
      pos: ex.vec(0, -20),
      width: 32,
      height: 16,
      collisionType: ex.CollisionType.PreventCollision,
    });

    const keyText = new ex.Text({
      text: "[F]",
      font: new ex.Font({
        size: 10,
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
    equipment: Map<string, EquipmentItem | null> | null;
  } {
    return {
      inventory: this.inventory,
      equipment: this.equipment,
    };
  }

  private die() {
    this.scene?.remove(this);
    this.kill();
  }
}
