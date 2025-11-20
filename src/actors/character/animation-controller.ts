import * as ex from "excalibur";
import { PlayerResources } from "../../resources";
import {
  STANDARD_SPRITE_WIDTH,
  SPRITE_HEIGHT,
  LEFT_MARGIN,
  FRAME_SPACING,
  SPRITE_WIDTH,
  SPRITE_BUFFER,
} from "../config";
import type { Character } from "./character";
import type { WeaponItem, ArmorItem, SkinToneOptions } from "./types";
import { AudioKeys } from "../../audio/sound-manager/audio-keys";

export type AnimationState =
  | "idle"
  | "walking"
  | "running"
  | "jumping"
  | "falling"
  | "attacking"
  | "run-attacking"
  | "dodging"
  | "shielding"
  | "hurt"
  | "dead";

interface EquippedArmor {
  legs?: ArmorItem;
  body?: ArmorItem;
  head?: ArmorItem;
  feet?: ArmorItem;
  gloves?: ArmorItem;
  mask?: ArmorItem;
  back?: ArmorItem;
  offhand?: ArmorItem;
}

export class AnimationController {
  public idleAnim?: ex.Animation;
  public runAnim?: ex.Animation;
  public walkAnim?: ex.Animation;
  public jumpAnim?: ex.Animation;
  public fallAnim?: ex.Animation;
  public attackAnim?: ex.Animation;
  public runAttackAnim?: ex.Animation;
  public hurtAnim?: ex.Animation;
  public deadAnim?: ex.Animation;
  public dodgeAnim?: ex.Animation;
  public shieldAnim?: ex.Animation;

  public currentState: AnimationState = "idle";
  public facingRight: boolean;

  public weaponActor?: ex.Actor;
  public weaponSprites?: Map<string, ex.Animation>;
  private equippedWeapon: WeaponItem | null = null;
  private equippedArmor: EquippedArmor = {};

  private character: Character;
  private sex: "male" | "female";
  private skinTone: SkinToneOptions;
  private hairStyle: number;

  private afterimageTimer: number = 0;

  constructor(
    character: Character,
    sex: "male" | "female",
    skinTone: SkinToneOptions,
    hairStyle: number,
    facingRight: boolean
  ) {
    this.character = character;
    this.sex = sex;
    this.skinTone = skinTone;
    this.hairStyle = hairStyle;
    this.facingRight = facingRight;
  }

  private setupSounds() {
    this.setupFootstepSounds();
  }

  private setupFootstepSounds() {
    if (this.walkAnim) {
      this.walkAnim.events.on("frame", (evt) => {
        if (evt.frameIndex === 1 || evt.frameIndex === 5) {
          this.playFootstep(0.3);
        }
      });
    }

    if (this.runAnim) {
      this.runAnim.events.on("frame", (evt) => {
        if (evt.frameIndex === 1 || evt.frameIndex === 5) {
          this.playFootstep(0.4);
        }
      });
    }
  }

  private playFootstep(baseVolume: number) {
    if (!this.character.engine?.soundManager) return;

    const volumeVariation = Math.random() * 0.1 - 0.05;
    const isPlayer = this.character.name === "player";

    const footstepKey = this.character.getIsInWater()
      ? AudioKeys.SFX.PLAYER.MOVEMENT.WATER_FOOTSTEP
      : AudioKeys.SFX.PLAYER.MOVEMENT.FOOTSTEP;

    const finalVolume = this.character.getIsInWater()
      ? Math.max(0.1, Math.min(1, baseVolume * 1.5 + volumeVariation))
      : Math.max(0.1, Math.min(1, baseVolume + volumeVariation));

    this.character.engine.soundManager.play(
      footstepKey,
      isPlayer ? finalVolume : finalVolume / 4
    );
  }

  public setupAnimations() {
    const createLayeredAnimation = (
      row: number,
      frameCount: number,
      frameDuration: number,
      strategy: ex.AnimationStrategy = ex.AnimationStrategy.Loop,
      frameOffset: number = 0
    ): ex.Animation => {
      const offset = frameOffset * STANDARD_SPRITE_WIDTH;

      const skinSheet = ex.SpriteSheet.fromImageSource({
        image: PlayerResources[this.sex].skin[`skin_${this.skinTone}`],
        grid: {
          rows: 8,
          columns: frameCount,
          spriteWidth: STANDARD_SPRITE_WIDTH,
          spriteHeight: SPRITE_HEIGHT - SPRITE_BUFFER,
        },
        spacing: {
          originOffset: {
            x: LEFT_MARGIN + offset,
            y: SPRITE_BUFFER,
          },
          margin: { x: FRAME_SPACING, y: SPRITE_BUFFER },
        },
      });

      const hairSheet = ex.SpriteSheet.fromImageSource({
        image:
          PlayerResources[this.sex].hair[
            `hair_${this.hairStyle}` as keyof (typeof PlayerResources)[typeof this.sex]["hair"]
          ],
        grid: {
          rows: 8,
          columns: frameCount,
          spriteWidth: STANDARD_SPRITE_WIDTH,
          spriteHeight: SPRITE_HEIGHT - SPRITE_BUFFER,
        },
        spacing: {
          originOffset: { x: LEFT_MARGIN + offset, y: SPRITE_BUFFER },
          margin: { x: FRAME_SPACING, y: SPRITE_BUFFER },
        },
      });

      const loadArmorSheet = (armorItem: ArmorItem | undefined) => {
        if (!armorItem?.spriteSheet) return null;

        return ex.SpriteSheet.fromImageSource({
          image: armorItem.spriteSheet,
          grid: {
            rows: 8,
            columns: frameCount,
            spriteWidth: STANDARD_SPRITE_WIDTH,
            spriteHeight: SPRITE_HEIGHT - SPRITE_BUFFER,
          },
          spacing: {
            originOffset: { x: LEFT_MARGIN + offset, y: SPRITE_BUFFER },
            margin: { x: FRAME_SPACING, y: SPRITE_BUFFER },
          },
        });
      };

      const legsSheet = loadArmorSheet(this.equippedArmor.legs);
      const bodySheet = loadArmorSheet(this.equippedArmor.body);
      const headSheet = loadArmorSheet(this.equippedArmor.head);
      const feetSheet = loadArmorSheet(this.equippedArmor.feet);
      const glovesSheet = loadArmorSheet(this.equippedArmor.gloves);
      const maskSheet = loadArmorSheet(this.equippedArmor.mask);
      const backSheet = loadArmorSheet(this.equippedArmor.back);
      const offhandSheet = loadArmorSheet(this.equippedArmor.offhand);

      const frames = ex.range(0, frameCount - 1).map((frameIndex) => {
        const skinSprite = skinSheet.getSprite(frameIndex, row);
        const hairSprite = hairSheet.getSprite(frameIndex, row);

        if (!skinSprite) {
          throw new Error(
            `Failed to create sprite at frame ${frameIndex}, row ${row}`
          );
        }

        const xOffset = 24;
        const yOffset = -8 + SPRITE_BUFFER / 2;

        const members: Array<{ graphic: ex.Graphic; offset: ex.Vector }> = [];

        if (offhandSheet) {
          const backSprite = offhandSheet.getSprite(frameIndex, row);
          if (backSprite) {
            members.push({
              graphic: backSprite,
              offset: ex.vec(xOffset, yOffset),
            });
          }
        }

        if (backSheet) {
          const backSprite = backSheet.getSprite(frameIndex, row);
          if (backSprite) {
            members.push({
              graphic: backSprite,
              offset: ex.vec(xOffset, yOffset),
            });
          }
        }

        members.push({ graphic: skinSprite, offset: ex.vec(xOffset, yOffset) });

        if (legsSheet) {
          const legsSprite = legsSheet.getSprite(frameIndex, row);
          if (legsSprite) {
            members.push({
              graphic: legsSprite,
              offset: ex.vec(xOffset, yOffset),
            });
          }
        }

        if (bodySheet) {
          const bodySprite = bodySheet.getSprite(frameIndex, row);
          if (bodySprite) {
            members.push({
              graphic: bodySprite,
              offset: ex.vec(xOffset, yOffset),
            });
          }
        }

        if (feetSheet) {
          const feetSprite = feetSheet.getSprite(frameIndex, row);
          if (feetSprite) {
            members.push({
              graphic: feetSprite,
              offset: ex.vec(xOffset, yOffset),
            });
          }
        }

        if (glovesSheet) {
          const glovesSprite = glovesSheet.getSprite(frameIndex, row);
          if (glovesSprite) {
            members.push({
              graphic: glovesSprite,
              offset: ex.vec(xOffset, yOffset),
            });
          }
        }

        if (hairSprite) {
          members.push({
            graphic: hairSprite,
            offset: ex.vec(xOffset, yOffset),
          });
        }

        if (headSheet) {
          const headSprite = headSheet.getSprite(frameIndex, row);
          if (headSprite) {
            members.push({
              graphic: headSprite,
              offset: ex.vec(xOffset, yOffset),
            });
          }
        }

        if (maskSheet) {
          const maskSprite = maskSheet.getSprite(frameIndex, row);
          if (maskSprite) {
            members.push({
              graphic: maskSprite,
              offset: ex.vec(xOffset, yOffset),
            });
          }
        }

        const group = new ex.GraphicsGroup({ members });
        return { graphic: group, duration: frameDuration };
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
    this.runAttackAnim = createLayeredAnimation(7, 6, 100);

    this.deadAnim = createLayeredAnimation(
      6,
      9,
      100,
      ex.AnimationStrategy.Freeze
    );

    this.shieldAnim = createLayeredAnimation(
      5,
      3,
      100,
      ex.AnimationStrategy.Freeze,
      0
    );

    this.setupSounds();
  }

  public equipArmor(armor: ArmorItem) {
    switch (armor.slot) {
      case "legs":
        this.equippedArmor.legs = armor;
        break;
      case "body":
        this.equippedArmor.body = armor;
        break;
      case "helmet":
        this.equippedArmor.head = armor;
        break;
      case "boots":
        this.equippedArmor.feet = armor;
        break;
      case "gloves":
        this.equippedArmor.gloves = armor;
        break;
      case "mask":
        this.equippedArmor.mask = armor;
        break;
      case "back":
        this.equippedArmor.back = armor;
        break;
      case "offhand":
        this.equippedArmor.offhand = armor;
        break;
    }

    this.setupAnimations();

    this.updateAnimation(this.character.vel);
  }

  public unequipArmor(slot: ArmorItem["slot"]) {
    switch (slot) {
      case "legs":
        this.equippedArmor.legs = undefined;
        break;
      case "body":
        this.equippedArmor.body = undefined;
        break;
      case "helmet":
        this.equippedArmor.head = undefined;
        break;
      case "boots":
        this.equippedArmor.feet = undefined;
        break;
      case "gloves":
        this.equippedArmor.gloves = undefined;
        break;
      case "mask":
        this.equippedArmor.mask = undefined;
        break;
      case "back":
        this.equippedArmor.back = undefined;
        break;
      case "offhand":
        this.equippedArmor.offhand = undefined;
        break;
    }

    this.setupAnimations();

    this.updateAnimation(this.character.vel);
  }

  public getEquippedArmor(slot: ArmorItem["slot"]): ArmorItem | undefined {
    switch (slot) {
      case "legs":
        return this.equippedArmor.legs;
      case "body":
        return this.equippedArmor.body;
      case "helmet":
        return this.equippedArmor.head;
      case "boots":
        return this.equippedArmor.feet;
      case "gloves":
        return this.equippedArmor.gloves;
      case "mask":
        return this.equippedArmor.mask;
      case "back":
        return this.equippedArmor.back;
      case "offhand":
        return this.equippedArmor.offhand;
      default:
        return undefined;
    }
  }

  /**
   * Transitions between attack animations while preserving the current frame.
   * Call this to smoothly switch from run-attacking to attacking or vice versa.
   */
  public transitionAttackAnimation(toRunAttack: boolean): void {
    const currentAnim = this.character.graphics.current as ex.Animation;
    const targetAnim = toRunAttack ? this.runAttackAnim : this.attackAnim;
    const targetState = toRunAttack ? "run-attacking" : "attacking";

    if (!currentAnim || !targetAnim) return;

    // Only transition if we're in an attack state
    if (
      this.currentState !== "attacking" &&
      this.currentState !== "run-attacking"
    ) {
      return;
    }

    // Don't transition if already in target state
    if (this.currentState === targetState) {
      return;
    }

    // Get current frame index
    const currentFrameIndex = currentAnim.currentFrameIndex;

    // Switch state and animation
    this.currentState = targetState;
    this.character.graphics.use(targetAnim);

    // Jump to the same frame
    targetAnim.goToFrame(currentFrameIndex);

    // Also sync weapon animation
    this.syncWeaponToFrame(
      currentFrameIndex,
      toRunAttack ? "run-attack" : "attack"
    );
  }

  /**
   * Gets the current frame index of the active attack animation
   */
  public getCurrentAttackFrame(): number {
    const currentAnim = this.character.graphics.current as ex.Animation;
    if (currentAnim instanceof ex.Animation) {
      return currentAnim.currentFrameIndex;
    }
    return 0;
  }

  /**
   * Syncs the weapon animation to a specific frame
   */
  private syncWeaponToFrame(frameIndex: number, animType: string): void {
    if (!this.weaponActor || !this.weaponSprites) return;

    const weaponAnim = this.weaponSprites.get(animType);
    if (weaponAnim) {
      this.weaponActor.graphics.use(weaponAnim);
      weaponAnim.goToFrame(frameIndex);
    }
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
      this.character.offset = ex.vec(SPRITE_WIDTH / 2, 0);
    } else {
      this.character.offset = ex.vec(-SPRITE_WIDTH / 2, 0);
    }

    this.character.graphics.flipHorizontal = this.facingRight;

    // Prevent animation updates during attacking states
    if (
      this.currentState === "attacking" ||
      this.currentState === "run-attacking"
    ) {
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

      case "shielding":
        if (
          this.shieldAnim &&
          this.character.graphics.current !== this.shieldAnim
        ) {
          console.log("using shield animation");
          this.character.graphics.use(this.shieldAnim);
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
          this.dodgeAnim.tint = ex.Color.fromRGB(0, 0, 0, 0.5);
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

  public loadWeaponSprites(weapon: WeaponItem) {
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
          rows: 8,
          columns: frameCount,
          spriteWidth: STANDARD_SPRITE_WIDTH,
          spriteHeight: SPRITE_HEIGHT,
        },
        spacing: {
          originOffset: { x: LEFT_MARGIN, y: 0 },
          margin: { x: FRAME_SPACING, y: 0 },
        },
      });

      const yOffset = -SPRITE_HEIGHT / 2;

      const frames = ex.range(0, frameCount - 1).map((frameIndex) => {
        const sprite = weaponSheet.getSprite(frameIndex, row);
        if (sprite) {
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
    this.weaponSprites.set("run-attack", createWeaponAnimation(6, 7));

    this.weaponSprites.set(
      "dead",
      createWeaponAnimation(9, 6, 100, ex.AnimationStrategy.Freeze)
    );

    this.weaponSprites.set(
      "shield",
      createWeaponAnimation(3, 5, 100, ex.AnimationStrategy.Freeze)
    );
  }

  public equipWeapon(weapon: WeaponItem) {
    if (this.weaponActor) {
      this.character.removeChild(this.weaponActor);
      this.weaponActor.kill();
    }

    this.equippedWeapon = weapon;

    this.weaponActor = new ex.Actor({
      pos: ex.vec(0, 0),
      name: "player-weapon",
      collisionType: ex.CollisionType.PreventCollision,
    });

    this.weaponActor?.addTag("player-weapon");

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

  public getEquippedWeapon(): WeaponItem | null {
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
        : this.currentState === "run-attacking"
        ? "run-attack"
        : this.currentState === "shielding"
        ? "shield"
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

    const xOffset = this.facingRight ? -SPRITE_WIDTH / 2 : SPRITE_WIDTH / 2;
    this.weaponActor.pos = ex.vec(xOffset, 0);
    this.weaponActor.offset = ex.vec(-xOffset, 24);
  }
}
