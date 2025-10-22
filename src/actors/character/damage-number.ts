import * as ex from "excalibur";
import { SCALE } from "../config";

export class DamageNumber extends ex.Actor {
  private lifetime: number = 1000;
  private elapsed: number = 0;
  private floatSpeed: number = -50;

  constructor(pos: ex.Vector, damage: number, color: ex.Color = ex.Color.Red) {
    super({
      pos: pos.clone(),
      width: 20,
      height: 20,
      collisionType: ex.CollisionType.PreventCollision,
      z: 1000,
    });

    const text = new ex.Text({
      text: damage.toString(),
      font: new ex.Font({
        size: 16,
        family: "Arial",
        bold: true,
        color,
      }),
    });

    this.graphics.use(text);

    this.pos.x += (Math.random() - 0.5) * 20;
  }

  onInitialize(engine: ex.Engine) {
    this.on("preupdate", (evt) => {
      const delta = evt.engine.clock.elapsed();
      this.elapsed += delta;

      this.pos.y += this.floatSpeed * (delta / 1000);

      const fadeProgress = this.elapsed / this.lifetime;
      const opacity = 1 - fadeProgress;

      if (this.graphics.current) {
        this.graphics.opacity = opacity;
      }

      if (this.elapsed >= this.lifetime) {
        this.kill();
      }
    });
  }
}
