export const AudioKeys = {
  SFX: {
    PLAYER: {
      FOOTSTEP: "player-footstep",
      JUMP: "player-jump",
      DODGE: "player-dodge",
      LAND: "player-land",
      HURT: "player-hurt",
      DEATH: "player-death",
      ATTACK: "player-attack",
      SPELL_CAST: "player-spell-cast",
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
    FOREST: "ambient-forest",
    CAVE: "ambient-cave",
    WIND: "ambient-wind",
  },
} as const;

type DeepValues<T> = T extends object
  ? { [K in keyof T]: DeepValues<T[K]> }[keyof T]
  : T;

export type AudioKey = DeepValues<typeof AudioKeys>;
