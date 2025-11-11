import * as ex from "excalibur";
import type { GameEngine } from "../../engine/game-engine";
import type {
  AppearanceOptions,
  AttributesConfig,
} from "../../actors/character/types";
import { AppearanceSelector } from "./appearance-selector";
import { NameInput } from "./name-input";
import { StatDistributor } from "./stat-distributor";
import { CharacterPreview } from "./character-preview";
import { UIButton } from "./ui-button";

export class CharacterCreationScene extends ex.Scene {
  private appearanceSelector!: AppearanceSelector;
  private nameInput!: NameInput;
  private statDistributor!: StatDistributor;
  private characterPreview!: CharacterPreview;
  private startButton!: UIButton;

  onInitialize(engine: GameEngine): void {
    this.createBackground(engine);
    this.createTitle(engine);
    this.createComponents(engine);
    this.createStartButton(engine);
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
    const titleY = engine.drawHeight * 0.1;

    const title = new ex.Label({
      text: "Create Your Character",
      pos: ex.vec(engine.drawWidth / 2, titleY),
      font: new ex.Font({
        size: 20,
        color: ex.Color.White,
        bold: true,
        textAlign: ex.TextAlign.Center,
        baseAlign: ex.BaseAlign.Middle,
      }),
    });
    this.add(title);
  }

  private createComponents(engine: GameEngine): void {
    const width = engine.drawWidth;
    const height = engine.drawHeight;

    const leftX = width * 0.2;
    const centerX = width * 0.5;
    const rightX = width * 0.8;
    const topY = height * 0.15;

    this.nameInput = new NameInput(ex.vec(centerX, height * 0.15), 16);
    this.add(this.nameInput);

    this.appearanceSelector = new AppearanceSelector(
      ex.vec(leftX, height * 0.25),
      () => this.updatePreview()
    );
    this.add(this.appearanceSelector);

    this.characterPreview = new CharacterPreview(ex.vec(centerX, height * 0.5));
    this.add(this.characterPreview);

    this.statDistributor = new StatDistributor(
      ex.vec(rightX, height * 0.25),
      () => this.updatePreview()
    );
    this.add(this.statDistributor);

    this.updatePreview();
  }

  private createStartButton(engine: GameEngine): void {
    const buttonY = engine.drawHeight * 0.8;
    const hintY = buttonY + 40;

    this.startButton = new UIButton({
      text: "Start Adventure",
      pos: ex.vec(engine.drawWidth / 2, buttonY),
      width: 200,
      height: 50,
      normalColor: ex.Color.fromHex("#2ecc71"),
      hoverColor: ex.Color.fromHex("#27ae60"),

      onClick: () => this.startGame(engine),
    });
    this.add(this.startButton);

    const hint = new ex.Label({
      text: "Make sure to allocate all bonus points!",
      pos: ex.vec(engine.drawWidth / 2, hintY),
      font: new ex.Font({
        size: 11,
        color: ex.Color.Gray,
        textAlign: ex.TextAlign.Center,
        baseAlign: ex.BaseAlign.Middle,
      }),
    });
    this.add(hint);
  }

  private updatePreview(): void {
    const appearance: AppearanceOptions = {
      ...this.appearanceSelector.getAppearanceData(),
      displayName: this.nameInput.getName(),
    };

    this.characterPreview.updatePreview(appearance);
  }

  private startGame(engine: GameEngine): void {
    if (this.statDistributor.hasUnspentPoints()) {
      engine.showMessage("Please allocate all bonus points!", "danger");
      return;
    }

    const appearance: AppearanceOptions = {
      ...this.appearanceSelector.getAppearanceData(),
      displayName: this.nameInput.getName(),
    };
    const attributes = this.statDistributor.getAttributes();

    const maxLevelAttributes: AttributesConfig = {
      vitality: 100,
      strength: 100,
      agility: 100,
      intelligence: 100,
    };

    if (engine.onCharacterCreated) {
      engine.onCharacterCreated(appearance, maxLevelAttributes);
    }
  }
}
