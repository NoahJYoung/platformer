import * as ex from "excalibur";

export const BackgroundResources = {
  fall: {
    layer1: new ex.ImageSource("/assets/backgrounds/fall/layer1.png"),
    layer2: new ex.ImageSource("/assets/backgrounds/fall/layer2.png"),
    layer3: new ex.ImageSource("/assets/backgrounds/fall/layer3.png"),
    layer4: new ex.ImageSource("/assets/backgrounds/fall/layer4.png"),
    layer4Night: new ex.ImageSource(
      "/assets/backgrounds/fall/layer4-night.png"
    ),
    layer5: new ex.ImageSource("/assets/backgrounds/fall/layer5.png"),
    layer5Night: new ex.ImageSource(
      "/assets/backgrounds/fall/layer5-night.png"
    ),
  },
  winter: {
    layer1: new ex.ImageSource("/assets/backgrounds/winter/layer1.png"),
    layer2: new ex.ImageSource("/assets/backgrounds/winter/layer2.png"),
    layer3: new ex.ImageSource("/assets/backgrounds/winter/layer3.png"),
    layer4: new ex.ImageSource("/assets/backgrounds/winter/layer4.png"),
    layer4Night: new ex.ImageSource(
      "/assets/backgrounds/fall/layer4-night.png"
    ),

    layer5: new ex.ImageSource("/assets/backgrounds/winter/layer5.png"),
    layer5Night: new ex.ImageSource(
      "/assets/backgrounds/fall/layer5-night.png"
    ),
  },
  normal: {
    layer1: new ex.ImageSource("/assets/backgrounds/normal/layer1.png"),
    layer2: new ex.ImageSource("/assets/backgrounds/normal/layer2.png"),
    layer3: new ex.ImageSource("/assets/backgrounds/normal/layer3.png"),
    layer4: new ex.ImageSource("/assets/backgrounds/normal/layer4.png"),
    layer4Night: new ex.ImageSource(
      "/assets/backgrounds/normal/layer4-night.png"
    ),

    layer5: new ex.ImageSource("/assets/backgrounds/normal/layer5.png"),
    layer5Night: new ex.ImageSource(
      "/assets/backgrounds/fall/layer5-night.png"
    ),
  },
};

export const backgroundResourcesArray: ex.ImageSource[] = [
  // Fall
  BackgroundResources.fall.layer1,
  BackgroundResources.fall.layer2,
  BackgroundResources.fall.layer3,
  BackgroundResources.fall.layer4,
  BackgroundResources.fall.layer4Night,
  BackgroundResources.fall.layer5,
  BackgroundResources.fall.layer5Night,

  // Winter
  BackgroundResources.winter.layer1,
  BackgroundResources.winter.layer2,
  BackgroundResources.winter.layer3,
  BackgroundResources.winter.layer4,
  BackgroundResources.winter.layer4Night,
  BackgroundResources.winter.layer5,
  BackgroundResources.winter.layer5Night,

  // Normal
  BackgroundResources.normal.layer1,
  BackgroundResources.normal.layer2,
  BackgroundResources.normal.layer3,
  BackgroundResources.normal.layer4,
  BackgroundResources.normal.layer4Night,
  BackgroundResources.normal.layer5,
  BackgroundResources.normal.layer5Night,
];
