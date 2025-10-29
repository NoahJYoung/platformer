import * as ex from "excalibur";

export type OreType = "bronze" | "iron" | "gold" | "rune";

export interface OreGraphics {
  sprite: ex.ImageSource;
}

/**
 * Get the height for an ore node
 * All ores are 64x64 (taking up a 2x2 grid of 32px tiles)
 */
export function getHeightByOreType(_oreType: OreType): number {
  return 64;
}

/**
 * Get position offset for ore placement
 * Ores don't need offset adjustments like trees
 */
export function getPositionOffsetByOreType(
  pos: ex.Vector,
  _oreType: OreType
): ex.Vector {
  return pos;
}

/**
 * Get the sprite coordinates for each ore type in the sprite sheet
 * Sprite sheet is 128x128 with each ore being 64x64 (2x2 grid of 32px tiles)
 * - Bronze: top-left (0, 0)
 * - Iron: top-right (64, 0)
 * - Gold: bottom-left (0, 64)
 * - Rune: bottom-right (64, 64)
 */
export function getSpriteCoordinatesByOreType(oreType: OreType): {
  x: number;
  y: number;
} {
  switch (oreType) {
    case "bronze":
      return { x: 0, y: 0 };
    case "iron":
      return { x: 64, y: 0 };
    case "gold":
      return { x: 0, y: 64 };
    case "rune":
      return { x: 64, y: 64 };
    default:
      throw new Error(`Invalid ore type: ${oreType}`);
  }
}
