import * as ex from "excalibur";
import { CollisionGroups } from "../actors/config";
import type {
  BuildingTileDefinition,
  PlacedBuildingTile,
} from "./building-tile-types";
import { TILE_SIZE } from "./building-manager";

export class BuildingTile extends ex.Actor {
  public definition: BuildingTileDefinition;
  public gridX: number;
  public gridY: number;
  private spriteSheet: ex.SpriteSheet;

  constructor(
    definition: BuildingTileDefinition,
    gridX: number,
    gridY: number,
    worldX: number,
    worldY: number,
    spriteSheet: ex.SpriteSheet
  ) {
    super({
      name: `building_tile_${definition.id}_${gridX}_${gridY}`,
      pos: ex.vec(worldX, worldY),
      width: definition.width * TILE_SIZE,
      height: definition.height * TILE_SIZE,
      anchor: ex.vec(0.5, 0.5),
      collisionType: definition.solid
        ? ex.CollisionType.Fixed
        : ex.CollisionType.PreventCollision,
      collisionGroup: definition.solid
        ? CollisionGroups.Environment
        : CollisionGroups.Trigger,
      z: definition.layer === "background" ? -5 : -5,
    });

    this.definition = definition;
    this.gridX = gridX;
    this.gridY = gridY;
    this.spriteSheet = spriteSheet;
  }

  onInitialize(engine: ex.Engine): void {
    this.setupGraphics();
  }

  private setupGraphics(): void {
    const { spriteX, spriteY, width, height } = this.definition;

    // For multi-tile pieces, we need to create a composite graphic
    if (width === 1 && height === 1) {
      // Simple single tile
      const sprite = this.spriteSheet.getSprite(spriteX, spriteY);
      if (sprite) {
        this.graphics.use(sprite);
      }
    } else {
      // Multi-tile piece (like doors)
      // Create a canvas to combine multiple sprites
      const canvas = new ex.Canvas({
        width: width * 32,
        height: height * 32,
        draw: (ctx) => {
          for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
              const sprite = this.spriteSheet.getSprite(
                spriteX + dx,
                spriteY + dy
              );
              if (sprite) {
                ctx.drawImage(
                  sprite.image.image as HTMLImageElement,
                  sprite.sourceView.x,
                  sprite.sourceView.y,
                  sprite.sourceView.width,
                  sprite.sourceView.height,
                  dx * 32 - (width * 32) / 2,
                  dy * 32 - (height * 32) / 2,
                  32,
                  32
                );
              }
            }
          }
        },
      });
      this.graphics.use(canvas);
    }
  }

  public toPlacedTile(): PlacedBuildingTile {
    return {
      definition: this.definition,
      gridX: this.gridX,
      gridY: this.gridY,
      worldX: this.pos.x,
      worldY: this.pos.y,
    };
  }

  public setOpacity(opacity: number): void {
    const currentGraphic = this.graphics.current;
    if (currentGraphic) {
      currentGraphic.opacity = opacity;
    }
  }

  public makeInterior(): void {
    // When showing interior, walls become transparent or hidden
    if (
      this.definition.category === "wall" ||
      this.definition.category === "roof"
    ) {
      this.setOpacity(0.3);
    }
  }

  public makeExterior(): void {
    // Restore full opacity for exterior view
    this.setOpacity(1.0);
  }
}
