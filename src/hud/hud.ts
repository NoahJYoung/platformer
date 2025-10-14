import * as ex from "excalibur";
import type { GameEngine } from "../game-engine";

export class HUD extends ex.ScreenElement {
  private engine: GameEngine;

  private readonly barWidth = 200;
  private readonly barHeight = 12;
  private readonly barSpacing = 16;
  private readonly borderRadius = 6;

  // Temperature thermometer dimensions
  private readonly thermometerWidth = 100;
  private readonly thermometerHeight = 8;

  private healthBarCanvas: ex.Canvas | null = null;
  private energyBarCanvas: ex.Canvas | null = null;
  private manaBarCanvas: ex.Canvas | null = null;
  private temperatureCanvas: ex.Canvas | null = null;

  private healthText: ex.Text | null = null;
  private energyText: ex.Text | null = null;
  private manaText: ex.Text | null = null;
  private temperatureText: ex.Text | null = null;

  private hudGroup: ex.GraphicsGroup | null = null;

  constructor(engine: GameEngine) {
    super({
      pos: ex.vec(20, 20),
      z: 1000,
    });
    this.engine = engine;
  }

  onInitialize() {
    this.healthBarCanvas = new ex.Canvas({
      width: this.barWidth + 10,
      height: this.barHeight + 10,
      draw: (ctx) => this.drawHealthBar(ctx),
    });

    this.energyBarCanvas = new ex.Canvas({
      width: this.barWidth + 10,
      height: this.barHeight + 10,
      draw: (ctx) => this.drawEnergyBar(ctx),
    });

    this.manaBarCanvas = new ex.Canvas({
      width: this.barWidth + 10,
      height: this.barHeight + 10,
      draw: (ctx) => this.drawManaBar(ctx),
    });

    this.temperatureCanvas = new ex.Canvas({
      width: this.thermometerWidth + 10,
      height: this.thermometerHeight + 10,
      draw: (ctx) => this.drawTemperature(ctx),
    });

    this.healthText = new ex.Text({
      text: "Health: 100/100",
      font: new ex.Font({
        family: "Arial",
        size: 12,
        color: ex.Color.fromHex("#530303ff"), // Dark red
      }),
    });

    this.energyText = new ex.Text({
      text: "Energy: 100/100",
      font: new ex.Font({
        family: "Arial",
        size: 12,
        color: ex.Color.fromHex("#775604ff"), // Dark yellow/gold
      }),
    });

    this.manaText = new ex.Text({
      text: "Mana: 100/100",
      font: new ex.Font({
        family: "Arial",
        size: 12,
        color: ex.Color.fromHex("#a5a5f5ff"), // Dark blue
      }),
    });

    this.temperatureText = new ex.Text({
      text: "20°C",
      font: new ex.Font({
        family: "Arial",
        size: 10,
        color: ex.Color.White,
      }),
    });

    this.hudGroup = new ex.GraphicsGroup({
      members: [
        {
          graphic: this.healthBarCanvas,
          offset: ex.vec(0, 0),
        },
        {
          graphic: this.healthText,
          offset: ex.vec(5, this.barHeight / 2 - 7),
        },
        {
          graphic: this.energyBarCanvas,
          offset: ex.vec(0, this.barSpacing),
        },
        {
          graphic: this.energyText,
          offset: ex.vec(5, this.barSpacing + this.barHeight / 2 - 7),
        },
        {
          graphic: this.manaBarCanvas,
          offset: ex.vec(0, this.barSpacing * 2),
        },
        {
          graphic: this.manaText,
          offset: ex.vec(5, this.barSpacing * 2 + this.barHeight / 2 - 7),
        },
        {
          graphic: this.temperatureCanvas,
          offset: ex.vec(0, this.barSpacing * 3 + 1),
        },
        {
          graphic: this.temperatureText,
          offset: ex.vec(
            5,
            this.barSpacing * 3 + this.thermometerHeight / 2 - 4
          ),
        },
      ],
    });

    this.graphics.use(this.hudGroup);
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  private getTemperatureColor(temp: number): string {
    const normalized = Math.max(0, Math.min(1, (temp + 20) / 60));

    if (normalized < 0.33) {
      const intensity = normalized / 0.33;
      const r = Math.round(100 * intensity);
      const g = Math.round(150 * intensity);
      const b = 255;
      return `rgb(${r}, ${g}, ${b})`;
    } else if (normalized < 0.5) {
      const intensity = (normalized - 0.33) / 0.17;
      const r = Math.round(100 + 155 * intensity);
      const g = Math.round(150 + 105 * intensity);
      const b = 255;
      return `rgb(${r}, ${g}, ${b})`;
    } else if (normalized < 0.67) {
      const intensity = (normalized - 0.5) / 0.17;
      const r = 255;
      const g = 255;
      const b = Math.round(255 - 100 * intensity);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const intensity = (normalized - 0.67) / 0.33;
      const r = 255;
      const g = Math.round(255 - 255 * intensity);
      const b = Math.round(155 - 155 * intensity);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  private drawTemperature(ctx: CanvasRenderingContext2D) {
    const player = this.engine.player;
    if (!player || !player.getTemperature) return;

    const temp = player.getTemperature();

    const minTemp = -20;
    const maxTemp = 40;
    const percentage = Math.max(
      0,
      Math.min(1, (temp - minTemp) / (maxTemp - minTemp))
    );
    const fillWidth = this.thermometerWidth * percentage;

    this.drawRoundedRect(
      ctx,
      0,
      0,
      this.thermometerWidth,
      this.thermometerHeight,
      4
    );
    ctx.fillStyle = "#222";
    ctx.fill();

    if (fillWidth > 0) {
      ctx.save();
      this.drawRoundedRect(
        ctx,
        0,
        0,
        this.thermometerWidth,
        this.thermometerHeight,
        4
      );
      ctx.clip();

      ctx.fillStyle = this.getTemperatureColor(temp);
      ctx.fillRect(0, 0, fillWidth, this.thermometerHeight);

      ctx.restore();
    }

    this.drawRoundedRect(
      ctx,
      0,
      0,
      this.thermometerWidth,
      this.thermometerHeight,
      4
    );
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawHealthBar(ctx: CanvasRenderingContext2D) {
    const player = this.engine.player;
    if (!player) return;

    const percentage = Math.max(
      0,
      Math.min(1, player.health / player.maxHealth)
    );
    const fillWidth = this.barWidth * percentage;

    // Background
    this.drawRoundedRect(
      ctx,
      0,
      0,
      this.barWidth,
      this.barHeight,
      this.borderRadius
    );
    ctx.fillStyle = "#222";
    ctx.fill();

    // Fill
    if (fillWidth > 0) {
      ctx.save();
      this.drawRoundedRect(
        ctx,
        0,
        0,
        this.barWidth,
        this.barHeight,
        this.borderRadius
      );
      ctx.clip();

      ctx.fillStyle = ex.Color.Red.toString();
      ctx.fillRect(0, 0, fillWidth, this.barHeight);

      ctx.restore();
    }
  }

  private drawEnergyBar(ctx: CanvasRenderingContext2D) {
    const player = this.engine.player;
    if (
      !player ||
      player.energy === undefined ||
      player.maxEnergy === undefined
    )
      return;

    const percentage = Math.max(
      0,
      Math.min(1, player.energy / player.maxEnergy)
    );
    const fillWidth = this.barWidth * percentage;

    // Background
    this.drawRoundedRect(
      ctx,
      0,
      0,
      this.barWidth,
      this.barHeight,
      this.borderRadius
    );
    ctx.fillStyle = "#222";
    ctx.fill();

    // Fill
    if (fillWidth > 0) {
      ctx.save();
      this.drawRoundedRect(
        ctx,
        0,
        0,
        this.barWidth,
        this.barHeight,
        this.borderRadius
      );
      ctx.clip();

      ctx.fillStyle = ex.Color.Yellow.toString();
      ctx.fillRect(0, 0, fillWidth, this.barHeight);

      ctx.restore();
    }
  }

  private drawManaBar(ctx: CanvasRenderingContext2D) {
    const player = this.engine.player;
    if (!player || player.mana === undefined || player.maxMana === undefined)
      return;

    const percentage = Math.max(0, Math.min(1, player.mana / player.maxMana));
    const fillWidth = this.barWidth * percentage;

    this.drawRoundedRect(
      ctx,
      0,
      0,
      this.barWidth,
      this.barHeight,
      this.borderRadius
    );
    ctx.fillStyle = "#222";
    ctx.fill();

    if (fillWidth > 0) {
      ctx.save();
      this.drawRoundedRect(
        ctx,
        0,
        0,
        this.barWidth,
        this.barHeight,
        this.borderRadius
      );
      ctx.clip();

      ctx.fillStyle = ex.Color.Blue.toString();
      ctx.fillRect(0, 0, fillWidth, this.barHeight);

      ctx.restore();
    }
  }

  onPreUpdate() {
    const player = this.engine.player;
    if (
      !player ||
      !this.healthText ||
      !this.energyText ||
      !this.manaText ||
      !this.temperatureText ||
      !this.healthBarCanvas ||
      !this.energyBarCanvas ||
      !this.manaBarCanvas ||
      !this.temperatureCanvas
    )
      return;

    this.healthText.text = `${Math.round(player.health)}/${player.maxHealth}`;

    if (player.energy !== undefined && player.maxEnergy !== undefined) {
      this.energyText.text = `${Math.round(player.energy)}/${player.maxEnergy}`;
    }

    if (player.mana !== undefined && player.maxMana !== undefined) {
      this.manaText.text = `${Math.round(player.mana)}/${player.maxMana}`;
    }

    if (player.getTemperature) {
      const temp = player.getTemperature();
      this.temperatureText.text = `${Math.round(temp)}°C`;
    }

    this.healthBarCanvas.flagDirty();
    this.energyBarCanvas.flagDirty();
    this.manaBarCanvas.flagDirty();
    this.temperatureCanvas.flagDirty();
  }
}
