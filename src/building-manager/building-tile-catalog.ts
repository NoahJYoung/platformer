import type { BuildingTileConfig } from "./building-tile-types";

export const BUILDING_TILES: Record<string, BuildingTileConfig> = {
  foundation: {
    id: "foundation",
    name: "Foundation",
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

  // STONE
  stone_entrance: {
    id: "stone_entrance",
    name: "Stone Entrance",
    category: "door",
    material: "stone",
    outdoorSprite: { spriteX: 16, spriteY: 8, layer: "foreground" },
    indoorSprite: { spriteX: 2, spriteY: 8, layer: "foreground" },
    width: 2,
    height: 6,
    solid: true,
    interactable: true,
    interiorOnly: false,
  },

  stone_wall: {
    id: "stone_wall",
    name: "Stone Wall",
    category: "wall",
    material: "stone",
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

  small_stone_wall: {
    id: "small_stone_wall",
    name: "Small Stone Wall",
    category: "wall",
    material: "stone",
    width: 2,
    height: 1,
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

  stone_window: {
    id: "stone_window",
    name: "Small Window",
    category: "window",
    material: "stone",
    outdoorSprite: { spriteX: 18, spriteY: 8, layer: "foreground" },
    indoorSprite: { spriteX: 4, spriteY: 8, layer: "foreground" },
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },

  stone_roof_slope_left: {
    id: "stone_roof_slope_left",
    name: "Stone Roof Slope (left)",
    category: "roof",
    material: "stone",
    outdoorSprite: { spriteX: 17, spriteY: 2, layer: "foreground" },
    indoorSprite: { spriteX: 3, spriteY: 2, layer: "foreground" },
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },

  stone_roof_slope_right: {
    id: "stone_roof_slope_right",
    name: "Stone Roof Slope (right)",
    category: "roof",
    material: "stone",
    outdoorSprite: { spriteX: 23, spriteY: 2, layer: "foreground" },
    indoorSprite: { spriteX: 9, spriteY: 2, layer: "foreground" },
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },

  stone_roof_top_angle: {
    id: "stone_roof_top_angle",
    name: "Stone Roof Top (angled)",
    category: "roof",
    material: "stone",
    outdoorSprite: { spriteX: 20, spriteY: 0, layer: "foreground" },
    indoorSprite: { spriteX: 6, spriteY: 0, layer: "foreground" },
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },

  stone_roof_top_flat: {
    id: "stone_roof_top_flat",
    name: "Stone Roof Top (flat)",
    category: "roof",
    material: "stone",
    outdoorSprite: { spriteX: 14, spriteY: 0, layer: "foreground" },
    indoorSprite: { spriteX: 0, spriteY: 0, layer: "foreground" },
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },

  small_stone_roof_top_flat: {
    id: "small_stone_roof_top_flat",
    name: "Small Stone Roof Top (flat)",
    category: "roof",
    material: "stone",
    outdoorSprite: { spriteX: 14, spriteY: 0, layer: "foreground" },
    indoorSprite: { spriteX: 0, spriteY: 0, layer: "foreground" },
    width: 1,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },

  // WOOD
  wood_wall: {
    id: "wood_wall",
    name: "Wood Wall",
    category: "wall",
    material: "wood",
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

  small_wood_wall: {
    id: "small_wood_wall",
    name: "Small Wood Wall",
    category: "wall",
    material: "wood",
    width: 2,
    height: 1,
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

  wood_entrance: {
    id: "wood_entrance",
    name: "Wood Entrance",
    category: "door",
    material: "wood",
    outdoorSprite: { spriteX: 16, spriteY: 8, layer: "foreground" },
    indoorSprite: { spriteX: 2, spriteY: 8, layer: "foreground" },
    width: 2,
    height: 6,
    solid: true,
    interactable: true,
    interiorOnly: false,
  },

  wood_window: {
    id: "wood_window",
    name: "Wood Window",
    category: "window",
    material: "wood",
    outdoorSprite: { spriteX: 18, spriteY: 8, layer: "foreground" },
    indoorSprite: { spriteX: 4, spriteY: 8, layer: "foreground" },
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },

  wood_roof_slope_left: {
    id: "wood_roof_slope_left",
    name: "Wood Roof Slope (left)",
    category: "roof",
    material: "wood",
    outdoorSprite: { spriteX: 17, spriteY: 2, layer: "foreground" },
    indoorSprite: { spriteX: 3, spriteY: 2, layer: "foreground" },
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },

  wood_roof_slope_right: {
    id: "wood_roof_slope_right",
    name: "Wood Roof Slope (right)",
    category: "roof",
    material: "wood",
    outdoorSprite: { spriteX: 23, spriteY: 2, layer: "foreground" },
    indoorSprite: { spriteX: 9, spriteY: 2, layer: "foreground" },
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },

  wood_roof_top_angle: {
    id: "wood_roof_top_angle",
    name: "wood Roof Top (angled)",
    category: "roof",
    material: "wood",
    outdoorSprite: { spriteX: 20, spriteY: 0, layer: "foreground" },
    indoorSprite: { spriteX: 6, spriteY: 0, layer: "foreground" },
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },

  wood_roof_top_flat: {
    id: "wood_roof_top_flat",
    name: "Wood Roof Top (flat)",
    category: "roof",
    material: "wood",
    outdoorSprite: { spriteX: 14, spriteY: 0, layer: "foreground" },
    indoorSprite: { spriteX: 0, spriteY: 0, layer: "foreground" },
    width: 2,
    height: 2,
    solid: true,
    interactable: false,
    interiorOnly: false,
  },

  small_wood_roof_top_flat: {
    id: "small_wood_roof_top_flat",
    name: "Small Wood Roof Top (flat)",
    category: "roof",
    material: "wood",
    outdoorSprite: { spriteX: 14, spriteY: 0, layer: "foreground" },
    indoorSprite: { spriteX: 0, spriteY: 0, layer: "foreground" },
    width: 1,
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

export function getTilesByMaterial(material: string): BuildingTileConfig[] {
  return Object.values(BUILDING_TILES).filter(
    (tile) => tile.material === material || tile.category === "foundation"
  );
}

export function getTileById(id: string): BuildingTileConfig | null {
  return BUILDING_TILES[id] || null;
}
