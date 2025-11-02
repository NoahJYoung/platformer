import * as ex from "excalibur";
import { CollisionGroups } from "../actors/config";
import type {
  BuildingTileConfig,
  BuildingTileDefinition,
} from "./building-tile-types";
import { TILE_SIZE } from "./building-manager";

/**
 * Represents a group of connected building tiles merged into a single actor
 */
export class BuildingGroup extends ex.Actor {
  public tiles: Map<string, BuildingTileConfig> = new Map(); // key: "gridX,gridY"
  public gridPositions: Set<string> = new Set();
  private spriteSheet: ex.SpriteSheet;
  public hasFoundation: boolean = false;
  public isIndoorView: boolean = false; // Track if we're showing indoor view
  public doorPositions: Set<string> = new Set(); // Track door locations for exit detection

  constructor(spriteSheet: ex.SpriteSheet) {
    super({
      name: `building_group_${Date.now()}`,
      pos: ex.vec(0, 0),
      anchor: ex.vec(0, 0),
      collisionType: ex.CollisionType.Fixed,
      collisionGroup: CollisionGroups.Building,
      z: 0, // Default to floor level
    });

    this.spriteSheet = spriteSheet;
  }

  /**
   * Add a tile to this group
   */
  public addTile(
    gridX: number,
    gridY: number,
    tileConfig: BuildingTileConfig
  ): void {
    // Track if this group has a foundation
    if (tileConfig.category === "foundation") {
      this.hasFoundation = true;
    }

    // Track door positions
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

    // Store tile data
    for (let dy = 0; dy < tileConfig.height; dy++) {
      for (let dx = 0; dx < tileConfig.width; dx++) {
        const tileKey = this.gridKey(gridX + dx, gridY + dy);
        console.log(`  Occupying grid cell: (${gridX + dx}, ${gridY + dy})`);
        this.tiles.set(tileKey, tileConfig);
        this.gridPositions.add(tileKey);
      }
    }

    // Rebuild the merged graphic
    this.rebuildGraphic();
  }

  /**
   * Remove a tile from this group
   */
  public removeTile(gridX: number, gridY: number): BuildingTileConfig | null {
    const key = this.gridKey(gridX, gridY);
    const tileConfig = this.tiles.get(key);

    if (!tileConfig) return null;

    // Remove all spaces occupied by this tile
    for (let dy = 0; dy < tileConfig.height; dy++) {
      for (let dx = 0; dx < tileConfig.width; dx++) {
        const removeKey = this.gridKey(gridX + dx, gridY + dy);
        this.tiles.delete(removeKey);
        this.gridPositions.delete(removeKey);
        this.doorPositions.delete(removeKey); // Remove from door positions too
      }
    }

    // Check if we removed a foundation
    if (tileConfig.category === "foundation") {
      this.hasFoundation = this.checkHasFoundation();
    }

    // Rebuild graphic
    if (this.tiles.size > 0) {
      this.rebuildGraphic();
    }

    return tileConfig;
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

    // Copy all tiles from other group
    for (const [key, tileConfig] of otherGroup.tiles.entries()) {
      this.tiles.set(key, tileConfig);
      this.gridPositions.add(key);
    }

    // Copy door positions
    for (const doorPos of otherGroup.doorPositions) {
      this.doorPositions.add(doorPos);
    }

    // Merge foundation status
    if (otherGroup.hasFoundation) {
      this.hasFoundation = true;
    }

    // Preserve indoor/outdoor state (if other group was larger, use its state)
    if (otherGroup.isIndoorView) {
      this.isIndoorView = true;
    }

    // Rebuild graphic with all merged tiles
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
    // Check all positions the new tile would occupy
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const tileX = gridX + dx;
        const tileY = gridY + dy;

        // Check all 4 cardinal directions from this position
        const adjacentPositions = [
          this.gridKey(tileX - 1, tileY), // left
          this.gridKey(tileX + 1, tileY), // right
          this.gridKey(tileX, tileY - 1), // up
          this.gridKey(tileX, tileY + 1), // down
        ];

        // If any of these positions exist in the group, we're adjacent
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

    // Calculate bounds
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

    // Update actor position
    this.pos = ex.vec(minX * TILE_SIZE, minY * TILE_SIZE);

    // Create a canvas with all tiles drawn
    const canvas = new ex.Canvas({
      width: width,
      height: height,
      draw: (ctx) => {
        // Group tiles by category for layering
        const tilesToDraw: Array<{
          gridX: number;
          gridY: number;
          config: BuildingTileConfig;
        }> = [];

        // Collect unique tiles (not duplicates from multi-tile pieces)
        const drawn = new Set<string>();
        for (const [key, tileConfig] of this.tiles.entries()) {
          if (!drawn.has(key)) {
            const [gridX, gridY] = key.split(",").map(Number);
            tilesToDraw.push({ gridX, gridY, config: tileConfig });

            // Mark all spaces this tile occupies as drawn
            for (let dy = 0; dy < tileConfig.height; dy++) {
              for (let dx = 0; dx < tileConfig.width; dx++) {
                drawn.add(this.gridKey(gridX + dx, gridY + dy));
              }
            }
          }
        }

        // Sort by layer (background first, then foreground)
        tilesToDraw.sort((a, b) => {
          const aDef = this.getSpriteDefinition(a.config);
          const bDef = this.getSpriteDefinition(b.config);
          const aLayer = aDef.layer === "background" ? 0 : 1;
          const bLayer = bDef.layer === "background" ? 0 : 1;
          return aLayer - bLayer;
        });

        // Draw each tile
        for (const { gridX, gridY, config } of tilesToDraw) {
          const localX = (gridX - minX) * TILE_SIZE;
          const localY = (gridY - minY) * TILE_SIZE;

          // Get the appropriate sprite definition based on indoor/outdoor view
          const spriteDef = this.getSpriteDefinition(config);

          // Draw multi-tile pieces
          for (let dy = 0; dy < config.height; dy++) {
            for (let dx = 0; dx < config.width; dx++) {
              const sprite = this.spriteSheet.getSprite(
                spriteDef.spriteX + dx,
                spriteDef.spriteY + dy
              );
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

    // Update collision bounds
    this.updateCollisionBounds();
  }

  /**
   * Get the appropriate sprite definition based on indoor/outdoor view
   */
  private getSpriteDefinition(
    config: BuildingTileConfig
  ): BuildingTileDefinition {
    // If we're in indoor view and the tile has an indoor sprite, use it
    if (this.isIndoorView && config.indoorSprite) {
      return config.indoorSprite;
    }
    // Otherwise use the outdoor sprite
    return config.outdoorSprite;
  }

  /**
   * Update collision bounds based on solid tiles
   */
  private updateCollisionBounds(): void {
    // For now, use the full bounds
    // TODO: Could create composite colliders for only solid tiles
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
    // Count unique tiles (not grid positions, which may be occupied by multi-tile pieces)
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
