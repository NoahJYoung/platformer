import * as ex from "excalibur";
import type { GameMapScene } from "../scenes/game-scene";
import type { Player } from "../actors/player/player";
import { BuildingTile } from "./building-tile-actor";
import { BuildingGroup } from "./building-group";
import type {
  BuildingTileConfig,
  BuildingTileDefinition,
  PlacedBuildingTile,
} from "./building-tile-types";
import { BUILDING_TILES } from "./building-tile-catalog";
import type { MovementBoundaries } from "../actors/character/types";

export const TILE_SIZE = 16;

export class BuildingManager {
  private scene: GameMapScene;
  private player: Player;
  private spriteSheet: ex.SpriteSheet;

  private buildingGroups: BuildingGroup[] = [];
  private gridOccupancy: Map<string, BuildingGroup> = new Map();

  public isBuildMode: boolean = false;
  private selectedTileId: string | null = null;
  private ghostTile: ex.Actor | null = null;

  private gridOverlay: ex.Actor | null = null;

  private debugMode: boolean = false;

  constructor(
    scene: GameMapScene,
    player: Player,
    houseTilesResource: ex.ImageSource
  ) {
    this.scene = scene;
    this.player = player;

    this.spriteSheet = ex.SpriteSheet.fromImageSource({
      image: houseTilesResource,
      grid: {
        columns: 28,
        rows: 14,
        spriteWidth: 16,
        spriteHeight: 16,
      },
    });
  }

  /**
   * Toggle building mode on/off
   */
  public toggleBuildMode(): void {
    this.isBuildMode = !this.isBuildMode;

    if (this.isBuildMode) {
      this.enterBuildMode();
    } else {
      this.exitBuildMode();
    }
  }

  private enterBuildMode(): void {
    this.createGridOverlay();

    const firstTileId = Object.keys(BUILDING_TILES)[0];
    this.selectTile(firstTileId);
  }

  private exitBuildMode(): void {
    this.destroyGridOverlay();
    this.destroyGhostTile();
    this.selectedTileId = null;
  }

  /**
   * Select a tile type to place
   */
  public selectTile(tileId: string): void {
    if (!BUILDING_TILES[tileId]) {
      console.warn(`Tile ${tileId} not found`);
      return;
    }

    this.selectedTileId = tileId;
    this.destroyGhostTile();
  }

  /**
   * Get currently selected tile config
   */
  public getSelectedTile(): BuildingTileConfig | null {
    if (!this.selectedTileId) return null;
    return BUILDING_TILES[this.selectedTileId] || null;
  }

  /**
   * Update ghost tile position based on pointer/touch
   */
  public updateGhostTile(worldPos: ex.Vector): void {
    if (!this.isBuildMode || !this.selectedTileId) return;

    const gridPos = this.worldToGrid(worldPos);
    const tileConfig = BUILDING_TILES[this.selectedTileId];
    if (!tileConfig) return;

    const snappedWorldPos = this.gridToWorld(
      gridPos.x,
      gridPos.y,
      tileConfig.width,
      tileConfig.height
    );

    if (!this.ghostTile) {
      this.ghostTile = new ex.Actor({
        pos: snappedWorldPos,
        width: tileConfig.width * TILE_SIZE,
        height: tileConfig.height * TILE_SIZE,
        anchor: ex.vec(0.5, 0.5),
        z: 100,
      });

      this.setupGhostGraphics(this.ghostTile, tileConfig);
      this.scene.add(this.ghostTile);
    } else {
      this.ghostTile.pos = snappedWorldPos;
    }

    const isValid = this.canPlaceTile(gridPos.x, gridPos.y, tileConfig);
    this.updateGhostTint(isValid);
  }

  private setupGhostGraphics(
    actor: ex.Actor,
    tileConfig: BuildingTileConfig
  ): void {
    const { width, height } = tileConfig;
    const outdoorSprite = tileConfig.outdoorSprite;

    if (width === 1 && height === 1) {
      const sprite = this.spriteSheet.getSprite(
        outdoorSprite.spriteX,
        outdoorSprite.spriteY
      );
      if (sprite) {
        const ghostSprite = sprite.clone();
        ghostSprite.opacity = 0.6;
        actor.graphics.use(ghostSprite);
      }
    } else {
      const canvas = new ex.Canvas({
        width: width * TILE_SIZE,
        height: height * TILE_SIZE,
        draw: (ctx) => {
          ctx.globalAlpha = 0.6;
          for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
              const sprite = this.spriteSheet.getSprite(
                outdoorSprite.spriteX + dx,
                outdoorSprite.spriteY + dy
              );
              if (sprite) {
                ctx.drawImage(
                  sprite.image.image as HTMLImageElement,
                  sprite.sourceView.x,
                  sprite.sourceView.y,
                  sprite.sourceView.width,
                  sprite.sourceView.height,
                  dx * TILE_SIZE,
                  dy * TILE_SIZE,
                  TILE_SIZE,
                  TILE_SIZE
                );
              }
            }
          }
        },
      });
      actor.graphics.use(canvas);
    }
  }

  private updateGhostTint(isValid: boolean): void {
    if (!this.ghostTile) return;

    const currentGraphic = this.ghostTile.graphics.current;
    if (currentGraphic) {
      currentGraphic.tint = isValid ? ex.Color.Green : ex.Color.Red;
    }
  }

  private destroyGhostTile(): void {
    if (this.ghostTile) {
      this.scene.remove(this.ghostTile);
      this.ghostTile = null;
    }
  }

  public placeTile(worldPos: ex.Vector): boolean {
    if (!this.isBuildMode || !this.selectedTileId) return false;

    const gridPos = this.worldToGrid(worldPos);
    const tileConfig = BUILDING_TILES[this.selectedTileId];

    if (!tileConfig || !this.canPlaceTile(gridPos.x, gridPos.y, tileConfig)) {
      return false;
    }

    const adjacentGroups: BuildingGroup[] = [];

    for (const group of this.buildingGroups) {
      if (
        group.isAdjacentTo(
          gridPos.x,
          gridPos.y,
          tileConfig.width,
          tileConfig.height
        )
      ) {
        adjacentGroups.push(group);
      }
    }

    let targetGroup: BuildingGroup;

    if (adjacentGroups.length === 0) {
      targetGroup = new BuildingGroup(this.spriteSheet);
      this.scene.add(targetGroup);
      this.buildingGroups.push(targetGroup);

      if (this.debugMode) {
        console.log("🏗️ Created new building group");
      }
    } else if (adjacentGroups.length === 1) {
      targetGroup = adjacentGroups[0];

      if (this.debugMode) {
        console.log("🔗 Adding to existing group");
      }
    } else {
      targetGroup = adjacentGroups[0];

      if (this.debugMode) {
        console.log(`🔗 Merging ${adjacentGroups.length} groups into one`);
      }

      for (let i = 1; i < adjacentGroups.length; i++) {
        const groupToMerge = adjacentGroups[i];

        targetGroup.merge(groupToMerge);

        for (const pos of groupToMerge.getAllGridPositions()) {
          this.gridOccupancy.set(pos, targetGroup);
        }

        this.scene.remove(groupToMerge);
        this.buildingGroups = this.buildingGroups.filter(
          (g) => g !== groupToMerge
        );
      }
    }

    targetGroup.addTile(gridPos.x, gridPos.y, tileConfig);

    for (let dy = 0; dy < tileConfig.height; dy++) {
      for (let dx = 0; dx < tileConfig.width; dx++) {
        const key = this.gridKey(gridPos.x + dx, gridPos.y + dy);
        this.gridOccupancy.set(key, targetGroup);
      }
    }

    if (this.debugMode) {
      console.log(
        `✅ Placed ${tileConfig.name} at (${gridPos.x}, ${gridPos.y})`
      );
      console.log(
        `📊 Total groups: ${
          this.buildingGroups.length
        }, Total tiles: ${this.getTotalTileCount()}`
      );
    }

    return true;
  }

  /**
   * Get total number of tiles across all groups
   */
  private getTotalTileCount(): number {
    return this.buildingGroups.reduce((sum, group) => sum + group.tileCount, 0);
  }

  /**
   * Remove a tile at the given world position
   */
  public removeTile(worldPos: ex.Vector): boolean {
    const gridPos = this.worldToGrid(worldPos);
    const key = this.gridKey(gridPos.x, gridPos.y);
    const group = this.gridOccupancy.get(key);

    if (!group) return false;

    const removedTile = group.removeTile(gridPos.x, gridPos.y);
    if (!removedTile) return false;

    for (let dy = 0; dy < removedTile.height; dy++) {
      for (let dx = 0; dx < removedTile.width; dx++) {
        const removeKey = this.gridKey(gridPos.x + dx, gridPos.y + dy);
        this.gridOccupancy.delete(removeKey);
      }
    }

    if (group.tileCount === 0 || !group.isValid()) {
      this.scene.remove(group);
      this.buildingGroups = this.buildingGroups.filter((g) => g !== group);

      if (this.debugMode) {
        console.log("🗑️ Removed empty/invalid building group");
      }
    }

    this.checkAndSplitDisconnectedTiles(group);

    if (this.debugMode) {
      console.log(
        `🗑️ Removed ${removedTile.name} at (${gridPos.x}, ${gridPos.y})`
      );
      console.log(
        `📊 Total groups: ${
          this.buildingGroups.length
        }, Total tiles: ${this.getTotalTileCount()}`
      );
    }

    return true;
  }

  /**
   * Check if removing a tile disconnected the structure and split if needed
   */
  private checkAndSplitDisconnectedTiles(group: BuildingGroup): void {}

  /**
   * Check if a tile can be placed at the given grid position
   */
  private canPlaceTile(
    gridX: number,
    gridY: number,
    tileConfig: BuildingTileConfig
  ): boolean {
    return true;

    for (let dy = 0; dy < tileConfig.height; dy++) {
      for (let dx = 0; dx < tileConfig.width; dx++) {
        const key = this.gridKey(gridX + dx, gridY + dy);
        if (this.gridOccupancy.has(key)) {
          return false;
        }
      }
    }

    const worldPos = this.gridToWorld(gridX, gridY);
    if (worldPos.x < 0 || worldPos.x > (this.scene as any).levelWidth) {
      return false;
    }

    if (this.buildingGroups.length === 0) {
      if (tileConfig.category !== "foundation") {
        if (this.debugMode) {
          console.log("❌ First tile must be a foundation!");
        }
        return false;
      }
      if (!this.isOnGroundLevel(worldPos)) {
        if (this.debugMode) {
          console.log("❌ Foundation must be placed on ground!");
        }
        return false;
      }
      return true;
    }

    const isConnected = this.isConnectedToStructure(gridX, gridY);
    if (!isConnected) {
      if (this.debugMode) {
        console.log("❌ Tile must be connected to existing structure!");
      }
      return false;
    }

    if (
      tileConfig.category === "foundation" ||
      tileConfig.category === "floor"
    ) {
      return this.isOnGroundLevel(worldPos);
    }

    return true;
  }

  /**
   * Check if a position is connected to any existing structure
   */
  private isConnectedToStructure(gridX: number, gridY: number): boolean {
    for (const group of this.buildingGroups) {
      if (group.isAdjacentTo(gridX, gridY, 1, 1)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a position is on or very close to ground level
   */
  private isOnGroundLevel(worldPos: ex.Vector): boolean {
    const sceneWithConfig = this.scene as any;
    const levelHeight =
      sceneWithConfig.levelHeight || sceneWithConfig.config?.height || 600;
    const groundHeight = 32;

    const groundY = levelHeight - groundHeight / 2;

    const distanceFromGround = worldPos.y - groundY;

    if (this.debugMode) {
      console.log("Ground check:", {
        worldPosY: worldPos.y,
        levelHeight,
        groundY,
        distanceFromGround,
        isValid:
          distanceFromGround >= -TILE_SIZE * 2 &&
          distanceFromGround <= TILE_SIZE * 3,
      });
    }

    return (
      distanceFromGround >= -TILE_SIZE * 2 &&
      distanceFromGround <= TILE_SIZE * 3
    );
  }

  /**
   * Convert world coordinates to grid coordinates
   */
  private worldToGrid(worldPos: ex.Vector): { x: number; y: number } {
    return {
      x: Math.floor(worldPos.x / TILE_SIZE),
      y: Math.floor(worldPos.y / TILE_SIZE),
    };
  }

  /**
   * Convert grid coordinates to world coordinates (centered on tile)
   */
  private gridToWorld(
    gridX: number,
    gridY: number,
    width: number = 1,
    height: number = 1
  ): ex.Vector {
    return ex.vec(
      gridX * TILE_SIZE + (width * TILE_SIZE) / 2,
      gridY * TILE_SIZE + (height * TILE_SIZE) / 2
    );
  }

  /**
   * Generate a unique key for grid storage
   */
  private gridKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  /**
   * Create a light grid overlay for building mode
   */
  private createGridOverlay(): void {
    const sceneWithConfig = this.scene as any;
    const levelWidth =
      sceneWithConfig.levelWidth || sceneWithConfig.config?.width || 2400;
    const levelHeight =
      sceneWithConfig.levelHeight || sceneWithConfig.config?.height || 600;

    this.gridOverlay = new ex.Actor({
      pos: ex.vec(0, 0),
      anchor: ex.vec(0, 0),
      z: 99,
      collisionType: ex.CollisionType.PreventCollision,
    });

    const gridCanvas = new ex.Canvas({
      width: levelWidth,
      height: levelHeight,
      draw: (ctx) => {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;

        for (let x = 0; x <= levelWidth; x += TILE_SIZE) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, levelHeight);
          ctx.stroke();
        }

        for (let y = 0; y <= levelHeight; y += TILE_SIZE) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(levelWidth, y);
          ctx.stroke();
        }
      },
    });

    this.gridOverlay.graphics.use(gridCanvas);

    this.gridOverlay.pointer.useGraphicsBounds = false;

    this.scene.add(this.gridOverlay);
  }

  private destroyGridOverlay(): void {
    if (this.gridOverlay) {
      this.scene.remove(this.gridOverlay);
      this.gridOverlay = null;
    }
  }

  /**
   * Get all placed tiles for serialization/saving
   */
  public getPlacedTiles(): PlacedBuildingTile[] {
    const allTiles: PlacedBuildingTile[] = [];

    for (const group of this.buildingGroups) {
      const processed = new Set<string>();

      for (const [key, tileConfig] of group.tiles.entries()) {
        if (!processed.has(key)) {
          const [gridX, gridY] = key.split(",").map(Number);
          const worldPos = this.gridToWorld(
            gridX,
            gridY,
            tileConfig.width,
            tileConfig.height
          );

          allTiles.push({
            config: tileConfig,
            gridX,
            gridY,
            worldX: worldPos.x,
            worldY: worldPos.y,
          });

          for (let dy = 0; dy < tileConfig.height; dy++) {
            for (let dx = 0; dx < tileConfig.width; dx++) {
              processed.add(this.gridKey(gridX + dx, gridY + dy));
            }
          }
        }
      }
    }

    return allTiles;
  }

  /**
   * Load tiles from saved data
   */
  public loadTiles(tiles: PlacedBuildingTile[]): void {
    tiles.forEach((tileData) => {
      const worldPos = ex.vec(tileData.worldX, tileData.worldY);
      this.selectedTileId = tileData.config.id;
      this.placeTile(worldPos);
    });
    this.selectedTileId = null;
  }

  /**
   * Clear all placed tiles
   */
  public clearAll(): void {
    this.buildingGroups.forEach((group) => {
      this.scene.remove(group);
    });
    this.buildingGroups = [];
    this.gridOccupancy.clear();

    if (this.debugMode) {
      console.log("🧹 Cleared all building groups");
    }
  }

  public tryDoorInteraction(playerWorldPos: ex.Vector): boolean {
    const playerGrid = this.worldToGrid(playerWorldPos);

    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const checkX = playerGrid.x + dx;
        const checkY = playerGrid.y + dy;
        const key = this.gridKey(checkX, checkY);
        const group = this.gridOccupancy.get(key);

        if (group && group.isDoorPosition(checkX, checkY)) {
          group.toggleIndoorView();

          if (group.isIndoorView) {
            const bounds = this.getBuildingBounds(group);
            this.player.enterBuilding(bounds);
          } else {
            this.player.exitBuilding();
          }

          const message = group.isIndoorView
            ? "Entered building"
            : "Exited building";
          (this.scene.engine as any).showMessage?.(message, "info");
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Calculate movement boundaries for a building group
   */
  private getBuildingBounds(group: BuildingGroup): MovementBoundaries {
    const gridCoords = Array.from(group.gridPositions).map((key) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y };
    });

    const minGridX = Math.min(...gridCoords.map((c) => c.x));
    const maxGridX = Math.max(...gridCoords.map((c) => c.x));
    const minGridY = Math.min(...gridCoords.map((c) => c.y));
    const maxGridY = Math.max(...gridCoords.map((c) => c.y));

    const padding = TILE_SIZE;

    return {
      minX: minGridX * TILE_SIZE + padding,
      maxX: (maxGridX + 1) * TILE_SIZE - padding,
      minY: minGridY * TILE_SIZE + padding,
      maxY: (maxGridY + 1) * TILE_SIZE - padding,
    };
  }

  /**
   * Check if player can move to a position (used to block exiting through walls)
   */
  public canPlayerMoveTo(
    playerWorldPos: ex.Vector,
    newWorldPos: ex.Vector
  ): boolean {
    const currentGrid = this.worldToGrid(playerWorldPos);
    const newGrid = this.worldToGrid(newWorldPos);

    const currentKey = this.gridKey(currentGrid.x, currentGrid.y);
    const currentGroup = this.gridOccupancy.get(currentKey);

    const newKey = this.gridKey(newGrid.x, newGrid.y);
    const newGroup = this.gridOccupancy.get(newKey);

    if (currentGroup && currentGroup.isIndoorView) {
      if (!newGroup || newGroup !== currentGroup) {
        const nearDoor = this.isNearDoor(
          currentGrid.x,
          currentGrid.y,
          currentGroup
        );
        if (!nearDoor) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if a position is at or near a door
   */
  private isNearDoor(
    gridX: number,
    gridY: number,
    group: BuildingGroup
  ): boolean {
    if (group.isDoorPosition(gridX, gridY)) {
      return true;
    }

    const adjacent = [
      { x: gridX - 1, y: gridY },
      { x: gridX + 1, y: gridY },
      { x: gridX, y: gridY - 1 },
      { x: gridX, y: gridY + 1 },
      { x: gridX - 1, y: gridY - 1 },
      { x: gridX + 1, y: gridY - 1 },
      { x: gridX - 1, y: gridY + 1 },
      { x: gridX + 1, y: gridY + 1 },
    ];

    for (const pos of adjacent) {
      if (group.isDoorPosition(pos.x, pos.y)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the building group at a world position
   */
  public getBuildingGroupAt(worldPos: ex.Vector): BuildingGroup | null {
    const gridPos = this.worldToGrid(worldPos);
    const key = this.gridKey(gridPos.x, gridPos.y);
    return this.gridOccupancy.get(key) || null;
  }

  /**
   * Check if player is currently inside any building
   */
  public isPlayerInside(playerWorldPos: ex.Vector): boolean {
    const group = this.getBuildingGroupAt(playerWorldPos);
    return group?.isIndoorView || false;
  }
}
