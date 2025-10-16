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
} as const;
