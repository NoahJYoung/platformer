import * as ex from "excalibur";

export const WeaponResources = {
  male: {
    iron_sword: new ex.ImageSource(
      "/assets/sprites/weapons/male/iron_sword.png"
    ),
  },
  female: {
    iron_sword: new ex.ImageSource(
      "/assets/sprites/weapons/female/iron_sword.png"
    ),
  },
} as const;
