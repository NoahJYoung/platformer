import * as ex from "excalibur";

export const WeaponResources = {
  male: {
    iron_sword: new ex.ImageSource(
      "/assets/sprites/weapons/male/iron_sword.png"
    ),
    iron_axe: new ex.ImageSource("/assets/sprites/weapons/male/iron_axe.png"),
  },
  female: {
    iron_sword: new ex.ImageSource(
      "/assets/sprites/weapons/female/iron_sword.png"
    ),
    iron_axe: new ex.ImageSource("/assets/sprites/weapons/female/iron_axe.png"),
  },
} as const;
