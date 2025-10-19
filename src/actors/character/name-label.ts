import * as ex from "excalibur";
import { SCALE } from "../config";
import type { Character } from "./character";
import type { GameEngine } from "../../game-engine";

export class NameLabel extends ex.Actor {
  private parentCharacter: Character;
  private alwaysVisible: boolean;
  private level: number;
  private levelText!: ex.Text;
  private composite!: ex.GraphicsGroup;
  private engine!: GameEngine;

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
    this.level = this.parentCharacter.level;
  }

  onInitialize(engine: GameEngine) {
    this.engine = engine;
    const textToDisplay = this.parentCharacter.displayName || "Unknown";
    const isThreeOrMoreLevelsHigher = this.engine.player.level < this.level - 2;

    const nameText = new ex.Text({
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

    this.levelText = new ex.Text({
      text: `Lv. ${this.level}`,
      font: new ex.Font({
        size: 8 * SCALE,
        family: "Arial",
        bold: false,
        textAlign: ex.TextAlign.Center,
        color: isThreeOrMoreLevelsHigher ? ex.Color.Red : ex.Color.White,
        shadow: {
          offset: ex.vec(1, 1),
          color: ex.Color.Black,
        },
      }),
    });

    const isPlayer = this.parentCharacter.name === "player";

    this.composite = new ex.GraphicsGroup({
      members: [
        {
          graphic: nameText,
          offset: ex.vec(0, isPlayer ? 0 : -5),
        },
        {
          graphic: this.levelText,
          offset: ex.vec(13, isPlayer ? 12 * SCALE : 6 * SCALE),
        },
      ],
    });

    this.on("preupdate", () => {
      if (this.level !== this.parentCharacter.level) {
        this.level = this.parentCharacter.level;

        this.levelText.text = `Lv. ${this.level}`;
      }

      if (this.parentCharacter.hasTakenDamage || this.alwaysVisible) {
        this.graphics.use(this.composite);
      }
    });
  }
}
