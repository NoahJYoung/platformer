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
  platforms: [],
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
