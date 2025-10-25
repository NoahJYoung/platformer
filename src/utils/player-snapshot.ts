import * as ex from "excalibur";
import type { Player } from "../actors/player/player";

export class PlayerSnapshot {
  private static engine: ex.Engine | null = null;
  private static scene: ex.Scene | null = null;
  private static canvas: HTMLCanvasElement | null = null;
  private static isInitialized = false;

  private static async initialize() {
    if (this.isInitialized) return;

    this.canvas = document.createElement("canvas");
    this.canvas.width = 96;
    this.canvas.height = 108;
    this.canvas.style.display = "none";
    document.body.appendChild(this.canvas);

    this.engine = new ex.Engine({
      canvasElement: this.canvas,
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
    this.engine.addScene("snapshot", this.scene);

    await this.engine.start();
    await this.engine.goToScene("snapshot");

    this.isInitialized = true;
  }

  static async createSnapshot(player: Player): Promise<string> {
    await this.initialize();

    if (!this.engine || !this.scene || !this.canvas) {
      throw new Error("Snapshot engine not initialized");
    }

    this.scene.clear();

    try {
      const playerClone = player.createDisplayClone();

      const children = [...playerClone.children];
      children.forEach((child) => {
        if (child.name !== "player-weapon") {
          playerClone.removeChild(child);
          child.kill();
        }
      });

      playerClone.pos = ex.vec(48, 54);
      this.scene.camera.zoom = 1.5;
      this.scene.add(playerClone);

      await new Promise<void>((resolve) => {
        let frameCount = 0;
        const renderFrame = () => {
          frameCount++;
          if (frameCount >= 3) {
            resolve();
          } else {
            requestAnimationFrame(renderFrame);
          }
        };
        requestAnimationFrame(renderFrame);
      });

      const dataUrl = this.canvas.toDataURL("image/png");

      this.scene.remove(playerClone);
      playerClone.kill();

      return dataUrl;
    } catch (error) {
      console.error("Failed to create player snapshot:", error);

      return "";
    }
  }

  static cleanup() {
    if (this.engine) {
      this.engine.stop();
      this.engine = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }
    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }
    this.isInitialized = false;
  }
}
