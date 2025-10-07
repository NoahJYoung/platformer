import * as ex from "excalibur";
import type { Character } from "./character";
import type { AnimationController } from "./animation-controller";

export class DodgeSystem {
  private character: Character;
  private animController: AnimationController;

  private isDodging: boolean = false;
  private isInvincible: boolean = false;
  private dodgeCooldown: number = 0;

  // Dodge configuration
  private readonly dodgeDuration: number = 0.4; // seconds
  private readonly dodgeCooldownTime: number = 1.0; // seconds between dodges
  private readonly dodgeDistance: number = 150; // pixels to move
  private readonly dodgeEnergyCost: number = 15;

  private dodgeTimer: number = 0;
  private dodgeDirection: "left" | "right" = "right";

  constructor(character: Character, animController: AnimationController) {
    this.character = character;
    this.animController = animController;
  }

  public canDodge(energy: number): boolean {
    return (
      !this.isDodging &&
      this.dodgeCooldown <= 0 &&
      energy >= this.dodgeEnergyCost &&
      this.animController.currentState !== "dead" &&
      this.animController.currentState !== "attacking"
    );
  }

  public startDodge(
    direction: "left" | "right",
    currentEnergy: number
  ): number {
    if (!this.canDodge(currentEnergy)) {
      return currentEnergy;
    }

    this.isDodging = true;
    this.isInvincible = true;
    this.dodgeTimer = this.dodgeDuration;
    this.dodgeDirection = direction;
    this.dodgeCooldown = this.dodgeCooldownTime;

    // Set animation state to dodging
    this.animController.currentState = "dodging";

    // Apply dodge velocity
    const dodgeSpeed = this.dodgeDistance / this.dodgeDuration;
    const xVelocity = direction === "right" ? dodgeSpeed : -dodgeSpeed;
    this.character.vel.x = xVelocity;

    // Deduct energy
    return currentEnergy - this.dodgeEnergyCost;
  }

  public update(deltaSeconds: number): void {
    // Update cooldown
    if (this.dodgeCooldown > 0) {
      this.dodgeCooldown = Math.max(0, this.dodgeCooldown - deltaSeconds);
    }

    // Update dodge state
    if (this.isDodging) {
      this.dodgeTimer -= deltaSeconds;

      if (this.dodgeTimer <= 0) {
        this.endDodge();
      }
    }
  }

  private endDodge(): void {
    this.isDodging = false;
    this.isInvincible = false;
    this.dodgeTimer = 0;

    // Return to idle state (or let normal state logic take over)
    if (this.animController.currentState === "dodging") {
      this.animController.currentState = "idle";
    }

    // Reset velocity
    this.character.vel.x = 0;
  }

  public getIsInvincible(): boolean {
    return this.isInvincible;
  }

  public getIsDodging(): boolean {
    return this.isDodging;
  }

  public getDodgeCooldown(): number {
    return this.dodgeCooldown;
  }
}
