import * as ex from "excalibur";

export class NameInput extends ex.ScreenElement {
  private nameLabel!: ex.Text;
  private promptLabel!: ex.Text;
  private background!: ex.Rectangle;
  private border!: ex.Rectangle;
  public isActive: boolean = false;
  private characterName: string = "";
  private onChange?: (name: string) => void;
  private fontSize: number;

  private readonly keyToChar: Map<ex.Keys, string> = new Map([
    [ex.Keys.A, "a"],
    [ex.Keys.B, "b"],
    [ex.Keys.C, "c"],
    [ex.Keys.D, "d"],
    [ex.Keys.E, "e"],
    [ex.Keys.F, "f"],
    [ex.Keys.G, "g"],
    [ex.Keys.H, "h"],
    [ex.Keys.I, "i"],
    [ex.Keys.J, "j"],
    [ex.Keys.K, "k"],
    [ex.Keys.L, "l"],
    [ex.Keys.M, "m"],
    [ex.Keys.N, "n"],
    [ex.Keys.O, "o"],
    [ex.Keys.P, "p"],
    [ex.Keys.Q, "q"],
    [ex.Keys.R, "r"],
    [ex.Keys.S, "s"],
    [ex.Keys.T, "t"],
    [ex.Keys.U, "u"],
    [ex.Keys.V, "v"],
    [ex.Keys.W, "w"],
    [ex.Keys.X, "x"],
    [ex.Keys.Y, "y"],
    [ex.Keys.Z, "z"],
    [ex.Keys.Num0, "0"],
    [ex.Keys.Num1, "1"],
    [ex.Keys.Num2, "2"],
    [ex.Keys.Num3, "3"],
    [ex.Keys.Num4, "4"],
    [ex.Keys.Num5, "5"],
    [ex.Keys.Num6, "6"],
    [ex.Keys.Num7, "7"],
    [ex.Keys.Num8, "8"],
    [ex.Keys.Num9, "9"],
  ]);

  constructor(
    pos: ex.Vector,
    fontSize: number,
    onChange?: (name: string) => void
  ) {
    super({
      pos,
      width: 300,
      height: 70,
      z: 100,
    });
    this.fontSize = fontSize;
    this.onChange = onChange;
  }

  onInitialize(engine: ex.Engine): void {
    this.promptLabel = new ex.Text({
      text: "Click to enter name, press Enter when done",
      font: new ex.Font({
        size: this.fontSize * 0.65,
        color: ex.Color.Gray,
        textAlign: ex.TextAlign.Center,
        baseAlign: ex.BaseAlign.Middle,
      }),
    });

    this.nameLabel = new ex.Text({
      text: "Hero_",
      font: new ex.Font({
        size: this.fontSize,
        color: ex.Color.White,
        bold: true,
        textAlign: ex.TextAlign.Center,
        baseAlign: ex.BaseAlign.Middle,
      }),
    });

    const group = new ex.GraphicsGroup({
      members: [
        { graphic: this.promptLabel, offset: ex.vec(0, 0) },
        { graphic: this.nameLabel, offset: ex.vec(0, 25) },
      ],
    });

    this.graphics.use(group);

    this.on("pointerdown", () => {
      this.isActive = true;
      this.updateDisplay();
    });

    this.on("pointerenter", () => {
      engine.canvas.style.cursor = "text";
    });

    this.on("pointerleave", () => {
      engine.canvas.style.cursor = "default";
    });

    this.setupKeyboardInput(engine);
  }

  private setupKeyboardInput(engine: ex.Engine): void {
    this.on("preupdate", () => {
      if (!this.isActive) return;

      const kb = engine.input.keyboard;

      if (kb.wasPressed(ex.Keys.Enter)) {
        this.isActive = false;
        this.updateDisplay();
        if (this.onChange) {
          this.onChange(this.characterName.trim() || "Hero");
        }
        return;
      }

      if (kb.wasPressed(ex.Keys.Backspace)) {
        this.characterName = this.characterName.slice(0, -1);
        this.updateDisplay();
        return;
      }

      if (kb.wasPressed(ex.Keys.Space) && this.characterName.length < 20) {
        this.characterName += " ";
        this.updateDisplay();
        return;
      }

      if (this.characterName.length < 20) {
        const isShift =
          kb.isHeld(ex.Keys.ShiftLeft) || kb.isHeld(ex.Keys.ShiftRight);

        for (const [key, char] of this.keyToChar.entries()) {
          if (kb.wasPressed(key)) {
            const finalChar = isShift ? char.toUpperCase() : char;
            this.characterName += finalChar;
            this.updateDisplay();
            break;
          }
        }
      }
    });
  }

  private updateDisplay(): void {
    if (this.isActive) {
      this.nameLabel.text = (this.characterName || "") + "_";
      this.nameLabel.color = ex.Color.Yellow;
    } else {
      this.nameLabel.text = this.characterName || "Hero";
      this.nameLabel.color = ex.Color.White;
    }
  }

  public getName(): string {
    return this.characterName.trim() || "Hero";
  }
}
