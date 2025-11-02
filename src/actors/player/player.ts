import * as ex from "excalibur";
import { Character } from "../character/character";
import type {
  AppearanceOptions,
  Attribute,
  AttributesConfig,
  ConsumableItem,
  EquipmentItem,
  EquipmentSlot,
} from "../character/types";
import { GameEngine } from "../../engine/game-engine";
import type { LootDrop } from "../character/loot-drop";
import type { MaterialSource } from "../resources/material-source";
import { AudioKeys } from "../../audio/sound-manager/audio-keys";
import type { GameMapScene } from "../../scenes/game-scene";

export class Player extends Character {
  private lastToggleFrame: number = -1;
  private lastJumpFrame: number = -1;
  private temperature: number = 20;
  private hunger: number = 100;
  private thirst: number = 100;
  private nearbyMaterialSource: MaterialSource | null = null;

  private hasShownHungerWarning: boolean = false;
  private hasShownThirstWarning: boolean = false;
  private hasShownStarvationWarning: boolean = false;
  private hasShownDehydrationWarning: boolean = false;

  private lastInteractionTime: number = 0;
  private interactionCooldown: number = 500;

  private lastUIUpdate = 0;
  private uiUpdateInterval = 100;

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

  onPreUpdate(engine: GameEngine) {
    this.handleInput(engine);

    if (this.isInside && this.buildingBounds) {
      this.enforceMovementBoundaries();
    }
  }

  private enforceMovementBoundaries() {
    if (!this.buildingBounds) return;

    const { minX, maxX, minY, maxY } = this.buildingBounds;

    if (this.pos.x < minX) {
      this.pos.x = minX;
      this.vel.x = 0;
    } else if (this.pos.x > maxX) {
      this.pos.x = maxX;
      this.vel.x = 0;
    }

    if (this.pos.y < minY) {
      this.pos.y = minY;
      this.vel.y = 0;
    } else if (this.pos.y > maxY) {
      this.pos.y = maxY;
      this.vel.y = 0;
    }
  }

  update(engine: GameEngine, elapsed: number): void {
    super.update(engine, elapsed);
    this.updateTemperature(engine);
    this.updateHungerAndThirst(elapsed);
  }

  public setNearbyMaterialSource(source: MaterialSource | null) {
    this.nearbyMaterialSource = source;
  }

  public getNearbyMaterialSource(): MaterialSource | null {
    return this.nearbyMaterialSource;
  }

  private handleInput(engine: GameEngine) {
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
      const currentFrame = engine.stats.currFrame.id;
      if (this.lastJumpFrame !== currentFrame) {
        this.lastJumpFrame = currentFrame;
        if (
          this.energy >= this.jumpEnergyCost &&
          this.numberOfJumps < this.maxJumps
        ) {
          super.jump();
          this.vel.y = this.jumpSpeed;
          this.currentState = "jumping";
          this.energy = Math.max(0, this.energy - this.jumpEnergyCost);
          this.numberOfJumps += 1;
        }
      }
    }

    if (kb.wasPressed(ex.Keys.J) && this.currentState !== "hurt") {
      if (this.energy >= this.attackEnergyCost) {
        this.attack(currentTime);
      }
    }

    if (kb.wasPressed(ex.Keys.F) && this.currentState !== "hurt") {
      const scene = this.scene as GameMapScene;

      const buildingManager = scene.getBuildingManager?.();

      if (buildingManager) {
        if (
          currentTime - this.lastInteractionTime >=
          this.interactionCooldown
        ) {
          const interacted = buildingManager.tryDoorInteraction(this.pos);

          if (interacted) {
            this.lastInteractionTime = currentTime;

            const isInside = buildingManager.isPlayerInside(this.pos);
            const message = isInside ? "Entered building" : "Exited building";
            (engine as GameEngine).showMessage(message);
          }
        }
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

  protected updateResources(deltaSeconds: number): void {
    const prevHealth = this.health;
    const prevStamina = this.energy;
    const prevMana = this.mana;

    super.updateResources(deltaSeconds);
    this.lastUIUpdate += deltaSeconds * 1000;
    if (this.lastUIUpdate >= this.uiUpdateInterval) {
      if (
        prevHealth !== this.health ||
        prevStamina !== this.energy ||
        prevMana !== this.mana
      ) {
        this.events.emit("resourcesChanged");
      }
      this.lastUIUpdate = 0;
    }
  }

  getHunger(): number {
    return this.hunger;
  }

  consumeItem(item: ConsumableItem, slot: number) {
    if (item.type === "consumable") {
      if (item.refillable) {
        if (item.charges !== 0) {
          if (!item.charges) return;
          item.onConsume(this);
          item.charges -= 1;
        }
      } else {
        item.onConsume(this);
        this.inventory.removeItem(slot, 1);
      }
    }
  }

  private updateHungerAndThirst(elapsed: number): void {
    const deltaSeconds = elapsed / 1000;
    const maxHealth = this.statsSystem.getMaxHealth();

    const raining = this.engine?.timeCycle.getWeather() === "raining";

    if (raining) {
      this.refillWater();
    }

    const hungerDepletion =
      this.statsSystem.getHungerDepletionRate() * deltaSeconds;
    const thirstDepletion =
      this.statsSystem.getThirstDepletionRate() * deltaSeconds;

    if (this.hunger < 50 && this.hunger > 0) {
      if (!this.hasShownHungerWarning) {
        (this.engine as GameEngine).showMessage("You are getting hungry");
        this.hasShownHungerWarning = true;
      }
    } else if (this.hunger >= 50) {
      this.hasShownHungerWarning = false;
    }

    if (this.thirst < 50 && this.thirst > 0) {
      if (!this.hasShownThirstWarning) {
        (this.engine as GameEngine).showMessage("You are getting thirsty");
        this.hasShownThirstWarning = true;
      }
    } else if (this.thirst >= 50) {
      this.hasShownThirstWarning = false;
    }

    if (this.hunger > 0) {
      this.hunger = Math.max(0, this.hunger - hungerDepletion);
      this.hasShownStarvationWarning = false;
    } else {
      if (!this.hasShownStarvationWarning) {
        (this.engine as GameEngine).showMessage(
          "You desperately need to eat!",
          "danger"
        );
        this.hasShownStarvationWarning = true;
      }
      const healthDamage = (hungerDepletion / 100) * maxHealth;
      this.health = Math.max(0, this.health - healthDamage);
    }

    if (this.thirst > 0) {
      this.thirst = Math.max(0, this.thirst - thirstDepletion);
      this.hasShownDehydrationWarning = false;
    } else {
      if (!this.hasShownDehydrationWarning) {
        (this.engine as GameEngine).showMessage(
          "You desperately need water!",
          "danger"
        );
        this.hasShownDehydrationWarning = true;
      }
      const healthDamage = (thirstDepletion / 100) * maxHealth;
      this.health = Math.max(0, this.health - healthDamage);
    }

    if (this.health <= 0 && !this.hasDied) {
      this.die();
    }
  }

  public shouldPreventHealthRecovery(): boolean {
    return this.hunger === 0 || this.thirst === 0;
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

  refillWater() {
    if (this.inventory.hasUnfilledWaterContainers) {
      const weather = this.engine?.timeCycle.getWeather();
      const isRaining = weather === "raining";
      const message = isRaining
        ? "You take advantage of the rain to refill your water"
        : "You refill your water";
      this.engine?.showMessage(message);
      this.inventory.refillWater();
    }
  }

  public unequipItem(slot: EquipmentSlot): void {
    const unequipSoundKey = AudioKeys.SFX.PLAYER.ITEMS.EQUIPMENT.UNEQUIP;
    this.engine?.soundManager.play(unequipSoundKey, 0.3);

    const previousItem = this.equipmentManager.unequip(slot);
    if (previousItem) {
      this.inventory.addItem(0, previousItem);
    }
  }

  public equipItem(item: EquipmentItem): void {
    if (!this.canEquip(item)) {
      return;
    }
    const equipSoundKey = AudioKeys.SFX.PLAYER.ITEMS.EQUIPMENT.EQUIP;
    this.engine?.soundManager.play(equipSoundKey, 0.3);
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

  private nearbyLootDrop: LootDrop | null = null;

  public setNearbyLootDrop(lootDrop: LootDrop | null) {
    this.nearbyLootDrop = lootDrop;
  }

  public getNearbyLootDrop(): LootDrop | null {
    return this.nearbyLootDrop;
  }

  public die() {
    this.engine?.showMessage("You died!", "danger");
    super.die();
  }
}
