import { ImageSource, SpriteSheet, type Sprite } from "excalibur";
import { DECORATIONS_MAP } from "./decorations-config.ts";

type DecorationName = keyof typeof DECORATIONS_MAP;

type Season = "spring" | "summer" | "fall" | "winter";

interface DecorationItem {
  name: string;
  sprite: Sprite;
}

export class DecorationManager {
  private imageSource: ImageSource;
  private sprites: Record<string, Sprite>;

  constructor(imageSource: ImageSource) {
    this.imageSource = imageSource;
    this.sprites = {};
    this._createSprites();
  }

  private _createSprites(): void {
    for (const [name, config] of Object.entries(DECORATIONS_MAP)) {
      this.sprites[name] = SpriteSheet.fromImageSource({
        image: this.imageSource,
        grid: {
          rows: 1,
          columns: 1,
          spriteWidth: config.width * 32,
          spriteHeight: config.height * 32,
        },
        spacing: {
          originOffset: {
            x: config.col * 32,
            y: config.row * 32,
          },
        },
      }).getSprite(0, 0)!;
    }
  }

  get(name: DecorationName): Sprite | undefined {
    return this.sprites[name];
  }

  getSpringDecorations(): DecorationItem[] {
    return Object.keys(this.sprites)
      .filter((key) => key.startsWith("normal_"))
      .map((key) => ({ name: key, sprite: this.sprites[key] }));
  }

  getSummerDecorations(): DecorationItem[] {
    return this.getSpringDecorations();
  }

  getFallDecorations(): DecorationItem[] {
    return Object.keys(this.sprites)
      .filter((key) => key.startsWith("fall_"))
      .map((key) => ({ name: key, sprite: this.sprites[key] }));
  }

  getWinterDecorations(): DecorationItem[] {
    return Object.keys(this.sprites)
      .filter((key) => key.startsWith("winter_"))
      .map((key) => ({ name: key, sprite: this.sprites[key] }));
  }

  getSeasonDecorations(season: Season): DecorationItem[] {
    switch (season.toLowerCase()) {
      case "spring":
        return this.getSpringDecorations();
      case "summer":
        return this.getSummerDecorations();
      case "fall":
        return this.getFallDecorations();
      case "winter":
        return this.getWinterDecorations();
      default:
        return [];
    }
  }

  getGeneralDecorations(): DecorationItem[] {
    return Object.keys(this.sprites)
      .filter(
        (key) =>
          !key.startsWith("normal_") &&
          !key.startsWith("fall_") &&
          !key.startsWith("winter_")
      )
      .map((key) => ({ name: key, sprite: this.sprites[key] }));
  }

  getRandomSpring(): DecorationItem | undefined {
    const decorations = this.getSpringDecorations();
    if (decorations.length === 0) return undefined;
    return decorations[Math.floor(Math.random() * decorations.length)];
  }

  getRandomFall(): DecorationItem | undefined {
    const decorations = this.getFallDecorations();
    if (decorations.length === 0) return undefined;
    return decorations[Math.floor(Math.random() * decorations.length)];
  }

  getRandomWinter(): DecorationItem | undefined {
    const decorations = this.getWinterDecorations();
    if (decorations.length === 0) return undefined;
    return decorations[Math.floor(Math.random() * decorations.length)];
  }

  getRandomGeneral(): DecorationItem | undefined {
    const decorations = this.getGeneralDecorations();
    if (decorations.length === 0) return undefined;
    return decorations[Math.floor(Math.random() * decorations.length)];
  }

  getRandomBySeason(season: Season): DecorationItem | undefined {
    const decorations = this.getSeasonDecorations(season);
    if (decorations.length === 0) return undefined;
    return decorations[Math.floor(Math.random() * decorations.length)];
  }

  getSpringNames(): string[] {
    return Object.keys(this.sprites).filter((key) => key.startsWith("normal_"));
  }

  getFallNames(): string[] {
    return Object.keys(this.sprites).filter((key) => key.startsWith("fall_"));
  }

  getWinterNames(): string[] {
    return Object.keys(this.sprites).filter((key) => key.startsWith("winter_"));
  }

  getGeneralNames(): string[] {
    return Object.keys(this.sprites).filter(
      (key) =>
        !key.startsWith("normal_") &&
        !key.startsWith("fall_") &&
        !key.startsWith("winter_")
    );
  }
}
