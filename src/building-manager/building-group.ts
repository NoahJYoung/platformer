import * as ex from "excalibur";
import { CollisionGroups } from "../actors/config";
import type {
  BuildingTileConfig,
  BuildingTileDefinition,
  SpriteSheetsByMaterial,
} from "./building-tile-types";
import { TILE_SIZE } from "./building-manager";

/**
 * Represents a group of connected building tiles merged into a single actor
 */
export class BuildingGroup extends ex.Actor {
  public tiles: Map<string, BuildingTileConfig> = new Map();
  public gridPositions: Set<string> = new Set();
  private spriteSheets: SpriteSheetsByMaterial;
  public hasFoundation: boolean = false;
  public isIndoorView: boolean = false;
  public doorPositions: Set<string> = new Set();

  // Track roof collider actors
  private roofColliders: Map<string, ex.Actor> = new Map();

  constructor(spriteSheets: SpriteSheetsByMaterial) {
    super({
      name: `building_group_${Date.now()}`,
      pos: ex.vec(0, 0),
      anchor: ex.vec(0, 0),
      collisionType: ex.CollisionType.Fixed,
      collisionGroup: CollisionGroups.Building,
      z: 0,
    });

    this.spriteSheets = spriteSheets;
  }

  /**
   * Add a tile to this group
   */
  public addTile(
    gridX: number,
    gridY: number,
    tileConfig: BuildingTileConfig
  ): void {
    if (tileConfig.category === "foundation") {
      this.hasFoundation = true;
    }

    if (tileConfig.category === "door") {
      for (let dy = 0; dy < tileConfig.height; dy++) {
        for (let dx = 0; dx < tileConfig.width; dx++) {
          this.doorPositions.add(this.gridKey(gridX + dx, gridY + dy));
        }
      }
    }

    console.log(
      `Adding tile: ${tileConfig.name} at (${gridX}, ${gridY}) - Size: ${tileConfig.width}x${tileConfig.height}`
    );

    for (let dy = 0; dy < tileConfig.height; dy++) {
      for (let dx = 0; dx < tileConfig.width; dx++) {
        const tileKey = this.gridKey(gridX + dx, gridY + dy);
        console.log(`  Occupying grid cell: (${gridX + dx}, ${gridY + dy})`);
        this.tiles.set(tileKey, tileConfig);
        this.gridPositions.add(tileKey);
      }
    }

    // Add roof collider if this is a roof tile
    if (tileConfig.category === "roof") {
      this.addRoofCollider(gridX, gridY, tileConfig);
    }

    this.rebuildGraphic();
  }

  /**
   * Add a one-way platform collider for roof tiles
   */
  private addRoofCollider(
    gridX: number,
    gridY: number,
    tileConfig: BuildingTileConfig
  ): void {
    const key = this.gridKey(gridX, gridY);

    // Don't add duplicate colliders
    if (this.roofColliders.has(key)) return;

    // Calculate world position for this roof tile
    const worldX = gridX * TILE_SIZE + (tileConfig.width * TILE_SIZE) / 2;
    const worldY = gridY * TILE_SIZE; // Top edge of the tile

    const roofCollider = new ex.Actor({
      name: `roof_collider_${gridX}_${gridY}`,
      pos: ex.vec(worldX, worldY),
      width: tileConfig.width * TILE_SIZE,
      height: 4, // Thin platform
      anchor: ex.vec(0.5, 0), // Anchor at top
      collisionType: ex.CollisionType.Fixed,
      collisionGroup: CollisionGroups.Roof,
      z: 1, // Above the building graphic
    });

    // Make it invisible (or add debug graphic if needed)
    roofCollider.graphics.visible = false;

    // Optional: Add debug visualization
    // roofCollider.graphics.use(
    //   new ex.Rectangle({
    //     width: tileConfig.width * TILE_SIZE,
    //     height: 4,
    //     color: ex.Color.fromRGB(255, 0, 0, 0.5),
    //   })
    // );

    this.addChild(roofCollider);
    this.roofColliders.set(key, roofCollider);

    console.log(`  Added roof collider at (${gridX}, ${gridY})`);
  }

  /**
   * Remove a tile from this group
   */
  public removeTile(gridX: number, gridY: number): BuildingTileConfig | null {
    const key = this.gridKey(gridX, gridY);
    const tileConfig = this.tiles.get(key);

    if (!tileConfig) return null;

    // Remove roof collider if it's a roof tile
    if (tileConfig.category === "roof") {
      this.removeRoofCollider(gridX, gridY);
    }

    for (let dy = 0; dy < tileConfig.height; dy++) {
      for (let dx = 0; dx < tileConfig.width; dx++) {
        const removeKey = this.gridKey(gridX + dx, gridY + dy);
        this.tiles.delete(removeKey);
        this.gridPositions.delete(removeKey);
        this.doorPositions.delete(removeKey);
      }
    }

    if (tileConfig.category === "foundation") {
      this.hasFoundation = this.checkHasFoundation();
    }

    if (this.tiles.size > 0) {
      this.rebuildGraphic();
    }

    return tileConfig;
  }

  /**
   * Remove a roof collider
   */
  private removeRoofCollider(gridX: number, gridY: number): void {
    const key = this.gridKey(gridX, gridY);
    const collider = this.roofColliders.get(key);

    if (collider) {
      this.removeChild(collider);
      this.roofColliders.delete(key);
      console.log(`  Removed roof collider at (${gridX}, ${gridY})`);
    }
  }

  /**
   * Toggle between indoor and outdoor view
   */
  public toggleIndoorView(): void {
    this.isIndoorView = !this.isIndoorView;
    this.rebuildGraphic();
    console.log(
      `🏠 Toggled to ${this.isIndoorView ? "INDOOR" : "OUTDOOR"} view`
    );
  }

  /**
   * Set to indoor view
   */
  public setIndoorView(isIndoor: boolean): void {
    if (this.isIndoorView !== isIndoor) {
      this.isIndoorView = isIndoor;
      this.rebuildGraphic();
      console.log(`🏠 Set to ${this.isIndoorView ? "INDOOR" : "OUTDOOR"} view`);
    }
  }

  /**
   * Check if a grid position is a door
   */
  public isDoorPosition(gridX: number, gridY: number): boolean {
    return this.doorPositions.has(this.gridKey(gridX, gridY));
  }

  /**
   * Merge another building group into this one
   */
  public merge(otherGroup: BuildingGroup): void {
    console.log(
      `🔗 Merging group with ${otherGroup.tiles.size} tiles into this group`
    );

    for (const [key, tileConfig] of otherGroup.tiles.entries()) {
      this.tiles.set(key, tileConfig);
      this.gridPositions.add(key);
    }

    for (const doorPos of otherGroup.doorPositions) {
      this.doorPositions.add(doorPos);
    }

    if (otherGroup.hasFoundation) {
      this.hasFoundation = true;
    }

    if (otherGroup.isIndoorView) {
      this.isIndoorView = true;
    }

    // Transfer roof colliders from other group
    for (const [key, collider] of otherGroup.roofColliders) {
      // Remove from other group
      otherGroup.removeChild(collider);

      // Add to this group
      this.addChild(collider);
      this.roofColliders.set(key, collider);
    }
    otherGroup.roofColliders.clear();

    this.rebuildGraphic();
  }

  /**
   * Get all grid positions occupied by this group
   */
  public getAllGridPositions(): string[] {
    return Array.from(this.gridPositions);
  }

  /**
   * Check if this group still has a foundation
   */
  private checkHasFoundation(): boolean {
    for (const tileDef of this.tiles.values()) {
      if (tileDef.category === "foundation") {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a grid position (with optional width/height) would be adjacent to this group
   * For multi-tile pieces, checks if ANY part would be adjacent
   */
  public isAdjacentTo(
    gridX: number,
    gridY: number,
    width: number = 1,
    height: number = 1
  ): boolean {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const tileX = gridX + dx;
        const tileY = gridY + dy;

        const adjacentPositions = [
          this.gridKey(tileX - 1, tileY),
          this.gridKey(tileX + 1, tileY),
          this.gridKey(tileX, tileY - 1),
          this.gridKey(tileX, tileY + 1),
        ];

        if (adjacentPositions.some((pos) => this.gridPositions.has(pos))) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if this group contains a specific grid position
   */
  public hasPosition(gridX: number, gridY: number): boolean {
    return this.gridPositions.has(this.gridKey(gridX, gridY));
  }

  /**
   * Get the tile definition at a specific grid position
   */
  public getTileAt(gridX: number, gridY: number): BuildingTileConfig | null {
    return this.tiles.get(this.gridKey(gridX, gridY)) || null;
  }

  /**
   * Rebuild the merged graphic from all tiles
   */
  private rebuildGraphic(): void {
    if (this.tiles.size === 0) return;

    const gridCoords = Array.from(this.gridPositions).map((key) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y };
    });

    const minX = Math.min(...gridCoords.map((c) => c.x));
    const maxX = Math.max(...gridCoords.map((c) => c.x));
    const minY = Math.min(...gridCoords.map((c) => c.y));
    const maxY = Math.max(...gridCoords.map((c) => c.y));

    const width = (maxX - minX + 1) * TILE_SIZE;
    const height = (maxY - minY + 1) * TILE_SIZE;

    this.pos = ex.vec(minX * TILE_SIZE, minY * TILE_SIZE);

    // Update roof collider positions relative to new group position
    this.updateRoofColliderPositions(minX, minY);

    const canvas = new ex.Canvas({
      width: width,
      height: height,
      draw: (ctx) => {
        const tilesToDraw: Array<{
          gridX: number;
          gridY: number;
          config: BuildingTileConfig;
        }> = [];

        const drawn = new Set<string>();
        for (const [key, tileConfig] of this.tiles.entries()) {
          if (!drawn.has(key)) {
            const [gridX, gridY] = key.split(",").map(Number);
            tilesToDraw.push({ gridX, gridY, config: tileConfig });

            for (let dy = 0; dy < tileConfig.height; dy++) {
              for (let dx = 0; dx < tileConfig.width; dx++) {
                drawn.add(this.gridKey(gridX + dx, gridY + dy));
              }
            }
          }
        }

        tilesToDraw.sort((a, b) => {
          const aDef = this.getSpriteDefinition(a.config);
          const bDef = this.getSpriteDefinition(b.config);
          const aLayer = aDef.layer === "background" ? 0 : 1;
          const bLayer = bDef.layer === "background" ? 0 : 1;
          return aLayer - bLayer;
        });

        for (const { gridX, gridY, config } of tilesToDraw) {
          const localX = (gridX - minX) * TILE_SIZE;
          const localY = (gridY - minY) * TILE_SIZE;

          const spriteDef = this.getSpriteDefinition(config);

          for (let dy = 0; dy < config.height; dy++) {
            for (let dx = 0; dx < config.width; dx++) {
              const sprite = this.spriteSheets[
                config.material || "wood"
              ].getSprite(spriteDef.spriteX + dx, spriteDef.spriteY + dy);
              if (sprite) {
                ctx.drawImage(
                  sprite.image.image as HTMLImageElement,
                  sprite.sourceView.x,
                  sprite.sourceView.y,
                  sprite.sourceView.width,
                  sprite.sourceView.height,
                  localX + dx * TILE_SIZE,
                  localY + dy * TILE_SIZE,
                  TILE_SIZE,
                  TILE_SIZE
                );
              }
            }
          }
        }
      },
    });

    this.graphics.use(canvas);

    this.updateCollisionBounds();
  }

  /**
   * Update roof collider positions when group position changes
   */
  private updateRoofColliderPositions(minX: number, minY: number): void {
    for (const [key, collider] of this.roofColliders) {
      const [gridX, gridY] = key.split(",").map(Number);
      const tileConfig = this.tiles.get(key);

      if (tileConfig) {
        // Calculate position relative to group origin
        const localX =
          (gridX - minX) * TILE_SIZE + (tileConfig.width * TILE_SIZE) / 2;
        const localY = (gridY - minY) * TILE_SIZE;

        collider.pos = ex.vec(localX, localY);
      }
    }
  }

  /**
   * Get the appropriate sprite definition based on indoor/outdoor view
   */
  private getSpriteDefinition(
    config: BuildingTileConfig
  ): BuildingTileDefinition {
    if (this.isIndoorView && config.indoorSprite) {
      return config.indoorSprite;
    }
    return config.outdoorSprite;
  }

  /**
   * Update collision bounds based on solid tiles
   */
  private updateCollisionBounds(): void {
    const hasSolidTiles = Array.from(this.tiles.values()).some((t) => t.solid);

    if (!hasSolidTiles) {
      this.body.collisionType = ex.CollisionType.PreventCollision;
    } else {
      this.body.collisionType = ex.CollisionType.Fixed;
    }
  }

  /**
   * Generate grid key
   */
  private gridKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  /**
   * Get the number of tiles in this group
   */
  public get tileCount(): number {
    const uniqueTiles = new Set<BuildingTileConfig>();
    for (const tileConfig of this.tiles.values()) {
      uniqueTiles.add(tileConfig);
    }
    return uniqueTiles.size;
  }

  /**
   * Check if this group is valid (has foundation and tiles)
   */
  public isValid(): boolean {
    return this.hasFoundation && this.tiles.size > 0;
  }
}
