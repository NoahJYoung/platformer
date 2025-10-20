import { BackgroundResources } from "./background-resources";
import { FloorResources } from "./floor-resources";
import { PlayerResources } from "./player-resources";
import { WeaponResources } from "./weapon-resources";
import { ClothingResources } from "./clothing-resources";

export const Resources = [
  // Background
  BackgroundResources.fall.layer1,
  BackgroundResources.fall.layer2,
  BackgroundResources.fall.layer3,
  BackgroundResources.fall.layer4,
  BackgroundResources.fall.layer4Night,
  BackgroundResources.fall.layer5,
  BackgroundResources.fall.layer5Night,
  BackgroundResources.winter.layer1,
  BackgroundResources.winter.layer2,
  BackgroundResources.winter.layer3,
  BackgroundResources.winter.layer4,
  BackgroundResources.winter.layer4Night,
  BackgroundResources.winter.layer5,
  BackgroundResources.winter.layer5Night,
  BackgroundResources.normal.layer1,
  BackgroundResources.normal.layer2,
  BackgroundResources.normal.layer3,
  BackgroundResources.normal.layer4,
  BackgroundResources.normal.layer4Night,
  BackgroundResources.normal.layer5,
  BackgroundResources.normal.layer5Night,

  // Floor
  FloorResources.floor1,
  FloorResources.floor2,
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
  WeaponResources.male.iron_sword,
  WeaponResources.male.iron_axe,

  // Female
  WeaponResources.female.iron_sword,
  WeaponResources.female.iron_axe,

  // Armor/Clothing
  // Legs
  // Male
  ClothingResources.legs.male.blue_pants,
  ClothingResources.legs.male.black_pants,

  // Body
  // Male
  ClothingResources.body.male.blue_shirt,
  ClothingResources.body.male.black_shirt,

  // Offhand
  // Male
  ClothingResources.offhand.male.small_lantern,
  ClothingResources.offhand.male.torch,

  // Female
  ClothingResources.offhand.female.small_lantern,

  // Back
  // Male
  ClothingResources.back.male.small_backpack,

  // Female

  // Head
  // Male
  ClothingResources.head.male.blue_feather_hat,
  ClothingResources.head.male.black_hood,

  // Feet
  // Male
  ClothingResources.feet.male.brown_boots,
  ClothingResources.feet.male.black_boots,

  // Hands
  // Male
  ClothingResources.hands.male.brown_gloves,
  ClothingResources.hands.male.black_gloves,

  // Face
  // Male
  ClothingResources.face.male.brown_face_scarf,
] as const;
