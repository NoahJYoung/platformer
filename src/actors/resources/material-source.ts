import * as ex from "excalibur";
import { Inventory } from "../character/inventory";
import { CollisionGroups } from "../config";
import { DamageNumber } from "../character/damage-number";
import { LootDrop } from "../character/loot-drop";
import type { WeaponSubType, WeaponItem } from "../character/types";
import type { GameEngine } from "../../game-engine";
import type { Player } from "../player/player";
import { HealthBar } from "../character/health-bar";

export abstract class MaterialSource extends ex.Actor {
  public level = 10;
  public health: number = 100;
  public maxHealth: number = 100;
  public hasTakenDamage = false;

  public interactInventory: Inventory;
  public dropInventory: Inventory;

  protected abstract acceptedWeaponTypes: WeaponSubType[];

  protected isDepleted: boolean = false;
  protected healthBar?: HealthBar;

  private interactionIndicator?: ex.Actor;
  private isPlayerNearby: boolean = false;
  private lastDamageTime: number = 0;
  private damageCooldown: number = 500;

  constructor(
    name: string,
    pos: ex.Vector,
    width: number,
    height: number,
    z: number,
    level = 10
  ) {
    super({
      name: name,
      pos: pos,
      width: width,
      height: height,
      collisionType: ex.CollisionType.Passive,
      collisionGroup: ex.CollisionGroup.collidesWith([
        CollisionGroups.Weapon,
        CollisionGroups.Player,
      ]),
      z,
    });

    this.interactInventory = new Inventory();
    this.dropInventory = new Inventory();
    this.level = level;
    this.health = level * 10;
  }

  onInitialize(engine: ex.Engine) {
    this.healthBar = new HealthBar(
      this,
      () => this.health,
      () => this.maxHealth,
      -30
    );
    this.addChild(this.healthBar);

    this.interactionIndicator = new ex.Actor({
      pos: ex.vec(0, -this.height / 2 - 20),
      width: 32,
      height: 16,
      collisionType: ex.CollisionType.PreventCollision,
      z: this.z + 1,
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

    this.on("collisionstart", (evt: ex.CollisionStartEvent) => {
      this.handleWeaponCollision(evt);
      this.handlePlayerProximity(evt);
    });

    this.on("collisionend", (evt: ex.CollisionEndEvent) => {
      this.handlePlayerExit(evt);
    });

    this.onMaterialSourceInitialize(engine);
  }

  protected abstract onMaterialSourceInitialize(engine: ex.Engine): void;

  private handleWeaponCollision(evt: ex.CollisionStartEvent) {
    const hitbox = evt.other.owner as ex.Actor;

    if (hitbox.body.group === CollisionGroups.Weapon) {
      const weapon = (hitbox as any).weaponData as WeaponItem | undefined;

      if (!weapon) {
        return;
      }

      if (this.acceptedWeaponTypes.includes(weapon.subtype)) {
        const baseDamage = weapon.damage || 10;

        const engine = this.scene?.engine as GameEngine;
        const player = engine?.player;
        const damage = player
          ? player.getStrengthDamageMultiplier(baseDamage)
          : baseDamage;

        this.takeDamage(damage);
      }
    }
  }

  private handlePlayerProximity(evt: ex.CollisionStartEvent) {
    const other = evt.other.owner as ex.Actor;

    if (other?.name === "player" && !this.isDepleted) {
      const player = other as Player;

      const hasItems = this.interactInventory.getAllItems().size > 0;
      if (hasItems) {
        this.isPlayerNearby = true;
        if (this.interactionIndicator) {
          player.setNearbyMaterialSource(this);
          this.interactionIndicator.graphics.visible = true;
        }
      }
    }
  }

  private handlePlayerExit(evt: ex.CollisionEndEvent) {
    const other = evt.other.owner as ex.Actor;

    if (other?.name === "player") {
      const player = other as Player;

      this.isPlayerNearby = false;
      if (this.interactionIndicator) {
        player.setNearbyMaterialSource(null);

        this.interactionIndicator.graphics.visible = false;
      }
    }
  }

  public takeDamage(amount: number) {
    if (this.isDepleted) return;
    this.hasTakenDamage = true;
    const currentTime = Date.now();
    if (currentTime - this.lastDamageTime < this.damageCooldown) {
      return;
    }

    this.lastDamageTime = currentTime;

    const oldHealth = this.health;
    this.health = Math.max(0, this.health - amount);

    const actualDamage = oldHealth - this.health;

    if (actualDamage > 0) {
      const damageNumber = new DamageNumber(
        ex.vec(this.pos.x, this.pos.y - this.height / 2),
        Math.round(actualDamage)
      );
      this.scene?.add(damageNumber);

      this.applyDamageTint();
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  private applyDamageTint() {
    const currentGraphic = this.graphics.current;
    if (currentGraphic) {
      currentGraphic.tint = ex.Color.Red;

      setTimeout(() => {
        if (currentGraphic) {
          currentGraphic.tint = ex.Color.White;
        }
      }, 150);
    }
  }

  protected die() {
    this.isDepleted = true;

    this.body.collisionType = ex.CollisionType.PreventCollision;

    this.body.group = ex.CollisionGroup.collidesWith([]);

    if (this.interactionIndicator) {
      this.interactionIndicator.graphics.visible = false;
    }

    this.onDeath();
    this.spawnLootDrop();

    setTimeout(() => {
      this.kill();
    }, 2000);
  }

  protected abstract onDeath(): void;

  private spawnLootDrop() {
    if (!this.scene || !this.dropInventory.getAllItems().size) return;

    const lootDrop = new LootDrop(
      ex.vec(this.pos.x, this.pos.y + this.height - 130),
      this.dropInventory,
      null
    );

    this.scene.add(lootDrop);
  }

  public getIsPlayerNearby(): boolean {
    return this.isPlayerNearby;
  }

  public getInteractInventory(): Inventory {
    return this.interactInventory;
  }
}
