import * as ex from "excalibur";
import { Resources } from "./resources";
import { Player } from "./actors/player/player";
import { HUD } from "./hud/hud";
import { TimeCycle } from "./environment/time-cycle";
import type { AppearanceOptions } from "./actors/character/types";
import { GameMapScene } from "./scenes/game-scene";
import { createItem } from "./items/item-creator";
import { ProceduralWorldGenerator } from "./worlds-generator/world-generator";
import { handcraftedScenes } from "./scenes/handcrafted-scenes/handcrafted-scenes";

export class GameEngine extends ex.Engine {
  public player!: Player;
  public hud: HUD | null = null;
  public _nextSceneEntryPoint?: string;
  public timeCycle: TimeCycle = new TimeCycle(this);

  constructor() {
    const dimensions = GameEngine.calculateGameDimensions();

    super({
      width: dimensions.width,
      height: dimensions.height,
      displayMode: ex.DisplayMode.FitContainer,
      canvasElementId: "game-canvas",
      physics: {
        gravity: ex.vec(0, 800),
      },
    });
  }

  private static calculateGameDimensions(): { width: number; height: number } {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const targetAspectRatio = 2;

    const baseHeight = 300;

    const isMobile = viewportWidth < 768;

    let width: number;
    let height: number;

    if (isMobile) {
      height = Math.min(viewportHeight * 0.7, 450);
      width = height * targetAspectRatio;

      if (width > viewportWidth * 0.95) {
        width = viewportWidth * 0.95;
        height = width / targetAspectRatio;
      }
    } else {
      const heightMultiplier = 1.5;

      height = baseHeight * heightMultiplier;
      width = height * targetAspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  async initialize() {
    const options: ex.LoaderOptions = {};
    const loader = new ex.Loader({});

    Resources.forEach((resource) => loader.addResource(resource));
    loader.backgroundColor = "#1a1a1a";

    await this.start(loader);

    const playerAppearance: AppearanceOptions = {
      sex: "male",
      skinTone: 1,
      hairStyle: 4,
      displayName: "Player",
    };

    const testSkillLevel = 10;

    this.player = new Player(ex.vec(100, 100), playerAppearance, {
      strength: testSkillLevel,
      intelligence: testSkillLevel,
      agility: testSkillLevel,
      vitality: testSkillLevel,
    });
    this.setupNewPlayer();

    const generator = new ProceduralWorldGenerator({
      seed: Date.now(),
      numberOfScenes: 8,
      platformDensity: "low",
      treeDensity: "low",
      enemyDensity: "medium",
      handcraftedScenes,
    });

    const scenes = generator.generateWorld();

    scenes.forEach((sceneConfig) => {
      const scene = new GameMapScene(sceneConfig);
      this.addScene(sceneConfig.name, scene);
    });

    this.hud = new HUD(this);
    this.goToScene(scenes[0].name);
  }

  public forceSingleUpdate() {
    if (this.player) {
      this.player.animController.updateWeaponAnimation();
      this.player.animController.updateAnimation(this.player.vel);
    }
  }

  onPreUpdate(engine: ex.Engine, delta: number) {
    super.onPreUpdate(engine, delta);
    this.timeCycle.update(delta);
  }

  protected setupNewPlayer(): void {
    if (!this.player) return;

    const ironSword = createItem("iron_sword", this.player.sex);
    const ironAxe = createItem("iron_axe", this.player.sex);
    const darkPants = createItem("dark_pants", this.player.sex);

    const blueShirt = createItem("dark_shirt", this.player.sex);
    const smallBackpack = createItem("small_backpack", this.player.sex);
    const blueHat = createItem("dark_hood", this.player.sex);
    const leatherBoots = createItem("dark_boots", this.player.sex);
    const faceScarf = createItem("brown_scarf", this.player.sex);
    const leatherGloves = createItem("dark_gloves", this.player.sex);
    const smallLantern = createItem("small_lantern", this.player.sex);
    const torch = createItem("torch", this.player.sex);
    const knife = createItem("iron_knife", this.player.sex);
    const waterSkin = createItem("leather_water_skin");

    this.player.inventory.addItem(0, torch);
    this.player.inventory.addItem(1, ironAxe);
    this.player.inventory.addItem(2, knife);
    this.player.inventory.addItem(3, waterSkin);
  }
}
