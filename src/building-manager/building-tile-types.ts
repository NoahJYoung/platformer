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

export type BuildingMaterial = "stone" | "wood";

export interface SpriteSheetsByMaterial {
  stone: ex.SpriteSheet;
  wood: ex.SpriteSheet;
}

export interface ImageSourcesByMaterial {
  stone: ex.ImageSource;
  wood: ex.ImageSource;
}

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
  material?: BuildingMaterial;
}

export interface PlacedBuildingTile {
  config: BuildingTileConfig;
  gridX: number;
  gridY: number;
  worldX: number;
  worldY: number;
}
