import * as ex from "excalibur";
import { Player } from "../actors/player/player";
import { GameEngine } from "../game-engine";
import type { AppearanceOptions, WeaponItem } from "../actors/character/types";
import type { SceneConfig } from "./types";
import { CollisionGroups } from "../actors/config";
import { Enemy } from "../actors/enemy/enemy";
import type { EnemyConfig } from "../actors/enemy/types";
import { GroundTileManager } from "./ground-tile-manager";
import { BackgroundResources, FloorResources } from "../resources";
import { createItem } from "../items/item-creator";

export class GameMapScene extends ex.Scene {
  public name: string = "unknown";
  protected config: SceneConfig;
  protected player: Player | null = null;
  protected levelWidth: number;
  protected levelHeight: number;
  private groundTileManager = new GroundTileManager(FloorResources.floor1);

  private AUTO_SPAWN_ENEMIES = true;
  private spawnInterval: ex.Timer | null = null;

  constructor(config: SceneConfig) {
    super();
    this.config = config;
    this.levelWidth = config.width;
    this.levelHeight = config.height;
  }

  onInitialize(engine: GameEngine): void {
    this.player = engine.player;
    this.groundTileManager.setTheme("normal", 0, 0, 1, 2);
    this.groundTileManager.setTheme("fall", 6, 0, 1, 2);
    this.groundTileManager.setTheme("winter", 12, 0, 1, 2);

    if (!this.player) {
      console.error("No player found!");
      return;
    }

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

    this.createLevel(engine);

    this.createExits(engine);

    this.createEnemies(this.config.enemies || []);

    engine.timeCycle.onSeasonChange(() => {
      this.rebuildBackground(engine);
    });

    this.setupEnemySpawning();
  }

  onActivate(context: ex.SceneActivationContext<unknown>): void {
    const engine = this.engine as GameEngine;
    this.player = engine.player;

    if (engine.hud) {
      this.add(engine.hud);
    }

    if (!this.player) {
      console.error("No player found!");
      return;
    }

    if (this.player.scene && this.player.scene !== this) {
      this.player.scene.remove(this.player);
    }

    const entryPoint = engine._nextSceneEntryPoint || "default";
    delete engine._nextSceneEntryPoint;

    this.player.pos = this.getSpawnPosition(entryPoint);

    this.add(this.player);
  }

  onDeactivate(): void {
    if (this.spawnInterval) {
      this.spawnInterval.stop();
      this.remove(this.spawnInterval);
      this.spawnInterval = null;
    }
  }

  protected getSpawnPosition(entryPoint: string): ex.Vector {
    const spawns = this.config.spawnPoints || {};

    if (spawns[entryPoint]) {
      return spawns[entryPoint];
    }

    return ex.vec(this.levelWidth / 2, this.levelHeight / 2);
  }

  private setupEnemySpawning(): void {
    if (!this.AUTO_SPAWN_ENEMIES) return;

    this.spawnInterval = new ex.Timer({
      interval: 20000, // 20 seconds
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

    // Log all actors in the scene
    console.log("=== SCENE ACTORS AFTER SPAWN ===");
    console.log(`Total actors: ${this.actors.length}`);

    // Group actors by type
    const actorsByType: Record<string, number> = {};
    this.actors.forEach((actor) => {
      const type = actor.name?.split("_")[0] || "unnamed";
      actorsByType[type] = (actorsByType[type] || 0) + 1;
    });

    console.log("Actors by type:", actorsByType);

    // Show alive vs killed
    const aliveActors = this.actors.filter((a) => !a.isKilled()).length;
    const killedActors = this.actors.filter((a) => a.isKilled()).length;
    console.log(`Alive: ${aliveActors}, Killed: ${killedActors}`);
    console.log("================================");
  }

  protected createExits(engine: GameEngine): void {
    this.config.exits?.forEach((exit) => {
      const trigger = new ex.Actor({
        name: `exit_to_${exit.targetScene}`,
        pos: ex.vec(exit.x, exit.y),
        width: exit.width,
        height: exit.height,
        collisionType: ex.CollisionType.Passive,
        collisionGroup: ex.CollisionGroup.collidesWith([
          CollisionGroups.Player,
        ]),
        z: 100,
      });

      trigger.on("collisionstart", (evt: ex.CollisionStartEvent) => {
        if (evt.other.owner instanceof ex.Actor && this.player) {
          this.transitionTo(engine, exit.targetScene, exit.targetEntry);
        }
      });

      this.add(trigger);
    });
  }

  private createEnemies(enemies: EnemyConfig[]) {
    enemies.forEach((enemyConfig) => {
      this.spawnEnemy(enemyConfig);
    });
  }

  private spawnEnemy(enemyConfig: EnemyConfig): void {
    const enemy = new Enemy(enemyConfig);

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
    engine.goToScene(sceneName);
  }

  protected rebuildBackground(engine: GameEngine): void {
    const backgroundActors = this.actors.filter((actor) => actor.z < 0);
    backgroundActors.forEach((actor) => {
      this.remove(actor);
    });

    const oldGroundActor = this.actors.find((actor) => actor.name === "ground");
    const ground = this.getGroundFromSeason(engine);
    this.add(ground);
    if (oldGroundActor) {
      this.remove(oldGroundActor);
    }

    this.createBackground(engine);
    engine.timeCycle.starField?.createStars(this);
  }

  protected createBackground(engine: GameEngine): void {
    const season = engine.timeCycle.getCurrentSeason();
    const theme =
      season === "winter" ? "winter" : season === "fall" ? "fall" : "normal";
    const backgrounds = BackgroundResources[theme];

    const layers = [
      { resource: backgrounds.layer5, speed: -0.6 },
      { resource: backgrounds.layer5Night, speed: -0.6, isNightLayer: true },
      { resource: backgrounds.layer4, speed: -0.5 },
      { resource: backgrounds.layer4Night, speed: -0.5, isNightLayer: true },
      { resource: backgrounds.layer3, speed: -0.4 },
      { resource: backgrounds.layer2, speed: -0.3 },
      { resource: backgrounds.layer1, speed: -0.2 },
    ];

    const bgWidth = 1024;
    const bgHeight = 346;

    const viewportHeight = engine.drawHeight;

    const zoom = this.camera.zoom;
    const effectiveViewportHeight = viewportHeight / zoom;

    const baseScaleY = effectiveViewportHeight / bgHeight;
    const scaledWidth = bgWidth * baseScaleY;

    const maxParallaxOffset =
      (this.levelWidth / 2) * Math.max(...layers.map((l) => l.speed));
    const tilesNeeded =
      Math.ceil((this.levelWidth + maxParallaxOffset * 2) / scaledWidth) + 2;

    layers.forEach((layer, index) => {
      const startOffset = -Math.ceil(maxParallaxOffset / scaledWidth);

      const dayLayerIndex = layer.isNightLayer ? index - 1 : index;
      const visualIndex = dayLayerIndex > 1 ? Math.floor(dayLayerIndex / 2) : 0;
      const verticalScaleMultiplier = 1 + (4 - visualIndex) * 0.3;
      const scaleY = baseScaleY * verticalScaleMultiplier;

      const isFurthestLayer = visualIndex === 0;
      const yOffset = isFurthestLayer ? 0 : this.levelHeight * 0.05;

      for (let i = startOffset; i < tilesNeeded + startOffset; i++) {
        const sprite = layer.resource.toSprite();

        sprite.scale = ex.vec(baseScaleY, scaleY);

        const zIndex = layer.isNightLayer ? -99.5 + index : -100 + index;

        const background = new ex.Actor({
          pos: ex.vec(i * scaledWidth, this.levelHeight / 2 + yOffset),
          anchor: ex.vec(0, 0.5),
          z: zIndex,
        });

        background.graphics.use(sprite);

        if (layer.isNightLayer) {
          sprite.opacity = 0;
        }

        const initialX = i * scaledWidth;

        background.on("preupdate", () => {
          if (this.player && this.camera) {
            const cameraPos = this.camera.pos;
            const parallaxOffset =
              (cameraPos.x - this.levelWidth / 2) * layer.speed;

            background.pos = ex.vec(
              initialX - parallaxOffset,
              cameraPos.y + yOffset
            );

            if (layer.isNightLayer) {
              const nightData = engine.timeCycle.calculateNightEffect(
                engine.timeCycle.getTimeOfDay()
              );
              sprite.opacity = nightData.opacity / 0.8;
            }
          }
        });

        this.add(background);
      }
      engine.timeCycle.starField?.createStars(this);
    });
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
      width: width,
      height: height,
      collisionType: ex.CollisionType.Fixed,
      collisionGroup: CollisionGroups.Environment,
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
  getGroundFromSeason(engine: GameEngine): ex.Actor {
    if (!this.groundTileManager) {
      return new ex.Actor({
        name: "ground",
        pos: ex.vec(this.levelWidth / 2, this.levelHeight - 10),
        width: this.levelWidth,
        height: 20,
        color: ex.Color.Green,
        collisionType: ex.CollisionType.Fixed,
        collisionGroup: CollisionGroups.Environment,
      });
    }

    const season = engine.timeCycle.getCurrentSeason();
    const theme =
      season === "winter" ? "winter" : season === "fall" ? "fall" : "normal";

    const ground = new ex.Actor({
      name: "ground",
      pos: ex.vec(this.levelWidth / 2, this.levelHeight - 10),
      width: this.levelWidth,
      height: 20,
      collisionType: ex.CollisionType.Fixed,
      collisionGroup: CollisionGroups.Environment,
    });

    const groundCanvas = this.groundTileManager.createGroundCanvasElement(
      this.levelWidth,
      20,
      theme
    );

    const canvasGraphic = new ex.Canvas({
      width: this.levelWidth,
      height: 20,
      draw: (ctx) => {
        ctx.drawImage(groundCanvas, 0, 0);
      },
    });

    ground.graphics.use(canvasGraphic);

    return ground;
  }

  protected createLevel(engine: GameEngine): void {
    this.createBackground(engine);
    this.createPlatforms();

    const ground = this.getGroundFromSeason(engine);
    this.add(ground);

    const exitLabel = new ex.Label({
      text: "Forest →",
      pos: ex.vec(2350, this.levelHeight - 100),
      font: new ex.Font({
        size: 20,
        color: ex.Color.Black,
      }),
    });
    this.add(exitLabel);
  }
}
