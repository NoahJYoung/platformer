// Example: How to integrate the world generator into your game

import * as ex from "excalibur";

import type { GameEngine } from "../game-engine";

import { GameMapScene } from "../scenes/game-scene";
import type { SceneConfig } from "../scenes/types";
import { ProceduralWorldGenerator } from "./world-generator";

// ===== OPTION 1: Generate a completely procedural world =====
export function generateProceduralWorld(engine: GameEngine): void {
  const generator = new ProceduralWorldGenerator({
    seed: 12345, // Use same seed for reproducible worlds
    numberOfScenes: 10,
    minWidth: 2400,
    maxWidth: 3600,
    minHeight: 800,
    maxHeight: 1200,
    platformDensity: "medium",
    treeDensity: "high",
    enemyDensity: "medium",
  });

  const scenes = generator.generateWorld();

  // Add all generated scenes to the engine
  scenes.forEach((sceneConfig) => {
    const scene = new GameMapScene(sceneConfig);
    engine.addScene(sceneConfig.name, scene);
  });

  // Save the world configuration for later
  const worldJson = generator.serializeWorld();
  console.log("World generated and serialized:", worldJson);

  // Go to first scene
  engine.goToScene(scenes[0].name);
}

// ===== OPTION 2: Mix handcrafted and procedural scenes =====
export function generateMixedWorld(engine: GameEngine): void {
  // Define your handcrafted scenes
  const tutorialScene: SceneConfig = {
    type: "forest",
    name: "tutorial",
    backgroundTheme: "normal",
    width: 2400,
    height: 800,
    spawnPoints: {
      default: ex.vec(200, 700),
    },
    platforms: [
      { x: 400, y: 750, width: 160, height: 64 },
      { x: 600, y: 700, width: 120, height: 20 },
    ],
    enemies: [],
    materialSources: {
      trees: [
        { x: 800, y: 780 },
        { x: 1000, y: 780 },
      ],
    },
  };

  const bossScene: SceneConfig = {
    type: "forest",
    name: "boss_arena",
    backgroundTheme: "winter",
    width: 2000,
    height: 800,
    spawnPoints: {
      default: ex.vec(200, 700),
    },
    platforms: [],
    enemies: [
      {
        name: "boss",
        pos: ex.vec(1500, 700),
        appearanceOptions: {
          sex: "male",
          skinTone: 5,
          hairStyle: 1,
          displayName: "Forest Guardian",
        },
        facingRight: false,
        attributes: {
          strength: 20,
          vitality: 30,
          agility: 15,
          intelligence: 10,
        },
      },
    ],
    materialSources: {
      trees: [],
    },
  };

  // Create generator with handcrafted scenes at specific positions
  const generator = new ProceduralWorldGenerator({
    seed: 54321,
    numberOfScenes: 12,
    platformDensity: "medium",
    treeDensity: "medium",
    enemyDensity: "low",
    handcraftedScenes: new Map([
      [0, tutorialScene], // First scene is tutorial
      [11, bossScene], // Last scene is boss arena
    ]),
  });

  const scenes = generator.generateWorld();

  // Add all scenes to engine
  scenes.forEach((sceneConfig) => {
    const scene = new GameMapScene(sceneConfig);
    engine.addScene(sceneConfig.name, scene);
  });

  // Start at tutorial
  engine.goToScene("tutorial");
}

// ===== OPTION 3: Load a saved world =====
export function loadSavedWorld(engine: GameEngine, worldJson: string): void {
  const scenes = ProceduralWorldGenerator.deserializeWorld(worldJson);

  scenes.forEach((sceneConfig) => {
    const scene = new GameMapScene(sceneConfig);
    engine.addScene(sceneConfig.name, scene);
  });

  // Go to first scene
  if (scenes.length > 0) {
    engine.goToScene(scenes[0].name);
  }
}

// ===== OPTION 4: Save and load with localStorage =====
export class WorldManager {
  private static STORAGE_KEY = "procedural_world";

  static saveWorld(generator: ProceduralWorldGenerator): void {
    const worldJson = generator.serializeWorld();
    localStorage.setItem(this.STORAGE_KEY, worldJson);
    console.log("World saved to localStorage");
  }

  static loadWorld(engine: GameEngine): boolean {
    const worldJson = localStorage.getItem(this.STORAGE_KEY);

    if (!worldJson) {
      console.log("No saved world found");
      return false;
    }

    try {
      loadSavedWorld(engine, worldJson);
      console.log("World loaded from localStorage");
      return true;
    } catch (error) {
      console.error("Failed to load world:", error);
      return false;
    }
  }

  static clearWorld(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log("Saved world cleared");
  }

  static hasWorldSave(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }
}

// ===== Simple debugging utility =====
export function debugWorldGeneration(): void {
  const generator = new ProceduralWorldGenerator({
    seed: 12345,
    numberOfScenes: 3,
    platformDensity: "medium",
    treeDensity: "medium",
    enemyDensity: "low",
  });

  const scenes = generator.generateWorld();

  console.log("===== GENERATED WORLD =====");
  scenes.forEach((scene, index) => {
    console.log(`\nScene ${index}: ${scene.name}`);
    console.log(`  Size: ${scene.width}x${scene.height}`);
    console.log(`  Theme: ${scene.backgroundTheme}`);
    console.log(`  Platforms: ${scene.platforms?.length || 0}`);
    console.log(`  Trees: ${scene.materialSources?.trees.length || 0}`);
    console.log(`  Enemies: ${scene.enemies?.length || 0}`);
    console.log(`  Exits: ${scene.exits?.length || 0}`);
    console.log(`  Spawn Points:`, Object.keys(scene.spawnPoints || {}));
  });

  console.log("\n===== SERIALIZED WORLD =====");
  console.log(generator.serializeWorld());
}

// ===== Test scene connectivity =====
export function testSceneConnections(scenes: SceneConfig[]): void {
  console.log("===== TESTING SCENE CONNECTIONS =====\n");

  scenes.forEach((scene) => {
    console.log(`Scene: ${scene.name}`);

    // Check exits
    if (scene.exits && scene.exits.length > 0) {
      scene.exits.forEach((exit) => {
        console.log(
          `  Exit -> ${exit.targetScene} (entry: ${exit.targetEntry})`
        );

        // Verify target scene exists
        const targetScene = scenes.find((s) => s.name === exit.targetScene);
        if (!targetScene) {
          console.error(
            `    ERROR: Target scene "${exit.targetScene}" not found!`
          );
        } else {
          // Verify target entry point exists
          if (
            targetScene.spawnPoints &&
            targetScene.spawnPoints[exit.targetEntry]
          ) {
            console.log(`    ✓ Target spawn point exists`);
          } else {
            console.error(
              `    ERROR: Target spawn point "${exit.targetEntry}" not found in ${exit.targetScene}!`
            );
            console.log(
              `    Available spawn points:`,
              Object.keys(targetScene.spawnPoints || {})
            );
          }
        }
      });
    } else {
      console.log(`  No exits`);
    }

    // Check spawn points
    if (scene.spawnPoints) {
      console.log(`  Spawn points:`, Object.keys(scene.spawnPoints).join(", "));
    }

    console.log("");
  });
}
