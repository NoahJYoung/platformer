import * as ex from "excalibur";

interface GroundThemeConfig {
  row: number;
  startCol: number;
  middleCol: number;
  endCol: number;

  topRow: number;
  fillRow: number;
  bottomRow?: number;
}

export class GroundTileManager {
  private spriteSheet: ex.SpriteSheet;
  private imageSource: ex.ImageSource;
  private tileWidth: number = 32;
  private tileHeight: number = 32;
  private tileOverlap: number = 5;

  private themes: Record<string, GroundThemeConfig> = {
    normal: {
      row: 0,
      startCol: 0,
      middleCol: 1,
      endCol: 2,
      topRow: 0,
      fillRow: 1,
    },
    fall: {
      row: 1,
      startCol: 0,
      middleCol: 1,
      endCol: 2,
      topRow: 6,
      fillRow: 7,
    },
    winter: {
      row: 2,
      startCol: 0,
      middleCol: 1,
      endCol: 2,
      topRow: 12,
      fillRow: 13,
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
    this.themes[themeName] = {
      row,
      startCol,
      middleCol,
      endCol,
      topRow: row,
      fillRow: row,
    };
  }

  /**
   * Extended theme setting with vertical tiling support
   */
  public setThemeWithVertical(
    themeName: string,
    row: number,
    startCol: number,
    middleCol: number,
    endCol: number,
    topRow: number,
    fillRow: number,
    bottomRow?: number
  ): void {
    this.themes[themeName] = {
      row,
      startCol,
      middleCol,
      endCol,
      topRow,
      fillRow,
      bottomRow,
    };
  }

  public createGroundTiles(
    width: number,
    height: number,
    theme: "normal" | "fall" | "winter",
    extendEdges: boolean = true
  ): ex.GraphicsGroup {
    const themeConfig = this.themes[theme];
    if (!themeConfig) {
      return this.createGroundTiles(width, height, "normal", extendEdges);
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

        let tileRow: number;
        if (row === 0) {
          tileRow = themeConfig.topRow;
        } else if (
          row === tilesHigh - 1 &&
          themeConfig.bottomRow !== undefined
        ) {
          tileRow = themeConfig.bottomRow;
        } else {
          tileRow = themeConfig.fillRow;
        }

        const sprite = this.spriteSheet.getSprite(tileCol, tileRow);

        members.push({
          graphic: sprite.clone(),
          offset: ex.vec(
            col * this.tileWidth -
              width / 2 +
              this.tileWidth / 2 -
              (col > 0 ? this.tileOverlap : 0),
            row * this.tileHeight -
              height / 2 +
              this.tileHeight / 2 -
              (row > 0 ? this.tileOverlap : 0)
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
    theme: "normal" | "fall" | "winter",
    extendEdges: boolean = true
  ): ex.GraphicsGroup {
    return this.createGroundTiles(width, this.tileHeight, theme, extendEdges);
  }

  /**
   * Create ground tiles as a canvas element with vertical tiling support
   */
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

        let tileRow: number;
        if (row === 0) {
          tileRow = themeConfig.topRow;
        } else if (
          row === tilesHigh - 1 &&
          themeConfig.bottomRow !== undefined
        ) {
          tileRow = themeConfig.bottomRow;
        } else {
          tileRow = themeConfig.fillRow;
        }

        const sourceX = tileCol * this.tileWidth;
        const sourceY = tileRow * this.tileHeight;

        const destX = col * this.tileWidth - (col > 0 ? this.tileOverlap : 0);
        const destY = row * this.tileHeight - (row > 0 ? this.tileOverlap : 0);
        const drawWidth = this.tileWidth + (col > 0 ? this.tileOverlap : 0);
        const drawHeight = this.tileHeight + (row > 0 ? this.tileOverlap : 0);

        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          this.tileWidth,
          this.tileHeight,
          destX,
          destY,
          drawWidth,
          drawHeight
        );
      }
    }

    return canvas;
  }
}
