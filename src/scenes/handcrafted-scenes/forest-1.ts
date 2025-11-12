import * as ex from "excalibur";

import type { SceneConfig } from "../types";

export const forest_1: SceneConfig = {
  type: "forest",
  name: "forest-1",
  backgroundTheme: "normal",
  width: 3200,
  height: 800,
  spawnPoints: {
    default: ex.vec(200, 600),
  },
  exits: [],
  platforms: [
    { x: 1024, y: 768, width: 1024, height: 32 },
    { x: 1024 + 32 * 1, y: 768 - 32 * 1, width: 1024 - 64 * 1, height: 32 },
    { x: 1024 + 32 * 2, y: 768 - 32 * 2, width: 1024 - 64 * 2, height: 32 },
    { x: 1024 + 32 * 3, y: 768 - 32 * 3, width: 1024 - 64 * 3, height: 32 },
    { x: 1024 + 32 * 4, y: 768 - 32 * 4, width: 1024 - 64 * 4, height: 32 },
    { x: 1024 + 32 * 5, y: 768 - 32 * 5, width: 1024 - 64 * 5, height: 32 },
    { x: 1024 + 32 * 6, y: 768 - 32 * 6, width: 1024 - 64 * 6, height: 32 },
    { x: 1024 + 32 * 7, y: 768 - 32 * 7, width: 1024 - 64 * 7, height: 32 },
    { x: 1024 + 32 * 8, y: 768 - 32 * 8, width: 1024 - 64 * 8, height: 32 },
  ],
  enemies: [],
  waterSegments: [
    {
      x: 400,
      y: 800,
      width: 800,
      height: 32,
    },
  ],
  groundSegments: [
    {
      x: -32,
      y: 768,
      width: 64,
      height: 32,
    },
    {
      x: 800,
      y: 768,
      width: 2400,
      height: 32,
    },
  ],
  materialSources: {
    trees: [],
    ores: [],
  },
};
