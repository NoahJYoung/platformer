import * as ex from "excalibur";
import { Character } from "../character/character";
import type { AppearanceOptions } from "../character/types";

export class Player extends Character {
  public isRunMode: boolean = false;
  private lastToggleFrame: number = -1;

  // Double-tap detection properties
  private lastLeftTapTime: number = 0;
  private lastRightTapTime: number = 0;
  private doubleTapWindow: number = 300; // milliseconds

  constructor(pos: ex.Vector, appearanceOptions: AppearanceOptions) {
    super("player", pos, appearanceOptions, true);
  }

  protected getAttackTargets(): string[] {
    return ["enemy"];
  }

  onPreUpdate(engine: ex.Engine) {
    this.handleInput(engine);
  }

  private handleInput(engine: ex.Engine) {
    const kb = engine.input.keyboard;
    if (this.currentState === "dead") {
      return;
    }

    // // Check for double-tap on left keys (A or Left Arrow)
    // if (kb.wasPressed(ex.Keys.A) || kb.wasPressed(ex.Keys.Left)) {
    //   const currentTime = Date.now();
    //   if (currentTime - this.lastLeftTapTime < this.doubleTapWindow) {
    //     // Double tap detected!
    //     this.dodge("left");
    //     this.lastLeftTapTime = 0; // Reset to prevent triple-tap detection
    //   } else {
    //     this.lastLeftTapTime = currentTime;
    //   }
    // }

    // // Check for double-tap on right keys (D or Right Arrow)
    // if (kb.wasPressed(ex.Keys.D) || kb.wasPressed(ex.Keys.Right)) {
    //   const currentTime = Date.now();
    //   if (currentTime - this.lastRightTapTime < this.doubleTapWindow) {
    //     // Double tap detected!
    //     this.dodge("right");
    //     this.lastRightTapTime = 0; // Reset to prevent triple-tap detection
    //   } else {
    //     this.lastRightTapTime = currentTime;
    //   }
    // }

    // Toggle run mode
    if (kb.wasPressed(ex.Keys.ShiftLeft) || kb.wasPressed(ex.Keys.ShiftRight)) {
      const currentFrame = engine.stats.currFrame.id;

      if (this.lastToggleFrame !== currentFrame) {
        this.lastToggleFrame = currentFrame;

        if (this.isRunMode) {
          this.isRunMode = false;
        } else if (this.energy > 0) {
          this.isRunMode = true;
        }
      }
    }

    const canRun = this.isRunMode && this.energy > 0;

    const adjustedMoveSpeed = canRun
      ? this.moveSpeed * this.runMultiplier
      : this.moveSpeed;

    const isInAir = this.vel.y !== 0;

    // Handle movement
    let xVel = 0;
    if (
      (isInAir || this.currentState !== "attacking") &&
      this.currentState !== "hurt" &&
      this.currentState !== "dodging"
    ) {
      if (kb.isHeld(ex.Keys.Left) || kb.isHeld(ex.Keys.A)) {
        xVel = -adjustedMoveSpeed;
        this.facingRight = false;
      }
      if (kb.isHeld(ex.Keys.Right) || kb.isHeld(ex.Keys.D)) {
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

    // Update state based on movement
    if (
      this.currentState !== "attacking" &&
      this.currentState !== "hurt" &&
      this.currentState !== "dodging"
      // && this.currentState !== "dead"
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
      this.dodge("right");
    }

    if (kb.wasPressed(ex.Keys.Q) && this.currentState !== "hurt") {
      this.dodge("left");
    }

    // Handle jumping
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

    // Handle attack
    if (kb.wasPressed(ex.Keys.J) && this.currentState !== "hurt") {
      if (this.energy >= this.attackEnergyCost) {
        this.attack();
      }
    }

    // Handle weapon switching
    if (kb.wasPressed(ex.Keys.Key1)) {
      this.unequipWeapon();
    }

    if (kb.wasPressed(ex.Keys.Key2)) {
      this.equipWeapon(1);
    }
  }

  // Override updateEnergy to handle run mode energy drain
  protected updateEnergy(deltaSeconds: number) {
    if (this.currentState === "running") {
      this.energy = Math.max(
        0,
        this.energy - this.runEnergyDrain * deltaSeconds
      );

      // Disable run mode when out of energy
      if (this.energy <= 0) {
        this.isRunMode = false;
      }
    } else if (
      this.currentState === "idle" ||
      this.currentState === "walking"
    ) {
      this.energy = Math.min(
        this.maxEnergy,
        this.energy + this.energyRecoveryRate * deltaSeconds
      );
    }
  }

  // Override collision handling to add enemy collision damage
  protected handleCollisionStart(evt: ex.CollisionStartEvent) {
    // Call parent collision handling for platforms
    super.handleCollisionStart(evt);

    // Add player-specific collision: damage from enemies
    const otherActor = evt.other.owner as ex.Actor;
    if (otherActor?.name?.startsWith("enemy")) {
      this.takeDamage(10);
    }
  }
}
