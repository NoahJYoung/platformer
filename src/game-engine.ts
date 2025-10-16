import * as ex from "excalibur";
import { Resources } from "./resources";
import { Player } from "./actors/player/player";
import { HUD } from "./hud/hud";
import { scenes } from "./scenes/scenes";
import { TimeCycle } from "./environment/time-cycle";
import type { AppearanceOptions } from "./actors/character/types";
import { GameMapScene } from "./scenes/game-scene";
import { createItem } from "./items/item-creator";

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

    // Handle resize events
    // window.addEventListener("resize", () => this.handleResize());
  }

  /**
   * Calculate optimal game dimensions based on viewport
   */
  /**
   * Calculate optimal game dimensions based on viewport
   */
  private static calculateGameDimensions(): { width: number; height: number } {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Target aspect ratio (2:1 like your original 600x300)
    const targetAspectRatio = 2;

    // Base resolution for design reference
    const baseHeight = 300;
    const baseWidth = 600;

    // Determine if device is mobile
    const isMobile = viewportWidth < 768;

    let width: number;
    let height: number;

    if (isMobile) {
      // On mobile, zoom IN more (larger percentage of screen)
      height = Math.min(viewportHeight * 0.7, 450);
      width = height * targetAspectRatio;

      // If width exceeds viewport, constrain by width instead
      if (width > viewportWidth * 0.95) {
        width = viewportWidth * 0.95;
        height = width / targetAspectRatio;
      }
    } else {
      // On desktop, increase the RESOLUTION to show more of the game world
      // This makes sprites smaller but shows more area
      const heightMultiplier = 1.5; // Show 50% more vertical space

      height = baseHeight * heightMultiplier; // 450 instead of 300
      width = height * targetAspectRatio; // 900 instead of 600
    }

    // Round to avoid sub-pixel rendering issues
    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  // /**
  //  * Handle window resize events
  //  */
  // private handleResize(): void {
  //   const dimensions = GameEngine.calculateGameDimensions();

  //   // Update canvas resolution
  //   this.screen.resolution = ex.vec(dimensions.width, dimensions.height);

  //   // Optionally update HUD or other UI elements
  //   if (this.hud) {
  //     this.hud.onResize?.(dimensions.width, dimensions.height);
  //   }
  // }

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
    const bluePants = createItem("blue_pants", this.player.sex);
    const blueShirt = createItem("blue_shirt", this.player.sex);
    const smallBackpack = createItem("small_backpack", this.player.sex);
    const blueHat = createItem("blue_feather_hat", this.player.sex);

    this.player.inventory.addItem(0, ironSword);
    this.player.inventory.addItem(1, ironAxe);
    this.player.inventory.addItem(2, bluePants);
    this.player.inventory.addItem(3, blueShirt);
    this.player.inventory.addItem(4, smallBackpack);
    this.player.inventory.addItem(5, blueHat);
  }
}
