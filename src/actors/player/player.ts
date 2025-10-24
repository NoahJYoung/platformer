import * as ex from "excalibur";
import { Character } from "../character/character";
import type {
  AppearanceOptions,
  Attribute,
  AttributesConfig,
  EquipmentItem,
  EquipmentSlot,
} from "../character/types";
import type { GameEngine } from "../../game-engine";
import type { LootDrop } from "../character/loot-drop";
import type { MaterialSource } from "../resources/material-source";

export class Player extends Character {
  // public isRunMode: boolean = false;
  private lastToggleFrame: number = -1;
  private temperature: number = 20;
  private hunger: number = 100;
  private thirst: number = 100;
  private nearbyMaterialSource: MaterialSource | null = null;

  constructor(
    pos: ex.Vector,
    appearanceOptions: AppearanceOptions,
    attributes?: AttributesConfig
  ) {
    super("player", pos, appearanceOptions, true, false, attributes);
  }

  protected getAttackTargets(): string[] {
    return ["enemy"];
  }

  onPreUpdate(engine: ex.Engine) {
    this.handleInput(engine);
  }

  update(engine: GameEngine, elapsed: number): void {
    super.update(engine, elapsed);
    this.updateTemperature(engine);
  }

  public setNearbyMaterialSource(source: MaterialSource | null) {
    this.nearbyMaterialSource = source;
  }

  public getNearbyMaterialSource(): MaterialSource | null {
    return this.nearbyMaterialSource;
  }

  private handleInput(engine: ex.Engine) {
    const kb = engine.input.keyboard;
    const currentTime = Date.now();
    if (this.currentState === "dead") {
      return;
    }

    if (kb.wasPressed(ex.Keys.ShiftLeft) || kb.wasPressed(ex.Keys.ShiftRight)) {
      const currentFrame = engine.stats.currFrame.id;

      if (this.lastToggleFrame !== currentFrame) {
        this.lastToggleFrame = currentFrame;

        if (this.isRunMode) {
          this.isRunMode = false;
        } else if (this.energy > 10) {
          this.isRunMode = true;
        }
      }
    }

    const canRun = this.isRunMode && this.energy > 0;

    const adjustedMoveSpeed = canRun ? this.runSpeed : this.walkSpeed;

    const isInAir = this.vel.y !== 0;

    let xVel = 0;

    if (kb.isHeld(ex.Keys.K) && this.currentState !== "hurt") {
      if (!this.isShieldActive && this.mana >= 3) {
        this.activateShield();
      } else {
        return;
      }

      xVel = 0;
      this.vel.x = 0;
    } else {
      if (this.isShieldActive) {
        this.deactivateShield();
      }
    }
    if (
      this.currentState !== "attacking" &&
      this.currentState !== "hurt" &&
      this.currentState !== "dodging" &&
      this.currentState !== "shielding"
    ) {
      if (kb.isHeld(ex.Keys.Left) || kb.isHeld(ex.Keys.A)) {
        if (this.isShieldActive) return;
        xVel = -adjustedMoveSpeed;
        this.facingRight = false;
      }
      if (kb.isHeld(ex.Keys.Right) || kb.isHeld(ex.Keys.D)) {
        if (this.isShieldActive) return;
        xVel = adjustedMoveSpeed;
        this.facingRight = true;
      }
    }

    if (this.currentState === "hurt") {
      xVel = 0;
    }

    if (this.currentState !== "dodging") {
      this.vel.x = xVel;
    }
    this.graphics.flipHorizontal = this.facingRight;

    if (
      this.currentState !== "attacking" &&
      this.currentState !== "hurt" &&
      this.currentState !== "dodging" &&
      this.currentState !== "shielding"
    ) {
      if (this.vel.y < 0) {
        this.currentState = "jumping";
      } else if (this.vel.y > 0) {
        this.currentState = "falling";
      } else if (Math.abs(xVel) > 0) {
        this.currentState = canRun ? "running" : "walking";
      } else {
        this.currentState = "idle";
      }
    }

    if (kb.wasPressed(ex.Keys.E) && this.currentState !== "hurt") {
      this.dodge("right", currentTime);
    }

    if (kb.wasPressed(ex.Keys.Q) && this.currentState !== "hurt") {
      this.dodge("left", currentTime);
    }

    if (kb.wasPressed(ex.Keys.U) && this.currentState !== "hurt") {
      this.magicAttack("fire", currentTime);
    }

    if (kb.wasPressed(ex.Keys.I) && this.currentState !== "hurt") {
      this.magicAttack("wind", currentTime);
    }
    if (kb.wasPressed(ex.Keys.N) && this.currentState !== "hurt") {
      this.magicAttack("earth", currentTime);
    }
    if (kb.wasPressed(ex.Keys.M) && this.currentState !== "hurt") {
      this.magicAttack("water", currentTime);
    }

    if (
      (kb.wasPressed(ex.Keys.Up) ||
        kb.wasPressed(ex.Keys.W) ||
        kb.wasPressed(ex.Keys.Space)) &&
      this.canJump &&
      this.currentState !== "hurt"
    ) {
      if (this.energy >= this.jumpEnergyCost) {
        this.vel.y = this.jumpSpeed;
        this.canJump = false;
        this.currentState = "jumping";
        this.energy = Math.max(0, this.energy - this.jumpEnergyCost);
      }
    }

    if (kb.wasPressed(ex.Keys.J) && this.currentState !== "hurt") {
      if (this.energy >= this.attackEnergyCost) {
        this.attack(currentTime);
      }
    }
  }

  getTemperature(): number {
    return this.temperature;
  }

  updateTemperature(engine: GameEngine) {
    const newTemp = engine.timeCycle.getAmbientTemperature();
    this.temperature = newTemp;
  }

  getHunger(): number {
    return this.hunger;
  }

  updateHunger(amount: number) {
    this.hunger = Math.max(0, Math.min(100, this.hunger + amount));
  }

  getThirst(): number {
    return this.thirst;
  }

  updateThirst(amount: number) {
    this.thirst = Math.max(0, Math.min(100, this.thirst + amount));
  }

  public unEquipItem(slot: EquipmentSlot): void {
    const previousItem = this.equipmentManager.unequip(slot);
    if (previousItem) {
      this.inventory.addItem(0, previousItem);
    }
  }

  public equipItem(item: EquipmentItem): void {
    if (!this.canEquip(item)) {
      return;
    }
    const previousItem = this.equipmentManager.equip(item);
    this.inventory.removeItemByReference(item);
    if (previousItem) {
      this.inventory.addItem(0, previousItem);
    }
  }

  public canEquip(item: EquipmentItem) {
    if (!!item.requirements && !!Object.keys(item.requirements).length) {
      return Object.keys(item.requirements).every((attribute) => {
        const requiredLevel =
          item.requirements?.[attribute as keyof typeof item.requirements] || 0;
        const playerLevel = this.statsSystem.getStat(
          attribute as Attribute
        ).baseValue;

        return playerLevel >= requiredLevel;
      });
    }
    return true;
  }

  // protected updateEnergy(deltaSeconds: number) {
  //   console.log(this.currentState, this.isRunMode);
  //   if (this.currentState === "running") {
  //     this.energy = Math.max(
  //       0,
  //       this.energy - this.runEnergyDrain * deltaSeconds
  //     );

  //     if (this.energy <= 0) {
  //       this.isRunMode = false;
  //     }
  //   } else if (
  //     this.currentState === "idle" ||
  //     this.currentState === "walking"
  //   ) {
  //     this.energy = Math.min(
  //       this.maxEnergy,
  //       this.energy + this.energyRecoveryRate * deltaSeconds
  //     );
  //   }
  // }

  private nearbyLootDrop: LootDrop | null = null;

  public setNearbyLootDrop(lootDrop: LootDrop | null) {
    this.nearbyLootDrop = lootDrop;
  }

  public getNearbyLootDrop(): LootDrop | null {
    return this.nearbyLootDrop;
  }
}
