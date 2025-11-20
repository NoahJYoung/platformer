import * as ex from "excalibur";
import { Player } from "../actors/player/player";
import { GameEngine } from "../engine/game-engine";
import type { WeaponItem } from "../actors/character/types";
import type { BackgroundLayer, SceneConfig } from "./types";
import { CollisionGroups, GAME_HEIGHT } from "../actors/config";
import { Enemy } from "../actors/enemy/enemy";
import type { EnemyConfig } from "../actors/enemy/types";
import { GroundTileManager } from "./ground-tile-manager";
import { BackgroundResources, FloorResources } from "../resources";
import { createItem } from "../items/item-creator";
import { Tree } from "../actors/resources/tree/tree";
import { Ore } from "../actors/resources/ore/ore";

import { BuildingManager } from "../building-manager/building-manager";
import { BuildingInput } from "../building-manager/building-input";
import { BuildingResources } from "../resources/building-resources";
import { SaveManager } from "../engine/save-manager";
import { BUILDING_TILES } from "../building-manager/building-tile-catalog";
import { WaterPool } from "../actors/resources/water/water-pool";

export class GameMapScene extends ex.Scene {
  public name: string = "unknown";
  public config: SceneConfig;
  public player: Player | null = null;
  public levelWidth: number;
  public levelHeight: number;
  private groundTileManager = new GroundTileManager(FloorResources.floor1);
  private spawnIntervalTime = 20000;

  private AUTO_SPAWN_ENEMIES = false;
  private spawnInterval: ex.Timer | null = null;

  private buildingManager: BuildingManager | null = null;
  private buildingInput: BuildingInput | null = null;

  constructor(config: SceneConfig) {
    super();
    this.config = config;
    this.levelWidth = config.width;
    this.levelHeight = config.height;
    this.name = config.name;
  }

  async onInitialize(engine: GameEngine): Promise<void> {
    this.player = engine.player;

    if (!this.player) {
      console.error("No player found!");
      return;
    }

    this.buildingManager = new BuildingManager(this, this.player, {
      wood: BuildingResources.wood_house_tiles,
      stone: BuildingResources.stone_house_tiles,
    });

    this.buildingInput = new BuildingInput(engine, this.buildingManager);
    this.buildingInput.initialize();

    engine.timeCycle.addToScene(this);

    this.camera.strategy.elasticToActor(this.player, 0.05, 0.1);

    this.camera.strategy.limitCameraBounds(
      new ex.BoundingBox({
        left: 0,
        top: 0,
        right: this.levelWidth,
        bottom: this.levelHeight,
      })
    );

    await this.createLevel(engine);

    this.createExits(engine);

    this.createEnemies(this.config.enemies || []);

    engine.timeCycle.onSeasonChange(() => {
      this.rebuildBackground(engine);
      this.createTrees();
      this.createOres();
    });

    this.setupEnemySpawning();

    engine.timeCycle.onSeasonChange(() => {
      this.rebuildBackground(engine);
      this.createTrees();
      this.createOres();
    });
  }

  onActivate(context: ex.SceneActivationContext<unknown>): void {
    const engine = this.engine as GameEngine;
    this.player = engine.player;

    if (engine.hud) {
      this.add(engine.hud);
    }

    engine.timeCycle.setBiome(this.config.type);

    if (!this.player) {
      console.error("No player found!");
      return;
    }

    if (this.player.scene && this.player.scene !== this) {
      this.player.scene.remove(this.player);
    }

    const entryPoint = engine._nextSceneEntryPoint || "default";
    delete engine._nextSceneEntryPoint;

    const spawnPos = this.getSpawnPosition(entryPoint);
    this.player.pos = spawnPos;

    if (this.config.buildingData && this.config.buildingData.tiles.length > 0) {
      this.loadBuildingData(this.config.buildingData);
    }

    setTimeout(() => {
      if (this.player) this.add(this.player);
    }, 100);

    engine.forceSingleUpdate();

    SaveManager.autoSave(engine);
  }

  onDeactivate(): void {
    if (this.spawnInterval) {
      this.spawnInterval.stop();
      this.remove(this.spawnInterval);
      this.spawnInterval = null;
    }

    if (this.buildingInput) {
      this.buildingInput.destroy();
    }
  }

  public getBuildingManager(): BuildingManager | null {
    return this.buildingManager;
  }

  private loadBuildingData(buildingData: {
    tiles: Array<{
      tileId: string;
      gridX: number;
      gridY: number;
      worldX: number;
      worldY: number;
    }>;
  }): void {
    console.log("LOADING: ", buildingData);
    if (!this.buildingManager) {
      console.error(
        "Cannot load building data: BuildingManager not initialized"
      );
      return;
    }

    let successCount = 0;
    let failCount = 0;

    buildingData.tiles.forEach((tileData) => {
      try {
        const tileConfig = BUILDING_TILES[tileData.tileId];

        if (!tileConfig) {
          console.warn(
            `❌ Building tile "${tileData.tileId}" not found in BUILDING_TILES catalog`
          );
          failCount++;
          return;
        }

        this.buildingManager?.selectTile(tileData.tileId);

        const worldPos = ex.vec(tileData.worldX, tileData.worldY);
        const gridPos = ex.vec(tileData.gridX, tileData.gridY);
        const success = this.buildingManager?.placeTile(
          worldPos,
          gridPos,
          true
        );

        if (success) {
          successCount++;
        } else {
          console.warn(
            `❌ Failed to place building tile "${tileData.tileId}" at (${tileData.gridX}, ${tileData.gridY})`
          );
          failCount++;
        }
      } catch (error) {
        console.error("Error loading building tile:", error, tileData);
        failCount++;
      }
    });

    (this.buildingManager as any).selectedTileId = null;
    if (typeof (this.buildingManager as any).destroyGhostTile === "function") {
      (this.buildingManager as any).destroyGhostTile();
    }

    console.log(
      `Building data loaded: ${successCount} tiles placed successfully, ${failCount} failed`
    );
  }

  private setupEnemySpawning(): void {
    if (!this.AUTO_SPAWN_ENEMIES) return;

    this.spawnInterval = new ex.Timer({
      interval: this.spawnIntervalTime,
      repeats: true,
      fcn: () => {
        this.spawnRandomEnemy();
      },
    });

    this.add(this.spawnInterval);
    this.spawnInterval.start();
  }

  private spawnRandomEnemy(): void {
    if (!this.player) return;

    const spawnDistance = 300 + Math.random() * 200;
    const spawnSide = Math.random() > 0.5 ? 1 : -1;

    const spawnX = this.player.pos.x + spawnDistance * spawnSide;
    const spawnY = this.levelHeight - 100;
    const clampedX = ex.clamp(spawnX, 100, this.levelWidth - 100);

    const enemyConfig: EnemyConfig = {
      name: `enemy_${Date.now()}`,
      pos: ex.vec(clampedX, spawnY),
      appearanceOptions: {
        sex: Math.random() > 0.5 ? "male" : "female",
        skinTone: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
        hairStyle: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
        displayName: `Enemy ${Math.floor(Math.random() * 100)}`,
      },
      facingRight: spawnSide < 0,
    };

    this.spawnEnemy(enemyConfig);

    const actorsByType: Record<string, number> = {};
    this.actors.forEach((actor) => {
      const type = actor.name?.split("_")[0] || "unnamed";
      actorsByType[type] = (actorsByType[type] || 0) + 1;
    });
  }

  protected createExits(engine: GameEngine): void {
    this.config.exits?.forEach((exit) => {
      const trigger = new ex.Actor({
        name: `exit_to_${exit.targetScene}`,
        pos: ex.vec(exit.x, exit.y),
        width: exit.width,
        height: exit.height,
        collisionType: ex.CollisionType.Passive,
        collisionGroup: CollisionGroups.Trigger,
        z: 100,
      });

      let isTransitioning = false;

      trigger.on("collisionstart", (evt: ex.CollisionStartEvent) => {
        const collidingActor = evt.other.owner;

        let isPlayer = false;

        if (collidingActor === this.player) {
          isPlayer = true;
        } else if (collidingActor?.name === "player") {
          isPlayer = true;
        } else if (
          collidingActor &&
          this.isPlayerOrChild(collidingActor as ex.Actor)
        ) {
          isPlayer = true;
        }

        if (isPlayer && !isTransitioning) {
          isTransitioning = true;
          console.log(
            `Transitioning from ${this.name} to ${exit.targetScene} via ${exit.targetEntry}`
          );
          this.transitionTo(engine, exit.targetScene, exit.targetEntry);

          setTimeout(() => {
            isTransitioning = false;
          }, 1000);
        }
      });

      this.add(trigger);
    });
  }

  private isPlayerOrChild(actor: ex.Actor): boolean {
    if (!this.player) return false;

    let current: ex.Actor | null = actor;
    while (current) {
      if (current === this.player) {
        return true;
      }
      current = current.parent as ex.Actor | null;
    }

    return false;
  }

  private createEnemies(enemies: EnemyConfig[]) {
    enemies.forEach((enemyConfig) => {
      this.spawnEnemy(enemyConfig);
    });
  }

  private spawnEnemy(enemyConfig: EnemyConfig): void {
    const enemy = new Enemy(enemyConfig);
    console.log({ enemyConfig });
    this.add(enemy);

    const ironSword = createItem(
      "iron_sword",
      enemyConfig.appearanceOptions.sex
    );

    enemy.equipItem(ironSword as WeaponItem);
  }

  protected transitionTo(
    engine: GameEngine,
    sceneName: string,
    entryPoint: string
  ): void {
    engine._nextSceneEntryPoint = entryPoint;

    console.log(`Setting entry point: ${entryPoint} for scene: ${sceneName}`);

    engine.goToScene(sceneName);
  }

  protected getSpawnPosition(entryPoint: string): ex.Vector {
    const spawns = this.config.spawnPoints || {};

    if (spawns[entryPoint]) {
      return spawns[entryPoint];
    }

    if (spawns.default) {
      return spawns.default;
    }

    const fallback = ex.vec(this.levelWidth / 2, this.levelHeight - 100);
    return fallback;
  }

  protected async rebuildBackground(engine: GameEngine): Promise<void> {
    const backgroundActors = this.actors.filter((actor) => actor.z < 0);
    backgroundActors.forEach((actor) => {
      this.remove(actor);
    });

    const oldGroundActors = this.actors.filter(
      (actor) =>
        actor.name === "ground" || actor.name?.startsWith("ground_segment_")
    );
    oldGroundActors.forEach((actor) => {
      this.remove(actor);
    });

    const groundActors = this.createGroundSegments(engine);
    groundActors.forEach((ground) => {
      this.add(ground);
    });

    this.createBackground(
      engine,
      this.levelHeight - this.getAverageGroundHeight(groundActors)
    );
    engine.timeCycle.starField?.createStars(this);
  }

  private getAverageGroundHeight(groundActors: ex.Actor[]): number {
    if (groundActors.length === 0) {
      return this.levelHeight;
    }

    const totalY = groundActors.reduce((sum, actor) => {
      return sum + (actor.pos.y - actor.height / 2);
    }, 0);

    return totalY / groundActors.length;
  }

  protected async createBackground(
    engine: GameEngine,
    averageGroundHeight: number
  ): Promise<void> {
    const season = engine.timeCycle.getCurrentSeason();
    const biome = this.config.type;
    const theme =
      season === "winter" ? "winter" : season === "fall" ? "fall" : "normal";
    const backgrounds =
      BackgroundResources[biome as keyof typeof BackgroundResources][theme];

    const bgWidth = 1024;
    const bgHeight = 346;

    const skyScale = (this.levelHeight / bgHeight) * 1.1;
    const scaledSkyWidth = bgWidth * skyScale;
    const scaledSkyHeight = bgHeight * skyScale;

    const tilesNeeded = Math.ceil(this.levelWidth / bgWidth) + 2;

    const layers: (BackgroundLayer | Promise<BackgroundLayer>)[] = [
      {
        resource: backgrounds.layer5,
        parallax: ex.vec(1, 1),
        isSky: true,
        z: -100,
      },
      {
        resource: backgrounds.layer5Night,
        parallax: ex.vec(1, 1),
        isSky: true,
        isNight: true,
        z: -99.5,
      },
      {
        resource: backgrounds.layer4,
        parallax: ex.vec(0.1, 0.1),
        z: -98,
      },
      {
        resource: backgrounds.layer4Night,
        parallax: ex.vec(0.1, 0.1),
        isNight: true,
        z: -97.5,
      },
      {
        resource: backgrounds.layer3,
        parallax: ex.vec(0.175, 0.175),
        z: -96,
      },
      {
        resource: backgrounds.layer2,
        parallax: ex.vec(0.35, 0.35),
        z: -95,
      },
      {
        resource: backgrounds.layer1,
        parallax: ex.vec(0.65, 0.65),
        z: -94,
      },
      {
        resource: backgrounds.decoration4,
        parallax: ex.vec(0.7, 0.7),
        z: -93,
        isDecoration: true,
      },
      {
        resource: backgrounds.decoration3,
        parallax: ex.vec(0.75, 0.75),
        z: -92,
        isDecoration: true,
      },
      {
        resource: backgrounds.decoration2,
        parallax: ex.vec(0.8, 0.8),
        z: -91,
        isDecoration: true,
      },
      {
        resource: backgrounds.decoration1,
        parallax: ex.vec(0.85, 0.85),
        z: -90,
        isDecoration: true,
      },
    ];

    for (const layer of layers) {
      const resolvedLayer = await Promise.resolve(layer);

      if (resolvedLayer.isSky) {
        if (!resolvedLayer.resource) {
          continue;
        }
        const skyTilesNeeded = Math.ceil(this.levelWidth / scaledSkyWidth) + 4;

        for (let i = -2; i < skyTilesNeeded; i++) {
          const sprite = resolvedLayer.resource.toSprite();
          sprite.scale = ex.vec(skyScale, skyScale);

          const background = new ex.Actor({
            pos: ex.vec(
              i * scaledSkyWidth + scaledSkyWidth / 2,
              scaledSkyHeight / 2
            ),
            anchor: ex.vec(0.5, 0.5),
            z: resolvedLayer.z,
          });

          background.graphics.use(sprite);
          background.addComponent(
            new ex.ParallaxComponent(resolvedLayer.parallax)
          );

          if (resolvedLayer.isNight) {
            sprite.opacity = 0;
            background.on("preupdate", () => {
              const nightData = engine.timeCycle.calculateDarkEffect(
                engine.timeCycle.getTimeOfDay()
              );
              sprite.opacity = nightData.opacity / 0.8;
            });
          }

          this.add(background);
        }
      } else {
        for (let i = -1; i < tilesNeeded; i++) {
          const parallaxFactor = resolvedLayer.parallax.y;
          const sprite = resolvedLayer.resource?.toSprite();
          if (!sprite) {
            continue;
          }

          const x = i * bgWidth + bgWidth / 2;

          const y =
            (this.levelHeight - bgHeight / 2) * parallaxFactor +
            (GAME_HEIGHT / 5) * (1 - parallaxFactor);

          const background = new ex.Actor({
            pos: ex.vec(x, y),
            anchor: ex.vec(0.5, 0.5),
            z: resolvedLayer.z,
          });

          background.graphics.use(sprite);
          background.addComponent(
            new ex.ParallaxComponent(resolvedLayer.parallax)
          );

          if (resolvedLayer.isNight) {
            sprite.opacity = 0;
            background.on("preupdate", () => {
              const nightData = engine.timeCycle.calculateDarkEffect(
                engine.timeCycle.getTimeOfDay()
              );
              sprite.opacity = nightData.opacity / 0.8;
            });
          }

          this.add(background);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    engine.timeCycle.starField?.createStars(this);
  }

  private createPlatform(
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const platform = new ex.Actor({
      name: "platform",
      pos: ex.vec(x, y),
      anchor: ex.vec(0, 1),
      width: width,
      height: height,
      collisionType: ex.CollisionType.Fixed,
      collisionGroup: CollisionGroups.Platform,
    });

    if (this.groundTileManager && this.engine) {
      const engine = this.engine as GameEngine;
      const season = engine.timeCycle.getCurrentSeason();
      const theme =
        season === "winter" ? "winter" : season === "fall" ? "fall" : "normal";

      const platformCanvas = this.groundTileManager.createGroundCanvasElement(
        width,
        height,
        theme
      );

      const canvasGraphic = new ex.Canvas({
        width: width,
        height: height,
        draw: (ctx) => {
          ctx.drawImage(platformCanvas, 0, 0);
        },
      });

      platform.graphics.use(canvasGraphic);
    } else {
      platform.graphics.use(
        new ex.Rectangle({
          width: width,
          height: height,
          color: ex.Color.fromHex("#654321"),
        })
      );
    }

    this.add(platform);
  }

  private createPlatforms(): void {
    this.config.platforms?.forEach((platform) => {
      this.createPlatform(
        platform.x,
        platform.y,
        platform.width,
        platform.height
      );
    });
  }

  /**
   * NEW: Create multiple ground segment actors with varied heights
   * Now with visual overlap to eliminate gaps
   */
  createGroundSegments(engine: GameEngine): ex.Actor[] {
    const groundActors: ex.Actor[] = [];

    const segments = this.config.groundSegments || [
      {
        x: this.levelWidth / 2,
        y: this.levelHeight - 32,
        width: this.levelWidth + 400,
        height: 32,
      },
    ];

    const season = engine.timeCycle.getCurrentSeason();
    const theme =
      season === "winter" ? "winter" : season === "fall" ? "fall" : "normal";

    segments.forEach((segment, index) => {
      const VISUAL_OVERLAP = 4;
      const visualWidth = segment.width + VISUAL_OVERLAP * 2;

      const ground = new ex.Actor({
        name: `ground_segment_${index}`,
        pos: ex.vec(segment.x, segment.y + segment.height / 2),
        anchor: ex.vec(0, 0.5),
        width: segment.width,
        height: segment.height,
        collisionType: ex.CollisionType.Fixed,
        collisionGroup: CollisionGroups.Environment,
      });

      const groundCanvas = this.groundTileManager.createGroundCanvasElement(
        visualWidth,
        segment.height,
        theme
      );

      const canvasGraphic = new ex.Canvas({
        width: visualWidth,
        height: segment.height,
        draw: (ctx) => {
          ctx.drawImage(groundCanvas, 0, 0);
        },
      });

      ground.graphics.use(canvasGraphic);
      groundActors.push(ground);
    });

    return groundActors;
  }

  createWaterSegments() {
    const waterActors: ex.Actor[] = [];

    const segments = this.config.waterSegments || [];

    segments.forEach((segment) => {
      const water = new WaterPool(
        ex.vec(segment.x, segment.y),
        segment.width,
        segment.height
      );

      waterActors.push(water);
    });
    return waterActors;
  }

  /**
   * DEPRECATED: Use createGroundSegments instead
   * Kept for backward compatibility
   */
  getGroundFromSeason(engine: GameEngine): ex.Actor {
    const segments = this.createGroundSegments(engine);
    return segments[0];
  }

  protected createTrees() {
    this.config.materialSources?.trees.forEach(({ x, y, type }) => {
      const tree = new Tree(ex.vec(x, y), type);
      this.add(tree);
    });
  }

  protected createOres() {
    if (this.config.type !== "mountain") {
      return;
    }

    this.config.materialSources?.ores.forEach(({ x, y, type }) => {
      const ore = new Ore(ex.vec(x, y), type);
      this.add(ore);
    });
  }

  protected async createLevel(engine: GameEngine): Promise<void> {
    const groundActors = this.createGroundSegments(engine);
    const waterActors = this.createWaterSegments();

    await this.createBackground(
      engine,
      this.levelHeight - this.getAverageGroundHeight(groundActors)
    );
    this.createPlatforms();

    groundActors.forEach((ground) => {
      this.add(ground);
    });

    waterActors.forEach((pool) => {
      this.add(pool);
    });

    this.createTrees();
    this.createOres();
  }
}
