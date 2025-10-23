import * as ex from "excalibur";
import type { GameEngine } from "../game-engine";
import { TreeResources } from "../resources/tree-resources";
import type { TreeType } from "../actors/resources/tree/tree-types";
import type { DecorationManager } from "../sprite-sheets/scenery/decorations/decorations-manager";

/**
 * Create a seeded random number generator
 */
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Get a random tree type using seeded random
 */
function getRandomTreeType(seededRandom: () => number): TreeType {
  const roll = seededRandom();
  if (roll < 0.5) return "pine-tree";
  else if (roll < 0.7) return "birch-tree";
  else if (roll < 0.85) return "willow-tree";
  else return "apple-tree";
}

/**
 * Get appropriate tree graphic for tree type and season
 */
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

/**
 * Create a canvas with decorations
 */
export function createDecorationCanvas(
  engine: GameEngine,
  decorationManager: DecorationManager | null,
  levelWidth: number,
  levelHeight: number,
  seed: number = 12345,
  minScale: number = 1.0,
  maxScale: number = 1.0,
  maxBlur: number = 2
): ex.Canvas {
  if (!decorationManager) {
    return new ex.Canvas();
  }

  const season = engine.timeCycle.getCurrentSeason();
  const seasonalDecos = decorationManager.getSeasonDecorations(season);
  const allDecos = [...seasonalDecos];

  if (allDecos.length === 0) {
    return new ex.Canvas({
      width: levelWidth,
      height: levelHeight,
      draw: () => {},
    });
  }

  const seededRandom = createSeededRandom(seed);
  const canvasWidth = levelWidth;
  const canvasHeight = levelHeight;
  const groundY = canvasHeight - 10;
  const decorationCount = Math.floor(levelWidth / 50);

  const avgScale = (minScale + maxScale) / 2;
  const blur = (1 - avgScale) * maxBlur;

  const decorationData: Array<{
    deco: { name: string; sprite: ex.Sprite };
    x: number;
    y: number;
    scale: number;
  }> = [];

  for (let i = 0; i < decorationCount; i++) {
    const decoIndex = Math.floor(seededRandom() * allDecos.length);
    const deco = allDecos[decoIndex];
    const x = seededRandom() * canvasWidth;
    const yOffset = Math.floor(seededRandom() * 3);
    const y = groundY + yOffset;
    const scale = minScale + seededRandom() * (maxScale - minScale);

    decorationData.push({ deco, x, y, scale });
  }

  const canvas = new ex.Canvas({
    width: canvasWidth,
    height: canvasHeight,
    cache: true,
    draw: (ctx) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
      }

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
  return canvas;
}

/**
 * Create a canvas with background trees
 */
export function createBackgroundTreeCanvas(
  engine: GameEngine,
  levelWidth: number,
  levelHeight: number,
  seed: number = 12345,
  density: number = 0.02,
  minScale: number = 0.5,
  maxScale: number = 1.0,
  maxBlur: number = 2
): ex.Canvas {
  const season = engine.timeCycle.getCurrentSeason();
  const seededRandom = createSeededRandom(seed);

  const padding = 500;
  const canvasWidth = levelWidth + padding * 2;
  const canvasHeight = levelHeight;
  const treeGroundY = levelHeight;

  const avgScale = (minScale + maxScale) / 2;
  const blur = (1 - avgScale) * maxBlur;

  const treeCount = Math.floor(canvasWidth * density);

  const treeData: Array<{
    graphic: ex.ImageSource;
    x: number;
    y: number;
    scale: number;
  }> = [];

  const minSpacing = 80;

  for (let i = 0; i < treeCount; i++) {
    const treeType = getRandomTreeType(seededRandom);
    const graphic = getTreeGraphic(treeType, season, seededRandom);
    const scale = minScale + seededRandom() * (maxScale - minScale);
    const y = treeGroundY;

    let placed = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!placed && attempts < maxAttempts) {
      const x = seededRandom() * canvasWidth;

      const tooClose = treeData.some(
        (tree) => Math.abs(tree.x - x) < minSpacing
      );

      if (!tooClose) {
        treeData.push({ graphic, x, y, scale });
        placed = true;
      }

      attempts++;
    }

    if (!placed) {
      const x = seededRandom() * canvasWidth;
      treeData.push({ graphic, x, y, scale });
    }
  }

  treeData.sort((a, b) => a.x - b.x);

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

      if (blur > 0) {
        ctx.filter = "none";
      }
    },
  });

  canvas.flagDirty();
  return canvas;
}
