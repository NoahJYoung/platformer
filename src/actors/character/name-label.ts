import * as ex from "excalibur";
import { SCALE } from "../config";
import type { Character } from "./character";

export class NameLabel extends ex.Actor {
  private parentCharacter: Character;
  private alwaysVisible: boolean;

  constructor(
    parentCharacter: Character,
    offsetY: number = -40 * SCALE,
    alwaysVisible: boolean
  ) {
    super({
      pos: ex.vec(0, offsetY),
      width: 100,
      height: 20,
      collisionType: ex.CollisionType.PreventCollision,
      anchor: ex.vec(0.5, 0.5),
    });

    this.parentCharacter = parentCharacter;
    this.alwaysVisible = alwaysVisible;
  }

  onInitialize(engine: ex.Engine) {
    const textToDisplay = this.parentCharacter.displayName || "Unknown";

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

    this.on("preupdate", () => {
      if (this.parentCharacter.hasTakenDamage || this.alwaysVisible) {
        this.graphics.use(text);
      }
    });
  }
}
