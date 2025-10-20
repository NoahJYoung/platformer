import {
  CollisionType,
  Actor,
  Color,
  vec,
  Label,
  Font,
  TextAlign,
  Canvas,
} from "excalibur";
import type { GameEngine } from "../game-engine";
import { StarField } from "./star-field";

export type Season = "summer" | "fall" | "winter" | "spring";

export class TimeCycle {
  private game: GameEngine;
  private overlay: Actor;
  private timeOfDay: number;
  private cycleSpeed: number;
  private season: Season;
  private dayInSeason: number;
  private daysPerSeason: number;
  private seasonChangeCallbacks: ((season: Season) => void)[];
  private addedScenes: Set<ex.Scene> = new Set();
  public starField: StarField | null = null;

  private isTransitioning: boolean = false;
  private transitionProgress: number = 0;
  private transitionDuration: number = 3;
  private transitionOverlay: Actor | null = null;
  private seasonLabel: Label | null = null;

  private ambientTemperature: number = 20;
  private gradientCanvas: Canvas | null = null;

  constructor(game: GameEngine) {
    this.game = game;
    this.overlay = new Actor({
      pos: vec(0, 0),
      width: game.drawWidth * 2,
      height: game.drawHeight * 2,
      collisionType: CollisionType.PreventCollision,
      z: 1000,
    });
    this.overlay.anchor = vec(0.5, 0.5);

    this.createGradientCanvas();

    this.timeOfDay = 20;
    this.cycleSpeed = 0.017;

    this.season = "spring";
    this.dayInSeason = 1;
    this.daysPerSeason = 30;
    this.seasonChangeCallbacks = [];
    this.starField = new StarField(game);
  }

  private createGradientCanvas() {
    const width = this.game.drawWidth * 2;
    const height = this.game.drawHeight * 2;

    this.gradientCanvas = new Canvas({
      width: width,
      height: height,
      cache: true,
      draw: (ctx) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);

        gradient.addColorStop(0, "rgba(12, 12, 26, 0)");
        gradient.addColorStop(0.19, "rgba(12, 12, 26, 0)");
        gradient.addColorStop(0.2, "rgba(12, 12, 26, 0.7)");
        gradient.addColorStop(0.4, "rgba(12, 12, 26, 0.95)");
        gradient.addColorStop(0.6, "rgba(12, 12, 26, 0.99)");
        gradient.addColorStop(1, "rgba(12, 12, 26, 1)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      },
    });

    this.overlay.graphics.use(this.gradientCanvas);
  }

  update(delta: number) {
    this.timeOfDay += this.cycleSpeed * (delta / 1000);

    if (this.timeOfDay >= 24) {
      this.timeOfDay = 0;
      this.advanceDay();
    }

    const nightData = this.calculateNightEffect(this.timeOfDay);

    this.overlay.graphics.opacity = nightData.opacity;

    this.ambientTemperature = this.calculateAmbientTemperature();

    if (this.game.currentScene && this.game.currentScene.camera) {
      const cam = this.game.currentScene.camera;
      this.overlay.pos = cam.pos;

      if (this.transitionOverlay) {
        this.transitionOverlay.pos = cam.pos;
      }
      if (this.seasonLabel) {
        this.seasonLabel.pos = cam.pos;
      }
    }

    if (this.isTransitioning) {
      this.updateTransition(delta / 1000);
    }

    this.starField?.update(delta);
  }

  private calculateAmbientTemperature(): number {
    let baseTemp: number;
    switch (this.season) {
      case "summer":
        baseTemp = 25;
        break;
      case "fall":
        baseTemp = 15;
        break;
      case "winter":
        baseTemp = -5;
        break;
      case "spring":
        baseTemp = 12;
        break;
    }

    let timeModifier = 0;

    if (this.timeOfDay >= 5 && this.timeOfDay < 14) {
      const progress = (this.timeOfDay - 5) / 9;
      timeModifier = progress * 8;
    } else if (this.timeOfDay >= 14 && this.timeOfDay < 22) {
      const progress = (this.timeOfDay - 14) / 8;
      timeModifier = 8 - progress * 10;
    } else {
      if (this.timeOfDay >= 22) {
        const progress = (this.timeOfDay - 22) / 7;
        timeModifier = -2 - progress * 3;
      } else {
        const progress = this.timeOfDay / 5;
        timeModifier = -5 + progress * 0;
      }
    }

    return Math.round((baseTemp + timeModifier) * 10) / 10;
  }

  getAmbientTemperature(): number {
    return this.ambientTemperature;
  }

  getTemperatureDescription(): string {
    const temp = this.ambientTemperature;

    if (temp < -10) return "Freezing";
    if (temp < 0) return "Very Cold";
    if (temp < 10) return "Cold";
    if (temp < 15) return "Cool";
    if (temp < 20) return "Mild";
    if (temp < 25) return "Warm";
    if (temp < 30) return "Hot";
    return "Very Hot";
  }

  getTemperatureFahrenheit(): number {
    return Math.round(((this.ambientTemperature * 9) / 5 + 32) * 10) / 10;
  }

  private updateTransition(deltaSeconds: number) {
    this.transitionProgress += deltaSeconds;

    if (!this.transitionOverlay) return;

    if (this.transitionProgress < this.transitionDuration / 2) {
      const fadeIn = this.transitionProgress / (this.transitionDuration / 2);
      this.transitionOverlay.graphics.opacity = fadeIn;

      if (this.seasonLabel) {
        this.seasonLabel.graphics.opacity = fadeIn;
      }
    } else if (this.transitionProgress < this.transitionDuration) {
      const fadeOut =
        (this.transitionProgress - this.transitionDuration / 2) /
        (this.transitionDuration / 2);
      this.transitionOverlay.graphics.opacity = 1 - fadeOut;

      if (this.seasonLabel) {
        this.seasonLabel.graphics.opacity = 1 - fadeOut;
      }
    } else {
      this.endTransition();
    }
  }

  private startTransition(newSeason: Season) {
    this.isTransitioning = true;
    this.transitionProgress = 0;

    if (!this.game.currentScene) return;

    if (!this.transitionOverlay) {
      this.transitionOverlay = new Actor({
        pos: vec(0, 0),
        width: this.game.drawWidth * 2,
        height: this.game.drawHeight * 2,
        color: Color.Black,
        collisionType: CollisionType.PreventCollision,
        z: 1500,
      });
      this.transitionOverlay.graphics.opacity = 0;
      this.transitionOverlay.anchor = vec(0.5, 0.5);

      this.game.currentScene.add(this.transitionOverlay);
    }

    if (!this.seasonLabel) {
      const seasonText = this.getSeasonDisplayName(newSeason);

      this.seasonLabel = new Label({
        text: seasonText,
        pos: vec(0, 0),
        font: new Font({
          family: "Arial, sans-serif",
          size: 48,
          bold: true,
          color: Color.White,
          textAlign: TextAlign.Center,
        }),
        z: 1501,
      });
      this.seasonLabel.graphics.opacity = 0;

      this.game.currentScene.add(this.seasonLabel);
    }
  }

  private getSeasonDisplayName(season: Season): string {
    const seasonNames: Record<Season, string> = {
      summer: "Summer",
      fall: "Autumn",
      winter: "Winter",
      spring: "Spring",
    };
    return seasonNames[season];
  }

  private endTransition() {
    this.isTransitioning = false;
    this.transitionProgress = 0;

    if (this.game.currentScene) {
      if (this.transitionOverlay) {
        this.game.currentScene.remove(this.transitionOverlay);
        this.transitionOverlay = null;
      }
      if (this.seasonLabel) {
        this.game.currentScene.remove(this.seasonLabel);
        this.seasonLabel = null;
      }
    }
  }

  advanceDay() {
    this.dayInSeason++;
    if (this.dayInSeason >= this.daysPerSeason) {
      this.dayInSeason = 0;
      this.changeSeason();
    }
  }

  changeSeason() {
    const seasons: Season[] = ["summer", "fall", "winter", "spring"];
    const currentIndex = seasons.indexOf(this.season);
    const nextIndex = (currentIndex + 1) % seasons.length;
    const newSeason = seasons[nextIndex];

    this.startTransition(newSeason);

    setTimeout(() => {
      this.season = newSeason;
      this.seasonChangeCallbacks.forEach((callback) => callback(this.season));
    }, (this.transitionDuration / 2) * 1000);
  }

  setSeason(season: Season) {
    if (["summer", "fall", "winter", "spring"].includes(season)) {
      this.startTransition(season);

      setTimeout(() => {
        this.season = season;
        this.dayInSeason = 0;
        this.seasonChangeCallbacks.forEach((callback) => callback(this.season));
      }, (this.transitionDuration / 2) * 1000);
    }
  }

  onSeasonChange(callback: (season: Season) => void) {
    this.seasonChangeCallbacks.push(callback);
  }

  private getSceneLightStrength = () => {
    // TODO: Get Scene light sources
    const player = this.game.player;
    let lightStrength = 0;
    const itemLightStrength = 0.1;

    if (player) {
      const playerLightSources = player.equipmentManager.equippedLightSources;
      playerLightSources.forEach(() => (lightStrength += itemLightStrength));
    }

    return lightStrength;
  };

  public calculateNightEffect(hour: number) {
    const baseColor = Color.fromHex("#0c0c1aff");
    const sceneLightStrength = this.getSceneLightStrength();
    const maxOpacity = 0.96 - sceneLightStrength;

    let opacity = 0;

    if (hour >= 6 && hour < 18) {
      opacity = 0;
    } else if (hour >= 18 && hour < 21) {
      opacity = ((hour - 18) / 3) * maxOpacity;
    } else if (hour >= 21 || hour < 5) {
      opacity = maxOpacity;
    } else {
      opacity = ((6 - hour) / 1) * maxOpacity;
    }

    return { color: baseColor, opacity };
  }

  public get isNight() {
    return this.timeOfDay >= 21;
  }

  getCurrentSeason() {
    return this.season;
  }

  getTimeOfDay() {
    return this.timeOfDay;
  }

  getDayProgress() {
    return this.dayInSeason / this.daysPerSeason;
  }

  isInTransition() {
    return this.isTransitioning;
  }

  addToScene(scene: ex.Scene) {
    if (!this.addedScenes.has(scene)) {
      scene.add(this.overlay);
      this.addedScenes.add(scene);
    }
  }
}
