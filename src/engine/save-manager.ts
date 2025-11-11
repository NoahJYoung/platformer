import * as ex from "excalibur";
import type { GameEngine } from "../engine/game-engine";
import type { Season } from "../environment/time-cycle";
import type { EquipmentSlot } from "../actors/character/types";
import type { SceneConfig } from "../scenes/types";
import { createItem } from "../items/item-creator";
import { Player as PlayerClass } from "../actors/player/player";
import { StatsSystem } from "../actors/character/stats-system";
import { GameMapScene } from "../scenes/game-scene";
import { HUD } from "../hud/hud";

interface SaveData {
  version: string;
  timestamp: number;
  playerData: {
    currentScene: string;
    position: { x: number; y: number };

    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    mana: number;
    maxMana: number;
    hunger: number;
    thirst: number;

    isRunMode: boolean;

    sex: "male" | "female";
    skinTone: number;
    hairStyle: number;
    displayName: string;

    statsSystem: {
      stats: any;
      xpGainRates: any;
    };

    inventory: {
      items: Array<{
        slot: number;
        itemKey: string;
        quantity: number;
        charges?: number;
      }>;
    };

    equipment: {
      slots: Array<{
        slot: EquipmentSlot;
        itemKey: string;
      }>;
    };
  };

  worldData: {
    seed: number;
    currentSceneIndex: number;
    scenes: any[];
  };

  timeCycleData: {
    timeOfDay: number;
    season: Season;
    dayInSeason: number;
    weather: string;
  };
}

export class SaveManager {
  private static readonly SAVE_KEY_PREFIX = "game_save_";
  private static readonly SAVE_VERSION = "1.0.0";
  private static readonly MAX_SAVE_SLOTS = 3;

  /**
   * Save the current game state to a specific slot
   */
  public static saveGame(engine: GameEngine, slot: number = 0): boolean {
    try {
      if (slot < 0 || slot >= this.MAX_SAVE_SLOTS) {
        console.error(`Invalid save slot: ${slot}`);
        return false;
      }

      if (!engine.player) {
        console.error("Cannot save: no player found");
        return false;
      }

      const saveData = this.serializeGameState(engine);
      const saveKey = `${this.SAVE_KEY_PREFIX}${slot}`;

      localStorage.setItem(saveKey, JSON.stringify(saveData));

      console.log(`Game saved to slot ${slot}`);
      engine.showMessage("Game saved successfully!", "success");

      return true;
    } catch (error) {
      console.error("Failed to save game:", error);
      engine.showMessage("Failed to save game!", "danger");
      return false;
    }
  }

  /**
   * Load game state from a specific slot
   */
  public static loadGame(engine: GameEngine, slot: number = 0): boolean {
    try {
      if (slot < 0 || slot >= this.MAX_SAVE_SLOTS) {
        console.error(`Invalid save slot: ${slot}`);
        return false;
      }

      const saveKey = `${this.SAVE_KEY_PREFIX}${slot}`;
      const saveDataString = localStorage.getItem(saveKey);

      if (!saveDataString) {
        console.error(`No save found in slot ${slot}`);
        engine.showMessage("No save file found!", "danger");
        return false;
      }

      const saveData: SaveData = JSON.parse(saveDataString);

      if (saveData.version !== this.SAVE_VERSION) {
        console.warn(
          `Save version mismatch: ${saveData.version} vs ${this.SAVE_VERSION}`
        );
      }

      this.deserializeGameState(engine, saveData);

      console.log(`Game loaded from slot ${slot}`);
      engine.showMessage("Game loaded successfully!", "success");

      return true;
    } catch (error) {
      console.error("Failed to load game:", error);
      engine.showMessage("Failed to load game!", "danger");
      return false;
    }
  }

  /**
   * Check if a save exists in a specific slot
   */
  public static hasSave(slot: number): boolean {
    const saveKey = `${this.SAVE_KEY_PREFIX}${slot}`;
    return localStorage.getItem(saveKey) !== null;
  }

  /**
   * Get save info for a specific slot (for UI display)
   */
  public static getSaveInfo(
    slot: number
  ): { timestamp: Date; playerName: string; level: number } | null {
    try {
      const saveKey = `${this.SAVE_KEY_PREFIX}${slot}`;
      const saveDataString = localStorage.getItem(saveKey);

      if (!saveDataString) return null;

      const saveData: SaveData = JSON.parse(saveDataString);

      return {
        timestamp: new Date(saveData.timestamp),
        playerName: saveData.playerData.displayName,
        level: this.calculateLevelFromStats(
          saveData.playerData.statsSystem.stats
        ),
      };
    } catch (error) {
      console.error(`Failed to get save info for slot ${slot}:`, error);
      return null;
    }
  }

  /**
   * Delete a save from a specific slot
   */
  public static deleteSave(slot: number): boolean {
    try {
      const saveKey = `${this.SAVE_KEY_PREFIX}${slot}`;
      localStorage.removeItem(saveKey);
      console.log(`Save deleted from slot ${slot}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete save from slot ${slot}:`, error);
      return false;
    }
  }

  /**
   * Serialize the current game state
   */
  private static serializeGameState(engine: GameEngine): SaveData {
    const player = engine.player!;
    const currentScene = engine.currentScene as GameMapScene;

    const inventoryItems = Array.from(player.inventory.getAllItems().entries())
      .filter(([_, slot]) => slot !== null)
      .map(([slotNum, slot]) => ({
        slot: slotNum,
        itemKey: slot!.item.key,
        quantity: slot!.quantity,
        charges: (slot!.item as any).charges,
      }));

    const equipmentSlots = Array.from(
      player.equipmentManager.getAllEquipped().entries()
    )
      .filter(([_, item]) => item !== null)
      .map(([slot, item]) => ({
        slot: slot,
        itemKey: item!.key,
      }));

    const allScenes = this.getAllScenes(engine);
    const currentSceneIndex = allScenes.findIndex(
      (s) => s.name === currentScene.name
    );

    const saveData: SaveData = {
      version: this.SAVE_VERSION,
      timestamp: Date.now(),

      playerData: {
        currentScene: currentScene.name,
        position: { x: player.pos.x, y: player.pos.y },

        health: player.health,
        maxHealth: player.maxHealth,
        energy: player.energy,
        maxEnergy: player.maxEnergy,
        mana: player.mana,
        maxMana: player.maxMana,
        hunger: player.getHunger(),
        thirst: player.getThirst(),

        isRunMode: player.isRunMode,

        sex: player.sex,
        skinTone: player.skinTone,
        hairStyle: player.hairStyle,
        displayName: player.displayName,

        statsSystem: {
          stats: player.statsSystem.getStats(),
          xpGainRates: (player.statsSystem as any).xpGainRates,
        },

        inventory: {
          items: inventoryItems,
        },

        equipment: {
          slots: equipmentSlots,
        },
      },

      worldData: {
        seed: (engine as any).worldSeed || Date.now(),
        currentSceneIndex: currentSceneIndex,
        scenes: this.serializeScenes(allScenes),
      },

      timeCycleData: {
        timeOfDay: engine.timeCycle.getTimeOfDay(),
        season: engine.timeCycle.getCurrentSeason(),
        dayInSeason: (engine.timeCycle as any).dayInSeason,
        weather: engine.timeCycle.getWeather(),
      },
    };

    return saveData;
  }

  /**
   * Deserialize and restore game state
   */
  private static deserializeGameState(
    engine: GameEngine,
    saveData: SaveData
  ): void {
    this.restoreWorld(engine, saveData.worldData);

    const player = new PlayerClass(
      ex.vec(saveData.playerData.position.x, saveData.playerData.position.y),
      {
        sex: saveData.playerData.sex,
        skinTone: saveData.playerData.skinTone as any,
        hairStyle: saveData.playerData.hairStyle as any,
        displayName: saveData.playerData.displayName,
      }
    );

    player.statsSystem = this.restoreStatsSystem(
      saveData.playerData.statsSystem
    );

    player.maxHealth = player.statsSystem.getMaxHealth();
    player.maxEnergy = player.statsSystem.getMaxEnergy();
    player.maxMana = player.statsSystem.getMaxMana();
    player.runSpeed = player.statsSystem.getRunSpeed();

    player.health = saveData.playerData.health;
    player.energy = saveData.playerData.energy;
    player.mana = saveData.playerData.mana;
    player.updateHunger(saveData.playerData.hunger - player.getHunger());
    player.updateThirst(saveData.playerData.thirst - player.getThirst());
    player.isRunMode = saveData.playerData.isRunMode;

    saveData.playerData.inventory.items.forEach((itemData) => {
      const item = createItem(itemData.itemKey, player.sex);
      if (item && itemData.charges !== undefined) {
        (item as any).charges = itemData.charges;
      }
      if (item) {
        player.inventory.addItem(itemData.slot, item, itemData.quantity);
      }
    });

    saveData.playerData.equipment.slots.forEach((slotData) => {
      const item = createItem(slotData.itemKey, player.sex);
      if (item) {
        player.equipItem(item as any);
      }
    });

    engine.player = player;

    (engine.timeCycle as any).timeOfDay = saveData.timeCycleData.timeOfDay;
    (engine.timeCycle as any).season = saveData.timeCycleData.season;
    (engine.timeCycle as any).dayInSeason = saveData.timeCycleData.dayInSeason;
    (engine.timeCycle as any).weather = saveData.timeCycleData.weather;

    engine.hud = new HUD(engine);

    engine.goToScene(saveData.playerData.currentScene);
  }

  /**
   * Restore the stats system from saved data
   */
  private static restoreStatsSystem(statsData: any): StatsSystem {
    const statsSystem = new StatsSystem(
      statsData.stats.vitality.baseValue,
      statsData.stats.strength.baseValue,
      statsData.stats.agility.baseValue,
      statsData.stats.intelligence.baseValue
    );

    (statsSystem as any).stats = statsData.stats;
    (statsSystem as any).xpGainRates = statsData.xpGainRates;

    return statsSystem;
  }

  /**
   * Restore the world from saved data
   */
  private static restoreWorld(engine: GameEngine, worldData: any): void {
    (engine as any).worldSeed = worldData.seed;

    const scenes = worldData.scenes.map((sceneData: any) => {
      if (sceneData.spawnPoints) {
        Object.keys(sceneData.spawnPoints).forEach((key) => {
          const point = sceneData.spawnPoints[key];
          sceneData.spawnPoints[key] = ex.vec(point.x, point.y);
        });
      }

      if (sceneData.enemies) {
        sceneData.enemies.forEach((enemy: any) => {
          enemy.pos = ex.vec(enemy.pos.x, enemy.pos.y);
        });
      }

      return sceneData as SceneConfig;
    });

    scenes.forEach((sceneConfig: SceneConfig) => {
      const scene = new GameMapScene(sceneConfig);
      engine.addScene(sceneConfig.name, scene);
    });
  }

  /**
   * Get all scenes from the engine
   */
  private static getAllScenes(engine: GameEngine): SceneConfig[] {
    const scenes: SceneConfig[] = [];

    const sceneMap = (engine as GameEngine).scenes;

    Object.keys(sceneMap).forEach((key) => {
      const scene = sceneMap[key];
      if (scene instanceof GameMapScene) {
        scenes.push((scene as GameMapScene).config);
      }
    });

    return scenes;
  }

  /**
   * Serialize scenes for saving
   */
  private static serializeScenes(scenes: SceneConfig[]): any[] {
    return scenes.map((scene) => ({
      ...scene,

      spawnPoints: scene.spawnPoints
        ? Object.fromEntries(
            Object.entries(scene.spawnPoints).map(([key, vec]) => [
              key,
              { x: vec.x, y: vec.y },
            ])
          )
        : undefined,
      enemies: scene.enemies?.map((enemy) => ({
        ...enemy,
        pos: { x: enemy.pos.x, y: enemy.pos.y },
      })),
    }));
  }

  /**
   * Calculate player level from stats
   */
  private static calculateLevelFromStats(stats: any): number {
    const values = Object.values(stats).map(
      (stat: any) => stat.baseValue
    ) as number[];
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  /**
   * Auto-save on scene transition
   */
  public static autoSave(engine: GameEngine): void {
    if (engine.player) {
      this.saveGame(engine, 0);
    }
  }
}
