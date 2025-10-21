import * as ex from "excalibur";

export const TreeResources = {
  fall: new ex.ImageSource("/assets/sprites/resources/trees/fall.png"),
  winter: new ex.ImageSource("/assets/sprites/resources/trees/winter.png"),
  normal: new ex.ImageSource("/assets/sprites/resources/trees/normal.png"),
  apples: new ex.ImageSource("/assets/sprites/resources/trees/apples.png"),
};

export const treeResourcesArray: ex.ImageSource[] = [
  TreeResources.fall,
  TreeResources.winter,
  TreeResources.normal,
  TreeResources.apples,
];
