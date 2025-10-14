import * as ex from "excalibur";
import { Character } from "../character/character";
import type { AppearanceOptions } from "../character/types";
import type { GameEngine } from "../../game-engine";

export class Player extends Character {
  public isRunMode: boolean = false;
  private lastToggleFrame: number = -1;
  private temperature: number = 20;
  private hunger: number = 100;
  private thirst: number = 100;

  constructor(pos: ex.Vector, appearanceOptions: AppearanceOptions) {
    super("player", pos, appearanceOptions, true);
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

  private handleInput(engine: ex.Engine) {
    const kb = engine.input.keyboard;
    if (this.currentState === "dead") {
      return;
    }

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

    if (
      this.currentState !== "attacking" &&
      this.currentState !== "hurt" &&
      this.currentState !== "dodging"
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

    if (kb.wasPressed(ex.Keys.K) && this.currentState !== "hurt") {
      this.magicAttack("fireball");
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
        this.attack();
      }
    }

    if (kb.wasPressed(ex.Keys.Key1)) {
      this.unequipWeapon();
    }

    if (kb.wasPressed(ex.Keys.Key2)) {
      this.equipWeapon(1);
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

  protected updateEnergy(deltaSeconds: number) {
    if (this.currentState === "running") {
      this.energy = Math.max(
        0,
        this.energy - this.runEnergyDrain * deltaSeconds
      );

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
}
