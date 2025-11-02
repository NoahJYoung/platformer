import type { BuildingTileConfig } from "./building-tile-types";

/**
 * Catalog of all available building tiles
 * Based on the House_Tiles.png sprite sheet (448x224, 16px tiles)
 * The sheet is 28 tiles wide x 14 tiles tall
 *
 * IMPORTANT: All coordinates are in 16px tile units
 */
export const BUILDING_TILES: Record<string, BuildingTileConfig> = {
  wood_foundation: {
    id: "wood_foundation",
    name: "Wood Foundation",
    category: "foundation",
    width: 2,
    height: 2,
    solid: false,
    interactable: false,
    interiorOnly: false,
    outdoorSprite: {
      spriteX: 18,
      layer: "background",
      spriteY: 12,
    },
  },

  stone_wall: {
    id: "stone_wall",
    name: "Stone Wall",
    category: "wall",
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
    outdoorSprite: { spriteX: 18, spriteY: 10, layer: "foreground" },
    indoorSprite: {
      spriteX: 4,
      spriteY: 10,
      layer: "foreground",
    },
  },

  wood_door: {
    id: "wood_door",
    name: "Wood Door",
    category: "door",
    outdoorSprite: { spriteX: 16, spriteY: 8, layer: "foreground" },
    indoorSprite: { spriteX: 2, spriteY: 8, layer: "foreground" },
    width: 2,
    height: 6,
    solid: true,
    interactable: true,
    interiorOnly: false,
  },

  window: {
    id: "window",
    name: "Small Window",
    category: "window",
    outdoorSprite: { spriteX: 18, spriteY: 8, layer: "foreground" },
    indoorSprite: { spriteX: 4, spriteY: 8, layer: "foreground" },
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },
};

export function getTilesByCategory(category: string): BuildingTileConfig[] {
  return Object.values(BUILDING_TILES).filter(
    (tile) => tile.category === category
  );
}

export function getTileById(id: string): BuildingTileConfig | null {
  return BUILDING_TILES[id] || null;
}
