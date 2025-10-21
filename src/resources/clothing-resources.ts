import * as ex from "excalibur";

export const ClothingResources = {
  offhand: {
    male: {
      small_lantern: new ex.ImageSource(
        "/assets/sprites/armor/offhand/male/small_lantern.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      torch: new ex.ImageSource(
        "/assets/sprites/armor/offhand/male/torch.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
    female: {
      small_lantern: new ex.ImageSource(
        "/assets/sprites/armor/offhand/female/small_lantern.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  back: {
    male: {
      small_backpack: new ex.ImageSource(
        "/assets/sprites/armor/back/male/small_backpack.png",
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

const maleClothingResourcesArray = [
  // Offhand
  ClothingResources.offhand.male.torch,
  ClothingResources.offhand.male.small_lantern,
  // Back
  ClothingResources.back.male.small_backpack,
  // Head
  ClothingResources.head.male.black_hood,
  ClothingResources.head.male.blue_feather_hat,
  // Face
  ClothingResources.face.male.brown_face_scarf,
  // Body
  ClothingResources.body.male.black_shirt,
  ClothingResources.body.male.blue_shirt,
  // Legs
  ClothingResources.legs.male.black_pants,
  ClothingResources.legs.male.blue_pants,
  // Feet
  ClothingResources.feet.male.brown_boots,
  ClothingResources.feet.male.black_boots,
  // Hands
  ClothingResources.hands.male.brown_gloves,
  ClothingResources.hands.male.black_gloves,
];

const femaleClothingResourcesArray = [
  // Offhand
  // ClothingResources.offhand.female.torch,
  ClothingResources.offhand.female.small_lantern,
  // // Back
  // ClothingResources.back.female.small_backpack,
  // // Head
  // ClothingResources.head.female.black_hood,
  // ClothingResources.head.female.blue_feather_hat,
  // // Face
  // ClothingResources.face.female.brown_face_scarf,
  // // Body
  // ClothingResources.body.female.black_shirt,
  // ClothingResources.body.female.blue_shirt,
  // // Legs
  // ClothingResources.legs.female.black_pants,
  // ClothingResources.legs.female.blue_pants,
  // // Feet
  // ClothingResources.feet.female.brown_boots,
  // ClothingResources.feet.female.black_boots,
  // // Hands
  // ClothingResources.hands.female.brown_gloves,
  // ClothingResources.hands.female.black_gloves,
];

export const clothingResourcesArray = [
  ...maleClothingResourcesArray,
  ...femaleClothingResourcesArray,
];
