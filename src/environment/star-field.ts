import { Actor, Circle, Color, vec } from "excalibur";
import type { GameEngine } from "../game-engine";

export class StarField {
  private stars: Actor[] = [];
  private game: GameEngine;
  private currentScene: ex.Scene | null = null;
  private seed: number = 12345; // Change this to get different star patterns

  constructor(game: GameEngine) {
    this.game = game;
  }

  // Seeded random number generator (LCG algorithm)
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

    for (let i = 0; i < numStars; i++) {
      const x = random() * viewportWidth;
      const y = random() * (viewportHeight * 0.6);
      const size = random() * 1.5 + 0.5;
      const brightness = 1;

      const star = new Actor({
        pos: vec(x, y),
        z: -98.5,
      });

      const starGraphic = new Circle({
        radius: size,
        color: Color.White,
      });

      star.graphics.use(starGraphic);
      starGraphic.opacity = 0;

      (star as any).viewportX = x;
      (star as any).viewportY = y;
      (star as any).brightness = brightness;
      (star as any).twinkleOffset = random() * Math.PI * 2;

      scene.add(star);
      this.stars.push(star);
    }
  }

  update(delta: number) {
    if (!this.currentScene || !this.game.currentScene?.camera) return;

    const camera = this.game.currentScene.camera;
    const timeOfDay = this.game.timeCycle.getTimeOfDay();
    const nightData = this.game.timeCycle.calculateNightEffect(timeOfDay);

    const starVisibility = Math.max(0, (nightData.opacity - 0.3) / 0.65);

    const viewportWidth = this.game.drawWidth;
    const viewportHeight = this.game.drawHeight;

    this.stars.forEach((star, index) => {
      star.pos = vec(
        camera.pos.x - viewportWidth / 2 + (star as any).viewportX,
        camera.pos.y - viewportHeight / 2 + (star as any).viewportY
      );

      const twinkleSpeed = 0.001;
      const twinkle =
        Math.sin(Date.now() * twinkleSpeed + (star as any).twinkleOffset) *
          0.3 +
        0.7;

      const graphic = star.graphics.current as Circle | null;
      if (graphic) {
        graphic.opacity = starVisibility * (star as any).brightness * twinkle;
      }
    });
  }

  removeStars() {
    if (this.currentScene) {
      this.stars.forEach((star) => {
        this.currentScene?.remove(star);
      });
    }
    this.stars = [];
  }
}
