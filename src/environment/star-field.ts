import { Actor, Circle, Color, vec } from "excalibur";
import type { GameEngine } from "../game-engine";

export class StarField {
  private stars: Actor[] = [];
  private game: GameEngine;
  private currentScene: ex.Scene | null = null;

  constructor(game: GameEngine) {
    this.game = game;
  }

  createStars(scene: ex.Scene, levelWidth: number, levelHeight: number) {
    // Remove old stars if they exist
    this.removeStars();

    this.currentScene = scene;
    const numStars = 150; // Adjust density as needed

    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * levelWidth;
      const y = Math.random() * (levelHeight * 0.6); // Keep stars in upper portion
      const size = Math.random() * 1.5 + 0.5; // Random size between 0.5 and 2
      const brightness = Math.random() * 0.5 + 0.5; // Random brightness

      const star = new Actor({
        pos: vec(x, y),
        z: -99.7, // Between sky (-100/-99.5) and mountains (-99/-98.5)
      });

      const starGraphic = new Circle({
        radius: size,
        color: Color.White,
      });

      star.graphics.use(starGraphic);
      starGraphic.opacity = 0; // Start invisible

      // Store initial position and properties for parallax
      (star as any).initialX = x;
      (star as any).initialY = y;
      (star as any).brightness = brightness;
      (star as any).twinkleOffset = Math.random() * Math.PI * 2;

      scene.add(star);
      this.stars.push(star);
    }
  }

  update(delta: number) {
    if (!this.currentScene || !this.game.currentScene?.camera) return;

    const camera = this.game.currentScene.camera;
    const timeOfDay = this.game.timeCycle.getTimeOfDay();
    const nightData = this.game.timeCycle.calculateNightEffect(timeOfDay);

    // Calculate star visibility based on night darkness
    const starVisibility = Math.max(0, (nightData.opacity - 0.3) / 0.65);

    this.stars.forEach((star, index) => {
      // Parallax effect (stars move slightly with camera)
      const parallaxSpeed = -0.65; // Between sky (-0.6) and mountains (-0.5)
      const cameraOffset =
        (camera.pos.x - this.game.drawWidth / 2) * parallaxSpeed;

      star.pos = vec(
        (star as any).initialX - cameraOffset,
        (star as any).initialY +
          (camera.pos.y - this.game.drawHeight / 2) * parallaxSpeed
      );

      // Twinkling effect
      const twinkleSpeed = 0.001;
      const twinkle =
        Math.sin(Date.now() * twinkleSpeed + (star as any).twinkleOffset) *
          0.3 +
        0.7;

      // Set opacity based on night time and twinkling
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
