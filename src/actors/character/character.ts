import * as ex from "excalibur";
import { Inventory } from "./inventory";
import { CollisionGroups, SPRITE_WIDTH } from "../config";
import { AnimationController } from "./animation-controller";
import { CombatSystem } from "./combat-system";
import { StatsSystem } from "./stats-system";
import { MagicProjectile } from "./magic-projectile";
import type {
  AppearanceOptions,
  ArmorItem,
  AttributesConfig,
  Element,
  EquipmentItem,
  InventoryItem,
  MovementBoundaries,
  SkinToneOptions,
} from "./types";
import { EquipmentManager } from "./equipment-manager";
import { DamageNumber } from "./damage-number";
import { HealthBar } from "./health-bar";
import { NameLabel } from "./name-label";
import { LootDrop } from "./loot-drop";
import { ProtectionShield } from "./protection-shield";
import type { GameEngine } from "../../engine/game-engine";
import { AudioKeys } from "../../audio/sound-manager/audio-keys";

export abstract class Character extends ex.Actor {
  public health: number = 100;
  public maxHealth: number = 100;
  public energy: number = 100;
  public maxEnergy: number = 100;
  public mana: number = 100;
  public maxMana: number = 100;
  public runSpeed: number = 100;
  public walkSpeed: number = 100;
  public canJump: boolean = false;
  public numberOfJumps = 0;

  public engine: GameEngine | null = null;

  public hasTakenDamage = false;
  public hasDied = false;

  private baseFireDamage = 10;
  private baseWindDamage = 10;
  private baseWaterDamage = 10;
  private baseEarthDamage = 10;

  private lastDodgeTime: number = 0;
  private lastSpellCastTime: number = 0;
  private lastAttackTime: number = 0;

  private previousLevel: number = 0;

  public inventory: Inventory;
  public equipmentManager: EquipmentManager;

  public sex: "male" | "female";
  public skinTone: SkinToneOptions;
  public hairStyle: number;

  public animController: AnimationController;
  protected combatSystem: CombatSystem;
  public statsSystem: StatsSystem;

  protected runEnergyDrain: number = 2;
  protected jumpEnergyCost: number = 4;
  protected attackEnergyCost: number = 8;
  protected energyRecoveryRate: number = 8;
  protected healthRecoveryRate: number = 1;
  protected manaRecoveryRate: number = 1;

  protected dodgeEnergyCost: number = 4;
  protected manaCost: number = 8;

  protected fallDamageThreshold: number = 600;
  protected fallDamageMultiplier: number = 0.5;
  protected lastYVelocity: number = 0;

  protected abstract getAttackTargets(): string[];
  private originalCollisionGroup: ex.CollisionGroup;

  public displayName: string;
  protected nameLabel?: NameLabel;
  protected healthBar?: HealthBar;
  protected showHealthBar: boolean = true;

  public protectionShield?: ProtectionShield;
  public isShieldActive: boolean = false;
  protected baseShieldManaCost: number = 5;

  protected isInside: boolean;
  protected buildingBounds: MovementBoundaries | null;

  public isRunMode: boolean = false;
  public isOnRoof = false;

  private isInWater = false;

  constructor(
    name: string,
    pos: ex.Vector,
    appearanceOptions: AppearanceOptions,
    facingRight: boolean,
    showHealthBar: boolean = false,
    attributes?: AttributesConfig,
    isInside: boolean = false,
    buildingBounds: MovementBoundaries | null = null
  ) {
    super({
      name: name,
      z: 1,
      offset: ex.vec(12, 0),
      pos: pos,
      width: 16,
      height: 48,
      collisionType: ex.CollisionType.Active,
      collisionGroup:
        name === "player" ? CollisionGroups.Player : CollisionGroups.Enemy,
    });

    this.originalCollisionGroup = this.body.group;

    this.sex = appearanceOptions.sex;
    this.skinTone = appearanceOptions.skinTone;
    this.hairStyle = appearanceOptions.hairStyle;
    this.displayName = appearanceOptions.displayName;

    this.isInside = isInside;
    this.buildingBounds = buildingBounds;

    this.animController = new AnimationController(
      this,
      this.sex,
      this.skinTone,
      this.hairStyle,
      facingRight
    );

    this.inventory = new Inventory();
    this.equipmentManager = new EquipmentManager(this.animController);

    this.statsSystem = new StatsSystem(
      attributes?.vitality,
      attributes?.strength,
      attributes?.agility,
      attributes?.intelligence
    );

    this.maxHealth = this.statsSystem.getMaxHealth();
    this.health = this.maxHealth;
    this.maxEnergy = this.statsSystem.getMaxEnergy();
    this.energy = this.maxEnergy;
    this.maxMana = this.statsSystem.getMaxMana();
    this.mana = this.maxMana;
    this.runSpeed = this.statsSystem.getRunSpeed();
    this.jumpEnergyCost = 4;
    this.attackEnergyCost = 8;
    this.energyRecoveryRate = this.statsSystem.getEnergyRecoveryRate();
    this.healthRecoveryRate = this.statsSystem.getHealthRecoveryRate();
    this.manaRecoveryRate = this.statsSystem.getHealthRecoveryRate();

    this.previousLevel = this.statsSystem.getLevel();

    this.combatSystem = new CombatSystem(
      this,
      this.animController,
      () => this.getAttackTargets(),
      this.attackEnergyCost
    );

    this.combatSystem.setOnDamageDealtCallback((damage) => {
      const leveledUp = this.statsSystem.onDamageDealt(damage);
      if (leveledUp) {
        this.onStrengthLevelUp();
      }
    });

    this.showHealthBar = showHealthBar;
  }

  onInitialize(engine: GameEngine) {
    this.animController.setupAnimations();
    this.engine = engine;

    const nameLabelOffset = this.showHealthBar ? -40 : -35;
    this.nameLabel = new NameLabel(
      this,
      nameLabelOffset,
      this.name === "player"
    );
    this.addChild(this.nameLabel);

    if (this.showHealthBar) {
      this.healthBar = new HealthBar(
        this,
        () => this.health,
        () => this.maxHealth,
        -30
      );
      this.addChild(this.healthBar);
    }

    this.on("preupdate", (evt) => {
      if (this.animController.currentState !== "dead") {
        const deltaSeconds = engine.clock.elapsed() / 1000;
        this.onPreUpdate(evt.engine, deltaSeconds);
        this.animController.updateAnimation(this.vel);
        this.animController.updateWeaponAnimation();
        this.trackFallVelocity();
        this.updateResources(deltaSeconds);
      }
    });

    this.on("collisionstart", (evt) => {
      this.handleCollisionStart(evt);
    });

    this.on("precollision", (evt) => this.handleRoofCollision(evt));
    this.on("postcollision", (evt) => {
      const otherActor = evt.other.owner as ex.Actor;
      if (
        [CollisionGroups.Roof, CollisionGroups.Platform].includes(
          otherActor?.body.group
        )
      ) {
        this.isOnRoof = false;
      }
    });
  }

  private handleRoofCollision(evt: ex.PreCollisionEvent): void {
    const otherActor = evt.other.owner as ex.Actor;

    if (!otherActor) return;

    if (
      [CollisionGroups.Roof, CollisionGroups.Platform].includes(
        otherActor?.body.group
      )
    ) {
      const isPlatform = otherActor?.body.group === CollisionGroups.Platform;
      const roofWorldPos = otherActor.globalPos;
      const roofTop = roofWorldPos.y - (isPlatform ? otherActor.height : 0);
      const playerBottom = this.pos.y + this.height / 2;

      if (this.vel.y < 0) {
        evt.contact.cancel();
        this.isOnRoof = false;
        return;
      }

      const isComingFromAbove = playerBottom <= roofTop + 4;

      if (!isComingFromAbove) {
        evt.contact.cancel();
        this.isOnRoof = false;
        return;
      }

      if (this.vel.y >= 0 && isComingFromAbove) {
        this.canJump = true;
        this.numberOfJumps = 0;

        if (!this.isOnRoof && this.vel.y > 50) {
          const isPlayer = this.name === "player";
          const landKey = AudioKeys.SFX.PLAYER.MOVEMENT.LAND;
          this.engine?.soundManager.play(landKey, isPlayer ? 0.3 : 0.15);
          this.isOnRoof = true;
        }
      }
    }
  }

  public equipItem(item: EquipmentItem) {
    const unequippedItem = this.equipmentManager.equip(item);
    if (unequippedItem) {
      this.inventory.addItem(0, unequippedItem);
    }
  }

  public unequipItem(slot: EquipmentItem["slot"]) {
    const unequippedItem = this.equipmentManager.unequip(slot);
    if (unequippedItem) {
      this.inventory.addItem(0, unequippedItem);
    }
  }

  public getEquippedArmor(slot: ArmorItem["slot"]): ArmorItem | null {
    return this.equipmentManager.getEquippedArmor(slot);
  }

  public getEquippedWeapon(): InventoryItem | null {
    return this.animController.getEquippedWeapon();
  }

  protected trackFallVelocity() {
    this.lastYVelocity = this.vel.y;
  }

  private checkLevelUp() {
    if (this.level > this.previousLevel) {
      this.previousLevel = this.level;
      this.engine?.showMessage(
        `Your level has increased to: ${this.level}`,
        "success"
      );
    }
  }

  public enterBuilding(bounds: MovementBoundaries) {
    this.buildingBounds = bounds;
    this.isInside = true;
  }

  public exitBuilding() {
    this.buildingBounds = null;
    this.isInside = false;
  }

  protected updateResources(deltaSeconds: number) {
    const energyRecoveryRate = this.statsSystem.getEnergyRecoveryRate();
    const manaRecoveryRate = this.statsSystem.getManaRecoveryRate();
    const healthRecoveryRate = this.statsSystem.getHealthRecoveryRate();

    if (this.isShieldActive) {
      const manaDrain = this.getShieldManaCost() * deltaSeconds;
      this.mana = Math.max(0, this.mana - manaDrain);

      const leveledUp = this.statsSystem.onManaUsed(manaDrain);
      if (leveledUp) {
        this.onIntelligenceLevelUp();
      }

      if (this.mana <= 0) {
        this.deactivateShield();
      }
    }

    if (this.animController.currentState === "running") {
      const energyUsed = this.runEnergyDrain * deltaSeconds;
      this.energy = Math.max(0, this.energy - energyUsed);

      const leveledUp = this.statsSystem.onEnergyUsed(energyUsed);
      if (leveledUp) {
        this.onAgilityLevelUp();
      }
      if (this.energy <= 0) {
        this.isRunMode = false;
        this.currentState = "walking";
      }
    } else if (
      this.animController.currentState === "idle" ||
      this.animController.currentState === "walking"
    ) {
      this.energy = Math.min(
        this.maxEnergy,
        this.energy + energyRecoveryRate * deltaSeconds
      );
    }

    if (this.mana < this.maxMana && !this.isShieldActive) {
      this.mana = Math.min(
        this.maxMana,
        this.mana + manaRecoveryRate * deltaSeconds
      );
    }

    if (this.health < this.maxHealth) {
      if (this.shouldPreventHealthRecovery()) return;
      this.health = Math.min(
        this.maxHealth,
        this.health + healthRecoveryRate * deltaSeconds
      );
    }
  }

  public abstract shouldPreventHealthRecovery(): boolean;

  public getIsInside() {
    return this.isInside;
  }

  public getIsInWater() {
    return this.isInWater;
  }

  public setIsInWater(inWater: boolean) {
    this.isInWater = inWater;
  }

  protected handleCollisionStart(evt: ex.CollisionStartEvent) {
    const otherActor = evt.other.owner as ex.Actor;

    if (otherActor?.body?.group === CollisionGroups.Environment) {
      if (this.pos.y < otherActor.pos.y) {
        if (this.lastYVelocity > this.fallDamageThreshold) {
          const damage = Math.floor(
            (this.lastYVelocity - this.fallDamageThreshold) *
              this.fallDamageMultiplier
          );
          if (damage > 0) {
            this.takeDamage(damage);
          }
        }
        this.canJump = true;
        this.numberOfJumps = 0;

        const isPlayer = this.name === "player";
        const landKey = AudioKeys.SFX.PLAYER.MOVEMENT.LAND;
        this.engine?.soundManager.play(landKey, isPlayer ? 0.3 : 0.15);
      }
    }
  }

  public canPerformDoubleJump(): boolean {
    return this.statsSystem.getStat("agility").baseValue >= 40;
  }

  protected isDodgeReady(currentTime: number): boolean {
    const cooldown = this.statsSystem.getDodgeCooldown();
    return currentTime - this.lastDodgeTime >= cooldown;
  }

  protected isSpellReady(currentTime: number): boolean {
    const cooldown = this.statsSystem.getSpellCooldown();
    return currentTime - this.lastSpellCastTime >= cooldown;
  }

  protected isAttackReady(currentTime: number): boolean {
    const cooldown = this.statsSystem.getAttackCooldown();
    return currentTime - this.lastAttackTime >= cooldown;
  }

  public getDodgeCooldownRemaining(currentTime: number): number {
    const cooldown = this.statsSystem.getDodgeCooldown();
    const elapsed = currentTime - this.lastDodgeTime;
    return Math.max(0, cooldown - elapsed);
  }

  public getSpellCooldownRemaining(currentTime: number): number {
    const cooldown = this.statsSystem.getSpellCooldown();
    const elapsed = currentTime - this.lastSpellCastTime;
    return Math.max(0, cooldown - elapsed);
  }

  public getAttackCooldownRemaining(currentTime: number): number {
    const cooldown = this.statsSystem.getAttackCooldown();
    const elapsed = currentTime - this.lastAttackTime;
    return Math.max(0, cooldown - elapsed);
  }

  public activateShield() {
    if (this.isShieldActive || this.mana <= 0) return;

    this.isShieldActive = true;
    this.currentState = "shielding";

    const shieldRadius = Math.max(this.width, this.height) * 0.8;
    this.protectionShield = new ProtectionShield(
      shieldRadius,
      this.statsSystem.getIntelligence()
    );
    this.addChild(this.protectionShield);
  }

  public deactivateShield() {
    if (!this.isShieldActive) return;

    this.isShieldActive = false;
    this.currentState = "idle";

    if (this.protectionShield) {
      this.protectionShield.deactivate();
      this.protectionShield = undefined;
    }
  }

  protected getShieldManaCost(): number {
    const intelligenceReduction =
      (this.statsSystem.getIntelligence() - 10) * 0.05;
    const reduction = Math.max(0, Math.min(0.5, intelligenceReduction));
    return this.baseShieldManaCost * (1 - reduction);
  }

  protected handleCollisionEnd(evt: ex.CollisionEndEvent) {}

  public createDisplayClone(): ex.Actor {
    const originalState = this.animController.currentState;
    const originalFacing = this.animController.facingRight;

    this.animController.currentState = "idle";
    this.animController.facingRight = false;
    this.animController.updateAnimation(ex.vec(0, 0));
    this.animController.updateWeaponAnimation();

    const displayActor = new ex.Actor({
      pos: this.pos.clone(),
      width: this.width,
      height: this.height,
      anchor: this.anchor.clone(),
      offset: ex.vec(-SPRITE_WIDTH / 2, 0),
      scale: this.scale.clone(),
      collisionType: ex.CollisionType.PreventCollision,
    });

    const currentGraphic = this.graphics.current;
    if (currentGraphic) {
      displayActor.graphics.use(currentGraphic.clone());
    }
    displayActor.graphics.flipHorizontal = false;

    this.children.forEach((child) => {
      const childClone = new ex.Actor({
        pos: (child as ex.Actor).pos.clone(),
        name: child.name,
        offset: (child as ex.Actor).offset.clone(),
        collisionType: ex.CollisionType.PreventCollision,
      });

      const childGraphic = (child as ex.Actor).graphics.current;
      if (childGraphic) {
        childClone.graphics.use(childGraphic.clone());
        childClone.graphics.flipHorizontal = false;
      }

      displayActor.addChild(childClone);
    });

    this.animController.currentState = originalState;
    this.animController.facingRight = originalFacing;
    this.animController.updateAnimation(this.vel);
    this.animController.updateWeaponAnimation();

    return displayActor;
  }

  public attack(time: number) {
    if (!this.isAttackReady(time)) {
      return;
    }
    const equippedWeapon = this.equipmentManager.getEquippedWeapon();
    const oldEnergy = this.energy;

    // Check if currently running and use appropriate attack
    if (this.animController.currentState === "running") {
      this.energy = this.combatSystem.runAttack(equippedWeapon, this.energy);
    } else {
      this.energy = this.combatSystem.attack(equippedWeapon, this.energy);
    }

    const energyUsed = oldEnergy - this.energy;
    if (energyUsed > 0) {
      const leveledUp = this.statsSystem.onEnergyUsed(energyUsed);
      if (leveledUp) {
        this.onAgilityLevelUp();
      }
    }
    this.lastAttackTime = Date.now();
  }

  /**
   * Transitions attack animation mid-attack based on movement state.
   * Call this when movement state changes during an attack.
   */
  public transitionAttackIfNeeded(isMoving: boolean): void {
    const currentState = this.animController.currentState;

    if (currentState === "attacking" && isMoving) {
      // Transition from stationary attack to run attack
      this.combatSystem.transitionAttack(true);
    } else if (currentState === "run-attacking" && !isMoving) {
      // Transition from run attack to stationary attack
      this.combatSystem.transitionAttack(false);
    }
  }

  public getStrengthDamageMultiplier(baseDamage: number): number {
    const multiplier = this.statsSystem.getStrengthDamageMultiplier();
    return Math.round(baseDamage * multiplier);
  }

  public getIntelligenceDamageMultiplier(baseDamage: number): number {
    const multiplier = this.statsSystem.getIntelligenceDamageMultiplier();
    return Math.round(baseDamage * multiplier);
  }
  public magicAttack(spellType: Element, time: number) {
    if (!this.isSpellReady(time)) {
      return;
    }
    if (!this.animController.attackAnim) {
      return;
    }

    if (this.mana >= this.manaCost) {
      this.mana = this.combatSystem.magicAttack(this.mana);

      this.createMagicProjectile(spellType);

      this.mana -= this.manaCost;
      this.lastSpellCastTime = Date.now();
    }
  }

  private createMagicProjectile(spellType: Element) {
    const direction = this.facingRight ? 1 : -1;
    const spawnOffset = 10;
    const baseDamage = 20;
    const damage = this.getIntelligenceDamageMultiplier(baseDamage);

    const projectile = new MagicProjectile(
      ex.vec(this.pos.x + spawnOffset * direction, this.pos.y),
      direction,
      spellType,
      damage,
      (damageDealt: number) => {
        const leveledUp = this.statsSystem.onMagicDamageDealt(damageDealt);
        if (leveledUp) {
          this.onIntelligenceLevelUp();
        }
      }
    );

    this.scene?.add(projectile);
  }

  jump() {
    if (!this.engine?.soundManager) return;
    const baseVolume = 0.3;

    const jumpKey = AudioKeys.SFX.PLAYER.MOVEMENT.JUMP;

    this.engine.soundManager.play(jumpKey, baseVolume);
  }

  public dodge(direction: "left" | "right", time: number) {
    if (!this.isDodgeReady(time)) {
      return;
    }
    if (this.animController.dodgeAnim) {
      this.animController.dodgeAnim.reset();
    }
    this.currentState = "dodging";
    if (!this.engine?.soundManager) return;
    const baseVolume = 0.5;

    const jumpKey = AudioKeys.SFX.PLAYER.MOVEMENT.DODGE;

    this.engine.soundManager.play(jumpKey, baseVolume);
    this.body.group = ex.CollisionGroup.collidesWith([
      CollisionGroups.Environment,
      CollisionGroups.Trigger,
    ]);
    const dodgeSpeed = this.jumpSpeed * 2;

    this.vel.x =
      direction === "right" ? Math.abs(dodgeSpeed) : -Math.abs(dodgeSpeed);
    this.energy = Math.max(0, this.energy - this.dodgeEnergyCost);

    this.lastDodgeTime = Date.now();
  }

  public endDodge() {
    this.currentState = "idle";

    this.body.group = this.originalCollisionGroup;
  }

  public takeDamage(amount: number, element?: Element) {
    if (this.isShieldActive) {
      const oldMana = this.mana;

      let damageAfterDefense = amount;

      if (element) {
        const elementalDefense =
          this.equipmentManager.getTotalElementalDefense()[element];
        damageAfterDefense -= elementalDefense;
      } else {
        damageAfterDefense -= this.equipmentManager.getTotalPhysicalDefense();
      }

      const finalDamage = Math.max(damageAfterDefense, 1);

      this.mana = Math.max(0, this.mana - finalDamage);

      const actualManaDamage = oldMana - this.mana;

      if (actualManaDamage > 0) {
        const damageNumber = new DamageNumber(
          ex.vec(this.pos.x, this.pos.y - this.height / 2),
          Math.round(actualManaDamage),
          ex.Color.Cyan
        );
        this.scene?.add(damageNumber);
      }

      if (this.mana <= 0) {
        this.deactivateShield();
      }

      return;
    }

    this.hasTakenDamage = true;
    const oldHealth = this.health;

    let damageAfterDefense = amount;

    if (element) {
      const elementalDefense =
        this.equipmentManager.getTotalElementalDefense()[element];
      damageAfterDefense -= elementalDefense;
    } else {
      damageAfterDefense -= this.equipmentManager.getTotalPhysicalDefense();
    }

    this.health = this.combatSystem.takeDamage(
      this.health,
      Math.max(damageAfterDefense, 1)
    );

    const actualDamage = oldHealth - this.health;
    if (actualDamage > 0) {
      const damageNumber = new DamageNumber(
        ex.vec(this.pos.x, this.pos.y - this.height / 2),
        Math.round(actualDamage)
      );
      this.scene?.add(damageNumber);

      const leveledUp = this.statsSystem.onDamageReceived(actualDamage);
      if (leveledUp) {
        this.onVitalityLevelUp();
      }
    }
  }

  public heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  protected onVitalityLevelUp() {
    const oldMaxHealth = this.maxHealth;
    this.maxHealth = this.statsSystem.getMaxHealth();
    this.health += this.maxHealth - oldMaxHealth;
    this.healthRecoveryRate = this.statsSystem.getHealthRecoveryRate();

    this.engine?.showMessage(
      `Your vitality has increased to: ${this.stats.vitality.baseValue}`,
      "success"
    );
    this.checkLevelUp();
  }

  protected onAgilityLevelUp() {
    this.maxEnergy = this.statsSystem.getMaxEnergy();
    this.runSpeed = this.statsSystem.getRunSpeed();
    this.energyRecoveryRate = this.statsSystem.getEnergyRecoveryRate();
    this.engine?.showMessage(
      `Your agility has increased to: ${this.stats.agility.baseValue}`,
      "success"
    );
    this.checkLevelUp();
  }

  protected onStrengthLevelUp() {
    this.engine?.showMessage(
      `Your strength has increased to: ${this.stats.strength.baseValue}`,
      "success"
    );
    this.checkLevelUp();
  }

  protected onIntelligenceLevelUp() {
    this.manaRecoveryRate = this.statsSystem.getManaRecoveryRate();
    this.engine?.showMessage(
      `Your intelligence has increased to: ${this.stats.intelligence.baseValue}`,
      "success"
    );
    this.checkLevelUp();
  }

  public getEquipmentStats() {
    const physicalDamage =
      (this.equipmentManager.getEquippedWeapon()?.damage || 5) *
      this.statsSystem.getStrengthDamageMultiplier();
    const physicalDefense = this.equipmentManager.getTotalPhysicalDefense();
    const elementalDefense = this.equipmentManager.getTotalElementalDefense();

    const fireDamage =
      this.baseFireDamage * this.statsSystem.getIntelligenceDamageMultiplier();
    const windDamage =
      this.baseWindDamage * this.statsSystem.getIntelligenceDamageMultiplier();
    const waterDamage =
      this.baseWaterDamage * this.statsSystem.getIntelligenceDamageMultiplier();
    const earthDamage =
      this.baseEarthDamage * this.statsSystem.getIntelligenceDamageMultiplier();

    return {
      physicalDamage,
      physicalDefense,
      fireDamage,
      fireDefense: elementalDefense.fire,
      windDamage,
      windDefense: elementalDefense.wind,
      waterDamage,
      waterDefense: elementalDefense.water,
      earthDamage,
      earthDefense: elementalDefense.earth,
    };
  }

  public get level() {
    return this.statsSystem.getLevel();
  }

  public get isInvincible() {
    return this.combatSystem.isInvincible;
  }

  public set isInvincible(state: boolean) {
    this.combatSystem.isInvincible = state;
  }

  public get currentState() {
    return this.animController.currentState;
  }

  public get jumpSpeed(): number {
    const jumpSpeed = this.statsSystem.getJumpSpeed();

    return jumpSpeed;
  }

  protected set currentState(state: typeof this.animController.currentState) {
    this.animController.currentState = state;
  }

  protected get facingRight() {
    return this.animController.facingRight;
  }

  protected set facingRight(value: boolean) {
    this.animController.facingRight = value;
  }

  public get stats() {
    return this.statsSystem.getStats();
  }

  public get maxJumps() {
    return this.statsSystem.getMaxNumberOfJumps();
  }

  public die() {
    if (!this.hasDied) {
      this.combatSystem.onDeath();
      this.currentState = "dead";
      this.hasDied = true;
      this.body.collisionType = ex.CollisionType.PreventCollision;

      this.spawnLootDrop();
    }
  }

  private spawnLootDrop() {
    if (!this.scene) return;

    const lootDrop = new LootDrop(
      this.pos.clone(),
      this.inventory,
      this.equipmentManager
    );

    this.scene.add(lootDrop);
  }
}
