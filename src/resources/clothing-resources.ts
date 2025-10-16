import * as ex from "excalibur";

export const ClothingResources = {
  back: {
    male: {
      small_backpack: new ex.ImageSource(
        "/assets/sprites/armor/back/male/small_backpack.png"
      ),
    },
  },
  head: {
    male: {
      blue_feather_hat: new ex.ImageSource(
        "/assets/sprites/armor/head/male/blue_feather_hat.png"
      ),
    },
  },
  face: {
    male: {
      brown_face_scarf: new ex.ImageSource(
        "/assets/sprites/armor/face/male/brown_face_scarf.png"
      ),
    },
  },
  body: {
    male: {
      blue_shirt: new ex.ImageSource(
        "/assets/sprites/armor/body/male/blue_shirt.png"
      ),
    },
  },
  legs: {
    male: {
      blue_pants: new ex.ImageSource(
        "/assets/sprites/armor/legs/male/blue_pants.png"
      ),
    },
  },
  feet: {
    male: {
      brown_boots: new ex.ImageSource(
        "/assets/sprites/armor/feet/male/brown_boots.png"
      ),
    },
  },
  hands: {
    male: {
      brown_gloves: new ex.ImageSource(
        "/assets/sprites/armor/hands/male/brown_gloves.png"
      ),
    },
  },
} as const;
