import * as ex from "excalibur";

export const PlayerResources = {
  male: {
    skin: {
      skin_1: new ex.ImageSource("/assets/sprites/player/male/skin/Skin1.png"),
      skin_2: new ex.ImageSource("/assets/sprites/player/male/skin/Skin2.png"),
      skin_3: new ex.ImageSource("/assets/sprites/player/male/skin/Skin3.png"),
      skin_4: new ex.ImageSource("/assets/sprites/player/male/skin/Skin4.png"),
      skin_5: new ex.ImageSource("/assets/sprites/player/male/skin/Skin5.png"),
    },
    hair: {
      hair_1: new ex.ImageSource("/assets/sprites/player/male/hair/Hair1.png"),
      hair_2: new ex.ImageSource("/assets/sprites/player/male/hair/Hair2.png"),
      hair_3: new ex.ImageSource("/assets/sprites/player/male/hair/Hair3.png"),
      hair_4: new ex.ImageSource("/assets/sprites/player/male/hair/Hair4.png"),
      hair_5: new ex.ImageSource("/assets/sprites/player/male/hair/Hair5.png"),
    },
  },
  female: {
    skin: {
      skin_1: new ex.ImageSource(
        "/assets/sprites/player/female/skin/Skin1.png"
      ),
      skin_2: new ex.ImageSource(
        "/assets/sprites/player/female/skin/Skin2.png"
      ),
      skin_3: new ex.ImageSource(
        "/assets/sprites/player/female/skin/Skin3.png"
      ),
      skin_4: new ex.ImageSource(
        "/assets/sprites/player/female/skin/Skin4.png"
      ),
      skin_5: new ex.ImageSource(
        "/assets/sprites/player/female/skin/Skin5.png"
      ),
    },
    hair: {
      hair_1: new ex.ImageSource(
        "/assets/sprites/player/female/hair/Hair1.png"
      ),
      hair_2: new ex.ImageSource(
        "/assets/sprites/player/female/hair/Hair2.png"
      ),
      hair_3: new ex.ImageSource(
        "/assets/sprites/player/female/hair/Hair3.png"
      ),
      hair_4: new ex.ImageSource(
        "/assets/sprites/player/female/hair/Hair4.png"
      ),
      hair_5: new ex.ImageSource(
        "/assets/sprites/player/female/hair/Hair5.png"
      ),
    },
  },
} as const;

export const WeaponResources = {
  male: {
    sword_1: new ex.ImageSource("/assets/sprites/weapons/male/Sword1.png"),
    axe_1: new ex.ImageSource("/assets/sprites/weapons/male/Axe1.png"),
  },
  female: {
    sword_1: new ex.ImageSource("/assets/sprites/weapons/female/Sword1.png"),
  },
} as const;

export const Resources = [
  // Skin
  // Male
  PlayerResources.male.skin.skin_1,
  PlayerResources.male.skin.skin_2,
  PlayerResources.male.skin.skin_3,
  PlayerResources.male.skin.skin_4,
  PlayerResources.male.skin.skin_5,
  // Female
  PlayerResources.female.skin.skin_1,
  PlayerResources.female.skin.skin_2,
  PlayerResources.female.skin.skin_3,
  PlayerResources.female.skin.skin_4,
  PlayerResources.female.skin.skin_5,

  // Hair
  // Male
  PlayerResources.male.hair.hair_1,
  PlayerResources.male.hair.hair_2,
  PlayerResources.male.hair.hair_3,
  PlayerResources.male.hair.hair_4,
  PlayerResources.male.hair.hair_5,
  // Female
  PlayerResources.female.hair.hair_1,
  PlayerResources.female.hair.hair_2,
  PlayerResources.female.hair.hair_3,
  PlayerResources.female.hair.hair_4,
  PlayerResources.female.hair.hair_5,

  // Weapons
  // Male
  WeaponResources.male.sword_1,
  WeaponResources.male.axe_1,

  // Female
  WeaponResources.female.sword_1,
] as const;
