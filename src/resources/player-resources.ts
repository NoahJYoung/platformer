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
