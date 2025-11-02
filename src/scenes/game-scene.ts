import * as ex from "excalibur";
import { Player } from "../actors/player/player";
import { GameEngine } from "../engine/game-engine";
import type { WeaponItem } from "../actors/character/types";
import type { BackgroundLayer, SceneConfig } from "./types";
import { CollisionGroups } from "../actors/config";
import { Enemy } from "../actors/enemy/enemy";
import type { EnemyConfig } from "../actors/enemy/types";
import { GroundTileManager } from "./ground-tile-manager";
import { BackgroundResources, FloorResources } from "../resources";
import { createItem } from "../items/item-creator";
import { Tree } from "../actors/resources/tree/tree";
import { Ore } from "../actors/resources/ore/ore";
import { DecorationManager } from "../sprite-sheets/scenery/decorations/decorations-manager";
import { DecorationResources } from "../resources/decoration-resources";
import { createForestDecorationLayer } from "./create-forest-decoration-layer";
import { BuildingManager } from "../building-manager/building-manager";
import { BuildingInput } from "../building-manager/building-input";
import { BuildingResources } from "../resources/building-resources";

export class GameMapScene extends ex.Scene {
  public name: string = "unknown";
  public config: SceneConfig;
  public player: Player | null = null;
  public levelWidth: number;
  public levelHeight: number;
  private groundTileManager = new GroundTileManager(FloorResources.floor1);
  private decorationManager: DecorationManager | null = null;
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
    this.decorationManager = new DecorationManager(
      DecorationResources.decorations
    );
  }

  async onInitialize(engine: GameEngine): Promise<void> {
    this.player = engine.player;
    this.groundTileManager.setTheme("normal", 0, 0, 1, 2);
    this.groundTileManager.setTheme("fall", 3, 0, 1, 2);
    this.groundTileManager.setTheme("winter", 6, 0, 1, 2);

    if (!this.player) {
      console.error("No player found!");
      return;
    }

    this.buildingManager = new BuildingManager(
      this,
      this.player,
      BuildingResources.house_tiles
    );

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

    setTimeout(() => {
      if (this.player) this.add(this.player);
    }, 100);

    engine.forceSingleUpdate();
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

    const oldGroundActor = this.actors.find((actor) => actor.name === "ground");
    const ground = this.getGroundFromSeason(engine);
    this.add(ground);
    if (oldGroundActor) {
      this.remove(oldGroundActor);
    }

    this.createBackground(engine);
    engine.timeCycle.starField?.createStars(this);
  }

  protected async createBackground(engine: GameEngine): Promise<void> {
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
        parallax: ex.vec(0.7, 0.7),
        z: -94,
      },

      createForestDecorationLayer({
        engine,
        sceneType: this.config.type,
        seed: this.hashString(`${this.name}-0`),
        z: -93.5,
        parallax: 0.75,
        decorationManager: this.decorationManager,
        density: this.config.type === "forest" ? 0.005 : 0.002,
      }),

      this.config.type === "forest"
        ? createForestDecorationLayer({
            engine,
            sceneType: this.config.type,

            seed: this.hashString(`${this.name}-92.5`),
            z: -92.5,
            parallax: 0.8,
            decorationManager: this.decorationManager,
          })
        : null,

      createForestDecorationLayer({
        engine,
        sceneType: this.config.type,

        seed: this.hashString(`${this.name}-92`),
        z: -92,
        parallax: 0.85,
        decorationManager: this.decorationManager,
        density: this.config.type === "forest" ? 0.005 : 0.002,
      }),

      this.config.type === "forest"
        ? createForestDecorationLayer({
            engine,
            sceneType: this.config.type,

            seed: this.hashString(`${this.name}-91.5`),
            z: -91.5,
            parallax: 0.9,
            decorationManager: this.decorationManager,
          })
        : null,

      createForestDecorationLayer({
        engine,
        sceneType: this.config.type,
        seed: this.hashString(`${this.name}-91`),
        z: -91,
        parallax: 0.95,
        decorationManager: this.decorationManager,
        density: this.config.type === "forest" ? 0.005 : 0.002,
      }),
    ].filter((layer) => !!layer);

    for (const layer of layers) {
      const resolvedLayer = await Promise.resolve(layer);

      if ("isDecoration" in resolvedLayer && resolvedLayer.isDecoration) {
        if (!resolvedLayer.canvas) {
          continue;
        }
        const parallaxFactor = resolvedLayer.parallax.y;
        const decorationWidth = resolvedLayer.canvas.width;
        const decorationHeight = resolvedLayer.canvas.height;

        const decorationTilesNeeded =
          Math.ceil(this.levelWidth / decorationWidth) + 2;

        for (let i = -1; i < decorationTilesNeeded; i++) {
          const y =
            ((this.levelHeight || 0) - decorationHeight / 2) * parallaxFactor;
          const x =
            ((i * decorationWidth + decorationWidth) * parallaxFactor) / 2;

          const decorationLayer = new ex.Actor({
            name: `decoration_layer_${i}`,
            pos: ex.vec(x, y),
            anchor: ex.vec(0.5, 0.5),
            z: resolvedLayer.z,
          });

          decorationLayer.graphics.use(resolvedLayer.canvas);
          decorationLayer.addComponent(
            new ex.ParallaxComponent(resolvedLayer.parallax)
          );

          this.add(decorationLayer);
        }
      } else if (resolvedLayer.isSky) {
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
          const sprite = resolvedLayer.resource?.toSprite();
          if (!sprite) {
            continue;
          }

          const parallaxFactor = resolvedLayer.parallax.y;

          const y =
            ((this.levelHeight || 0) - sprite.height / 2) * parallaxFactor;
          const x = i * bgWidth + bgWidth / 2;

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
    const groundHeight = 32;
    const groundPadding = 200;
    const extendedWidth = this.levelWidth + groundPadding * 2;

    if (!this.groundTileManager) {
      return new ex.Actor({
        name: "ground",
        pos: ex.vec(this.levelWidth / 2, this.levelHeight - groundHeight / 2),
        width: extendedWidth,
        height: groundHeight,
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
      pos: ex.vec(this.levelWidth / 2, this.levelHeight - groundHeight / 2),
      width: extendedWidth,
      height: groundHeight,
      collisionType: ex.CollisionType.Fixed,
      collisionGroup: CollisionGroups.Environment,
    });

    const groundCanvas = this.groundTileManager.createGroundCanvasElement(
      extendedWidth,
      groundHeight,
      theme
    );

    const canvasGraphic = new ex.Canvas({
      width: extendedWidth,
      height: groundHeight,
      draw: (ctx) => {
        ctx.drawImage(groundCanvas, 0, 0);
      },
    });

    ground.graphics.use(canvasGraphic);

    return ground;
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
    await this.createBackground(engine);
    this.createPlatforms();

    const ground = this.getGroundFromSeason(engine);
    this.add(ground);

    this.createTrees();
    this.createOres();

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

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
