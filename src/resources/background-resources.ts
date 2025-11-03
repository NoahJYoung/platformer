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
      decoration1: new ex.ImageSource(
        "/assets/backgrounds/forest/fall/decorations1.png"
      ),
      decoration2: new ex.ImageSource(
        "/assets/backgrounds/forest/fall/decorations2.png"
      ),
      decoration3: new ex.ImageSource(
        "/assets/backgrounds/forest/fall/decorations3.png"
      ),
      decoration4: new ex.ImageSource(
        "/assets/backgrounds/forest/fall/decorations4.png"
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
        "/assets/backgrounds/forest/winter/layer4-night.png"
      ),

      layer5: new ex.ImageSource(
        "/assets/backgrounds/forest/winter/layer5.png"
      ),
      layer5Night: new ex.ImageSource(
        "/assets/backgrounds/forest/winter/layer5-night.png"
      ),
      decoration1: new ex.ImageSource(
        "/assets/backgrounds/forest/winter/decorations1.png"
      ),
      decoration2: new ex.ImageSource(
        "/assets/backgrounds/forest/winter/decorations2.png"
      ),
      decoration3: new ex.ImageSource(
        "/assets/backgrounds/forest/winter/decorations3.png"
      ),
      decoration4: new ex.ImageSource(
        "/assets/backgrounds/forest/winter/decorations4.png"
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
        "/assets/backgrounds/forest/normal/layer5-night.png"
      ),
      decoration1: new ex.ImageSource(
        "/assets/backgrounds/forest/normal/decorations1.png"
      ),
      decoration2: new ex.ImageSource(
        "/assets/backgrounds/forest/normal/decorations2.png"
      ),
      decoration3: new ex.ImageSource(
        "/assets/backgrounds/forest/normal/decorations3.png"
      ),
      decoration4: new ex.ImageSource(
        "/assets/backgrounds/forest/normal/decorations4.png"
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

const getAllBackgroundResources = () => {
  const resources: ex.ImageSource[] = [];

  Object.values(BackgroundResources).forEach((biome) => {
    Object.values(biome).forEach((season) => {
      resources.push(...Object.values(season));
    });
  });

  return resources;
};

export const backgroundResourcesArray: ex.ImageSource[] =
  getAllBackgroundResources();
