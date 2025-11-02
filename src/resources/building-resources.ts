import * as ex from "excalibur";

export const BuildingResources = {
  stone_house_tiles: new ex.ImageSource(
    "/assets/sprites/buildings/stone_house_tiles.png"
  ),
  wood_house_tiles: new ex.ImageSource(
    "/assets/sprites/buildings/wood_house_tiles.png"
  ),
};

export const buildingResourcesArray = [
  BuildingResources.stone_house_tiles,
  BuildingResources.wood_house_tiles,
];
