import type { ImageSource } from "excalibur";
import * as ex from "excalibur";

export type TreeType =
  | "apple-tree"
  | "pine-tree"
  | "birch-tree"
  | "willow-tree";

export type AppleTreeGraphicState = "with_apples" | "without_apples" | "base";

export interface AppleTreeGraphics {
  normal: ImageSource;
  apples: ImageSource;
  fall: ImageSource;
  winter: ImageSource;
}

export interface PineTreeGraphics {
  normal_1: ImageSource;
  normal_2: ImageSource;
  fall_1: ImageSource;
  fall_2: ImageSource;
  winter_1: ImageSource;
}

export interface SimpleTreeGraphics {
  normal: ImageSource;
  fall: ImageSource;
  winter: ImageSource;
}

export type TreeGraphics =
  | AppleTreeGraphics
  | PineTreeGraphics
  | SimpleTreeGraphics;

export function isAppleTreeGraphics(
  graphics: TreeGraphics
): graphics is AppleTreeGraphics {
  return "apples" in graphics;
}

export function isPineTreeGraphics(
  graphics: TreeGraphics
): graphics is PineTreeGraphics {
  return "normal_1" in graphics;
}

export function isSimpleTreeGraphics(
  graphics: TreeGraphics
): graphics is SimpleTreeGraphics {
  return !("apples" in graphics) && !("normal_1" in graphics);
}

export function getHeightByTreeType(treeType: TreeType) {
  switch (treeType) {
    case "apple-tree":
      return 208;
    case "birch-tree":
      return 124;
    case "pine-tree":
      return 192;
    case "willow-tree":
      return 192;
  }
}

export function getPositionOffsetByTreeType(
  pos: ex.Vector,
  treeType: TreeType
) {
  const base = 208;
  const heightByTreeType = getHeightByTreeType(treeType);
  const { x, y } = pos;
  const difference = base - heightByTreeType;

  return ex.vec(x, y + difference / 2);
}
