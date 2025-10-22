import type { SceneConfig } from "./types";
import * as ex from "excalibur";

const TREE_HEIGHT = 208;
const TREE_WIDTH = 64;

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
    // exits: [
    //   {
    //     x: 2390,
    //     y: 400,
    //     width: 20,
    //     height: 800,
    //     targetScene: "forest-2",
    //     targetEntry: "from_forest-1",
    //   },
    // ],
    // platforms: [
    //   // Starting area - low platforms
    //   { x: 400, y: 750, width: 160, height: 64 },
    //   { x: 600, y: 700, width: 120, height: 20 },

    //   // First ascent - gradual climb
    //   { x: 750, y: 650, width: 100, height: 20 },
    //   { x: 880, y: 600, width: 100, height: 20 },
    //   { x: 1010, y: 550, width: 100, height: 20 },

    //   // Mid-level plateau
    //   { x: 1150, y: 500, width: 180, height: 20 },

    //   // Second ascent - steeper
    //   { x: 1350, y: 450, width: 90, height: 20 },
    //   { x: 1430, y: 400, width: 90, height: 20 },
    //   { x: 1570, y: 350, width: 90, height: 20 },

    //   // High plateau
    //   { x: 1680, y: 300, width: 200, height: 20 },

    //   // Descent path - going back down
    //   { x: 1900, y: 350, width: 100, height: 20 },
    //   { x: 2020, y: 400, width: 100, height: 20 },
    //   { x: 2140, y: 450, width: 100, height: 20 },

    //   // Alternative lower path (if player falls)
    //   { x: 700, y: 550, width: 140, height: 20 },
    //   { x: 920, y: 520, width: 140, height: 20 },
    //   { x: 1100, y: 580, width: 140, height: 20 },
    //   { x: 1300, y: 620, width: 140, height: 20 },
    //   { x: 1500, y: 650, width: 140, height: 20 },
    //   { x: 1700, y: 680, width: 140, height: 20 },
    //   { x: 1900, y: 700, width: 140, height: 20 },

    //   // Floating platforms for extra challenge
    //   { x: 500, y: 500, width: 80, height: 20 },
    //   { x: 620, y: 450, width: 80, height: 20 },
    //   { x: 1200, y: 250, width: 100, height: 20 }, // Hidden high platform
    //   { x: 1800, y: 200, width: 120, height: 20 }, // Very high platform
    // ],
    // enemies: [
    //   {
    //     name: "enemy",
    //     pos: ex.vec(1800, 650),
    //     appearanceOptions: {
    //       sex: "female",
    //       skinTone: 5,
    //       hairStyle: 1,
    //       displayName: "Enemy",
    //     },
    //     facingRight: false,
    //     attributes: {
    //       strength: 5,
    //       vitality: 5,
    //       agility: 5,
    //       intelligence: 5,
    //     },
    //   },
    // ],
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
