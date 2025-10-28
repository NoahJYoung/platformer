import * as ex from "excalibur";

interface GroundThemeConfig {
  row: number;
  startCol: number;
  middleCol: number;
  endCol: number;
}

export class GroundTileManager {
  private spriteSheet: ex.SpriteSheet;
  private imageSource: ex.ImageSource;
  private tileWidth: number = 32;
  private tileHeight: number = 64;

  private themes: Record<string, GroundThemeConfig> = {
    normal: {
      row: 0,
      startCol: 0,
      middleCol: 1,
      endCol: 2,
    },
    fall: {
      row: 1,
      startCol: 0,
      middleCol: 1,
      endCol: 2,
    },
    winter: {
      row: 2,
      startCol: 0,
      middleCol: 1,
      endCol: 2,
    },
  };

  constructor(spriteSheetImage: ex.ImageSource) {
    this.imageSource = spriteSheetImage;
    this.spriteSheet = ex.SpriteSheet.fromImageSource({
      image: spriteSheetImage,
      grid: {
        rows: 18,
        columns: 9,
        spriteWidth: this.tileWidth,
        spriteHeight: this.tileHeight,
      },
    });
  }

  public setTheme(
    themeName: string,
    row: number,
    startCol: number,
    middleCol: number,
    endCol: number
  ): void {
    this.themes[themeName] = { row, startCol, middleCol, endCol };
  }

  public createGroundTiles(
    width: number,
    height: number,
    theme: "normal" | "fall" | "winter"
  ): ex.GraphicsGroup {
    const themeConfig = this.themes[theme];
    if (!themeConfig) {
      return this.createGroundTiles(width, height, "normal");
    }

    const tilesWide = Math.ceil(width / this.tileWidth);
    const tilesHigh = Math.ceil(height / this.tileHeight);

    const members: ex.GraphicsGrouping[] = [];

    for (let row = 0; row < tilesHigh; row++) {
      for (let col = 0; col < tilesWide; col++) {
        let tileCol: number;

        if (col === 0) {
          tileCol = themeConfig.startCol;
        } else if (col === tilesWide - 1) {
          tileCol = themeConfig.endCol;
        } else {
          tileCol = themeConfig.middleCol;
        }

        const sprite = this.spriteSheet.getSprite(tileCol, themeConfig.row);

        members.push({
          graphic: sprite.clone(),
          offset: ex.vec(
            col * this.tileWidth - width / 2 + this.tileWidth / 2,
            row * this.tileHeight - height / 2 + this.tileHeight / 2
          ),
        });
      }
    }

    return new ex.GraphicsGroup({
      members: members,
    });
  }

  public createPlatformTiles(
    width: number,
    theme: "normal" | "fall" | "winter"
  ): ex.GraphicsGroup {
    return this.createGroundTiles(width, this.tileHeight, theme);
  }

  public createGroundCanvasElement(
    width: number,
    height: number,
    theme: "normal" | "fall" | "winter"
  ): HTMLCanvasElement {
    const themeConfig = this.themes[theme];
    if (!themeConfig) {
      return this.createGroundCanvasElement(width, height, "normal");
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = width;
    canvas.height = height;

    const tilesWide = Math.ceil(width / this.tileWidth);
    const tilesHigh = Math.ceil(height / this.tileHeight);

    const image = this.imageSource.image;

    for (let row = 0; row < tilesHigh; row++) {
      for (let col = 0; col < tilesWide; col++) {
        let tileCol: number;
        if (col === 0) {
          tileCol = themeConfig.startCol;
        } else if (col === tilesWide - 1) {
          tileCol = themeConfig.endCol;
        } else {
          tileCol = themeConfig.middleCol;
        }

        const sourceX = tileCol * this.tileWidth;
        const sourceY = themeConfig.row * this.tileHeight;

        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          this.tileWidth,
          this.tileHeight,
          col * this.tileWidth,
          row * this.tileHeight,
          this.tileWidth,
          this.tileHeight
        );
      }
    }

    return canvas;
  }
}
