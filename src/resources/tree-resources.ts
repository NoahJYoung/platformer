import * as ex from "excalibur";

export const TreeResources = {
  // Apple tree graphics
  apple: {
    normal: new ex.ImageSource(
      "/assets/sprites/resources/trees/apple-tree/normal.png"
    ),
    apples: new ex.ImageSource(
      "/assets/sprites/resources/trees/apple-tree/apples.png"
    ),
    fall: new ex.ImageSource(
      "/assets/sprites/resources/trees/apple-tree/fall.png"
    ),
    winter: new ex.ImageSource(
      "/assets/sprites/resources/trees/apple-tree/winter.png"
    ),
  },

  // Pine tree graphics (multiple variants)
  pine: {
    normal_1: new ex.ImageSource(
      "/assets/sprites/resources/trees/pine-tree/normal_1.png"
    ),
    normal_2: new ex.ImageSource(
      "/assets/sprites/resources/trees/pine-tree/normal_2.png"
    ),
    fall_1: new ex.ImageSource(
      "/assets/sprites/resources/trees/pine-tree/fall_1.png"
    ),
    fall_2: new ex.ImageSource(
      "/assets/sprites/resources/trees/pine-tree/fall_2.png"
    ),
    winter_1: new ex.ImageSource(
      "/assets/sprites/resources/trees/pine-tree/winter_1.png"
    ),
  },

  // Birch tree graphics
  birch: {
    normal: new ex.ImageSource(
      "/assets/sprites/resources/trees/birch-tree/normal.png"
    ),
    fall: new ex.ImageSource(
      "/assets/sprites/resources/trees/birch-tree/fall.png"
    ),
    winter: new ex.ImageSource(
      "/assets/sprites/resources/trees/birch-tree/winter.png"
    ),
  },

  // Willow tree graphics
  willow: {
    normal: new ex.ImageSource(
      "/assets/sprites/resources/trees/willow-tree/normal.png"
    ),
    fall: new ex.ImageSource(
      "/assets/sprites/resources/trees/willow-tree/fall.png"
    ),
    winter: new ex.ImageSource(
      "/assets/sprites/resources/trees/willow-tree/winter.png"
    ),
  },
};

// Array of all tree resources for loading
export const treeResourcesArray: ex.ImageSource[] = [
  // Apple tree
  TreeResources.apple.normal,
  TreeResources.apple.apples,
  TreeResources.apple.fall,
  TreeResources.apple.winter,

  // Pine tree
  TreeResources.pine.normal_1,
  TreeResources.pine.normal_2,
  TreeResources.pine.fall_1,
  TreeResources.pine.fall_2,
  TreeResources.pine.winter_1,

  // Birch tree
  TreeResources.birch.normal,
  TreeResources.birch.fall,
  TreeResources.birch.winter,

  // Willow tree
  TreeResources.willow.normal,
  TreeResources.willow.fall,
  TreeResources.willow.winter,
];
