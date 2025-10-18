import * as ex from "excalibur";

export const ClothingResources = {
  back: {
    male: {
      small_backpack: new ex.ImageSource(
        "/assets/sprites/armor/back/male/small_backpack.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      small_lantern: new ex.ImageSource(
        "/assets/sprites/armor/back/male/small_lantern.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
    female: {
      small_lantern: new ex.ImageSource(
        "/assets/sprites/armor/back/female/small_lantern.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  head: {
    male: {
      blue_feather_hat: new ex.ImageSource(
        "/assets/sprites/armor/head/male/blue_feather_hat.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      black_hood: new ex.ImageSource(
        "/assets/sprites/armor/head/male/black_hood.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  face: {
    male: {
      brown_face_scarf: new ex.ImageSource(
        "/assets/sprites/armor/face/male/brown_face_scarf.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  body: {
    male: {
      blue_shirt: new ex.ImageSource(
        "/assets/sprites/armor/body/male/blue_shirt.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      black_shirt: new ex.ImageSource(
        "/assets/sprites/armor/body/male/black_shirt.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  legs: {
    male: {
      blue_pants: new ex.ImageSource(
        "/assets/sprites/armor/legs/male/blue_pants.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      black_pants: new ex.ImageSource(
        "/assets/sprites/armor/legs/male/black_pants.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  feet: {
    male: {
      brown_boots: new ex.ImageSource(
        "/assets/sprites/armor/feet/male/brown_boots.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      black_boots: new ex.ImageSource(
        "/assets/sprites/armor/feet/male/black_boots.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  hands: {
    male: {
      brown_gloves: new ex.ImageSource(
        "/assets/sprites/armor/hands/male/brown_gloves.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      black_gloves: new ex.ImageSource(
        "/assets/sprites/armor/hands/male/black_gloves.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
} as const;
