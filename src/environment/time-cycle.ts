import {
  CollisionType,
  Actor,
  Color,
  vec,
  Label,
  Font,
  TextAlign,
  Canvas,
  clamp,
} from "excalibur";
import type { GameEngine } from "../engine/game-engine";
import { StarField } from "./star-field";
import type { WeatherType } from "./types";
import { WeatherOverlay } from "./weather-overlay";
import { AudioKeys } from "../audio/sound-manager/audio-keys";
import type { GameSoundManager } from "../audio/sound-manager/sound-manager";
import type { SceneType } from "../scenes/types";
import type { GameMapScene } from "../scenes/game-scene";

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

  private weather: WeatherType = "clear";
  private minRainOvarlayOpacity = 0.3;
  private minSnowOverlayOpacity = 0.25;
  private weatherOverlay: WeatherOverlay;
  private weatherCheckInterval: number = 8;
  private lastWeatherCheck: number = 0;

  private seasonOverride: Season | null = null;

  private darkMessageShown = false;
  private lightMessageShown = false;

  private currentBiome: SceneType = "forest";
  private currentAmbientSound: string | null = null;
  private targetAmbientSound: string | null = null;
  private ambientFadeSpeed: number = 0.2;
  private isDayTime: boolean = true;
  private ambientSoundCheckInterval: number = 1;
  private lastAmbientSoundCheck: number = 0;
  private soundManager;

  private lightningTimer: number = 0;
  private nextLightningTime: number = 0;
  private minLightningInterval: number = 30;
  private maxLightningInterval: number = 60;
  private firstFlash = false;

  constructor(game: GameEngine, soundManager: GameSoundManager) {
    this.game = game;
    this.soundManager = soundManager;

    this.overlay = new Actor({
      pos: vec(0, 0),
      width: game.drawWidth * 2,
      height: game.drawHeight * 2,
      collisionType: CollisionType.PreventCollision,
      z: 1000,
    });
    this.overlay.anchor = vec(0.5, 0.5);

    this.createGradientCanvas();

    this.timeOfDay = 6;
    this.cycleSpeed = 0.034;

    this.season = "spring";
    this.dayInSeason = 1;
    this.daysPerSeason = 31;
    this.seasonChangeCallbacks = [];
    this.starField = new StarField(game);
    this.weatherOverlay = new WeatherOverlay(game);

    this.weatherOverlay.createWeatherEffect(game.currentScene);
  }

  public initialize() {
    if (this.soundManager) {
      this.updateWeather();
      this.updateAmbientSound().catch(console.error);
    }
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
    this.weatherOverlay.update(delta);
    this.timeOfDay += this.cycleSpeed * (delta / 1000);

    if (this.timeOfDay >= 24) {
      this.timeOfDay = 0;
      this.advanceDay();
    }

    this.checkWeatherChange();
    this.checkAmbientSoundChange(delta);
    this.checkLightning(delta);

    const nightData = this.calculateDarkEffect(this.timeOfDay);
    this.weatherOverlay.update(delta);

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

  private checkAmbientSoundChange(delta: number) {
    this.lastAmbientSoundCheck += delta / 1000;

    if (this.lastAmbientSoundCheck >= this.ambientSoundCheckInterval) {
      this.lastAmbientSoundCheck = 0;

      const wasDay = this.isDayTime;
      this.isDayTime = this.timeOfDay >= 6 && this.timeOfDay < 20;

      if (wasDay !== this.isDayTime) {
        this.updateAmbientSound().catch(console.error);
      }
    }
  }

  private getAmbientSoundKey(): string {
    const timeOfDay = this.isDayTime ? "DAY" : "NIGHT";
    const biome = this.currentBiome.toUpperCase();
    const weather = this.weather;

    if (weather === "raining") {
      return AudioKeys.AMBIENT.WEATHER.RAIN;
    }

    return (AudioKeys.AMBIENT as Record<string, any>)[
      biome as keyof typeof AudioKeys.AMBIENT
    ][timeOfDay];
  }

  private async updateAmbientSound() {
    if (!this.soundManager) {
      console.warn(
        "Sound manager not initialized, skipping ambient sound update"
      );
      return;
    }

    const newSoundKey = this.getAmbientSoundKey();

    if (newSoundKey === this.currentAmbientSound) {
      return;
    }

    this.targetAmbientSound = newSoundKey;

    const soundToStop = this.currentAmbientSound;

    if (soundToStop) {
      const currentSound = this.soundManager.getSound(soundToStop);

      if (currentSound && currentSound.isPlaying()) {
        this.soundManager.fadeOut(
          soundToStop,
          1 / this.ambientFadeSpeed,
          () => {
            if (this.soundManager) {
              this.soundManager.stop(soundToStop);
            }
          }
        );
      } else {
        if (currentSound) {
          this.soundManager.stop(soundToStop);
        }
      }
    }

    if (this.targetAmbientSound) {
      await this.soundManager.playLooped(this.targetAmbientSound, 0, true);

      this.soundManager.fadeIn(
        this.targetAmbientSound,
        1 / this.ambientFadeSpeed,
        0.3
      );
    }

    this.currentAmbientSound = this.targetAmbientSound;
  }

  public setBiome(biome: SceneType) {
    if (this.currentBiome !== biome) {
      this.currentBiome = biome;
      this.updateAmbientSound().catch(console.error);
    }
  }

  public getBiome(): SceneType {
    return this.currentBiome;
  }

  public refreshAmbientSound() {
    this.updateAmbientSound().catch(console.error);
  }

  public getCurrentAmbientSound() {
    return this.currentAmbientSound;
  }

  public stopAmbientSounds() {
    if (!this.soundManager) {
      return;
    }

    if (this.currentAmbientSound) {
      this.soundManager.fadeOut(this.currentAmbientSound, 0.5, () => {
        if (this.soundManager) {
          this.soundManager.stop(this.currentAmbientSound!);
          this.currentAmbientSound = null;
        }
      });
    }
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

    switch (this.weather) {
      case "raining":
        baseTemp -= 6;
        break;
      case "snowing":
        baseTemp -= 10;
        break;
      case "clear":
      default:
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

    const messages: Record<Season, string> = {
      fall: "It is a crisp fall night",
      winter: "It is a cold winter night",
      spring: "It is a mild spring night",
      summer: "It is a hot summer night",
    };

    this.game.showMessage(messages[newSeason]);

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

  getWeather() {
    return this.weather;
  }

  private getWeatherProbabilities(season: Season): {
    rain: number;
    snow: number;
    clear: number;
  } {
    switch (season) {
      case "spring":
        return { rain: 0.25, snow: 0, clear: 0.75 };
      case "summer":
        return { rain: 0.1, snow: 0, clear: 0.9 };
      case "fall":
        return { rain: 0.35, snow: 0.1, clear: 0.55 };
      case "winter":
        return { rain: 0.1, snow: 0.4, clear: 0.5 };
    }
  }

  private checkEquippedLightSources() {
    const player = (this.game.currentScene as GameMapScene).player;
    if (player?.getIsInside()) {
      return;
    }
    const lightSources = player?.equipmentManager.equippedLightSources;
    if (
      lightSources?.some(
        (source) => source.tags?.includes("torch") && source.slot === "offhand"
      )
    ) {
      player?.unequipItem("offhand");
      this.game.showMessage("Your torch went out due to the rain");
      player?.events.emit("resourcesChanged");
    }
  }

  private checkWeatherChange() {
    if (this.weather === "raining") {
      this.checkEquippedLightSources();
    }
    const hoursSinceLastCheck = Math.abs(
      this.timeOfDay - this.lastWeatherCheck
    );

    if (hoursSinceLastCheck >= this.weatherCheckInterval) {
      this.lastWeatherCheck = this.timeOfDay;
      this.updateWeather();
    }
  }

  private updateWeather() {
    const probabilities = this.getWeatherProbabilities(this.season);
    const random = Math.random();

    let newWeather: WeatherType = "clear";

    if (random < probabilities.snow) {
      newWeather = "snowing";
      this.firstFlash = false;
    } else if (random < probabilities.snow + probabilities.rain) {
      newWeather = "raining";
      this.flashLightning();

      setTimeout(() => (this.firstFlash = true), 10000);
    } else {
      newWeather = "clear";
      this.firstFlash = false;
    }

    if (newWeather !== this.weather) {
      this.weather = newWeather;
      this.updateAmbientSound();

      if (this.game.currentScene) {
        this.weatherOverlay.switchScene(this.game.currentScene);
      }
      const messages: Record<WeatherType, string> = {
        raining: "It has started to rain",
        clear: "The weather cleared up",
        snowing: "It has started to snow",
      };

      this.game.showMessage(messages[newWeather]);
    }
  }

  private checkLightning(delta: number) {
    if (this.weather !== "raining" || !this.firstFlash) {
      this.lightningTimer = 0;
      return;
    }

    this.lightningTimer += delta / 1000;

    if (this.lightningTimer >= this.nextLightningTime) {
      this.flashLightning();

      this.lightningTimer = 0;
      this.nextLightningTime =
        this.minLightningInterval +
        Math.random() * (this.maxLightningInterval - this.minLightningInterval);
    }
  }

  private flashLightning() {
    if (!this.overlay) return;

    const originalCanvas = this.overlay.graphics.current;

    if (!originalCanvas) {
      return;
    }

    this.soundManager.play(AudioKeys.AMBIENT.WEATHER.THUNDER, 0.2);

    const flashCanvas = new Canvas({
      width: this.game.drawWidth * 2,
      height: this.game.drawHeight * 2,
      cache: true,
      draw: (ctx) => {
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillRect(0, 0, this.game.drawWidth * 2, this.game.drawHeight * 2);
      },
    });

    this.overlay.graphics.use(flashCanvas);

    setTimeout(() => {
      this.overlay.graphics.use(originalCanvas);

      setTimeout(() => {
        this.overlay.graphics.use(flashCanvas);

        setTimeout(() => {
          this.overlay.graphics.use(originalCanvas);
        }, 100);
      }, 150);
    }, 100);
  }

  private getSceneLightStrength = () => {
    const player = this.game.player;
    let lightStrength = 0;
    const itemLightStrength = 0.15;

    if (player) {
      const playerLightSources = player.equipmentManager.equippedLightSources;
      playerLightSources.forEach(() => (lightStrength += itemLightStrength));
    }

    return lightStrength;
  };

  public calculateDarkEffect(hour: number) {
    const baseColor = Color.fromHex("#0c0c1aff");
    const sceneLightStrength = this.getSceneLightStrength();
    const maxOpacity = 0.99 - sceneLightStrength;

    const minOpacity =
      this.weather === "clear"
        ? 0
        : this.weather === "raining"
        ? this.minRainOvarlayOpacity
        : this.minSnowOverlayOpacity;

    let opacity = 0;

    if (hour >= 6 && hour < 18) {
      opacity = minOpacity;
    } else if (hour >= 18 && hour < 21) {
      if (!this.darkMessageShown) {
        this.game.showMessage("It's getting dark...");
        this.darkMessageShown = true;
        this.lightMessageShown = false;
      }
      opacity = clamp(((hour - 18) / 3) * maxOpacity, minOpacity, maxOpacity);
    } else if (hour >= 21 || hour < 5) {
      opacity = maxOpacity;
    } else {
      if (!this.lightMessageShown) {
        this.game.showMessage("The sun is rising");
        this.lightMessageShown = true;
        this.darkMessageShown = false;
      }
      opacity = clamp(((6 - hour) / 1) * maxOpacity, minOpacity, maxOpacity);
    }

    return { color: baseColor, opacity };
  }

  public get isNight() {
    return this.timeOfDay >= 21;
  }

  getCurrentSeason() {
    return this.seasonOverride ?? this.season;
  }

  setSeasonOverride(season: Season | null) {
    this.seasonOverride = season;
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
