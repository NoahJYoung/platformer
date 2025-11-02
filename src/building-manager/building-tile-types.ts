export type BuildingTileCategory =
  | "wall"
  | "floor"
  | "roof"
  | "door"
  | "window"
  | "foundation"
  | "corner"
  | "beam";

export type BuildingTileLayer = "background" | "foreground";

export interface BuildingTileDefinition {
  spriteX: number;
  spriteY: number;

  layer: BuildingTileLayer;
}

/**
 * The complete tile configuration - includes both indoor/outdoor sprites
 */
export interface BuildingTileConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  solid: boolean;
  interactable: boolean;
  interiorOnly: boolean;
  category: BuildingTileCategory;
  outdoorSprite: BuildingTileDefinition;
  indoorSprite?: BuildingTileDefinition;
}

export interface PlacedBuildingTile {
  config: BuildingTileConfig;
  gridX: number;
  gridY: number;
  worldX: number;
  worldY: number;
}
