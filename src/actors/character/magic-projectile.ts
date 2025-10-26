import * as ex from "excalibur";
import { CollisionGroups } from "../config";
import { Character } from "./character";
import type { Element } from "./types";
import { ElementColors } from "./types";

export class MagicProjectile extends ex.Actor {
  private emitter!: ex.ParticleEmitter;
  private coreEmitter!: ex.ParticleEmitter;
  private element: Element;
  private damage: number;
  private radius: number;
  private onDamageDealt?: (damage: number) => void;
  private isCharging: boolean = true;
  private chargeStartTime: number = 0;
  private chargeDuration: number = 500;
  private launchDirection: number;
  private outerCircle!: ex.Circle;
  private innerCircle!: ex.Circle;

  constructor(
    pos: ex.Vector,
    direction: number,
    element: Element,
    damage: number,
    onDamageDealt?: (damage: number) => void
  ) {
    const normalizedDamage = Math.max(damage / 4, 1);
    const radius = ex.clamp(Math.sqrt(normalizedDamage) * 3, 2, 20);

    super({
      pos: pos,
      width: radius * 2,
      height: radius * 2,
      collisionType: ex.CollisionType.PreventCollision,
      collisionGroup: CollisionGroups.Weapon,
    });
    this.damage = damage;
    this.radius = radius;
    this.onDamageDealt = onDamageDealt;
    this.launchDirection = direction;
    this.element = element;
    this.body.useGravity = false;
  }

  onInitialize(engine: ex.Engine) {
    this.chargeStartTime = Date.now();

    this.emitter = new ex.ParticleEmitter({
      pos: ex.vec(0, 0),
      emitterType: ex.EmitterType.Circle,
      radius: 1,
      isEmitting: true,
      emitRate: 60,
      particle: {
        minSpeed: 80,
        maxSpeed: 120,
        minAngle: 0,
        maxAngle: Math.PI * 2,
        life: 400,
        opacity: 0.9,
        fade: true,
        minSize: 2,
        maxSize: 5,
        startSize: 4,
        endSize: 0.5,
        acc: ex.vec(0, 0),
        beginColor: this.getSpellColor("primary"),
        endColor: this.getSpellColor("secondary"),
      },
    });

    this.coreEmitter = new ex.ParticleEmitter({
      pos: ex.vec(0, 0),
      emitterType: ex.EmitterType.Circle,
      radius: 0.5,
      isEmitting: true,
      emitRate: 40,
      particle: {
        minSpeed: 20,
        maxSpeed: 50,
        minAngle: 0,
        maxAngle: Math.PI * 2,
        life: 300,
        opacity: 1,
        fade: true,
        minSize: 1,
        maxSize: 3,
        startSize: 2,
        endSize: 0,
        acc: ex.vec(0, 0),
        beginColor: this.getSpellColor("secondary"),
        endColor: this.getSpellColor("primary"),
      },
    });

    this.addChild(this.emitter);
    this.addChild(this.coreEmitter);

    this.outerCircle = new ex.Circle({
      radius: this.radius,
      color: this.getSpellColor("primary").clone(),
    });

    this.innerCircle = new ex.Circle({
      radius: this.radius * 0.5,
      color: this.getSpellColor("secondary").clone(),
    });

    const composite = new ex.GraphicsGroup({
      members: [
        { graphic: this.outerCircle, offset: ex.vec(0.5, 0.5) },
        {
          graphic: this.innerCircle,
          offset: ex.vec(this.radius / 2, this.radius / 2),
        },
      ],
    });

    this.graphics.use(composite);

    this.scale = ex.vec(0.05, 0.05);

    this.on("preupdate", () => {
      if (this.isCharging) {
        const elapsed = Date.now() - this.chargeStartTime;
        const progress = Math.min(elapsed / this.chargeDuration, 1);

        const easeProgress = 1 - Math.pow(1 - progress, 3);
        this.scale = ex.vec(easeProgress, easeProgress);

        this.emitter.radius = this.radius * easeProgress;
        this.coreEmitter.radius = this.radius * 0.5 * easeProgress;

        this.emitter.emitRate = 60 + 40 * progress;
        this.coreEmitter.emitRate = 40 + 30 * progress;

        const pulse = 0.7 + Math.sin(elapsed / 50) * 0.3;
        this.outerCircle.color = this.getSpellColor("primary").clone();
        this.outerCircle.color.a = pulse;

        if (progress >= 1) {
          this.launch();
        }
      }
    });

    this.on("collisionstart", (evt) => this.handleCollision(evt));
  }

  private launch() {
    this.isCharging = false;
    this.scale = ex.vec(1, 1);

    this.outerCircle.color = this.getSpellColor("primary");

    this.body.collisionType = ex.CollisionType.Active;

    this.vel = ex.vec(1000 * this.launchDirection, 0);

    this.emitter.radius = this.radius;
    this.emitter.emitRate = 50;
    this.coreEmitter.emitRate = 30;

    this.body.group = ex.CollisionGroup.collidesWith([
      CollisionGroups.Enemy,
      CollisionGroups.Interactable,
      CollisionGroups.Environment,
    ]);

    this.actions.delay(3000).die();
  }

  private getSpellColor(type: "primary" | "secondary"): ex.Color {
    const colors = ElementColors[this.element];
    return type === "primary" ? colors.primary : colors.secondary;
  }

  private handleCollision(evt: ex.CollisionStartEvent) {
    if (this.isCharging) return;

    const other = evt.other.owner as ex.Actor;

    if (other?.name?.startsWith("enemy")) {
      if (other instanceof Character) {
        other.takeDamage(this.damage, this.element);

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
        life: 400,
        opacity: 1,
        fade: true,
        minSize: 3,
        maxSize: 8,
        startSize: 6,
        endSize: 1,
        acc: ex.vec(0, 50),
        beginColor: this.getSpellColor("primary"),
        endColor: this.getSpellColor("secondary"),
      },
    });

    this.scene?.add(explosion);
    explosion.emitParticles(30);

    setTimeout(() => {
      explosion.kill();
    }, 1000);
  }
}
