import type { Canvas, ImageSource, Vector } from "excalibur";
import type { Inventory } from "../actors/character/inventory";
import type { EnemyConfig } from "../actors/enemy/types";
import type { TreeType } from "../actors/resources/tree/tree-types";
import type { OreType } from "../actors/resources/ore/ore-types";

export type SceneType = "forest" | "mountain" | "village";

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
  groundSegments?: GroundSegmentConfig[]; // NEW
}

export interface MaterialSourceConfig {
  trees: MaterialSourceType<TreeType>[];
  ores: MaterialSourceType<OreType>[];
}

export interface PlatformConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

// NEW: Ground segment configuration
export interface GroundSegmentConfig {
  x: number; // Center X position
  y: number; // Top Y position
  width: number; // Width of segment
  height: number; // Height/depth of segment
}

export interface ExitConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  targetScene: string;
  targetEntry: string;
}

export interface MaterialSourceType<T = OreType | TreeType> {
  x: number;
  y: number;
  type: T;
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

export interface BackgroundLayer {
  parallax: Vector;
  z: number;
  isDecoration?: boolean;
  isSky?: boolean;
  isNight?: boolean;
  resource?: ImageSource;
  canvas?: Canvas;
}
