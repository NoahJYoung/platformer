import * as ex from "excalibur";
import type { GameEngine } from "../engine/game-engine";
import type { BuildingManager } from "./building-manager";

export class BuildingInput {
  private engine: GameEngine;
  private buildingManager: BuildingManager;
  private isPointerDown: boolean = false;
  private lastPlacementTime: number = 0;
  private placementCooldown: number = 100; // ms between placements when dragging

  constructor(engine: GameEngine, buildingManager: BuildingManager) {
    this.engine = engine;
    this.buildingManager = buildingManager;
  }

  /**
   * Setup input listeners
   */
  public initialize(): void {
    // Pointer move (works for both mouse and touch)
    this.engine.input.pointers.primary.on("move", (evt) => {
      this.handlePointerMove(evt);
    });

    // Pointer down (mouse click or touch start)
    this.engine.input.pointers.primary.on("down", (evt) => {
      this.handlePointerDown(evt);
    });

    // Pointer up (mouse release or touch end)
    this.engine.input.pointers.primary.on("up", (evt) => {
      this.handlePointerUp(evt);
    });

    // Keyboard shortcuts for tile selection
    this.setupKeyboardShortcuts();
  }

  private handlePointerMove(evt: ex.PointerEvent): void {
    if (!this.buildingManager.isBuildMode) return;

    const worldPos = evt.worldPos;
    this.buildingManager.updateGhostTile(worldPos);

    // If pointer is down and we're in remove mode or placing, do continuous action
    if (this.isPointerDown) {
      const now = Date.now();
      if (now - this.lastPlacementTime >= this.placementCooldown) {
        // Check if shift is held for remove mode
        const isRemoveMode =
          this.engine.input.keyboard.isHeld(ex.Keys.ShiftLeft) ||
          this.engine.input.keyboard.isHeld(ex.Keys.ShiftRight);

        if (isRemoveMode) {
          this.buildingManager.removeTile(worldPos);
        } else {
          this.buildingManager.placeTile(worldPos);
        }

        this.lastPlacementTime = now;
      }
    }
  }

  private handlePointerDown(evt: ex.PointerEvent): void {
    if (!this.buildingManager.isBuildMode) return;

    this.isPointerDown = true;
    const worldPos = evt.worldPos;

    // Check if shift is held for remove mode
    const isRemoveMode =
      this.engine.input.keyboard.isHeld(ex.Keys.ShiftLeft) ||
      this.engine.input.keyboard.isHeld(ex.Keys.ShiftRight);

    if (isRemoveMode) {
      this.buildingManager.removeTile(worldPos);
    } else {
      this.buildingManager.placeTile(worldPos);
    }

    this.lastPlacementTime = Date.now();
  }

  private handlePointerUp(evt: ex.PointerEvent): void {
    this.isPointerDown = false;
  }

  private setupKeyboardShortcuts(): void {
    // B key to toggle build mode
    this.engine.input.keyboard.on("press", (evt) => {
      if (evt.key === ex.Keys.B) {
        this.buildingManager.toggleBuildMode();

        if (this.buildingManager.isBuildMode) {
          this.engine.showMessage(
            "Build mode activated - Hold Shift to remove tiles",
            "info"
          );
        } else {
          this.engine.showMessage("Build mode deactivated", "info");
        }
      }

      // Number keys 1-9 for quick tile selection
      if (this.buildingManager.isBuildMode) {
        const numberKeys = [
          ex.Keys.Digit1,
          ex.Keys.Digit2,
          ex.Keys.Digit3,
          ex.Keys.Digit4,
          ex.Keys.Digit5,
          ex.Keys.Digit6,
          ex.Keys.Digit7,
          ex.Keys.Digit8,
          ex.Keys.Digit9,
        ];

        const keyIndex = numberKeys.indexOf(evt.key);
        if (keyIndex >= 0) {
          const tileIds = Object.keys(
            this.buildingManager["BUILDING_TILES"] || {}
          );
          if (tileIds[keyIndex]) {
            this.buildingManager.selectTile(tileIds[keyIndex]);
            this.engine.showMessage(`Selected: ${tileIds[keyIndex]}`, "info");
          }
        }
      }
    });
  }

  /**
   * Cleanup listeners
   */
  public destroy(): void {
    // ExcaliburJS automatically handles cleanup when actors are removed
    // But we can add explicit cleanup here if needed
  }
}
