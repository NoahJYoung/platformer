import * as ex from "excalibur";
import { CollisionGroups } from "../config";

export class ProtectionShield extends ex.Actor {
  private outerCircle!: ex.Circle;
  private middleCircle!: ex.Circle;
  private isCharging: boolean = true;
  private chargeStartTime: number = 0;
  private chargeDuration: number = 200;
  private isShrinking: boolean = false;
  private shrinkStartTime: number = 0;
  private shrinkDuration: number = 150;
  private intelligence: number;

  constructor(radius: number, intelligence: number) {
    super({
      pos: ex.vec(0, 0),
      width: radius * 2,
      height: radius * 2,
      collisionType: ex.CollisionType.Fixed,
      anchor: ex.vec(0.5, 0.5),
    });

    this.intelligence = intelligence;

    this.body.group = ex.CollisionGroup.collidesWith([CollisionGroups.Enemy]);
  }

  onInitialize(engine: ex.Engine) {
    const radius = this.width / 2;
    this.chargeStartTime = Date.now();

    this.collider.set(ex.Shape.Circle(radius * 0.8));

    this.outerCircle = new ex.Circle({
      radius: radius * 0.8,
      color: ex.Color.fromRGB(100, 150, 255, 0.3),
      strokeColor: ex.Color.fromRGB(150, 200, 255),
      lineWidth: 2,
    });

    this.middleCircle = new ex.Circle({
      radius: radius * 0.7,
      color: ex.Color.fromRGB(120, 180, 255, 0.4),
    });

    const composite = new ex.GraphicsGroup({
      members: [
        { graphic: this.outerCircle, offset: ex.vec(0, 0) },
        {
          graphic: this.middleCircle,
          offset: ex.vec(radius * 0.13, radius * 0.13),
        },
      ],
    });

    this.graphics.use(composite);

    this.scale = ex.vec(0.05, 0.05);

    this.on("collisionstart", (evt) => this.handleCollision(evt));

    this.on("preupdate", () => {
      if (this.isShrinking) {
        const elapsed = Date.now() - this.shrinkStartTime;
        const progress = Math.min(elapsed / this.shrinkDuration, 1);

        const easeProgress = progress * progress * progress;
        const scale = 1 - easeProgress;
        this.scale = ex.vec(scale, scale);

        if (progress >= 1) {
          this.kill();
        }
      } else if (this.isCharging) {
        const elapsed = Date.now() - this.chargeStartTime;
        const progress = Math.min(elapsed / this.chargeDuration, 1);

        const easeProgress = 1 - Math.pow(1 - progress, 3);
        this.scale = ex.vec(easeProgress, easeProgress);

        if (progress >= 1) {
          this.isCharging = false;
        }
      }
    });
  }

  private handleCollision(evt: ex.CollisionStartEvent) {
    const other = evt.other.owner as ex.Actor;

    if (other?.name?.startsWith("enemy")) {
      const direction = other.pos.sub(this.pos).normalize();
      const pushForce = this.intelligence * 4;

      const pushVelocity = direction.scale(pushForce);
      other.vel = ex.vec(pushVelocity.x, other.vel.y);
    }
  }

  public deactivate() {
    this.isShrinking = true;
    this.shrinkStartTime = Date.now();
  }
}
