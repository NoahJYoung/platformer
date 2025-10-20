import * as ex from "excalibur";
import type { Player } from "../../../actors/player/player";

export class InventoryEngine {
  private engine: ex.Engine;
  private scene: ex.Scene;
  private playerDisplay: ex.Actor | null = null;

  constructor(canvasId: string) {
    this.engine = new ex.Engine({
      canvasElementId: canvasId,
      width: 96,
      height: 108,
      displayMode: ex.DisplayMode.Fixed,
      pixelArt: true,
      backgroundColor: ex.Color.Transparent,
      suppressConsoleBootMessage: true,
      suppressMinimumBrowserFeatureDetection: true,
      suppressPlayButton: true,
    });

    this.scene = new ex.Scene();
    this.engine.addScene("inventory", this.scene);

    this.engine.start().then(() => {
      this.engine.goToScene("inventory");
    });
  }

  public setPlayer(player: Player) {
    if (this.playerDisplay) {
      this.scene.remove(this.playerDisplay);
      this.playerDisplay.kill();
      this.playerDisplay = null;
    }

    try {
      this.playerDisplay = player.createDisplayClone();

      const children = [...this.playerDisplay.children];

      children.forEach((child) => {
        if (child.name !== "player-weapon") {
          this.playerDisplay!.removeChild(child);
          child.kill();
        }
      });

      this.playerDisplay.pos = ex.vec(40, 48);
      this.scene.camera.zoom = 1.5;

      this.scene.add(this.playerDisplay);
    } catch (error) {
      console.error("createDisplayClone failed:", error);

      this.playerDisplay = new ex.Actor({
        pos: ex.vec(40, 48),
        width: player.width,
        height: player.height,
        collisionType: ex.CollisionType.PreventCollision,
      });

      const currentGraphic = player.graphics.current;
      if (currentGraphic) {
        this.playerDisplay.graphics.use(currentGraphic);
      }

      this.playerDisplay.scale = player.scale;
      this.scene.add(this.playerDisplay);
    }
  }

  public updatePlayerEquipment(player: Player) {
    this.setPlayer(player);
  }

  public async destroy() {
    if (this.playerDisplay) {
      this.scene.remove(this.playerDisplay);
      this.playerDisplay.kill();
      this.playerDisplay = null;
    }

    this.scene.clear();

    await this.engine.stop();

    if (this.scene) {
      this.scene.clear();
    }
  }
}
