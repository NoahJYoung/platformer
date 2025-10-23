import * as ex from "excalibur";
import type { EnemyConfig } from "../actors/enemy/types";
import type { SceneConfig, PlatformConfig, TreeConfig } from "../scenes/types";
import {
  getHeightByTreeType,
  type TreeType,
} from "../actors/resources/tree/tree-types";

const TREE_WIDTH = 64;
const GROUND_HEIGHT = 32;

export interface WorldGeneratorConfig {
  seed?: number;
  numberOfScenes: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  platformDensity?: "low" | "medium" | "high";
  treeDensity?: "low" | "medium" | "high";
  enemyDensity?: "low" | "medium" | "high";
  handcraftedScenes?: Map<number, SceneConfig>;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ProceduralWorldGenerator {
  private config: Required<WorldGeneratorConfig>;
  private rng: SeededRandom;
  private generatedScenes: SceneConfig[] = [];

  constructor(config: WorldGeneratorConfig) {
    this.config = {
      seed: config.seed ?? Date.now(),
      numberOfScenes: config.numberOfScenes,
      minWidth: config.minWidth ?? 2400,
      maxWidth: config.maxWidth ?? 3600,
      minHeight: config.minHeight ?? 800,
      maxHeight: config.maxHeight ?? 1200,
      platformDensity: config.platformDensity ?? "medium",
      treeDensity: config.treeDensity ?? "medium",
      enemyDensity: config.enemyDensity ?? "low",
      handcraftedScenes: config.handcraftedScenes ?? new Map(),
    };

    this.rng = new SeededRandom(this.config.seed);
  }

  /**
   * Generate all scenes in the world
   */
  public generateWorld(): SceneConfig[] {
    this.generatedScenes = [];

    for (let i = 0; i < this.config.numberOfScenes; i++) {
      if (this.config.handcraftedScenes.has(i)) {
        const handcrafted = this.config.handcraftedScenes.get(i)!;
        this.generatedScenes.push(handcrafted);
      } else {
        const scene = this.generateScene(i);
        this.generatedScenes.push(scene);
      }
    }

    this.connectScenes();

    return this.generatedScenes;
  }

  /**
   * Generate a single scene
   */
  private generateScene(index: number): SceneConfig {
    const useExtraLarge = this.rng.next() < 0.1;
    const useLarge = !useExtraLarge && this.rng.next() < 0.3;

    let width: number;
    let height: number;

    if (useExtraLarge) {
      width = this.rng.nextInt(3000, this.config.maxWidth);
      height = this.rng.nextInt(1000, Math.min(1400, this.config.maxHeight));
    } else if (useLarge) {
      width = this.rng.nextInt(2800, 3200);
      height = this.rng.nextInt(900, 1100);
    } else {
      width = this.rng.nextInt(this.config.minWidth, 2800);
      height = this.rng.nextInt(this.config.minHeight, 1000);
    }

    const sceneName = `forest-${index + 1}`;

    const themeRoll = this.rng.next();
    const backgroundTheme =
      themeRoll < 0.6 ? "normal" : themeRoll < 0.8 ? "fall" : "winter";

    const platforms = this.generatePlatforms(width, height);
    const surfacePoints = this.getAllSurfacePoints(platforms, width, height);
    const trees = this.generateTrees(surfacePoints, platforms);
    const enemies = this.generateEnemies(surfacePoints, trees, index);

    const scene: SceneConfig = {
      type: "forest",
      name: sceneName,
      backgroundTheme,
      width,
      height,
      spawnPoints: {},
      exits: [],
      platforms,
      materialSources: {
        trees,
      },
      enemies,
    };

    return scene;
  }

  /**
   * Generate platforms for a scene
   */
  private generatePlatforms(
    sceneWidth: number,
    sceneHeight: number
  ): PlatformConfig[] {
    const platforms: PlatformConfig[] = [];

    const densityMultiplier = {
      low: 0.7,
      medium: 1.0,
      high: 1.4,
    }[this.config.platformDensity];

    const basePlatformCount = Math.floor(
      (sceneWidth / 200) * densityMultiplier
    );
    const platformCount = this.rng.nextInt(
      Math.max(3, basePlatformCount - 2),
      basePlatformCount + 3
    );

    const numberOfPaths = this.rng.nextInt(2, 4);
    const platformsPerPath = Math.floor(platformCount / numberOfPaths);

    for (let pathIdx = 0; pathIdx < numberOfPaths; pathIdx++) {
      const startX =
        (sceneWidth / numberOfPaths) * pathIdx + this.rng.nextInt(100, 300);
      const startHeight = sceneHeight - this.rng.nextInt(400, 600);

      let currentX = startX;
      let currentY = startHeight;

      for (let i = 0; i < platformsPerPath; i++) {
        const platformWidth = this.rng.nextInt(80, 200);
        const platformHeight = 20;

        platforms.push({
          x: currentX,
          y: currentY,
          width: platformWidth,
          height: platformHeight,
        });

        const horizontalGap = this.rng.nextInt(80, 150);
        const verticalChange = this.rng.nextInt(-80, 80);

        currentX += platformWidth + horizontalGap;
        currentY = Math.max(
          200,
          Math.min(sceneHeight - 200, currentY + verticalChange)
        );

        if (currentX > sceneWidth - 200) break;
      }
    }

    const randomPlatforms = this.rng.nextInt(2, 5);
    for (let i = 0; i < randomPlatforms; i++) {
      platforms.push({
        x: this.rng.nextInt(200, sceneWidth - 200),
        y: this.rng.nextInt(200, sceneHeight - 200),
        width: this.rng.nextInt(80, 150),
        height: 20,
      });
    }

    return platforms;
  }

  /**
   * Get all surface points where trees can be placed (ground and platforms)
   */
  private getAllSurfacePoints(
    platforms: PlatformConfig[],
    sceneWidth: number,
    sceneHeight: number
  ): Rectangle[] {
    const surfaces: Rectangle[] = [];

    surfaces.push({
      x: 0,
      y: sceneHeight - GROUND_HEIGHT,
      width: sceneWidth,
      height: GROUND_HEIGHT,
    });

    platforms.forEach((platform) => {
      surfaces.push({
        x: platform.x - platform.width / 2,
        y: platform.y - platform.height / 2,
        width: platform.width,
        height: platform.height,
      });
    });

    return surfaces;
  }

  /**
   * Generate trees on available surfaces
   */
  private generateTrees(
    surfaces: Rectangle[],
    platforms: PlatformConfig[]
  ): TreeConfig[] {
    const trees: TreeConfig[] = [];

    const densityMultiplier = {
      low: 0.5,
      medium: 1.0,
      high: 1.5,
    }[this.config.treeDensity];

    surfaces.forEach((surface) => {
      const maxTrees = Math.floor(surface.width / (TREE_WIDTH * 1.5));
      const numberOfTrees = Math.floor(
        this.rng.nextInt(1, Math.max(2, maxTrees)) * densityMultiplier
      );

      for (let i = 0; i < numberOfTrees; i++) {
        let attempts = 0;
        let placed = false;
        const treeType = this.getRandomTreeType();

        while (attempts < 10 && !placed) {
          const treeX =
            surface.x +
            this.rng.nextInt(TREE_WIDTH / 2, surface.width - TREE_WIDTH / 2);

          const treeY = surface.y - getHeightByTreeType("apple-tree") / 2;
          const collides = trees.some((existingTree) =>
            this.checkCollision(
              {
                x: treeX,
                y: treeY,
                width: TREE_WIDTH,
                height: getHeightByTreeType(treeType),
              },
              {
                x: existingTree.x,
                y: existingTree.y,
                width: TREE_WIDTH,
                height: getHeightByTreeType(treeType),
              }
            )
          );

          if (!collides) {
            trees.push({ x: treeX, y: treeY, type: treeType });
            placed = true;
          }

          attempts++;
        }
      }
    });

    return trees;
  }

  private getRandomTreeType(): TreeType {
    const roll = this.rng.next();

    if (roll < 0.35) {
      return "pine-tree";
    } else if (roll < 0.65) {
      return "birch-tree";
    } else if (roll < 0.82) {
      return "willow-tree";
    } else {
      return "apple-tree";
    }
  }

  /**
   * Generate enemies for a scene
   */
  private generateEnemies(
    surfaces: Rectangle[],
    trees: TreeConfig[],
    sceneIndex: number
  ): EnemyConfig[] {
    const enemies: EnemyConfig[] = [];

    const densityMultiplier = {
      low: 0.5,
      medium: 1.0,
      high: 1.5,
    }[this.config.enemyDensity];

    const difficultyScaling = 1 + sceneIndex * 0.2;

    const baseEnemyCount = Math.floor(2 * densityMultiplier);
    const enemyCount = this.rng.nextInt(
      Math.max(1, baseEnemyCount - 1),
      baseEnemyCount + 2
    );

    const groundSurface = surfaces[0];

    for (let i = 0; i < enemyCount; i++) {
      let attempts = 0;
      let placed = false;

      while (attempts < 20 && !placed) {
        const enemyX = this.rng.nextInt(
          groundSurface.x + 200,
          groundSurface.x + groundSurface.width - 200
        );
        const enemyY = groundSurface.y;

        const collidesWithTree = trees.some(
          (tree) => Math.abs(tree.x - enemyX) < TREE_WIDTH + 50
        );

        const tooCloseToEnemy = enemies.some(
          (enemy) => Math.abs(enemy.pos.x - enemyX) < 200
        );

        if (!collidesWithTree && !tooCloseToEnemy) {
          const sex = this.rng.next() > 0.5 ? "male" : "female";
          const baseLevel = Math.floor(3 + sceneIndex * 1.5);

          enemies.push({
            name: `enemy_${sceneIndex}_${i}`,
            pos: ex.vec(enemyX, enemyY),
            appearanceOptions: {
              sex,
              skinTone: this.rng.nextInt(1, 6) as 1 | 2 | 3 | 4 | 5,
              hairStyle: this.rng.nextInt(1, 6) as 1 | 2 | 3 | 4 | 5,
              displayName: `Enemy ${i + 1}`,
            },
            facingRight: this.rng.next() > 0.5,
            attributes: {
              strength: Math.floor(baseLevel * difficultyScaling),
              vitality: Math.floor(baseLevel * difficultyScaling),
              agility: Math.floor(baseLevel * difficultyScaling),
              intelligence: Math.floor(baseLevel * difficultyScaling),
            },
          });
          placed = true;
        }

        attempts++;
      }
    }

    return enemies;
  }

  private connectScenes(): void {
    for (let i = 0; i < this.generatedScenes.length; i++) {
      const scene = this.generatedScenes[i];
      const prevScene = i > 0 ? this.generatedScenes[i - 1] : null;
      const nextScene =
        i < this.generatedScenes.length - 1
          ? this.generatedScenes[i + 1]
          : null;

      scene.spawnPoints = scene.spawnPoints || {};
      scene.exits = scene.exits || [];

      const groundLevel = scene.height - GROUND_HEIGHT - 50;
      scene.spawnPoints.default = ex.vec(scene.width / 2, groundLevel);

      if (nextScene) {
        const exitHeight = 200;
        scene.exits.push({
          x: scene.width - 10,
          y: scene.height - exitHeight / 2,
          width: 20,
          height: exitHeight,
          targetScene: nextScene.name,
          targetEntry: `from_${scene.name}`,
        });

        nextScene.spawnPoints = nextScene.spawnPoints || {};
        const nextGroundLevel = nextScene.height - GROUND_HEIGHT - 50;
        nextScene.spawnPoints[`from_${scene.name}`] = ex.vec(
          100,
          nextGroundLevel
        );
      }

      if (prevScene) {
        const exitHeight = 200;
        scene.exits.push({
          x: 10,
          y: scene.height - exitHeight / 2,
          width: 20,
          height: exitHeight,
          targetScene: prevScene.name,
          targetEntry: `from_${scene.name}`,
        });

        prevScene.spawnPoints = prevScene.spawnPoints || {};
        const prevGroundLevel = prevScene.height - GROUND_HEIGHT - 50;
        prevScene.spawnPoints[`from_${scene.name}`] = ex.vec(
          prevScene.width - 100,
          prevGroundLevel
        );
      }
    }
  }

  /**
   * Check if two rectangles collide
   */
  private checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(
      rect1.x + rect1.width / 2 < rect2.x - rect2.width / 2 ||
      rect1.x - rect1.width / 2 > rect2.x + rect2.width / 2 ||
      rect1.y + rect1.height < rect2.y ||
      rect1.y > rect2.y + rect2.height
    );
  }

  /**
   * Serialize the world configuration to JSON
   */
  public serializeWorld(): string {
    return JSON.stringify(
      {
        seed: this.config.seed,
        scenes: this.generatedScenes,
        config: {
          numberOfScenes: this.config.numberOfScenes,
          platformDensity: this.config.platformDensity,
          treeDensity: this.config.treeDensity,
          enemyDensity: this.config.enemyDensity,
        },
      },
      null,
      2
    );
  }

  /**
   * Deserialize a world from JSON
   */
  public static deserializeWorld(json: string): SceneConfig[] {
    const data = JSON.parse(json);

    data.scenes.forEach((scene: SceneConfig) => {
      if (scene.spawnPoints) {
        Object.keys(scene.spawnPoints).forEach((key) => {
          const point =
            scene.spawnPoints![key as keyof Record<string, ex.Vector>];

          scene.spawnPoints![key] = ex.vec(point.x, point.y);
        });
      }

      if (scene.enemies) {
        scene.enemies.forEach((enemy: EnemyConfig) => {
          enemy.pos = ex.vec(enemy.pos.x, enemy.pos.y);
        });
      }
    });

    return data.scenes;
  }
}

/**
 * Seeded random number generator for reproducible world generation
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  public next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Generate random integer between min (inclusive) and max (exclusive)
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
}
