import * as ex from "excalibur";
import type { GameEngine } from "../../engine/game-engine";
import { UIButton } from "../character-creation-scene/ui-button";
import { SaveManager } from "../../engine/save-manager";

export class MainMenuScene extends ex.Scene {
  onInitialize(engine: GameEngine): void {
    this.createBackground(engine);
    this.createTitle(engine);
    this.createMenuButtons(engine);
  }

  private createBackground(engine: GameEngine): void {
    const background = new ex.Actor({
      pos: ex.vec(engine.drawWidth / 2, engine.drawHeight / 2),
      anchor: ex.vec(0.5, 0.5),
      width: engine.drawWidth,
      height: engine.drawHeight,
    });
    background.graphics.use(
      new ex.Rectangle({
        width: engine.canvasWidth,
        height: engine.canvasHeight,
        color: ex.Color.fromHex("#0a0a0a"),
      })
    );
    this.add(background);
  }

  private createTitle(engine: GameEngine): void {
    // Convert to ScreenElement for proper positioning
    const titleElement = new ex.ScreenElement({
      pos: ex.vec(engine.drawWidth / 2, engine.drawHeight / 3),
      anchor: ex.vec(0, 0),
      z: 100,
    });
    titleElement.graphics.use(
      new ex.Text({
        text: "Title",
        font: new ex.Font({
          size: 48,
          color: ex.Color.White,
          bold: true,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      })
    );
    this.add(titleElement);

    const subtitleElement = new ex.ScreenElement({
      pos: ex.vec(engine.drawWidth / 2, engine.drawHeight / 3 + 60),
      z: 100,
    });
    subtitleElement.graphics.use(
      new ex.Text({
        text: "Subtitle",
        font: new ex.Font({
          size: 20,
          color: ex.Color.Gray,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      })
    );
    this.add(subtitleElement);
  }

  private createMenuButtons(engine: GameEngine): void {
    const centerX = engine.drawWidth / 2;
    const centerY = engine.drawHeight / 2;

    const newGameButton = new UIButton({
      text: "New Game",
      pos: ex.vec(centerX, centerY + 20),
      width: 200,
      height: 50,
      onClick: () => {
        console.log("click");
        engine.goToScene("characterCreation");
      },
    });
    this.add(newGameButton);

    const loadGameButton = new UIButton({
      text: "Load Game",
      pos: ex.vec(centerX, centerY + 80),
      width: 200,
      height: 50,
      normalColor: SaveManager.hasSave(0)
        ? ex.Color.fromHex("#2ecc71")
        : ex.Color.fromHex("#333333"),
      hoverColor: SaveManager.hasSave(0)
        ? ex.Color.fromHex("#27ae60")
        : ex.Color.fromHex("#444444"),
      onClick: () => {
        if (SaveManager.hasSave(0)) {
          SaveManager.loadGame(engine, 0);
        } else {
          engine.showMessage("No save file found!", "info");
        }
      },
    });
    this.add(loadGameButton);
  }
}
