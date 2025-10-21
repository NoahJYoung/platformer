import * as ex from "excalibur";
import { CollisionGroups, SCALE } from "../config";
import type { Character } from "./character";
import type { AnimationController } from "./animation-controller";
import type { WeaponItem } from "./types";

export class CombatSystem {
  private canDealDamage: boolean = false;
  private character: Character;
  private animController: AnimationController;
  private getValidTargets: () => string[];
  private attackEnergyCost: number;

  private onDamageDealtCallback?: (damage: number) => void;

  public isInvincible: boolean = false;

  constructor(
    character: Character,
    animController: AnimationController,
    getValidTargets: () => string[],
    attackEnergyCost: number = 8
  ) {
    this.character = character;
    this.animController = animController;
    this.getValidTargets = getValidTargets;
    this.attackEnergyCost = attackEnergyCost;
  }

  public setOnDamageDealtCallback(callback: (damage: number) => void) {
    this.onDamageDealtCallback = callback;
  }

  public attack(equippedWeapon: WeaponItem | null, energy: number): number {
    if (
      this.animController.currentState === "attacking" ||
      this.animController.currentState === "hurt"
    )
      return energy;
    if (this.animController.attackAnim) {
      this.animController.attackAnim.reset();
    }

    this.animController.currentState = "attacking";
    this.canDealDamage = false;

    const newEnergy = Math.max(0, energy - this.attackEnergyCost);

    if (equippedWeapon) {
      this.performWeaponAttack(equippedWeapon);
    } else {
      this.performPunchAttack();
    }

    return newEnergy;
  }

  public magicAttack(mana: number) {
    const attackAnim = this.animController.attackAnim;
    if (!attackAnim) return mana;
    if (this.animController.attackAnim) {
      this.animController.attackAnim.reset();
    }

    this.animController.currentState = "attacking";

    attackAnim.reset();
    this.character.graphics.use(attackAnim);

    const newMana = Math.max(0, mana - this.attackEnergyCost);

    const duration = attackAnim.frames.length * attackAnim.frameDuration;

    setTimeout(() => {
      if (this.animController.currentState === "attacking") {
        this.animController.currentState = "idle";
      }
    }, duration);

    return newMana;
  }

  private performWeaponAttack(weapon: WeaponItem) {
    const attackAnim = this.animController.attackAnim;
    if (!attackAnim) return;

    let damageDealt = false;

    const attackHitbox = new ex.Actor({
      pos: ex.vec(0, 0),
      name: `weapon-hitbox-${weapon.subtype}`,
      width: (weapon.reach || 30) * SCALE,
      height: 20 * SCALE,
      collisionType: ex.CollisionType.Passive,
      collisionGroup: CollisionGroups.Weapon,
    });

    (attackHitbox as any).weaponData = weapon;

    const collisionHandler = (evt: ex.CollisionStartEvent) => {
      const target = evt.other.owner as ex.Actor;
      const validTargets = this.getValidTargets();

      if (
        !damageDealt &&
        this.canDealDamage &&
        validTargets.some((targetName) => target?.name?.startsWith(targetName))
      ) {
        const baseDamage = weapon.damage || 10;
        const damage = this.character.getStrengthDamageMultiplier(baseDamage);
        if (typeof (target as Character).takeDamage === "function") {
          (target as Character).takeDamage(damage);
          damageDealt = true;

          if (this.onDamageDealtCallback) {
            console.log(`Dealt: ${damage} Damage`);
            this.onDamageDealtCallback(damage);
          }
        }
      }
    };

    attackHitbox.on("collisionstart", collisionHandler);

    const updateAttackHitbox = () => {
      if (this.animController.currentState !== "attacking") return;

      const currentFrame = attackAnim.currentFrameIndex;

      if (currentFrame >= 4) {
        if (!attackHitbox.scene) {
          this.character.addChild(attackHitbox);
        }
        if (!damageDealt) {
          this.canDealDamage = true;
        }
        const baseReach = weapon.reach || 30;
        const extensionAmount = 10 * SCALE * (currentFrame - 3);
        const extendedReach = baseReach + extensionAmount;

        attackHitbox.collider.set(ex.Shape.Box(extendedReach, 20 * SCALE));

        const offsetX = this.animController.facingRight
          ? extensionAmount / 2
          : -extensionAmount / 2;
        attackHitbox.pos = ex.vec(offsetX, 0);
      } else {
        this.canDealDamage = false;
        if (attackHitbox.scene) {
          this.character.removeChild(attackHitbox);
        }
      }
    };

    const hitboxInterval = setInterval(updateAttackHitbox, 16);

    attackAnim.reset();
    this.character.graphics.use(attackAnim);

    updateAttackHitbox();

    const duration = attackAnim.frames.length * attackAnim.frameDuration;

    setTimeout(() => {
      clearInterval(hitboxInterval);
      attackHitbox.kill();
      this.canDealDamage = false;

      if (this.animController.currentState === "attacking") {
        this.animController.currentState = "idle";
      }
    }, duration);
  }

  private performPunchAttack() {
    const attackAnim = this.animController.attackAnim;
    if (!attackAnim) return;

    attackAnim.reset();
    this.character.graphics.use(attackAnim);

    const duration = attackAnim.frames.length * attackAnim.frameDuration;

    let damageDealt = false;

    const punchHitbox = new ex.Actor({
      pos: ex.vec(0, 0),
      width: 20 * SCALE,
      height: 20 * SCALE,
      collisionType: ex.CollisionType.Passive,
      collisionGroup: CollisionGroups.Weapon,
    });
    this.character.addChild(punchHitbox);

    const originalPunchPos = punchHitbox.pos.clone();

    const updatePunchHitbox = () => {
      if (this.animController.currentState !== "attacking") return;

      const currentFrame = attackAnim.currentFrameIndex;

      if (currentFrame >= 3) {
        if (!damageDealt) {
          this.canDealDamage = true;
        }

        const extensionAmount = 10 * SCALE * (currentFrame - 2);
        const extendedReach = 5 * SCALE + extensionAmount;

        punchHitbox.collider.set(ex.Shape.Box(extendedReach, 20 * SCALE));

        const offsetX = this.animController.facingRight
          ? extensionAmount / 2
          : -extensionAmount / 2;
        punchHitbox.pos = ex.vec(
          originalPunchPos.x + offsetX,
          originalPunchPos.y
        );
      } else {
        this.canDealDamage = false;
        punchHitbox.collider.set(ex.Shape.Box(20 * SCALE, 20 * SCALE));
        punchHitbox.pos = originalPunchPos.clone();
      }
    };

    const punchHandler = (evt: ex.CollisionStartEvent) => {
      const target = evt.other.owner as ex.Actor;
      const validTargets = this.getValidTargets();

      if (
        !damageDealt &&
        this.canDealDamage &&
        validTargets.some((targetName) => target?.name?.startsWith(targetName))
      ) {
        const baseDamage = 5;
        const damage = this.character.getStrengthDamageMultiplier(baseDamage);

        if (typeof (target as Character).takeDamage === "function") {
          (target as Character).takeDamage(damage);
          damageDealt = true;

          if (this.onDamageDealtCallback) {
            this.onDamageDealtCallback(damage);
          }
        }
      }
    };

    punchHitbox.on("collisionstart", punchHandler);

    updatePunchHitbox();
    const punchInterval = setInterval(updatePunchHitbox, 16);

    setTimeout(() => {
      clearInterval(punchInterval);
      punchHitbox.kill();
      this.canDealDamage = false;

      if (this.animController.currentState === "attacking") {
        this.animController.currentState = "idle";
      }
    }, duration);
  }

  public takeDamage(currentHealth: number, amount: number): number {
    if (
      this.animController.currentState === "dead" ||
      this.animController.currentState === "hurt"
    ) {
      return currentHealth;
    }

    const newHealth = Math.max(0, currentHealth - amount);
    this.animController.currentState = "hurt";

    const hurtStateDuration = 150;

    setTimeout(() => {
      if (newHealth <= 0) {
        this.onDeath();
      } else {
        this.animController.currentState = "idle";
      }
    }, hurtStateDuration);

    return newHealth;
  }

  private onDeath() {
    this.character.die();
    this.character.vel.x = 0;
    this.animController.currentState = "dead";
    this.character.body.group = ex.CollisionGroup.collidesWith([
      CollisionGroups.Environment,
    ]);

    const deadAnim = this.animController.deadAnim;
    this.character.body.collisionType = ex.CollisionType.Passive;
    this.character.children.forEach((child) => {
      if (child instanceof ex.Actor) {
        child.body.collisionType = ex.CollisionType.Passive;
      }
    });
    if (deadAnim) {
      this.character.graphics.use(deadAnim);
      this.animController.updateWeaponAnimation();

      const duration = deadAnim.frames.length * deadAnim.frameDuration;

      setTimeout(() => {
        this.character.kill();
      }, duration + 2000);
    }
  }
}
