import * as ex from "excalibur";
import { SCALE } from "../config";

export class NameLabel extends ex.Actor {
  private displayName: string;

  constructor(displayName: string, offsetY: number = -40 * SCALE) {
    super({
      pos: ex.vec(0, offsetY),
      width: 100,
      height: 20,
      collisionType: ex.CollisionType.PreventCollision,
      anchor: ex.vec(0.5, 0.5),
    });

    this.displayName = displayName || "Unknown";
  }

  onInitialize(engine: ex.Engine) {
    const textToDisplay = this.displayName || "Unknown";

    const text = new ex.Text({
      text: textToDisplay,
      font: new ex.Font({
        size: 9 * SCALE,
        family: "Arial",
        bold: false,
        color: ex.Color.White,
        shadow: {
          offset: ex.vec(1, 1),
          color: ex.Color.Black,
        },
      }),
    });

    this.graphics.use(text);
  }
}
