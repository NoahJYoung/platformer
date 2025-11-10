import * as ex from "excalibur";
import { Resources } from "../resources";
import { Player } from "../actors/player/player";
import { HUD } from "../hud/hud";
import { TimeCycle } from "../environment/time-cycle";
import type {
  AppearanceOptions,
  AttributesConfig,
} from "../actors/character/types";
import { GameMapScene } from "../scenes/game-scene";
import { createItem } from "../items/item-creator";
import { ProceduralWorldGenerator } from "../worlds-generator/world-generator";
import { handcraftedScenes } from "../scenes/handcrafted-scenes/handcrafted-scenes";
import {
  getAllSoundsForLoader,
  loadSounds,
} from "../audio/sound-manager/load-sounds";
import { registerSounds } from "../audio/sound-manager/register-sounds";
import { GameSoundManager } from "../audio/sound-manager/sound-manager";
import { MessageManager, type MessageType } from "./message-manager";
import { CharacterCreationScene } from "../scenes/character-creation-scene/character-creation-scene";
import { MainMenuScene } from "../scenes/main-menu-scene/main-menu-scene";
import { GAME_HEIGHT, GAME_WIDTH } from "../actors/config";

export class GameEngine extends ex.Engine {
  public player!: Player;
  public hud: HUD | null = null;
  public _nextSceneEntryPoint?: string;
  public soundManager: GameSoundManager;
  public timeCycle: TimeCycle;
  public messageManager: MessageManager = new MessageManager();
  private isPaused = false;
  public onCharacterCreated?: (
    appearance: AppearanceOptions,
    attributes: AttributesConfig
  ) => void;

  constructor() {
    super({
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      displayMode: ex.DisplayMode.FitContainerAndFill,
      canvasElementId: "game-canvas",
      suppressPlayButton: true,
      physics: {
        gravity: ex.vec(0, 800),
      },
    });

    this.soundManager = new GameSoundManager();
    this.timeCycle = new TimeCycle(this, this.soundManager);

    // this.setupResizeHandler();
  }

  // private setupResizeHandler(): void {
  //   let resizeTimeout: number;

  //   window.addEventListener("resize", () => {
  //     clearTimeout(resizeTimeout);
  //     resizeTimeout = window.setTimeout(() => {
  //       const dimensions = GameEngine.calculateGameDimensions();
  //       this.screen.resolution = {
  //         width: dimensions.width,
  //         height: dimensions.height,
  //       };

  //       if (this.hud) {
  //         this.hud.onResize?.(dimensions);
  //       }
  //     }, 250);
  //   });
  // }

  async initialize() {
    const loader = new ex.Loader({});

    Resources.forEach((resource) => loader.addResource(resource));

    const loadedSounds = loadSounds();
    const soundsForLoader = getAllSoundsForLoader(loadedSounds);
    soundsForLoader.forEach((sound) => loader.addResource(sound));

    loader.backgroundColor = "#1a1a1a";

    await this.start(loader);

    registerSounds(this.soundManager, loadedSounds);

    this.timeCycle.initialize();

    const mainMenuScene = new MainMenuScene();
    this.addScene("mainMenu", mainMenuScene);

    const charCreationScene = new CharacterCreationScene();
    this.addScene("characterCreation", charCreationScene);

    this.onCharacterCreated = (appearance, attributes) => {
      this.setupGameWorld(appearance, attributes);
    };

    this.goToScene("mainMenu");
  }

  private setupGameWorld(
    playerAppearance: AppearanceOptions,
    attributes: AttributesConfig
  ) {
    this.player = new Player(ex.vec(100, 100), playerAppearance, attributes);

    this.setupNewPlayer();

    const generator = new ProceduralWorldGenerator({
      seed: Date.now(),
      numberOfScenes: 12,
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
    this.showMessage(`Welcome, ${playerAppearance.displayName}!`, "success");
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

  showMessage(text: string, type: MessageType = "info") {
    return this.messageManager?.post(text, type);
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
    const ironPick = createItem("iron_pickaxe", this.player.sex);

    const torch = createItem("torch", this.player.sex);
    const knife = createItem("iron_knife", this.player.sex);
    const waterSkin = createItem("leather_water_skin");

    this.player.inventory.addItem(0, torch);
    this.player.inventory.addItem(1, ironAxe);
    this.player.inventory.addItem(2, knife);
    this.player.inventory.addItem(3, waterSkin);
    this.player.inventory.addItem(4, ironPick);
  }

  public pause() {
    if (!this.isPaused) {
      this.stop();
      this.isPaused = true;
    }
  }

  public async resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.start();

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }
}
