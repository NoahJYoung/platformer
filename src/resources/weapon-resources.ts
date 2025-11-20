import * as ex from "excalibur";

export const WeaponResources = {
  male: {
    iron_sword: new ex.ImageSource(
      "/assets/sprites/character/male/equipment/weapons/swords/iron_sword.png",
      { filtering: ex.ImageFiltering.Pixel }
    ),
    iron_axe: new ex.ImageSource(
      "/assets/sprites/character/male/equipment/weapons/axes/iron_axe.png",
      {
        filtering: ex.ImageFiltering.Pixel,
      }
    ),
    iron_pickaxe: new ex.ImageSource(
      "/assets/sprites/character/male/equipment/weapons/pickaxes/iron_pickaxe.png",
      {
        filtering: ex.ImageFiltering.Pixel,
      }
    ),
    iron_knife: new ex.ImageSource(
      "/assets/sprites/character/male/equipment/weapons/knives/iron_knife.png",
      {
        filtering: ex.ImageFiltering.Pixel,
      }
    ),
  },
  female: {
    iron_sword: new ex.ImageSource(
      "/assets/sprites/character/female/equipment/weapons/swords/iron_sword.png",
      { filtering: ex.ImageFiltering.Pixel }
    ),
    iron_axe: new ex.ImageSource(
      "/assets/sprites/character/female/equipment/weapons/axes/iron_axe.png",
      { filtering: ex.ImageFiltering.Pixel }
    ),
    iron_pickaxe: new ex.ImageSource(
      "/assets/sprites/character/female/equipment/weapons/pickaxes/iron_pickaxe.png",
      {
        filtering: ex.ImageFiltering.Pixel,
      }
    ),
  },
} as const;

const maleWeaponResourcesArray = [
  // Swords
  WeaponResources.male.iron_sword,
  // Axes
  WeaponResources.male.iron_axe,
  // Axes
  WeaponResources.male.iron_pickaxe,
  //knives
  WeaponResources.male.iron_knife,
];

const femaleWeaponResourcesArray = [
  // Swords
  WeaponResources.female.iron_sword,
  // Axes
  WeaponResources.female.iron_axe,
  WeaponResources.female.iron_pickaxe,
];
export const weaponResourcesArray = [
  ...maleWeaponResourcesArray,
  // ...femaleWeaponResourcesArray,
];
