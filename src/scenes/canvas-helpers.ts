import type { TreeType } from "../actors/resources/tree/tree-types";
import type { GameEngine } from "../engine/game-engine";
import { TreeResources } from "../resources/tree-resources";
import type { DecorationManager } from "../sprite-sheets/scenery/decorations/decorations-manager";
import * as ex from "excalibur";
import type { BackgroundLayer, SceneType, GroundSegmentConfig } from "./types";

const BACKGROUND_HEIGHT = 346;
const BACKGROUND_WIDTH = 1024;
const BASELINE_GROUND_HEIGHT = 32; // The default/baseline ground height

interface ForestDecorationLayerConfig {
  engine: GameEngine;
  decorationManager: DecorationManager | null;
  sceneType: SceneType;
  seed: number;
  z: number;
  parallax: number;
  density?: number;
  groundSegments?: GroundSegmentConfig[];
  sceneWidth?: number;
  sceneHeight?: number;
}

/**
 * Find the ground segment at a given X position in canvas coordinates
 * Canvas now spans full scene width with padding on each side
 */
function findGroundSegmentAtX(
  canvasX: number,
  groundSegments: GroundSegmentConfig[],
  sceneWidth: number
): GroundSegmentConfig | null {
  const padding = 500;

  // Remove left padding to get X within the scene width area
  const sceneX = canvasX - padding;

  // Find which segment contains this X position
  for (const segment of groundSegments) {
    const segmentLeft = segment.x - segment.width / 2;
    const segmentRight = segment.x + segment.width / 2;

    if (sceneX >= segmentLeft && sceneX <= segmentRight) {
      return segment;
    }
  }

  // Fallback to closest segment
  if (groundSegments.length === 0) return null;

  return groundSegments.reduce((closest, segment) => {
    const segmentCenter = segment.x;
    const closestCenter = closest.x;
    return Math.abs(segmentCenter - sceneX) < Math.abs(closestCenter - sceneX)
      ? segment
      : closest;
  }, groundSegments[0]);
}

/**
 * Calculate the Y offset for a decoration based on ground segment height
 *
 * Returns: offset in canvas pixels to adjust decoration Y position
 */
function calculateGroundOffset(
  canvasX: number,
  groundSegments: GroundSegmentConfig[] | undefined,
  sceneWidth: number,
  sceneHeight: number,
  parallax: number
): number {
  if (!groundSegments || groundSegments.length === 0) {
    return 0;
  }

  const segment = findGroundSegmentAtX(canvasX, groundSegments, sceneWidth);
  if (!segment) return 0;

  // Baseline ground Y in scene coordinates
  const baselineGroundY = sceneHeight - BASELINE_GROUND_HEIGHT;

  // Actual ground Y for this segment
  const actualGroundY = segment.y;

  // Height difference in scene coordinates
  // Positive = terrain is lower, Negative = terrain is higher
  const heightDiff = actualGroundY - baselineGroundY;

  // Scale to canvas coordinates and apply parallax
  // Scene height maps to BACKGROUND_HEIGHT
  const scale = BACKGROUND_HEIGHT / sceneHeight;

  return heightDiff * scale * parallax;
}

export const createForestDecorationLayer = async ({
  engine,
  sceneType,
  decorationManager,
  seed,
  z,
  parallax,
  density = 0.005,
  groundSegments,
  sceneWidth = 2400,
  sceneHeight = 800,
}: ForestDecorationLayerConfig): Promise<BackgroundLayer> => {
  const season = engine.timeCycle.getCurrentSeason();
  const seededRandom = createSeededRandom(seed);
  const scale = parallax * 0.9;
  const blur = (1 - scale) * 3;

  const decorations = decorationManager?.getSeasonDecorations(season) || [];
  const padding = 500;

  // CHANGE: Canvas width now matches scene width (scaled by parallax) plus padding
  // This prevents tiling issues with varied terrain heights
  const canvasWidth = sceneWidth + padding * 2;

  const canvasHeight = BACKGROUND_HEIGHT;
  const groundHeight = 32 * parallax;
  const groundY = BACKGROUND_HEIGHT - groundHeight * parallax;
  const treeGroundY = groundY;
  const decorationGroundY = groundY;
  const treeCount = Math.floor(canvasWidth * density);
  const decorationCount = Math.floor(canvasWidth * density);

  const treeData: Array<{
    graphic: ex.ImageSource;
    x: number;
    y: number;
    scale: number;
  }> = [];

  const minSpacing = 120;

  const decorationData: Array<{
    deco: { name: string; sprite: ex.Sprite };
    x: number;
    y: number;
    scale: number;
  }> = [];

  const decorationsLength = decorations.length;
  for (let i = 0; i < decorationCount; i++) {
    const decoIndex = Math.floor(seededRandom() * decorationsLength);
    const deco = decorations[decoIndex];

    const x = Math.min(
      Math.max(seededRandom() * canvasWidth, deco.sprite.width / 2),
      canvasWidth - deco.sprite.width / 2
    );

    // Calculate ground offset based on terrain
    const groundOffset = calculateGroundOffset(
      x,
      groundSegments,
      sceneWidth,
      sceneHeight,
      parallax
    );
    const y = decorationGroundY + groundOffset;

    decorationData.push({ deco, x, y, scale });
  }

  await new Promise((resolve) => setTimeout(resolve, 0));

  const gridSize = minSpacing;
  const occupiedCells = new Set<string>();
  const maxAttempts = 20;

  for (let i = 0; i < treeCount; i++) {
    const treeType =
      sceneType === "forest" ? getRandomTreeType(seededRandom) : "pine-tree";
    const graphic = getTreeGraphic(treeType, season, seededRandom);

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < maxAttempts) {
      const x = Math.min(
        Math.max(seededRandom() * canvasWidth, graphic.width / 2),
        canvasWidth - graphic.width / 2
      );

      const cellKey = `${Math.floor(x / gridSize)}`;

      if (!occupiedCells.has(cellKey)) {
        occupiedCells.add(cellKey);

        // Calculate ground offset based on terrain
        const groundOffset = calculateGroundOffset(
          x,
          groundSegments,
          sceneWidth,
          sceneHeight,
          parallax
        );
        const y = treeGroundY + groundOffset;

        treeData.push({ graphic, x, y, scale });
        placed = true;
      }
      attempts++;
    }

    if (!placed) {
      const x = seededRandom() * canvasWidth;

      // Calculate ground offset based on terrain
      const groundOffset = calculateGroundOffset(
        x,
        groundSegments,
        sceneWidth,
        sceneHeight,
        parallax
      );
      const y = treeGroundY + groundOffset;

      treeData.push({ graphic, x, y, scale });
    }

    if (i % 10 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 0));

  const canvas = new ex.Canvas({
    width: canvasWidth,
    height: canvasHeight,
    cache: true,
    draw: (ctx) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
      }

      treeData.forEach(({ graphic, x, y, scale }) => {
        const sprite = graphic.toSprite();
        const spriteWidth = sprite.width * scale;
        const spriteHeight = sprite.height * scale;

        const drawX = x - spriteWidth / 2;
        const drawY = y - spriteHeight;

        if (sprite.image?.image) {
          const img = sprite.image.image as HTMLImageElement;

          try {
            ctx.drawImage(
              img,
              sprite.sourceView.x,
              sprite.sourceView.y,
              sprite.sourceView.width,
              sprite.sourceView.height,
              drawX,
              drawY,
              spriteWidth,
              spriteHeight
            );
          } catch (err) {
            console.error("Error drawing background tree:", err);
          }
        }
      });

      decorationData.forEach(({ deco, x, y, scale }) => {
        const sprite = deco.sprite;
        const spriteWidth = sprite.width * scale;
        const spriteHeight = sprite.height * scale;
        const drawY = y - (spriteHeight * scale - 2);

        if (sprite.image?.image) {
          const img = sprite.image.image as HTMLImageElement;

          try {
            ctx.drawImage(
              img,
              sprite.sourceView.x,
              sprite.sourceView.y,
              sprite.sourceView.width,
              sprite.sourceView.height,
              x,
              drawY,
              spriteWidth,
              spriteHeight
            );
          } catch (err) {
            console.error("Error drawing sprite:", deco.name, err);
          }
        }
      });

      if (blur > 0) {
        ctx.filter = "none";
      }
    },
  });

  canvas.flagDirty();

  return {
    canvas,
    parallax: ex.vec(parallax, parallax),
    z,
    isDecoration: true,
  };
};

function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function getRandomTreeType(seededRandom: () => number): TreeType {
  const roll = seededRandom();
  if (roll < 0.6) return "pine-tree";
  else if (roll < 0.9) return "birch-tree";
  else if (roll < 0.95) return "willow-tree";
  else return "apple-tree";
}

function getTreeGraphic(
  treeType: TreeType,
  season: string,
  seededRandom: () => number
): ex.ImageSource {
  switch (treeType) {
    case "apple-tree":
      if (season === "fall") return TreeResources.apple.fall;
      if (season === "winter") return TreeResources.apple.winter;
      return TreeResources.apple.normal;

    case "pine-tree":
      if (season === "fall") {
        return seededRandom() > 0.5
          ? TreeResources.pine.fall_1
          : TreeResources.pine.fall_2;
      }
      if (season === "winter") return TreeResources.pine.winter_1;
      return seededRandom() > 0.5
        ? TreeResources.pine.normal_1
        : TreeResources.pine.normal_2;

    case "birch-tree":
      if (season === "fall") return TreeResources.birch.fall;
      if (season === "winter") return TreeResources.birch.winter;
      return TreeResources.birch.normal;

    case "willow-tree":
      if (season === "fall") return TreeResources.willow.fall;
      if (season === "winter") return TreeResources.willow.winter;
      return TreeResources.willow.normal;

    default:
      return TreeResources.apple.normal;
  }
}
