import * as ex from "excalibur";
import { CollisionGroups } from "../config";
import type { Character } from "./character";
import type { AnimationController } from "./animation-controller";
import type { WeaponItem } from "./types";
import { AudioKeys } from "../../audio/sound-manager/audio-keys";

export class CombatSystem {
  private canDealDamage: boolean = false;
  private character: Character;
  private animController: AnimationController;
  private getValidTargets: () => string[];
  private attackEnergyCost: number;

  private onDamageDealtCallback?: (damage: number) => void;

  private currentAttackTimeout?: ReturnType<typeof setTimeout>;
  private currentHitboxInterval?: ReturnType<typeof setInterval>;
  private currentAttackHitbox?: ex.Actor;
  private currentAttackStartTime: number = 0;
  private currentAttackDuration: number = 0;

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

  private isAttackingState(): boolean {
    return (
      this.animController.currentState === "attacking" ||
      this.animController.currentState === "run-attacking"
    );
  }

  /**
   * Transitions between attack types mid-attack, preserving the current frame.
   * Returns true if a transition occurred, false otherwise.
   */
  public transitionAttack(toRunAttack: boolean): boolean {
    if (!this.isAttackingState()) {
      return false;
    }

    const currentState = this.animController.currentState;
    const targetState = toRunAttack ? "run-attacking" : "attacking";

    if (currentState === targetState) {
      return false;
    }

    this.animController.transitionAttackAnimation(toRunAttack);

    return true;
  }

  public attack(equippedWeapon: WeaponItem | null, energy: number): number {
    if (this.isAttackingState() || this.animController.currentState === "hurt")
      return energy;
    if (this.animController.attackAnim) {
      this.animController.attackAnim.goToFrame(0);
    }

    this.animController.currentState = "attacking";
    this.canDealDamage = false;

    const newEnergy = Math.max(0, energy - this.attackEnergyCost);

    const playWeaponSFX = () => {
      if (this.animController.runAttackAnim) {
        const swingHandler = (evt: ex.FrameEvent) => {
          if (evt.frameIndex === 3) {
            const swingKey = AudioKeys.SFX.PLAYER.COMBAT.WEAPON.SWING;
            this.character.engine?.soundManager.play(swingKey, 0.2);
            this.animController.runAttackAnim?.events.off(
              "frame",
              swingHandler
            );
          }
        };
        this.animController.runAttackAnim.events.on("frame", swingHandler);
      }
    };

    if (equippedWeapon) {
      this.performWeaponAttack(
        equippedWeapon,
        playWeaponSFX,
        this.animController.attackAnim
      );
    } else {
      this.performPunchAttack(playWeaponSFX, this.animController.attackAnim);
    }

    return newEnergy;
  }

  public runAttack(equippedWeapon: WeaponItem | null, energy: number): number {
    if (this.isAttackingState() || this.animController.currentState === "hurt")
      return energy;

    if (this.animController.runAttackAnim) {
      this.animController.runAttackAnim.goToFrame(0);
    }

    this.animController.currentState = "run-attacking";
    this.canDealDamage = false;

    const newEnergy = Math.max(0, energy - this.attackEnergyCost);

    const playWeaponSFX = () => {
      if (this.animController.runAttackAnim) {
        const swingHandler = (evt: ex.FrameEvent) => {
          if (evt.frameIndex === 3) {
            const swingKey = AudioKeys.SFX.PLAYER.COMBAT.WEAPON.SWING;
            this.character.engine?.soundManager.play(swingKey, 0.2);
            this.animController.runAttackAnim?.events.off(
              "frame",
              swingHandler
            );
          }
        };
        this.animController.runAttackAnim.events.on("frame", swingHandler);
      }
    };

    if (equippedWeapon) {
      this.performWeaponAttack(
        equippedWeapon,
        playWeaponSFX,
        this.animController.runAttackAnim
      );
    } else {
      this.performPunchAttack(playWeaponSFX, this.animController.runAttackAnim);
    }

    return newEnergy;
  }

  public magicAttack(mana: number) {
    const attackAnim = this.animController.attackAnim;
    if (!attackAnim) return mana;
    if (this.animController.attackAnim) {
      this.animController.attackAnim.goToFrame(0);
    }

    this.animController.currentState = "attacking";

    attackAnim.goToFrame(0);
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

  private performWeaponAttack(
    weapon: WeaponItem,
    playSound: () => void,
    attackAnim?: ex.Animation
  ) {
    playSound();
    if (!attackAnim) {
      attackAnim = this.animController.attackAnim;
    }
    if (!attackAnim) return;

    let damageDealt = false;

    const attackHitbox = new ex.Actor({
      pos: ex.vec(0, 0),
      anchor: ex.vec(0, 0.5),
      name: `weapon-hitbox-${weapon.subtype}`,
      width: weapon.reach || 30,
      height: 20,
      collisionType: ex.CollisionType.Passive,
      collisionGroup: CollisionGroups.Weapon,
    });

    (attackHitbox as any).weaponData = weapon;
    this.currentAttackHitbox = attackHitbox;

    const collisionHandler = (evt: ex.CollisionStartEvent) => {
      const target = evt.other.owner as ex.Actor;
      const validTargets = this.getValidTargets();

      if (
        !damageDealt &&
        this.canDealDamage &&
        validTargets.some((targetName) => target?.name?.startsWith(targetName))
      ) {
        console.log("TRUE");
        const hitKey = AudioKeys.SFX.PLAYER.COMBAT.WEAPON.HIT;
        const baseVolume = this.character.name === "player" ? 0.3 : 0.2;
        this.character.engine?.soundManager.play(hitKey, baseVolume);
        const baseDamage = weapon.damage || 10;
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

    attackHitbox.on("collisionstart", collisionHandler);

    const updateAttackHitbox = () => {
      if (!this.isAttackingState()) {
        return;
      }

      const currentAnim = this.character.graphics.current as ex.Animation;
      const currentFrame = currentAnim?.currentFrameIndex ?? 0;

      if (currentFrame >= 4) {
        if (!attackHitbox.scene) {
          this.character.addChild(attackHitbox);
        }
        if (!damageDealt) {
          this.canDealDamage = true;
        }
        const baseReach = weapon.reach || 5;
        const extensionAmount = 10 * (currentFrame - 3);
        const extendedReach = baseReach + extensionAmount;

        attackHitbox.collider.set(
          ex.Shape.Box(
            extendedReach,
            20,
            this.animController.facingRight ? ex.vec(0, 0.5) : ex.vec(1, 0.5)
          )
        );

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

    if (this.currentHitboxInterval) {
      clearInterval(this.currentHitboxInterval);
    }
    if (this.currentAttackTimeout) {
      clearTimeout(this.currentAttackTimeout);
    }

    const hitboxInterval = setInterval(updateAttackHitbox, 16);
    this.currentHitboxInterval = hitboxInterval;

    attackAnim.goToFrame(0);
    this.character.graphics.use(attackAnim);

    updateAttackHitbox();

    const duration = attackAnim.frames.length * attackAnim.frameDuration;
    this.currentAttackDuration = duration;
    this.currentAttackStartTime = Date.now();

    this.currentAttackTimeout = setTimeout(() => {
      clearInterval(hitboxInterval);
      this.currentHitboxInterval = undefined;
      attackHitbox.kill();
      this.currentAttackHitbox = undefined;
      this.canDealDamage = false;

      if (this.isAttackingState()) {
        this.animController.currentState = "idle";
      }
    }, duration);
  }

  private performPunchAttack(playSound: () => void, attackAnim?: ex.Animation) {
    playSound();
    if (!attackAnim) {
      attackAnim = this.animController.attackAnim;
    }
    if (!attackAnim) return;

    attackAnim.goToFrame(0);
    this.character.graphics.use(attackAnim);

    const duration = attackAnim.frames.length * attackAnim.frameDuration;

    let damageDealt = false;

    const punchHitbox = new ex.Actor({
      pos: ex.vec(0, 0),
      width: 20,
      height: 20,
      collisionType: ex.CollisionType.Passive,
      collisionGroup: CollisionGroups.Weapon,
    });
    this.character.addChild(punchHitbox);
    this.currentAttackHitbox = punchHitbox;

    const originalPunchPos = punchHitbox.pos.clone();

    const updatePunchHitbox = () => {
      if (!this.isAttackingState()) {
        return;
      }

      const currentAnim = this.character.graphics.current as ex.Animation;
      const currentFrame = currentAnim?.currentFrameIndex ?? 0;

      if (currentFrame >= 3) {
        if (!damageDealt) {
          this.canDealDamage = true;
        }

        const extensionAmount = 5 * (currentFrame - 2);
        const extendedReach = 5 + extensionAmount;

        punchHitbox.collider.set(
          ex.Shape.Box(
            extendedReach,
            20,
            this.animController.facingRight ? ex.vec(0, 0.5) : ex.vec(1, 0.5)
          )
        );

        const offsetX = this.animController.facingRight
          ? extensionAmount / 2
          : -extensionAmount / 2;
        punchHitbox.pos = ex.vec(
          originalPunchPos.x + offsetX,
          originalPunchPos.y
        );
      } else {
        this.canDealDamage = false;
        punchHitbox.collider.set(ex.Shape.Box(20, 20));
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
        const hitKey = AudioKeys.SFX.PLAYER.COMBAT.WEAPON.HIT;
        const baseVolume = this.character.name === "player" ? 0.2 : 0.1;
        this.character.engine?.soundManager.play(hitKey, baseVolume);
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

    if (this.currentHitboxInterval) {
      clearInterval(this.currentHitboxInterval);
    }
    if (this.currentAttackTimeout) {
      clearTimeout(this.currentAttackTimeout);
    }

    updatePunchHitbox();
    const punchInterval = setInterval(updatePunchHitbox, 16);
    this.currentHitboxInterval = punchInterval;
    this.currentAttackDuration = duration;
    this.currentAttackStartTime = Date.now();

    this.currentAttackTimeout = setTimeout(() => {
      clearInterval(punchInterval);
      this.currentHitboxInterval = undefined;
      punchHitbox.kill();
      this.currentAttackHitbox = undefined;
      this.canDealDamage = false;

      if (this.isAttackingState()) {
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
        this.character.die();
      } else {
        this.animController.currentState = "idle";
      }
    }, hurtStateDuration);

    return newHealth;
  }

  public onDeath() {
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
