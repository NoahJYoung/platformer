import * as ex from "excalibur";
import { PlayerResources } from "../resources";
import {
  SCALE,
  STANDARD_SPRITE_WIDTH,
  SPRITE_HEIGHT,
  LEFT_MARGIN,
  FRAME_SPACING,
  scale,
  SPRITE_WIDTH,
  SPRITE_BUFFER,
} from "../config";
import type { Character } from "./character";
import type { InventoryItem } from "./inventory";

export type AnimationState =
  | "idle"
  | "walking"
  | "running"
  | "jumping"
  | "falling"
  | "attacking"
  | "dodging"
  | "hurt"
  | "dead";

export class AnimationController {
  // Animation states
  public idleAnim?: ex.Animation;
  public runAnim?: ex.Animation;
  public walkAnim?: ex.Animation;
  public jumpAnim?: ex.Animation;
  public fallAnim?: ex.Animation;
  public attackAnim?: ex.Animation;
  public hurtAnim?: ex.Animation;
  public deadAnim?: ex.Animation;
  public dodgeAnim?: ex.Animation;

  public currentState: AnimationState = "idle";
  public facingRight: boolean;

  private weaponActor?: ex.Actor;
  public weaponSprites?: Map<string, ex.Animation>;
  private equippedWeapon: InventoryItem | null = null;

  private character: Character;
  private sex: "male" | "female";
  private skinTone: 1 | 2 | 3 | 4 | 5;
  private hairStyle: 1 | 2 | 3 | 4 | 5;

  private afterimageTimer: number = 0;

  constructor(
    character: Character,
    sex: "male" | "female",
    skinTone: 1 | 2 | 3 | 4 | 5,
    hairStyle: 1 | 2 | 3 | 4 | 5,
    facingRight: boolean
  ) {
    this.character = character;
    this.sex = sex;
    this.skinTone = skinTone;
    this.hairStyle = hairStyle;
    this.facingRight = facingRight;
  }

  public setupAnimations() {
    const createLayeredAnimation = (
      row: number,
      frameCount: number,
      frameDuration: number,
      strategy: ex.AnimationStrategy = ex.AnimationStrategy.Loop
    ): ex.Animation => {
      const skinSheet = ex.SpriteSheet.fromImageSource({
        image: PlayerResources[this.sex].skin[`skin_${this.skinTone}`],
        grid: {
          rows: 7,
          columns: frameCount,
          spriteWidth: STANDARD_SPRITE_WIDTH,
          spriteHeight: SPRITE_HEIGHT - SPRITE_BUFFER,
        },
        spacing: {
          originOffset: { x: LEFT_MARGIN, y: SPRITE_BUFFER },
          margin: { x: FRAME_SPACING, y: SPRITE_BUFFER },
        },
      });

      const hairSheet = ex.SpriteSheet.fromImageSource({
        image: PlayerResources[this.sex].hair[`hair_${this.hairStyle}`],
        grid: {
          rows: 7,
          columns: frameCount,
          spriteWidth: STANDARD_SPRITE_WIDTH,
          spriteHeight: SPRITE_HEIGHT - SPRITE_BUFFER,
        },
        spacing: {
          originOffset: { x: LEFT_MARGIN, y: SPRITE_BUFFER },
          margin: { x: FRAME_SPACING, y: SPRITE_BUFFER },
        },
      });

      const frames = ex.range(0, frameCount - 1).map((frameIndex) => {
        const skinSprite = skinSheet.getSprite(frameIndex, row);
        const hairSprite = hairSheet.getSprite(frameIndex, row);

        if (skinSprite && hairSprite) {
          skinSprite.scale = scale;
          hairSprite.scale = scale;

          const xOffset = 24 * SCALE;
          const yOffset = -8 * SCALE + (SPRITE_BUFFER / 2) * SCALE;
          const members: Array<{ graphic: ex.Graphic; offset: ex.Vector }> = [
            { graphic: skinSprite, offset: ex.vec(xOffset, yOffset) },
            { graphic: hairSprite, offset: ex.vec(xOffset, yOffset) },
          ];

          const group = new ex.GraphicsGroup({ members });
          return { graphic: group, duration: frameDuration };
        }

        if (skinSprite) {
          skinSprite.scale = scale;
          return { graphic: skinSprite, duration: frameDuration };
        }

        throw new Error(
          `Failed to create sprite at frame ${frameIndex}, row ${row}`
        );
      });

      return new ex.Animation({ frames, strategy });
    };

    this.idleAnim = createLayeredAnimation(0, 5, 100);
    this.hurtAnim = createLayeredAnimation(3, 1, 150);
    this.walkAnim = createLayeredAnimation(1, 8, 100);
    this.runAnim = createLayeredAnimation(2, 8, 80);
    this.jumpAnim = createLayeredAnimation(3, 4, 100);
    this.dodgeAnim = createLayeredAnimation(3, 4, 20, ex.AnimationStrategy.End);
    this.fallAnim = createLayeredAnimation(4, 4, 100);
    this.attackAnim = createLayeredAnimation(5, 6, 100);
    this.deadAnim = createLayeredAnimation(
      6,
      9,
      100,
      ex.AnimationStrategy.Freeze
    );
  }

  public updateAnimation(velocity: ex.Vector) {
    if (
      !this.idleAnim ||
      !this.runAnim ||
      !this.walkAnim ||
      !this.jumpAnim ||
      !this.dodgeAnim
    )
      return;

    if (Math.abs(velocity.x) > 0.1) {
      this.facingRight = velocity.x > 0;
    }

    if (this.facingRight) {
      this.character.offset = ex.vec((SPRITE_WIDTH * SCALE) / 2, 0);
    } else {
      this.character.offset = ex.vec(-(SPRITE_WIDTH * SCALE) / 2, 0);
    }

    this.character.graphics.flipHorizontal = this.facingRight;

    if (this.currentState === "attacking") {
      return;
    }

    switch (this.currentState) {
      case "idle":
        if (this.character.graphics.current !== this.idleAnim) {
          this.character.graphics.use(this.idleAnim);
        }
        break;
      case "walking":
        if (this.character.graphics.current !== this.walkAnim) {
          this.character.graphics.use(this.walkAnim);
        }
        break;
      case "running":
        if (this.character.graphics.current !== this.runAnim) {
          this.character.graphics.use(this.runAnim);
        }
        break;
      case "jumping":
        if (this.character.graphics.current !== this.jumpAnim) {
          this.character.graphics.use(this.jumpAnim);
        }
        break;
      case "falling":
        if (
          this.fallAnim &&
          this.character.graphics.current !== this.fallAnim
        ) {
          this.character.graphics.use(this.fallAnim);
        }
        break;
      case "hurt":
        if (
          this.hurtAnim &&
          this.character.graphics.current !== this.hurtAnim
        ) {
          this.character.graphics.use(this.hurtAnim);
          this.hurtAnim.reset();
          this.hurtAnim.tint = ex.Color.Red;
        }
        break;

      case "dodging":
        if (
          this.jumpAnim &&
          this.character.graphics.current !== this.dodgeAnim
        ) {
          this.character.graphics.use(this.dodgeAnim);
          this.afterimageTimer = 0;
        }

        this.afterimageTimer += 16;
        if (this.afterimageTimer >= 30) {
          this.createAfterimage();
          this.afterimageTimer = 0;
        }

        if (this.dodgeAnim && this.dodgeAnim.done) {
          if (
            "endDodge" in this.character &&
            typeof this.character.endDodge === "function"
          ) {
            this.character.endDodge();
          }
        }
        break;
    }
  }

  private createAfterimage() {
    const afterimage = new ex.Actor({
      pos: this.character.pos.clone(),
      width: this.character.width,
      height: this.character.height,
      offset: this.character.offset.clone(),
      collisionType: ex.CollisionType.PreventCollision,
    });

    const currentGraphic = this.character.graphics.current?.clone();
    if (currentGraphic) {
      afterimage.graphics.use(currentGraphic);
      afterimage.graphics.flipHorizontal = this.facingRight;
      afterimage.graphics.opacity = 0.6;
    }

    this.character.scene?.add(afterimage);

    afterimage.actions.fade(0, 200).die();
  }

  // Weapon sprite management
  public loadWeaponSprites(weapon: InventoryItem) {
    if (!weapon.spriteSheet) return;

    this.weaponSprites = new Map();

    const createWeaponAnimation = (
      frameCount: number,
      row: number,
      frameDuration: number = 100,
      strategy: ex.AnimationStrategy = ex.AnimationStrategy.Loop
    ): ex.Animation => {
      if (!weapon.spriteSheet) {
        throw new Error(`No sprite sheet found for weapon: ${weapon}`);
      }
      const weaponSheet = ex.SpriteSheet.fromImageSource({
        image: weapon.spriteSheet,
        grid: {
          rows: 7,
          columns: frameCount,
          spriteWidth: STANDARD_SPRITE_WIDTH,
          spriteHeight: SPRITE_HEIGHT,
        },
        spacing: {
          originOffset: { x: LEFT_MARGIN, y: 0 },
          margin: { x: FRAME_SPACING, y: 0 },
        },
      });

      const yOffset = -(SPRITE_HEIGHT * SCALE) / 2;

      const frames = ex.range(0, frameCount - 1).map((frameIndex) => {
        const sprite = weaponSheet.getSprite(frameIndex, row);
        if (sprite) {
          sprite.scale = scale;
          const group = new ex.GraphicsGroup({
            members: [{ graphic: sprite, offset: ex.vec(0, yOffset) }],
          });
          return {
            graphic: group,
            duration: frameDuration,
          };
        }
        throw new Error(
          `Failed to load weapon frame ${frameIndex}, row ${row}`
        );
      });

      return new ex.Animation({ frames, strategy });
    };

    this.weaponSprites.set("idle", createWeaponAnimation(5, 0));
    this.weaponSprites.set("walk", createWeaponAnimation(8, 1));
    this.weaponSprites.set("run", createWeaponAnimation(8, 2, 80));
    this.weaponSprites.set("jump", createWeaponAnimation(4, 3));
    this.weaponSprites.set("fall", createWeaponAnimation(4, 4));
    this.weaponSprites.set("hurt", createWeaponAnimation(1, 3, 150));
    this.weaponSprites.set("attack", createWeaponAnimation(6, 5));
    this.weaponSprites.set(
      "dead",
      createWeaponAnimation(9, 6, 100, ex.AnimationStrategy.Freeze)
    );
  }

  public equipWeapon(weapon: InventoryItem) {
    if (this.weaponActor) {
      this.character.removeChild(this.weaponActor);
      this.weaponActor.kill();
    }

    this.equippedWeapon = weapon;

    this.weaponActor = new ex.Actor({
      pos: ex.vec(0, 0),
      collisionType: ex.CollisionType.PreventCollision,
    });

    this.character.addChild(this.weaponActor);
    this.loadWeaponSprites(weapon);
  }

  public unequipWeapon() {
    if (this.weaponActor) {
      this.character.removeChild(this.weaponActor);
      this.weaponActor.kill();
      this.weaponActor = undefined;
    }
    this.equippedWeapon = null;
    this.weaponSprites = undefined;
  }

  public getEquippedWeapon(): InventoryItem | null {
    return this.equippedWeapon;
  }

  public updateWeaponAnimation() {
    if (!this.weaponActor || !this.weaponSprites) return;

    const animType =
      this.currentState === "running"
        ? "run"
        : this.currentState === "walking"
        ? "walk"
        : this.currentState === "jumping"
        ? "jump"
        : this.currentState === "falling"
        ? "fall"
        : this.currentState === "hurt"
        ? "hurt"
        : this.currentState === "attacking"
        ? "attack"
        : this.currentState === "dead"
        ? "dead"
        : "idle";

    const weaponAnim = this.weaponSprites.get(animType);
    if (weaponAnim) {
      if (this.weaponActor.graphics.current !== weaponAnim) {
        this.weaponActor.graphics.use(weaponAnim);
      }

      const characterAnim = this.character.graphics.current as ex.Animation;
      if (characterAnim instanceof ex.Animation) {
        const characterFrameIndex = characterAnim.currentFrameIndex;
        weaponAnim.goToFrame(characterFrameIndex);
      }
    }

    this.weaponActor.graphics.flipHorizontal = this.facingRight;

    const xOffset = this.facingRight
      ? -(SPRITE_WIDTH * SCALE) / 2
      : (SPRITE_WIDTH * SCALE) / 2;
    this.weaponActor.pos = ex.vec(xOffset, 0);
    this.weaponActor.offset = ex.vec(-xOffset, 24 * SCALE);
  }
}
