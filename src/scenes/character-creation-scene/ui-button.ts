// src/scenes/character-creation/ui-button.ts
import * as ex from "excalibur";

export interface ButtonConfig {
  text: string;
  pos: ex.Vector;
  onClick: () => void;
  width?: number;
  height?: number;
  normalColor?: ex.Color;
  hoverColor?: ex.Color;
  activeColor?: ex.Color;
  highlightColor?: ex.Color;
  fontSize?: number;
}

export class UIButton extends ex.ScreenElement {
  private config: Required<ButtonConfig>;
  private isHovered: boolean = false;
  private isHighlighted: boolean = false;
  private buttonCanvas: ex.Canvas;

  constructor(config: ButtonConfig) {
    const width = config.width ?? 80;
    const height = config.height ?? 40;

    // Convert center position to top-left (like HUD uses top-left positioning)
    const topLeftPos = ex.vec(
      config.pos.x - width / 2,
      config.pos.y - height / 2
    );

    super({
      pos: topLeftPos, // Top-left position, NO anchor
      z: 100,
    });

    this.config = {
      ...config,
      width,
      height,
      normalColor: config.normalColor ?? ex.Color.fromHex("#3498db"),
      hoverColor: config.hoverColor ?? ex.Color.fromHex("#2980b9"),
      activeColor: config.activeColor ?? ex.Color.fromHex("#1c5d8f"),
      highlightColor: config.highlightColor ?? ex.Color.fromHex("#27ae60"),
      fontSize: config.fontSize ?? 16,
    };

    // Create canvas exactly like HUD does
    this.buttonCanvas = new ex.Canvas({
      width: this.config.width,
      height: this.config.height,
      draw: (ctx) => this.drawButton(ctx),
    });

    // Use the canvas directly in graphics (like HUD does)
    this.graphics.use(this.buttonCanvas);
  }

  private drawButton(ctx: CanvasRenderingContext2D): void {
    const w = this.config.width;
    const h = this.config.height;

    // Determine color based on state
    let color: ex.Color;
    if (this.isHighlighted) {
      color = this.config.highlightColor;
    } else if (this.isHovered) {
      color = this.config.hoverColor;
    } else {
      color = this.config.normalColor;
    }

    // Draw button background (from 0,0 like HUD does)
    ctx.fillStyle = color.toString();
    ctx.fillRect(0, 0, w, h);

    // Draw border
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);

    // Draw text centered
    ctx.fillStyle = "white";
    ctx.font = `bold ${this.config.fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.config.text, w / 2, h / 2);
  }

  onInitialize(engine: ex.Engine): void {
    this.setupInteractions(engine);
  }

  private setupInteractions(engine: ex.Engine): void {
    this.on("pointerenter", () => {
      this.isHovered = true;
      this.buttonCanvas.flagDirty();
      engine.canvas.style.cursor = "pointer";
    });

    this.on("pointerleave", () => {
      this.isHovered = false;
      this.buttonCanvas.flagDirty();
      engine.canvas.style.cursor = "default";
    });

    this.on("pointerdown", () => {
      this.buttonCanvas.flagDirty();
    });

    this.on("pointerup", () => {
      if (this.isHovered) {
        this.config.onClick();
      }
      this.buttonCanvas.flagDirty();
    });
  }

  public setHighlighted(highlighted: boolean): void {
    this.isHighlighted = highlighted;
    this.buttonCanvas.flagDirty();
  }

  public setText(text: string): void {
    this.config.text = text;
    this.buttonCanvas.flagDirty();
  }
}
