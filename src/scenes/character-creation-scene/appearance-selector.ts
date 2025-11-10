import * as ex from "excalibur";
import { UIButton } from "./ui-button";
import type {
  HairOptions,
  SkinToneOptions,
} from "../../actors/character/types";

export interface AppearanceData {
  sex: "male" | "female";
  skinTone: SkinToneOptions;
  hairStyle: HairOptions;
}

const COLORS_PER_STYLE = 5;
const TOTAL_STYLES = 7;
const HAIR_COLORS = ["Brown", "Light Brown", "Red", "Blonde", "Black"];

export class AppearanceSelector extends ex.ScreenElement {
  private sex: "male" | "female" = "male";
  private skinTone: SkinToneOptions = 1;
  private hairIndex: HairOptions = 1;

  private get hairStyle(): number {
    return Math.floor((this.hairIndex - 1) / COLORS_PER_STYLE) + 1;
  }

  private get hairColor(): number {
    return (this.hairIndex - 1) % COLORS_PER_STYLE;
  }

  private get hairColorName(): string {
    return HAIR_COLORS[this.hairColor];
  }

  private maleButton!: UIButton;
  private femaleButton!: UIButton;
  private prevSkinButton!: UIButton;
  private nextSkinButton!: UIButton;
  private prevHairStyleButton!: UIButton;
  private nextHairStyleButton!: UIButton;
  private prevHairColorButton!: UIButton;
  private nextHairColorButton!: UIButton;

  private skinToneValueLabel!: ex.ScreenElement;
  private hairStyleValueLabel!: ex.ScreenElement;
  private hairColorValueLabel!: ex.ScreenElement;

  private onChange?: (data: AppearanceData) => void;

  constructor(pos: ex.Vector, onChange?: (data: AppearanceData) => void) {
    super({ pos, z: 100 });
    this.onChange = onChange;
  }

  onInitialize(): void {
    this.createGenderSection();
    this.createSkinToneSection();
    this.createHairStyleSection();
    this.createHairColorSection();
  }

  private createLabel(text: string, yOffset: number): ex.ScreenElement {
    const label = new ex.ScreenElement({
      pos: ex.vec(0, yOffset),
      z: 100,
    });
    label.graphics.use(
      new ex.Text({
        text,
        font: new ex.Font({
          size: 14,
          color: ex.Color.White,
          bold: true,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      })
    );
    this.addChild(label);
    return label;
  }

  private createValueLabel(yOffset: number): ex.ScreenElement {
    const label = new ex.ScreenElement({
      pos: ex.vec(0, yOffset),
      z: 100,
    });
    label.graphics.use(
      new ex.Text({
        text: "",
        font: new ex.Font({
          size: 13,
          color: ex.Color.fromHex("#3498db"),
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      })
    );
    this.addChild(label);
    return label;
  }

  private createGenderSection(): void {
    this.createLabel("Gender", 0);

    this.maleButton = new UIButton({
      text: "Male",
      pos: ex.vec(-35, 30),
      onClick: () => {
        this.setSex("male");
      },
      fontSize: 13,
      width: 65,
      height: 30,
    });
    this.addChild(this.maleButton);
    this.maleButton.setHighlighted(true);

    this.femaleButton = new UIButton({
      text: "Female",
      pos: ex.vec(35, 30),
      onClick: () => {
        this.setSex("female");
      },
      fontSize: 13,
      width: 65,
      height: 30,
    });
    this.addChild(this.femaleButton);
  }

  private createSkinToneSection(): void {
    this.createLabel("Skin Tone", 60);

    this.skinToneValueLabel = this.createValueLabel(80);
    this.updateSkinToneLabel();

    this.prevSkinButton = new UIButton({
      text: "◀",
      pos: ex.vec(-35, 105),
      width: 65,
      height: 30,
      onClick: () => this.adjustSkinTone(-1),
      fontSize: 14,
    });
    this.addChild(this.prevSkinButton);

    this.nextSkinButton = new UIButton({
      text: "▶",
      pos: ex.vec(35, 105),
      width: 65,
      height: 30,
      onClick: () => this.adjustSkinTone(1),
      fontSize: 14,
    });
    this.addChild(this.nextSkinButton);
  }

  private createHairStyleSection(): void {
    this.createLabel("Hair Style", 135);

    this.hairStyleValueLabel = this.createValueLabel(155);
    this.updateHairStyleLabel();

    this.prevHairStyleButton = new UIButton({
      text: "◀",
      pos: ex.vec(-35, 180),
      width: 65,
      height: 30,
      onClick: () => this.adjustHairStyle(-1),
      fontSize: 14,
    });
    this.addChild(this.prevHairStyleButton);

    this.nextHairStyleButton = new UIButton({
      text: "▶",
      pos: ex.vec(35, 180),
      width: 65,
      height: 30,
      onClick: () => this.adjustHairStyle(1),
      fontSize: 14,
    });
    this.addChild(this.nextHairStyleButton);
  }

  private createHairColorSection(): void {
    this.createLabel("Hair Color", 210);

    this.hairColorValueLabel = this.createValueLabel(230);
    this.updateHairColorLabel();

    this.prevHairColorButton = new UIButton({
      text: "◀",
      pos: ex.vec(-35, 255),
      width: 65,
      height: 30,
      onClick: () => this.adjustHairColor(-1),
      fontSize: 14,
    });
    this.addChild(this.prevHairColorButton);

    this.nextHairColorButton = new UIButton({
      text: "▶",
      pos: ex.vec(35, 255),
      width: 65,
      height: 30,
      onClick: () => this.adjustHairColor(1),
      fontSize: 14,
    });
    this.addChild(this.nextHairColorButton);
  }

  private setSex(sex: "male" | "female"): void {
    this.sex = sex;
    this.maleButton.setHighlighted(sex === "male");
    this.femaleButton.setHighlighted(sex === "female");
    this.notifyChange();
  }

  private adjustSkinTone(delta: number): void {
    const newTone = Math.max(1, Math.min(5, this.skinTone + delta));
    this.skinTone = newTone as SkinToneOptions;
    this.updateSkinToneLabel();
    this.notifyChange();
  }

  private updateSkinToneLabel(): void {
    const text = new ex.Text({
      text: `Tone ${this.skinTone}`,
      font: new ex.Font({
        size: 13,
        color: ex.Color.fromHex("#3498db"),
        textAlign: ex.TextAlign.Center,
        baseAlign: ex.BaseAlign.Middle,
      }),
    });
    this.skinToneValueLabel.graphics.use(text);
  }

  private adjustHairStyle(delta: number): void {
    const currentStyle = this.hairStyle;
    const newStyle = Math.max(1, Math.min(TOTAL_STYLES, currentStyle + delta));

    if (newStyle !== currentStyle) {
      const currentColor = this.hairColor;
      const newBaseIndex = (newStyle - 1) * COLORS_PER_STYLE + 1;
      this.hairIndex = (newBaseIndex + currentColor) as HairOptions;
      this.updateHairStyleLabel();
      this.notifyChange();
    }
  }

  private updateHairStyleLabel(): void {
    const text = new ex.Text({
      text: `Style ${this.hairStyle}`,
      font: new ex.Font({
        size: 13,
        color: ex.Color.fromHex("#3498db"),
        textAlign: ex.TextAlign.Center,
        baseAlign: ex.BaseAlign.Middle,
      }),
    });
    this.hairStyleValueLabel.graphics.use(text);
  }

  private adjustHairColor(delta: number): void {
    const currentStyle = this.hairStyle;
    const currentColor = this.hairColor;
    const newColor =
      (currentColor + delta + COLORS_PER_STYLE) % COLORS_PER_STYLE;

    const styleBase = (currentStyle - 1) * COLORS_PER_STYLE + 1;
    this.hairIndex = (styleBase + newColor) as HairOptions;
    this.updateHairColorLabel();
    this.notifyChange();
  }

  private updateHairColorLabel(): void {
    const text = new ex.Text({
      text: this.hairColorName,
      font: new ex.Font({
        size: 13,
        color: ex.Color.fromHex("#3498db"),
        textAlign: ex.TextAlign.Center,
        baseAlign: ex.BaseAlign.Middle,
      }),
    });
    this.hairColorValueLabel.graphics.use(text);
  }

  private notifyChange(): void {
    if (this.onChange) {
      this.onChange(this.getAppearanceData());
    }
  }

  public getAppearanceData(): AppearanceData {
    return {
      sex: this.sex,
      skinTone: this.skinTone,
      hairStyle: this.hairIndex,
    };
  }
}
