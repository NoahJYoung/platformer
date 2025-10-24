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
  materialSources: {
    trees: [],
  },
};
