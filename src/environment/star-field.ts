import { Actor, Canvas, Color, vec } from "excalibur";
import type { GameEngine } from "../game-engine";

export class StarField {
  private starCanvas: Actor | null = null;
  private game: GameEngine;
  private currentScene: ex.Scene | null = null;
  private seed: number = 12345;
  private starData: Array<{
    x: number;
    y: number;
    size: number;
    brightness: number;
    twinkleOffset: number;
  }> = [];

  constructor(game: GameEngine) {
    this.game = game;
  }

  private seededRandom(seed: number): () => number {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  createStars(scene: ex.Scene) {
    this.removeStars();
    this.currentScene = scene;

    const numStars = 150;
    const viewportWidth = this.game.drawWidth;
    const viewportHeight = this.game.drawHeight;
    const random = this.seededRandom(this.seed);

    this.starData = [];
    for (let i = 0; i < numStars; i++) {
      this.starData.push({
        x: random() * viewportWidth,
        y: random() * (viewportHeight * 0.6),
        size: random() * 1.5 + 0.5,
        brightness: 1,
        twinkleOffset: random() * Math.PI * 2,
      });
    }

    this.starCanvas = new Actor({
      pos: vec(0, 0),
      width: viewportWidth,
      height: viewportHeight,
      anchor: vec(0, 0),
      z: -98.5,
    });

    const canvas = new Canvas({
      width: viewportWidth,
      height: viewportHeight,
      draw: (ctx) => {
        const timeOfDay = this.game.timeCycle.getTimeOfDay();
        const nightData = this.game.timeCycle.calculateNightEffect(timeOfDay);
        const starVisibility = Math.max(0, (nightData.opacity - 0.3) / 0.65);

        if (starVisibility <= 0) return;

        const twinkleSpeed = 0.001;
        const now = Date.now();

        this.starData.forEach((star) => {
          const twinkle =
            Math.sin(now * twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
          const opacity = starVisibility * star.brightness * twinkle;

          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      },
    });

    this.starCanvas.graphics.use(canvas);
    scene.add(this.starCanvas);
  }

  update(delta: number) {
    if (!this.starCanvas || !this.game.currentScene?.camera) return;

    const camera = this.game.currentScene.camera;
    const viewportWidth = this.game.drawWidth;
    const viewportHeight = this.game.drawHeight;

    // Update canvas position to follow camera
    this.starCanvas.pos = vec(
      camera.pos.x - viewportWidth / 2,
      camera.pos.y - viewportHeight / 2
    );
  }

  removeStars() {
    if (this.currentScene && this.starCanvas) {
      this.currentScene.remove(this.starCanvas);
      this.starCanvas.kill(); // Kill the actor
      this.starCanvas = null;
    }
    this.starData = [];
  }
}
