import * as ex from "excalibur";
import { AnimationController } from "../../actors/character/animation-controller";
import type { AppearanceOptions } from "../../actors/character/types";
import type { Character } from "../../actors/character/character";

export class CharacterPreview extends ex.ScreenElement {
  private previewActor?: ex.Actor;
  private animController?: AnimationController;

  constructor(pos: ex.Vector) {
    super({ pos, z: 100 });
  }

  public updatePreview(appearance: AppearanceOptions): void {
    if (this.previewActor) {
      this.removeChild(this.previewActor);
    }

    this.previewActor = new ex.Actor({
      pos: ex.vec(20, 0),
      width: 16,
      height: 48,
      anchor: ex.vec(0.5, 0.5),
    });

    this.animController = new AnimationController(
      this.previewActor as Character,
      appearance.sex,
      appearance.skinTone,
      appearance.hairStyle,
      false
    );

    this.animController.setupAnimations();
    this.animController.currentState = "idle";
    this.animController.updateAnimation(ex.vec(0, 0));

    this.previewActor.scale = ex.vec(2, 2);

    this.addChild(this.previewActor);
  }
}
