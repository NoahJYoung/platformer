import * as ex from "excalibur";
import { SCALE } from "../config";
import type { Character } from "./character";

export class HealthBar extends ex.Actor {
  private barWidth: number = 40;
  private barHeight: number = 4;
  private parentCharacter: Character;
  private getCurrentHealth: () => number;
  private getMaxHealth: () => number;
  private offsetY: number;

  constructor(
    parentCharacter: Character,
    getCurrentHealth: () => number,
    getMaxHealth: () => number,
    offsetY: number = -30
  ) {
    super({
      pos: ex.vec(0, offsetY),
      width: 40,
      height: 6,
      collisionType: ex.CollisionType.PreventCollision,
      anchor: ex.vec(0.5, 0.5),
    });

    this.parentCharacter = parentCharacter;
    this.getCurrentHealth = getCurrentHealth;
    this.getMaxHealth = getMaxHealth;
    this.offsetY = offsetY;
  }

  onInitialize(engine: ex.Engine) {
    // if (this.parentCharacter.hasTakenDamage) {
    //   this.graphics.use(this.createHealthBarGraphic());
    // }

    this.on("preupdate", () => {
      if (this.parentCharacter.hasTakenDamage) {
        this.graphics.use(this.createHealthBarGraphic());
      }
    });
  }

  private createHealthBarGraphic(): ex.Canvas {
    const canvas = new ex.Canvas({
      width: this.barWidth + 2,
      height: this.barHeight + 2,
      draw: (ctx) => {
        const currentHealth = this.getCurrentHealth();
        const maxHealth = this.getMaxHealth();
        const healthPercent = Math.max(
          0,
          Math.min(1, currentHealth / maxHealth)
        );

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.barWidth + 2, this.barHeight + 2);

        ctx.fillStyle = "#333333";
        ctx.fillRect(SCALE, SCALE, this.barWidth, this.barHeight);

        const healthColor = this.getHealthColor(healthPercent);
        ctx.fillStyle = healthColor;
        ctx.fillRect(
          SCALE,
          SCALE,
          this.barWidth * healthPercent,
          this.barHeight
        );
      },
    });

    return canvas;
  }

  private getHealthColor(healthPercent: number): string {
    if (healthPercent > 0.6) {
      return "#00ff00";
    } else if (healthPercent > 0.3) {
      return "#ffaa00";
    } else {
      return "#ff0000";
    }
  }
}
