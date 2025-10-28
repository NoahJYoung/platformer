export const AudioKeys = {
  SFX: {
    PLAYER: {
      MOVEMENT: {
        FOOTSTEP: "player-footstep",
        JUMP: "player-jump",
        DODGE: "player-dodge",
        LAND: "player-land",
      },
      ACTIONS: {
        CHOP: "player-chop",
        MINE: "player-mine",
      },
      COMBAT: {
        SPELLS: {
          CHARGE: "player-spell-charge",
          LAUNCH: "player-spell-launch",
          IMPACT: "player-spell-impact",
        },
        WEAPON: {
          SWING: "player-weapon-swing",
          HIT: "player-weapon-hit",
        },
      },
      ITEMS: {
        EQUIPMENT: {
          EQUIP: "player-equip-item",
          UNEQUIP: "player-unequip-item",
        },
      },
    },
    ENEMY: {
      FOOTSTEP: "enemy-footstep",
      HIT: "enemy-hit",
      DEFEAT: "enemy-defeat",
      GROWL: "enemy-growl",
    },
    ENVIRONMENT: {
      COIN: "coin-collect",
      CHEST_OPEN: "chest-open",
      DOOR_OPEN: "door-open",
      DOOR_CLOSE: "door-close",
      SWITCH: "switch-activate",
      WATER_SPLASH: "water-splash",
    },
    UI: {
      SELECT: "menu-select",
      CONFIRM: "menu-confirm",
      BACK: "menu-back",
      INVENTORY_OPEN: "inventory-open",
    },
    COMBAT: {
      SWORD_HIT: "sword-hit",
      MAGIC_PROJECTILE: "magic-projectile",
      SHIELD_BLOCK: "shield-block",
    },
  },
  MUSIC: {
    MENU: "music-menu",
    LEVEL_1: "music-level1",
    LEVEL_2: "music-level2",
    BOSS: "music-boss",
    VICTORY: "music-victory",
    GAME_OVER: "music-gameover",
  },
  AMBIENT: {
    FOREST: {
      DAY: "ambient-forest-day",
      NIGHT: "ambient-forest-night",
    },
    MOUNTAIN: {
      DAY: "ambient-mountain-day",
      NIGHT: "ambient-mountain-night",
    },
    WEATHER: {
      RAIN: "ambient-weather-rain",
      THUNDER: "sfx-thunder",
    },
  },
} as const;

type DeepValues<T> = T extends object
  ? { [K in keyof T]: DeepValues<T[K]> }[keyof T]
  : T;

export type AudioKey = DeepValues<typeof AudioKeys>;
