import * as ex from "excalibur";
import { Resources, WeaponResources } from "./actors/resources";
import { Player } from "./actors/player/player";
import { HUD } from "./hud/hud";
import { scenes } from "./scenes/scenes";
import { TimeCycle } from "./environment/time-cycle";
import type { AppearanceOptions } from "./actors/character/types";
import { GameMapScene } from "./scenes/game-scene";

export class GameEngine extends ex.Engine {
  public player!: Player;
  public hud: HUD | null = null;
  public _nextSceneEntryPoint?: string;
  public timeCycle: TimeCycle = new TimeCycle(this);

  constructor() {
    super({
      width: 1024,
      height: 346,
      displayMode: ex.DisplayMode.FitContainer,
      canvasElementId: "game-canvas",
      physics: {
        gravity: ex.vec(0, 800),
      },
    });
  }

  async initialize() {
    const loader = new ex.Loader();
    Resources.forEach((resource) => loader.addResource(resource));
    loader.backgroundColor = "#1a1a1a";

    await this.start(loader);

    const playerAppearance: AppearanceOptions = {
      sex: "male",
      skinTone: 3,
      hairStyle: 4,
    };

    this.player = new Player(ex.vec(100, 100), playerAppearance);
    this.setupNewPlayer();

    scenes.forEach((sceneConfig) => {
      if (sceneConfig.type === "forest") {
        const scene = new GameMapScene(sceneConfig);
        this.addScene(sceneConfig.name, scene);
      }
    });

    this.hud = new HUD(this);

    this.goToScene("forest-1");
  }

  onPreUpdate(engine: ex.Engine, delta: number) {
    super.onPreUpdate(engine, delta);
    this.timeCycle.update(delta);
  }

  protected setupNewPlayer(): void {
    if (!this.player) return;

    this.player.inventory.addItem(1, {
      id: "sword_1",
      name: "Iron Sword",
      type: "weapon",
      spriteSheet: WeaponResources.male.sword_1,
      damage: 25,
      reach: 25,
    });
  }
}
