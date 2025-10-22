import * as ex from "excalibur";
import { Character } from "../character/character";
import { SCALE } from "../config";
import { Player } from "../player/player";
import type { EnemyConfig } from "./types";

export class Enemy extends Character {
  private detectionRange: number = 300;
  private attackRange: number = 20;
  private patrolDistance: number = 100;
  private patrolStartX: number;
  private aiState: "idle" | "patrol" | "chase" | "attack" | "retreat" = "idle";
  private player?: Player;
  private attackCooldown: number = 0;
  private attackCooldownTime: number = 1.5;
  private wasHit: boolean = false;
  private consecutiveHits: number = 0;

  constructor(config: EnemyConfig) {
    const { name, pos, appearanceOptions, facingRight, attributes } = config;

    super("enemy", pos, appearanceOptions, facingRight, true, attributes);
    this.patrolStartX = pos.x;

    this.name = name.startsWith("enemy") ? name : `enemy-${name}`;
  }

  protected getAttackTargets(): string[] {
    return ["player"];
  }

  onPreUpdate(engine: ex.Engine, deltaSeconds: number) {
    if (!this.player) {
      this.player = engine.currentScene.actors.find((a) => a instanceof Player);
    }

    if (this.player && this.currentState !== "dead") {
      this.updateAI(engine, deltaSeconds);
    }
  }

  private updateAI(engine: ex.Engine, deltaSeconds: number) {
    if (
      !this.player ||
      this.currentState === "attacking" ||
      this.currentState === "hurt" ||
      this.currentState === "dodging"
    ) {
      return;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaSeconds;
    }

    const distanceToPlayer = this.pos.distance(this.player.pos);

    // Adjust attack range if player has shield active
    let effectiveAttackRange = this.attackRange;
    if (this.player.isShieldActive && this.player.protectionShield) {
      // Add shield radius to attack range so enemy attacks the shield
      const shieldRadius = this.player.protectionShield.width / 3;
      effectiveAttackRange = this.attackRange + shieldRadius;
    }

    if (distanceToPlayer <= effectiveAttackRange && this.attackCooldown <= 0) {
      this.aiState = "attack";
    } else if (distanceToPlayer <= this.detectionRange) {
      this.aiState = "chase";
    } else {
      this.aiState = "patrol";
    }

    switch (this.aiState) {
      case "patrol":
        this.patrol();
        break;
      case "chase":
        this.chasePlayer();
        break;
      case "attack":
        this.attackPlayer();
        break;
    }
  }

  private patrol() {
    this.vel.x = this.facingRight ? this.walkSpeed : -this.walkSpeed;

    if (Math.abs(this.vel.x) > 0.1) {
      this.currentState = "walking";
    } else {
      this.currentState = "idle";
    }
  }

  private chasePlayer() {
    if (!this.player) return;

    const direction = this.player.pos.x > this.pos.x ? 1 : -1;
    this.vel.x = direction * this.runSpeed;
    this.currentState = "running";
  }

  public takeDamage(amount: number): void {
    super.takeDamage(amount);

    this.wasHit = true;
    this.consecutiveHits++;
  }

  public dodge(direction: "left" | "right") {
    super.dodge(direction);
    this.consecutiveHits = 0;
    this.wasHit = false;
  }

  private attackPlayer() {
    if (
      !this.player ||
      this.currentState === "dead" ||
      this.player?.currentState === "dead" ||
      this.currentState === "dodging"
    )
      return;

    const shouldDodge = this.calculateDodgeChance(this.wasHit);

    if (!shouldDodge) {
      this.wasHit = false;
    }

    if (shouldDodge) {
      const direction = this.player.pos.x <= this.pos.x ? "left" : "right";
      this.dodge(direction);
      // this.attackCooldown = this.attackCooldownTime; // Set cooldown after dodging too!
      return;
    }

    this.vel.x = 0;

    if (this.energy >= this.attackEnergyCost) {
      this.attack();
      this.attackCooldown = this.attackCooldownTime;
    } else {
      this.currentState = "idle";
    }
  }

  private calculateDodgeChance(wasHit: boolean = false): boolean {
    if (this.energy < 16) {
      return false;
    }
    let dodgeChance = 0.2;
    const random = Math.random();

    if (wasHit) {
      dodgeChance = Math.min(0.8, 0.2 + this.consecutiveHits * 0.2);
    }

    return random < dodgeChance;
  }
}
