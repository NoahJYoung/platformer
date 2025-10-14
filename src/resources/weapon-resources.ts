import * as ex from "excalibur";

export const WeaponResources = {
  male: {
    sword_1: new ex.ImageSource("/assets/sprites/weapons/male/Sword1.png"),
    axe_1: new ex.ImageSource("/assets/sprites/weapons/male/Axe1.png"),
  },
  female: {
    sword_1: new ex.ImageSource("/assets/sprites/weapons/female/Sword1.png"),
  },
} as const;
