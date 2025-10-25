import { Actor, Canvas, vec } from "excalibur";
import type { GameEngine } from "../engine/game-engine";

export class WeatherOverlay {
  private weatherCanvas: Actor | null = null;
  private game: GameEngine;
  private currentScene: ex.Scene | null = null;
  private seed: number = 54321;
  private particleData: Array<{
    x: number;
    y: number;
    speed: number;
    length: number;
    opacity: number;
    windOffset: number;
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

  createWeatherEffect(scene: ex.Scene) {
    this.removeWeatherEffect();
    this.currentScene = scene;

    const viewportWidth = this.game.drawWidth;
    const viewportHeight = this.game.drawHeight;

    this.weatherCanvas = new Actor({
      pos: vec(0, 0),
      width: viewportWidth,
      height: viewportHeight,
      anchor: vec(0, 0),
      z: 999,
    });

    const canvas = new Canvas({
      width: viewportWidth,
      height: viewportHeight,
      draw: (ctx) => {
        const weather = this.game.timeCycle.getWeather();

        if (weather === "clear") return;

        const now = Date.now();

        if (weather === "raining") {
          this.drawRain(ctx, now, viewportWidth, viewportHeight);
        } else if (weather === "snowing") {
          this.drawSnow(ctx, now, viewportWidth, viewportHeight);
        }
      },
    });

    this.weatherCanvas.graphics.use(canvas);
    scene.add(this.weatherCanvas);
  }

  switchScene(newScene: ex.Scene) {
    this.createWeatherEffect(newScene);
  }

  private initializeParticles(
    count: number,
    viewportWidth: number,
    viewportHeight: number,
    isRain: boolean
  ) {
    const random = this.seededRandom(this.seed);
    this.particleData = [];

    for (let i = 0; i < count; i++) {
      this.particleData.push({
        x: random() * viewportWidth,
        y: random() * viewportHeight,
        speed: isRain ? random() * 3 + 4 : random() * 0.5 + 0.3,
        length: isRain ? random() * 10 + 10 : random() * 1 + 1,
        opacity: isRain ? random() * 0.3 + 0.3 : random() * 0.6 + 0.4,
        windOffset: random() * 0.5,
      });
    }
  }

  private drawRain(
    ctx: CanvasRenderingContext2D,
    now: number,
    width: number,
    height: number
  ) {
    if (this.particleData.length === 0) {
      this.initializeParticles(150, width, height, true);
    }

    const deltaTime = 16;
    const windStrength = Math.sin(now * 0.0005) * 2;

    this.particleData.forEach((drop) => {
      drop.y += drop.speed;
      drop.x += windStrength * drop.windOffset;

      if (drop.y > height) {
        drop.y = -drop.length;
        drop.x = Math.random() * width;
      }
      if (drop.x > width) drop.x = 0;
      if (drop.x < 0) drop.x = width;

      ctx.strokeStyle = `rgba(174, 194, 224, ${drop.opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + windStrength * 0.5, drop.y + drop.length);
      ctx.stroke();
    });
  }

  private drawSnow(
    ctx: CanvasRenderingContext2D,
    now: number,
    width: number,
    height: number
  ) {
    if (this.particleData.length === 0) {
      this.initializeParticles(100, width, height, false);
    }

    const windStrength = Math.sin(now * 0.001) * 1.5;

    this.particleData.forEach((flake) => {
      const sway = Math.sin(now * 0.002 + flake.windOffset * 10) * 0.5;
      flake.y += flake.speed;
      flake.x += windStrength * 0.3 + sway;

      if (flake.y > height) {
        flake.y = -flake.length;
        flake.x = Math.random() * width;
      }
      if (flake.x > width) flake.x = 0;
      if (flake.x < 0) flake.x = width;

      ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.length, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  update(delta: number) {
    if (this.game.currentScene !== this.currentScene) {
      this.switchScene(this.game.currentScene);
    }
    if (!this.weatherCanvas || !this.game.currentScene?.camera) return;

    const camera = this.game.currentScene.camera;
    const viewportWidth = this.game.drawWidth;
    const viewportHeight = this.game.drawHeight;

    this.weatherCanvas.pos = vec(
      camera.pos.x - viewportWidth / 2,
      camera.pos.y - viewportHeight / 2
    );

    const weather = this.game.timeCycle.getWeather();
    if (weather === "clear" && this.particleData.length > 0) {
      this.particleData = [];
    }
  }

  removeWeatherEffect() {
    if (this.currentScene && this.weatherCanvas) {
      this.currentScene.remove(this.weatherCanvas);
      this.weatherCanvas.kill();
      this.weatherCanvas = null;
    }
    this.particleData = [];
  }
}
