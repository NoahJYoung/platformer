import * as ex from "excalibur";
import { CollisionGroups } from "../config";
import { Character } from "./character";

export class MagicProjectile extends ex.Actor {
  private emitter!: ex.ParticleEmitter;
  private spellType: string;

  constructor(pos: ex.Vector, direction: number, spellType: string) {
    super({
      pos: pos,
      width: 8,
      height: 8,
      collisionType: ex.CollisionType.Active,
      collisionGroup: CollisionGroups.Weapon,
    });

    this.body.useGravity = false;

    this.spellType = spellType;
    this.vel = ex.vec(300 * direction, 0); // Projectile speed

    // Set what it collides with
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
      radius: 3,
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
      radius: 4,
      color: this.getSpellColor(),
    });
    this.graphics.use(circle);

    this.on("collisionstart", (evt) => this.handleCollision(evt));

    this.actions.delay(3000).die();
  }

  private getSpellColor(): ex.Color {
    switch (this.spellType) {
      case "fireball":
        return ex.Color.Orange;
      case "ice":
        return ex.Color.Cyan;
      case "lightning":
        return ex.Color.Yellow;
      default:
        return ex.Color.White;
    }
  }

  private handleCollision(evt: ex.CollisionStartEvent) {
    const other = evt.other.owner as ex.Actor;

    if (other?.name?.startsWith("enemy")) {
      const damage = this.getSpellDamage();
      if (other instanceof Character) {
        other.takeDamage(damage);
      }

      // Create impact effect
      this.createImpactEffect();

      // Destroy projectile
      this.kill();
    }

    if (
      other?.name?.startsWith("platform") ||
      other?.name?.startsWith("wall")
    ) {
      // Hit environment
      this.createImpactEffect();
      this.kill();
    }
  }

  private getSpellDamage(): number {
    switch (this.spellType) {
      case "fireball":
        return 25;
      case "ice":
        return 15; // Less damage but slows enemy
      case "lightning":
        return 30; // High damage
      default:
        return 20;
    }
  }

  private createImpactEffect() {
    // Create explosion particles at impact point
    const explosion = new ex.ParticleEmitter({
      pos: this.pos.clone(),
      emitterType: ex.EmitterType.Circle,
      radius: 5, // Reduced from 10
      isEmitting: false,
      emitRate: 30, // Reduced from 50
      particle: {
        minSpeed: 50, // Reduced from 100
        maxSpeed: 150, // Reduced from 300
        minAngle: 0,
        maxAngle: Math.PI * 2,
        life: 300, // Reduced from 500
        opacity: 1,
        fade: true,
        minSize: 3, // Reduced from 8
        maxSize: 8, // Reduced from 20
        startSize: 6, // Reduced from 15
        endSize: 1, // Reduced from 2
        acc: ex.vec(0, 50), // Reduced gravity from 100
        beginColor: this.getSpellColor(),
        endColor: ex.Color.Transparent,
      },
    });

    this.scene?.add(explosion);

    // Emit burst and clean up
    explosion.emitParticles(20);

    setTimeout(() => {
      explosion.kill();
    }, 1000);
  }
}
