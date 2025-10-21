import * as ex from "excalibur";
export const PlayerResources = {
  male: {
    skin: {
      skin_1: new ex.ImageSource("/assets/sprites/player/male/skin/Skin1.png", {
        filtering: ex.ImageFiltering.Pixel,
      }),
      skin_2: new ex.ImageSource("/assets/sprites/player/male/skin/Skin2.png", {
        filtering: ex.ImageFiltering.Pixel,
      }),
      skin_3: new ex.ImageSource("/assets/sprites/player/male/skin/Skin3.png", {
        filtering: ex.ImageFiltering.Pixel,
      }),
      skin_4: new ex.ImageSource("/assets/sprites/player/male/skin/Skin4.png", {
        filtering: ex.ImageFiltering.Pixel,
      }),
      skin_5: new ex.ImageSource("/assets/sprites/player/male/skin/Skin5.png", {
        filtering: ex.ImageFiltering.Pixel,
      }),
    },
    hair: {
      hair_1: new ex.ImageSource("/assets/sprites/player/male/hair/Hair1.png", {
        filtering: ex.ImageFiltering.Pixel,
      }),
      hair_2: new ex.ImageSource("/assets/sprites/player/male/hair/Hair2.png", {
        filtering: ex.ImageFiltering.Pixel,
      }),
      hair_3: new ex.ImageSource("/assets/sprites/player/male/hair/Hair3.png", {
        filtering: ex.ImageFiltering.Pixel,
      }),
      hair_4: new ex.ImageSource("/assets/sprites/player/male/hair/Hair4.png", {
        filtering: ex.ImageFiltering.Pixel,
      }),
      hair_5: new ex.ImageSource("/assets/sprites/player/male/hair/Hair5.png", {
        filtering: ex.ImageFiltering.Pixel,
      }),
    },
  },
  female: {
    skin: {
      skin_1: new ex.ImageSource(
        "/assets/sprites/player/female/skin/Skin1.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      skin_2: new ex.ImageSource(
        "/assets/sprites/player/female/skin/Skin2.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      skin_3: new ex.ImageSource(
        "/assets/sprites/player/female/skin/Skin3.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      skin_4: new ex.ImageSource(
        "/assets/sprites/player/female/skin/Skin4.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      skin_5: new ex.ImageSource(
        "/assets/sprites/player/female/skin/Skin5.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
    hair: {
      hair_1: new ex.ImageSource(
        "/assets/sprites/player/female/hair/Hair1.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      hair_2: new ex.ImageSource(
        "/assets/sprites/player/female/hair/Hair2.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      hair_3: new ex.ImageSource(
        "/assets/sprites/player/female/hair/Hair3.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      hair_4: new ex.ImageSource(
        "/assets/sprites/player/female/hair/Hair4.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      hair_5: new ex.ImageSource(
        "/assets/sprites/player/female/hair/Hair5.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
} as const;

const malePlayerResourcesArray = [
  // Skin
  PlayerResources.male.skin.skin_1,
  PlayerResources.male.skin.skin_2,
  PlayerResources.male.skin.skin_3,
  PlayerResources.male.skin.skin_4,
  PlayerResources.male.skin.skin_5,
  // Hair
  PlayerResources.male.hair.hair_1,
  PlayerResources.male.hair.hair_2,
  PlayerResources.male.hair.hair_3,
  PlayerResources.male.hair.hair_4,
  PlayerResources.male.hair.hair_5,
];

const femalePlayerResourcesArray = [
  // Skin
  PlayerResources.female.skin.skin_1,
  PlayerResources.female.skin.skin_2,
  PlayerResources.female.skin.skin_3,
  PlayerResources.female.skin.skin_4,
  PlayerResources.female.skin.skin_5,
  // Hair
  PlayerResources.female.hair.hair_1,
  PlayerResources.female.hair.hair_2,
  PlayerResources.female.hair.hair_3,
  PlayerResources.female.hair.hair_4,
  PlayerResources.female.hair.hair_5,
];

export const playerResourcesArray = [
  ...malePlayerResourcesArray,
  ...femalePlayerResourcesArray,
];
