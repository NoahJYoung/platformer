import * as ex from "excalibur";

export const BackgroundResources = {
  forest: {
    fall: {
      layer1: new ex.ImageSource("/assets/backgrounds/forest/fall/layer1.png"),
      layer2: new ex.ImageSource("/assets/backgrounds/forest/fall/layer2.png"),
      layer3: new ex.ImageSource("/assets/backgrounds/forest/fall/layer3.png"),
      layer4: new ex.ImageSource("/assets/backgrounds/forest/fall/layer4.png"),
      layer4Night: new ex.ImageSource(
        "/assets/backgrounds/forest/fall/layer4-night.png"
      ),
      layer5: new ex.ImageSource("/assets/backgrounds/forest/fall/layer5.png"),
      layer5Night: new ex.ImageSource(
        "/assets/backgrounds/forest/fall/layer5-night.png"
      ),
    },
    winter: {
      layer1: new ex.ImageSource(
        "/assets/backgrounds/forest/winter/layer1.png"
      ),
      layer2: new ex.ImageSource(
        "/assets/backgrounds/forest/winter/layer2.png"
      ),
      layer3: new ex.ImageSource(
        "/assets/backgrounds/forest/winter/layer3.png"
      ),
      layer4: new ex.ImageSource(
        "/assets/backgrounds/forest/winter/layer4.png"
      ),
      layer4Night: new ex.ImageSource(
        "/assets/backgrounds/forest/fall/layer4-night.png"
      ),

      layer5: new ex.ImageSource(
        "/assets/backgrounds/forest/winter/layer5.png"
      ),
      layer5Night: new ex.ImageSource(
        "/assets/backgrounds/forest/fall/layer5-night.png"
      ),
    },
    normal: {
      layer1: new ex.ImageSource(
        "/assets/backgrounds/forest/normal/layer1.png"
      ),
      layer2: new ex.ImageSource(
        "/assets/backgrounds/forest/normal/layer2.png"
      ),
      layer3: new ex.ImageSource(
        "/assets/backgrounds/forest/normal/layer3.png"
      ),
      layer4: new ex.ImageSource(
        "/assets/backgrounds/forest/normal/layer4.png"
      ),
      layer4Night: new ex.ImageSource(
        "/assets/backgrounds/forest/normal/layer4-night.png"
      ),

      layer5: new ex.ImageSource(
        "/assets/backgrounds/forest/normal/layer5.png"
      ),
      layer5Night: new ex.ImageSource(
        "/assets/backgrounds/forest/fall/layer5-night.png"
      ),
    },
  },
  mountain: {
    fall: {
      layer1: new ex.ImageSource(
        "/assets/backgrounds/mountain/fall/layer1.png"
      ),
      layer2: new ex.ImageSource(
        "/assets/backgrounds/mountain/fall/layer2.png"
      ),
      layer3: new ex.ImageSource(
        "/assets/backgrounds/mountain/fall/layer3.png"
      ),
      layer4: new ex.ImageSource(
        "/assets/backgrounds/mountain/fall/layer4.png"
      ),
      layer4Night: new ex.ImageSource(
        "/assets/backgrounds/mountain/fall/layer4-night.png"
      ),
      layer5: new ex.ImageSource(
        "/assets/backgrounds/mountain/fall/layer5.png"
      ),
      layer5Night: new ex.ImageSource(
        "/assets/backgrounds/mountain/fall/layer5-night.png"
      ),
    },
    winter: {
      layer1: new ex.ImageSource(
        "/assets/backgrounds/mountain/winter/layer1.png"
      ),
      layer2: new ex.ImageSource(
        "/assets/backgrounds/mountain/winter/layer2.png"
      ),
      layer3: new ex.ImageSource(
        "/assets/backgrounds/mountain/winter/layer3.png"
      ),
      layer4: new ex.ImageSource(
        "/assets/backgrounds/mountain/winter/layer4.png"
      ),
      layer4Night: new ex.ImageSource(
        "/assets/backgrounds/mountain/fall/layer4-night.png"
      ),

      layer5: new ex.ImageSource(
        "/assets/backgrounds/mountain/winter/layer5.png"
      ),
      layer5Night: new ex.ImageSource(
        "/assets/backgrounds/mountain/fall/layer5-night.png"
      ),
    },
    normal: {
      layer1: new ex.ImageSource(
        "/assets/backgrounds/mountain/normal/layer1.png"
      ),
      layer2: new ex.ImageSource(
        "/assets/backgrounds/mountain/normal/layer2.png"
      ),
      layer3: new ex.ImageSource(
        "/assets/backgrounds/mountain/normal/layer3.png"
      ),
      layer4: new ex.ImageSource(
        "/assets/backgrounds/mountain/normal/layer4.png"
      ),
      layer4Night: new ex.ImageSource(
        "/assets/backgrounds/mountain/normal/layer4-night.png"
      ),

      layer5: new ex.ImageSource(
        "/assets/backgrounds/mountain/normal/layer5.png"
      ),
      layer5Night: new ex.ImageSource(
        "/assets/backgrounds/mountain/fall/layer5-night.png"
      ),
    },
  },
};

export const backgroundResourcesArray: ex.ImageSource[] = [
  // Forest
  // Fall
  BackgroundResources.forest.fall.layer1,
  BackgroundResources.forest.fall.layer2,
  BackgroundResources.forest.fall.layer3,
  BackgroundResources.forest.fall.layer4,
  BackgroundResources.forest.fall.layer4Night,
  BackgroundResources.forest.fall.layer5,
  BackgroundResources.forest.fall.layer5Night,

  // Winter
  BackgroundResources.forest.winter.layer1,
  BackgroundResources.forest.winter.layer2,
  BackgroundResources.forest.winter.layer3,
  BackgroundResources.forest.winter.layer4,
  BackgroundResources.forest.winter.layer4Night,
  BackgroundResources.forest.winter.layer5,
  BackgroundResources.forest.winter.layer5Night,

  // Normal
  BackgroundResources.forest.normal.layer1,
  BackgroundResources.forest.normal.layer2,
  BackgroundResources.forest.normal.layer3,
  BackgroundResources.forest.normal.layer4,
  BackgroundResources.forest.normal.layer4Night,
  BackgroundResources.forest.normal.layer5,
  BackgroundResources.forest.normal.layer5Night,

  //Mountain
  // Fall
  BackgroundResources.mountain.fall.layer1,
  BackgroundResources.mountain.fall.layer2,
  BackgroundResources.mountain.fall.layer3,
  BackgroundResources.mountain.fall.layer4,
  BackgroundResources.mountain.fall.layer4Night,
  BackgroundResources.mountain.fall.layer5,
  BackgroundResources.mountain.fall.layer5Night,

  // Winter
  BackgroundResources.mountain.winter.layer1,
  BackgroundResources.mountain.winter.layer2,
  BackgroundResources.mountain.winter.layer3,
  BackgroundResources.mountain.winter.layer4,
  BackgroundResources.mountain.winter.layer4Night,
  BackgroundResources.mountain.winter.layer5,
  BackgroundResources.mountain.winter.layer5Night,

  // Normal
  BackgroundResources.mountain.normal.layer1,
  BackgroundResources.mountain.normal.layer2,
  BackgroundResources.mountain.normal.layer3,
  BackgroundResources.mountain.normal.layer4,
  BackgroundResources.mountain.normal.layer4Night,
  BackgroundResources.mountain.normal.layer5,
  BackgroundResources.mountain.normal.layer5Night,
];
