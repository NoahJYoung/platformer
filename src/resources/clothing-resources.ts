import * as ex from "excalibur";

export const ClothingResources = {
  offhand: {
    male: {
      small_lantern: new ex.ImageSource(
        "/assets/sprites/character/male/equipment/offhand/small_lantern.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      torch: new ex.ImageSource(
        "/assets/sprites/character/male/equipment/offhand/torch.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
    female: {
      small_lantern: new ex.ImageSource(
        "/assets/sprites/character/female/equipment/offhand/small_lantern.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  back: {
    male: {
      small_backpack: new ex.ImageSource(
        "/assets/sprites/character/male/equipment/back/small_backpack.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },

  face: {
    male: {
      brown_face_scarf: new ex.ImageSource(
        "/assets/sprites/character/male/equipment/face/brown_face_scarf.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  body: {
    male: {
      blue_trimmed_white_shirt: new ex.ImageSource(
        "/assets/sprites/character/male/equipment/torso/blue_trimmed_white_shirt.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      brown_leather_mail: new ex.ImageSource(
        "/assets/sprites/character/male/equipment/torso/brown_leather_mail.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
      black_leather_mail: new ex.ImageSource(
        "/assets/sprites/character/male/equipment/torso/black_leather_mail.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  legs: {
    male: {
      blue_pants: new ex.ImageSource(
        "/assets/sprites/character/male/equipment/legs/blue_pants.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  feet: {
    male: {
      brown_boots: new ex.ImageSource(
        "/assets/sprites/character/male/equipment/feet/brown_boots.png",
        { filtering: ex.ImageFiltering.Pixel }
      ),
    },
  },
  hands: {
    male: {
      brown_gloves: new ex.ImageSource(
        "/assets/sprites/character/male/equipment/hands/brown_gloves.png",
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

  // Face
  ClothingResources.face.male.brown_face_scarf,
  // Body
  ClothingResources.body.male.blue_trimmed_white_shirt,
  ClothingResources.body.male.black_leather_mail,
  ClothingResources.body.male.brown_leather_mail,

  // Legs
  ClothingResources.legs.male.blue_pants,
  // Feet
  ClothingResources.feet.male.brown_boots,
  // Hands
  ClothingResources.hands.male.brown_gloves,
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
  // ...femaleClothingResourcesArray,
];
