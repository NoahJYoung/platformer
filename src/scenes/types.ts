import type { Inventory } from "../actors/character/inventory";
import type { EnemyConfig } from "../actors/enemy/types";

export type SceneType = "forest" | "village";

export interface SceneConfig {
  type: SceneType;
  name: string;
  width: number;
  height: number;
  spawnPoints?: Record<string, ex.Vector>;
  backgroundTheme?: "normal" | "fall" | "winter";
  exits?: ExitConfig[];
  enemies?: EnemyConfig[];
  platforms?: PlatformConfig[];
}

export interface PlatformConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExitConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  targetScene: string;
  targetEntry: string;
}

export interface PlayerState {
  health: number;
  maxHealth: number;
  inventory: Inventory;
  equipment: Record<string, any>;
  level: number;
  experience: number;
  energy: number;
  maxEnergy: number;
  isRunMode: boolean;
  entryPoint?: string;
}
