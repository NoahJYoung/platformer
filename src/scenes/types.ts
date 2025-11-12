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
  groundSegments?: GroundSegmentConfig[];
  waterSegments?: WaterSegmentConfig[];
  buildingData?: BuildingData;
}

export interface BuildingData {
  tiles: PlacedBuildingTileData[];
}

export interface PlacedBuildingTileData {
  tileId: string;
  gridX: number;
  gridY: number;
  worldX: number;
  worldY: number;
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

export interface GroundSegmentConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WaterSegmentConfig {
  x: number;
  y: number;
  width: number;
  height: 32 | 64;
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
