import * as ex from "excalibur";
import { UIButton } from "./ui-button";
import type { AttributesConfig } from "../../actors/character/types";

export class StatDistributor extends ex.ScreenElement {
  private readonly baseValue = 5;
  private readonly bonusPoints = 5;

  private vitality: number = this.baseValue;
  private strength: number = this.baseValue;
  private agility: number = this.baseValue;
  private intelligence: number = this.baseValue;

  private vitalityLabel!: ex.ScreenElement;
  private strengthLabel!: ex.ScreenElement;
  private agilityLabel!: ex.ScreenElement;
  private intelligenceLabel!: ex.ScreenElement;
  private pointsLabel!: ex.ScreenElement;

  private onChange?: () => void;

  constructor(pos: ex.Vector, onChange?: () => void) {
    super({ pos, z: 100 });
    this.onChange = onChange;
  }

  onInitialize(): void {
    const title = new ex.ScreenElement({
      pos: ex.vec(0, 0),
      z: 100,
    });
    title.graphics.use(
      new ex.Text({
        text: "Attributes",
        font: new ex.Font({
          size: 14,
          color: ex.Color.White,
          bold: true,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      })
    );
    this.addChild(title);

    this.pointsLabel = new ex.ScreenElement({
      pos: ex.vec(0, 30),
      z: 100,
    });
    this.addChild(this.pointsLabel);
    this.updatePointsLabel();

    this.createStatRow("Vitality", 70);
    this.createStatRow("Strength", 130);
    this.createStatRow("Agility", 190);
    this.createStatRow("Intelligence", 250);

    this.updateLabels();
  }

  private createStatRow(name: string, yOffset: number): void {
    const nameLabel = new ex.ScreenElement({
      pos: ex.vec(-70, yOffset),
      z: 100,
    });
    nameLabel.graphics.use(
      new ex.Text({
        text: name,
        font: new ex.Font({
          size: 13,
          color: ex.Color.White,
          textAlign: ex.TextAlign.Left,
          baseAlign: ex.BaseAlign.Middle,
        }),
      })
    );
    this.addChild(nameLabel);

    const decreaseButton = new UIButton({
      text: "-",
      pos: ex.vec(20, yOffset),
      width: 30,
      height: 30,
      onClick: () => this.adjustStat(name.toLowerCase() as any, -1),
      fontSize: 16,
    });
    this.addChild(decreaseButton);

    const statLabel = new ex.ScreenElement({
      pos: ex.vec(50, yOffset),
      z: 100,
    });
    statLabel.graphics.use(
      new ex.Text({
        text: "5",
        font: new ex.Font({
          size: 15,
          color: ex.Color.fromHex("#3498db"),
          bold: true,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      })
    );
    this.addChild(statLabel);

    const increaseButton = new UIButton({
      text: "+",
      pos: ex.vec(80, yOffset),
      width: 30,
      height: 30,
      onClick: () => this.adjustStat(name.toLowerCase() as any, 1),
      fontSize: 16,
    });
    this.addChild(increaseButton);

    const labelMap: Record<string, string> = {
      Vitality: "vitalityLabel",
      Strength: "strengthLabel",
      Agility: "agilityLabel",
      Intelligence: "intelligenceLabel",
    };
    (this as any)[labelMap[name]] = statLabel;
  }

  private adjustStat(
    stat: "vitality" | "strength" | "agility" | "intelligence",
    delta: number
  ): void {
    const current = this[stat];
    const newValue = current + delta;

    if (newValue < this.baseValue) return;
    if (delta > 0 && this.getRemainingPoints() <= 0) return;

    this[stat] = newValue;
    this.updateLabels();

    if (this.onChange) {
      this.onChange();
    }
  }

  private getRemainingPoints(): number {
    const spent =
      this.vitality -
      this.baseValue +
      (this.strength - this.baseValue) +
      (this.agility - this.baseValue) +
      (this.intelligence - this.baseValue);

    return this.bonusPoints - spent;
  }

  private updateLabels(): void {
    this.updateStatLabel(this.vitalityLabel, this.vitality);
    this.updateStatLabel(this.strengthLabel, this.strength);
    this.updateStatLabel(this.agilityLabel, this.agility);
    this.updateStatLabel(this.intelligenceLabel, this.intelligence);
    this.updatePointsLabel();
  }

  private updateStatLabel(label: ex.ScreenElement, value: number): void {
    label.graphics.use(
      new ex.Text({
        text: `${value}`,
        font: new ex.Font({
          size: 15,
          color: ex.Color.fromHex("#3498db"),
          bold: true,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      })
    );
  }

  private updatePointsLabel(): void {
    const remaining = this.getRemainingPoints();
    this.pointsLabel.graphics.use(
      new ex.Text({
        text: `Bonus Points: ${remaining}`,
        font: new ex.Font({
          size: 13,
          color: remaining === 0 ? ex.Color.Green : ex.Color.Yellow,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      })
    );
  }

  public getAttributes(): AttributesConfig {
    return {
      vitality: this.vitality,
      strength: this.strength,
      agility: this.agility,
      intelligence: this.intelligence,
    };
  }

  public hasUnspentPoints(): boolean {
    return this.getRemainingPoints() > 0;
  }
}
