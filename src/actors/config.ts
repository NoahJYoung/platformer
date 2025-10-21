import * as ex from "excalibur";

export const SCALE = 1;
export const SPRITE_BUFFER = 4;
export const SPRITE_HEIGHT = 64;
export const SPRITE_WIDTH = 24;

export const scale = ex.vec(SCALE, SCALE);
export const STANDARD_SPRITE_WIDTH = 72;
export const FRAME_SPACING = 8;
export const LEFT_MARGIN = 4;

export const CollisionGroups = {
  Player: ex.CollisionGroupManager.create("player"),
  Enemy: ex.CollisionGroupManager.create("enemy"),
  Environment: ex.CollisionGroupManager.create("environment"),
  Weapon: ex.CollisionGroupManager.create("weapon"),
  Interactable: ex.CollisionGroupManager.create("interactable"),
  Resource: ex.CollisionGroupManager.create("resource"),
};
