import type { Inventory } from "../actors/character/inventory";
import type { EnemyConfig } from "../actors/enemy/types";
import type { TreeType } from "../actors/resources/tree/tree-types";

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
  materialSources?: MaterialSourceConfig;
}

export interface MaterialSourceConfig {
  trees: TreeConfig[];
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

export interface TreeConfig {
  x: number;
  y: number;
  type: TreeType;
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
