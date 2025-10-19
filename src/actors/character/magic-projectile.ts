import * as ex from "excalibur";
import { CollisionGroups } from "../config";
import { Character } from "./character";
import type { Element } from "./types";

export class MagicProjectile extends ex.Actor {
  private emitter!: ex.ParticleEmitter;
  private spellType: Element;
  private damage: number;
  private radius: number;
  private onDamageDealt?: (damage: number) => void;

  constructor(
    pos: ex.Vector,
    direction: number,
    spellType: Element,
    damage: number,
    onDamageDealt?: (damage: number) => void
  ) {
    const radius = ex.clamp(damage / 4, 2, 20);

    super({
      pos: pos,
      width: radius * 2,
      height: radius * 2,
      collisionType: ex.CollisionType.Active,
      collisionGroup: CollisionGroups.Weapon,
    });
    this.damage = damage;
    this.radius = radius;
    this.onDamageDealt = onDamageDealt;

    this.body.useGravity = false;

    this.spellType = spellType;
    this.vel = ex.vec(300 * direction, 0);

    this.body.group = ex.CollisionGroup.collidesWith([
      CollisionGroups.Enemy,
      CollisionGroups.Interactable,
      CollisionGroups.Environment,
    ]);
  }

  onInitialize(engine: ex.Engine) {
    this.emitter = new ex.ParticleEmitter({
      pos: ex.vec(0, 0),
      emitterType: ex.EmitterType.Circle,
      radius: this.radius,
      isEmitting: true,
      emitRate: 50,
      particle: {
        minSpeed: 50,
        maxSpeed: 100,
        minAngle: 0,
        maxAngle: Math.PI * 2,
        life: 300,
        opacity: 0.8,
        fade: true,
        minSize: 2,
        maxSize: 6,
        startSize: 4,
        endSize: 1,
        acc: ex.vec(0, 0),
        beginColor: this.getSpellColor(),
        endColor: ex.Color.Transparent,
      },
    });

    this.addChild(this.emitter);

    const circle = new ex.Circle({
      radius: this.radius,
      color: this.getSpellColor(),
    });
    this.graphics.use(circle);

    this.on("collisionstart", (evt) => this.handleCollision(evt));

    this.actions.delay(3000).die();
  }

  private getSpellColor(): ex.Color {
    switch (this.spellType) {
      case "fire":
        return ex.Color.Orange;
      case "ice":
        return ex.Color.Cyan;
      case "earth":
        return ex.Color.Green;
      case "water":
        return ex.Color.Azure;
      default:
        return ex.Color.White;
    }
  }

  private handleCollision(evt: ex.CollisionStartEvent) {
    const other = evt.other.owner as ex.Actor;

    if (other?.name?.startsWith("enemy")) {
      if (other instanceof Character) {
        other.takeDamage(this.damage);

        if (this.onDamageDealt) {
          this.onDamageDealt(this.damage);
        }
      }

      this.createImpactEffect();
      this.kill();
    }

    if (
      other?.name?.startsWith("platform") ||
      other?.name?.startsWith("wall")
    ) {
      this.createImpactEffect();
      this.kill();
    }
  }

  private createImpactEffect() {
    const explosion = new ex.ParticleEmitter({
      pos: this.pos.clone(),
      emitterType: ex.EmitterType.Circle,
      radius: 5,
      isEmitting: false,
      emitRate: 30,
      particle: {
        minSpeed: 50,
        maxSpeed: 150,
        minAngle: 0,
        maxAngle: Math.PI * 2,
        life: 300,
        opacity: 1,
        fade: true,
        minSize: 3,
        maxSize: 8,
        startSize: 6,
        endSize: 1,
        acc: ex.vec(0, 50),
        beginColor: this.getSpellColor(),
        endColor: ex.Color.Transparent,
      },
    });

    this.scene?.add(explosion);
    explosion.emitParticles(20);

    setTimeout(() => {
      explosion.kill();
    }, 1000);
  }
}
