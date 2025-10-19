import type { SceneConfig } from "./types";
import * as ex from "excalibur";

export const scenes: SceneConfig[] = [
  {
    type: "forest",
    name: "forest-1",
    backgroundTheme: "normal",
    width: 2400,
    height: 800,
    spawnPoints: {
      default: ex.vec(200, 700),
      from_forest: ex.vec(2350, 700),
    },
    exits: [
      {
        x: 2390,
        y: 400,
        width: 20,
        height: 800,
        targetScene: "forest-2",
        targetEntry: "from_forest-1",
      },
    ],
    platforms: [
      { x: 400, y: 750, width: 160, height: 64 },
      { x: 700, y: 500, width: 160, height: 20 },
      { x: 1000, y: 550, width: 160, height: 20 },
      { x: 1300, y: 450, width: 160, height: 20 },
      { x: 1650, y: 520, width: 160, height: 20 },
      { x: 2000, y: 600, width: 160, height: 20 },
    ],
    enemies: [
      {
        name: "enemy",
        pos: ex.vec(1800, 650),
        appearanceOptions: {
          sex: "female",
          skinTone: 5,
          hairStyle: 1,
          displayName: "Enemy",
        },
        facingRight: false,
      },
    ],
  },
  {
    name: "forest-2",
    type: "forest",
    backgroundTheme: "fall",
    width: 2400,
    height: 800,
    spawnPoints: {
      default: ex.vec(1600, 700),
      "from_forest-1": ex.vec(50, 700),
    },
    exits: [
      {
        x: 10,
        y: 400,
        width: 20,
        height: 800,
        targetScene: "forest-1",
        targetEntry: "from_forest-2",
      },
    ],
    platforms: [
      { x: 300, y: 580, width: 180, height: 20 },
      { x: 550, y: 480, width: 160, height: 20 },
      { x: 850, y: 520, width: 200, height: 20 },
      { x: 1150, y: 430, width: 170, height: 20 },
      { x: 1450, y: 500, width: 190, height: 20 },
      { x: 1800, y: 570, width: 210, height: 20 },
      { x: 2100, y: 490, width: 150, height: 20 },
    ],
    enemies: [
      {
        name: "enemy",
        pos: ex.vec(1800, 650),
        appearanceOptions: {
          sex: "male",
          skinTone: 2,
          hairStyle: 1,
          displayName: "Enemy",
        },
        facingRight: false,
      },
    ],
  },
];
