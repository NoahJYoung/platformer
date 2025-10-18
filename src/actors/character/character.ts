import * as ex from "excalibur";
import { Inventory } from "./inventory";
import { CollisionGroups, SCALE, SPRITE_WIDTH } from "../config";
import { AnimationController } from "./animation-controller";
import { CombatSystem } from "./combat-system";
import { StatsSystem } from "./stats-system";
import { MagicProjectile } from "./magic-projectile";
import type {
  AppearanceOptions,
  ArmorItem,
  EquipmentItem,
  InventoryItem,
} from "./types";
import { EquipmentManager } from "./equipment-manager";
import { DamageNumber } from "./damage-number";
import { HealthBar } from "./health-bar";
import { NameLabel } from "./name-label";

export abstract class Character extends ex.Actor {
  public health: number = 100;
  public maxHealth: number = 100;
  public energy: number = 100;
  public maxEnergy: number = 100;
  public mana: number = 100;
  public maxMana: number = 100;
  public moveSpeed: number = 100;
  public jumpSpeed: number = -400;
  public runMultiplier = 1.5;
  public canJump: boolean = false;

  public inventory: Inventory;
  public equipmentManager: EquipmentManager;

  public sex: "male" | "female";
  public skinTone: 1 | 2 | 3 | 4 | 5;
  public hairStyle: 1 | 2 | 3 | 4 | 5;

  public animController: AnimationController;
  protected combatSystem: CombatSystem;
  protected statsSystem: StatsSystem;

  protected runEnergyDrain: number = 4;
  protected jumpEnergyCost: number = 4;
  protected attackEnergyCost: number = 8;
  protected energyRecoveryRate: number = 4;
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

  constructor(
    name: string,
    pos: ex.Vector,
    appearanceOptions: AppearanceOptions,
    facingRight: boolean,
    showHealthBar: boolean = false
  ) {
    super({
      name: name,
      offset: ex.vec(12 * SCALE, 0),
      pos: pos,
      width: 16 * SCALE,
      height: 48 * SCALE,
      collisionType: ex.CollisionType.Active,
      collisionGroup:
        name === "player" ? CollisionGroups.Player : CollisionGroups.Enemy,
    });

    this.originalCollisionGroup = this.body.group;

    this.sex = appearanceOptions.sex;
    this.skinTone = appearanceOptions.skinTone;
    this.hairStyle = appearanceOptions.hairStyle;
    this.displayName = appearanceOptions.displayName;

    this.animController = new AnimationController(
      this,
      this.sex,
      this.skinTone,
      this.hairStyle,
      facingRight
    );

    this.inventory = new Inventory();
    this.equipmentManager = new EquipmentManager(this.animController);

    this.statsSystem = new StatsSystem();

    this.maxHealth = this.statsSystem.getMaxHealth();
    this.health = this.maxHealth;
    this.maxEnergy = this.statsSystem.getMaxEnergy();
    this.energy = this.maxEnergy;
    this.moveSpeed = this.statsSystem.getMoveSpeed();
    this.jumpEnergyCost = 4;
    this.attackEnergyCost = 8;
    this.energyRecoveryRate = this.statsSystem.getEnergyRecoveryRate();

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

  onInitialize(engine: ex.Engine) {
    this.animController.setupAnimations();

    const nameLabelOffset = this.showHealthBar ? -40 * SCALE : -35 * SCALE;
    this.nameLabel = new NameLabel(this.displayName, nameLabelOffset);
    this.addChild(this.nameLabel);

    if (this.showHealthBar) {
      this.healthBar = new HealthBar(
        this,
        () => this.health,
        () => this.maxHealth,
        -30 * SCALE // Offset above character
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
        this.updateEnergy(deltaSeconds);
      }
    });

    this.on("collisionstart", (evt) => {
      this.handleCollisionStart(evt);
    });

    this.on("collisionend", (evt) => {
      this.handleCollisionEnd(evt);
    });
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

  protected updateEnergy(deltaSeconds: number) {
    const energyRecoveryRate = this.statsSystem.getEnergyRecoveryRate();

    if (this.animController.currentState === "running") {
      const energyUsed = this.runEnergyDrain * deltaSeconds;
      this.energy = Math.max(0, this.energy - energyUsed);

      const leveledUp = this.statsSystem.onEnergyUsed(energyUsed);
      if (leveledUp) {
        this.onAgilityLevelUp();
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
      }
    }
  }

  protected handleCollisionEnd(evt: ex.CollisionEndEvent) {
    const otherActor = evt.other.owner as ex.Actor;

    if (otherActor?.name?.startsWith("platform")) {
      if (this.pos.y < otherActor.pos.y) {
        this.canJump = false;
      }
    }
  }

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
      offset: ex.vec(-(SPRITE_WIDTH * SCALE) / 2, 0),
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
        pos: child.pos.clone(),
        offset: child.offset.clone(),
        collisionType: ex.CollisionType.PreventCollision,
      });

      const childGraphic = child.graphics.current;
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

  public attack() {
    const equippedWeapon = this.equipmentManager.getEquippedWeapon();
    const oldEnergy = this.energy;

    this.energy = this.combatSystem.attack(equippedWeapon, this.energy);

    const energyUsed = oldEnergy - this.energy;
    if (energyUsed > 0) {
      const leveledUp = this.statsSystem.onEnergyUsed(energyUsed);
      if (leveledUp) {
        this.onAgilityLevelUp();
      }
    }
  }

  public magicAttack(spellType: "fireball" | "ice" | "lightning") {
    if (!this.animController.attackAnim) {
      return;
    }
    if (this.mana >= this.manaCost) {
      this.mana = this.combatSystem.magicAttack(this.mana);

      setTimeout(
        () => this.createMagicProjectile(spellType),
        this.animController.attackAnim.frameDuration * 4
      );

      this.mana -= this.manaCost;
    }
  }

  private createMagicProjectile(spellType: string) {
    const direction = this.facingRight ? 1 : -1;
    const spawnOffset = 10;

    const projectile = new MagicProjectile(
      ex.vec(this.pos.x + spawnOffset * direction, this.pos.y),
      direction,
      spellType
    );

    this.scene?.add(projectile);
  }

  public dodge(direction: "left" | "right") {
    if (this.animController.dodgeAnim) {
      this.animController.dodgeAnim.reset();
    }
    this.currentState = "dodging";
    this.body.group = ex.CollisionGroup.collidesWith([
      CollisionGroups.Environment,
    ]);
    const dodgeSpeed = this.jumpSpeed * 2;

    this.vel.x =
      direction === "right" ? Math.abs(dodgeSpeed) : -Math.abs(dodgeSpeed);
    this.energy = Math.max(0, this.energy - this.dodgeEnergyCost);
  }

  public endDodge() {
    this.currentState = "idle";

    this.body.group = this.originalCollisionGroup;
  }

  public takeDamage(amount: number) {
    const oldHealth = this.health;
    this.health = this.combatSystem.takeDamage(this.health, amount);

    const actualDamage = oldHealth - this.health;
    if (actualDamage > 0) {
      const damageNumber = new DamageNumber(
        ex.vec(this.pos.x, this.pos.y - this.height / 2),
        actualDamage
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
    console.log(`Max health increased to ${this.maxHealth}`);
  }

  protected onAgilityLevelUp() {
    this.maxEnergy = this.statsSystem.getMaxEnergy();
    this.moveSpeed = this.statsSystem.getMoveSpeed();
    this.energyRecoveryRate = this.statsSystem.getEnergyRecoveryRate();
    console.log(
      `Agility improved! Speed: ${this.moveSpeed}, Energy: ${this.maxEnergy}`
    );
  }

  protected onStrengthLevelUp() {
    console.log(
      `Strength increased! Damage multiplier: ${this.statsSystem.getDamageMultiplier()}`
    );
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
}
