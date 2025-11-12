import * as ex from "excalibur";
import { WaterResources } from "../../../resources/water-resources";
import { CollisionGroups } from "../../config";
import { AudioKeys } from "../../../audio/sound-manager/audio-keys";
import type { GameEngine } from "../../../engine/game-engine";
import type { Character } from "../../character/character";
import type { Player } from "../../player/player";

export class WaterPool extends ex.Actor {
  private spriteSheet!: ex.SpriteSheet;
  private tileWidth: number = 32;
  private tileHeight: number = 32;
  private animationFrames: ex.GraphicsGroup[] = [];
  private currentFrame: number = 0;
  private animationTimer: number = 0;
  private animationSpeed: number = 200;
  private splashEmitters: Map<string, ex.ParticleEmitter> = new Map();
  private interactionIndicator?: ex.Actor;
  private isPlayerNearby: boolean = false;

  constructor(pos: ex.Vector, width: number, height: 32 | 64, z: number = 2) {
    super({
      name: `water_pool_${Date.now()}`,
      pos,
      width,
      height,
      z,
      anchor: ex.vec(0, 1),
      collisionGroup: CollisionGroups.Environment,
    });
  }

  onInitialize(engine: GameEngine): void {
    this.spriteSheet = ex.SpriteSheet.fromImageSource({
      image: WaterResources.water_pool,
      grid: {
        rows: 6,
        columns: 5,
        spriteWidth: 32,
        spriteHeight: 32,
      },
    });

    this.animationFrames = this.createAnimationFrames();

    this.graphics.use(this.animationFrames[0]);

    this.setupInteractionIndicator();
    this.setupColliders(engine);
  }

  private setupInteractionIndicator(): void {
    this.interactionIndicator = new ex.Actor({
      pos: ex.vec(0, -this.height - 20),
      width: 32,
      height: 16,
      collisionType: ex.CollisionType.PreventCollision,
      z: this.z + 1,
    });

    const keyText = new ex.Text({
      text: "[F]",
      font: new ex.Font({
        size: 10,
        family: "Arial",
        bold: true,
        color: ex.Color.White,
        shadow: {
          offset: ex.vec(1, 1),
          color: ex.Color.Black,
        },
      }),
    });

    this.interactionIndicator.graphics.use(keyText);
    this.interactionIndicator.graphics.visible = false;
    this.addChild(this.interactionIndicator);
  }

  private setupColliders(engine: GameEngine): void {
    const floorHeight = 8;

    this.body.collisionType = ex.CollisionType.Fixed;

    const colliders: ex.Collider[] = [];

    const centerFloorWidth = this.width;
    if (centerFloorWidth > 0) {
      colliders.push(
        ex.Shape.Box(
          this.width,
          floorHeight,
          ex.vec(0, 1),
          ex.vec(-this.width / 2 + 16, floorHeight / 2)
        )
      );
    }

    this.collider.useCompositeCollider(colliders);

    const waterTrigger = new ex.Actor({
      name: `${this.name}_water_trigger`,
      pos: ex.vec(32, -this.height * 2),
      width: this.width,
      height: this.height,
      anchor: ex.vec(0.5, 0.5),
      collisionType: ex.CollisionType.Passive,
      z: 10,
    });

    waterTrigger.collider.useBoxCollider(this.width, this.height);
    waterTrigger.body.collisionType = ex.CollisionType.Passive;

    waterTrigger.on("collisionstart", (evt) => {
      if (
        ["player", "enemy", "ally"].includes(
          (evt.other.owner as ex.Actor)?.name
        )
      ) {
        const char = evt.other.owner as Character;
        char.setIsInWater(true);
        const splashKey = AudioKeys.SFX.PLAYER.MOVEMENT.SPLASH;
        engine.soundManager.play(splashKey, 0.3);

        this.createSplashEffect(evt.other.owner.pos, engine, "enter");

        if ((evt.other.owner as ex.Actor)?.name === "player") {
          this.handlePlayerEnter(evt.other.owner as any);
        }
      }
    });

    waterTrigger.on("collisionend", (evt) => {
      if (
        ["player", "enemy", "ally"].includes(
          (evt.other.owner as ex.Actor)?.name
        )
      ) {
        const char = evt.other.owner as Character;
        char.setIsInWater(false);
        const exitKey = AudioKeys.SFX.PLAYER.MOVEMENT.EXIT_WATER;
        engine.soundManager.play(exitKey, 0.8);

        this.createSplashEffect(evt.other.owner.pos, engine, "exit");

        if ((evt.other.owner as ex.Actor)?.name === "player") {
          this.handlePlayerExit(evt.other.owner as any);
        }
      }
    });

    this.addChild(waterTrigger);
  }

  private createSplashEffect(
    position: ex.Vector,
    engine: GameEngine,
    type: "enter" | "exit"
  ): void {
    const waterSurfaceY = this.pos.y - this.height * 2;

    const emitter = new ex.ParticleEmitter({
      pos: ex.vec(position.x, waterSurfaceY),
      emitterType: ex.EmitterType.Circle,
      radius: 5,
      isEmitting: false,
      emitRate: 50,
      particle: {
        minSpeed: type === "exit" ? 100 : 140,
        maxSpeed: type === "exit" ? 180 : 250,
        minAngle: 0,
        maxAngle: Math.PI * 2,
        life: type === "exit" ? 500 : 600,
        opacity: 0.85,
        fade: true,
        minSize: type === "exit" ? 2 : 2.5,
        maxSize: type === "exit" ? 3.5 : 4.5,
        startSize: type === "exit" ? 3 : 3.5,
        endSize: 0.3,
        acc: ex.vec(0, type === "exit" ? 400 : 600),
        beginColor: ex.Color.fromHex("#7fdbdb"),
        endColor: ex.Color.fromHex("#a8e6e6"),
      },
    });

    emitter.z = 100;

    engine.add(emitter);

    emitter.emitParticles(type === "enter" ? 10 : 15);

    setTimeout(
      () => {
        emitter.kill();
      },
      type === "enter" ? 700 : 800
    );
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    this.animationTimer += delta;

    if (this.animationTimer >= this.animationSpeed) {
      this.animationTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % 3;
      this.graphics.use(this.animationFrames[this.currentFrame]);
    }
  }

  private createAnimationFrames(): ex.GraphicsGroup[] {
    const frames: ex.GraphicsGroup[] = [];
    const isDoubleTile = this.height === 64;

    const animationRowPairs = [
      { topRow: 0, fillRow: 1 },
      { topRow: 2, fillRow: 3 },
      { topRow: 4, fillRow: 5 },
    ];

    for (const rowPair of animationRowPairs) {
      frames.push(
        this.createWaterFrame(rowPair.topRow, rowPair.fillRow, isDoubleTile)
      );
    }

    return frames;
  }

  private createWaterFrame(
    topRow: number,
    fillRow: number,
    isDoubleTile: boolean
  ): ex.GraphicsGroup {
    const tilesWide = Math.ceil(this.width / this.tileWidth);
    const tilesHigh = isDoubleTile ? 2 : 1;
    const members: ex.GraphicsGrouping[] = [];

    for (let row = 0; row < tilesHigh; row++) {
      for (let col = 0; col < tilesWide; col++) {
        let spriteCol: number;
        if (col === 0) {
          spriteCol = 0;
        } else if (col === 1) {
          spriteCol = 1;
        } else if (col === tilesWide - 2) {
          spriteCol = 3;
        } else if (col === tilesWide - 1) {
          spriteCol = 4;
        } else {
          spriteCol = 2;
        }

        let spriteRow: number;
        if (row === 0) {
          spriteRow = topRow;
        } else {
          spriteRow = fillRow;
        }

        const sprite = this.spriteSheet.getSprite(spriteCol, spriteRow);

        members.push({
          graphic: sprite.clone(),
          offset: ex.vec(
            col * this.tileWidth - this.width / 2 + this.tileWidth / 2,
            row * this.tileHeight - this.height / 2 + this.tileHeight / 2
          ),
        });
      }
    }

    return new ex.GraphicsGroup({
      members: members,
    });
  }

  private handlePlayerEnter(player: Player): void {
    this.isPlayerNearby = true;
    if (this.interactionIndicator) {
      player.setNearbyWaterSource?.(this);
      this.interactionIndicator.graphics.visible = true;
    }
  }

  private handlePlayerExit(player: Player): void {
    this.isPlayerNearby = false;
    if (this.interactionIndicator) {
      player.setNearbyWaterSource?.(null);
      this.interactionIndicator.graphics.visible = false;
    }
  }

  public getIsPlayerNearby(): boolean {
    return this.isPlayerNearby;
  }
}
