import * as ex from "excalibur";
import { MaterialSource } from "./material-source";
import type { InventoryItem, WeaponSubType } from "../character/types";
import type { GameEngine } from "../../game-engine";
import { SCALE } from "../config";
import { createItem } from "../../items/item-creator";

type Season = "spring" | "summer" | "fall" | "winter";
type TreeGraphicState = "with_apples" | "without_apples" | "base";

interface TreeGraphicsConfig {
  normal: ex.ImageSource;
  apples: ex.ImageSource;
  fall: ex.ImageSource;
  winter: ex.ImageSource;
}

export class Tree extends MaterialSource {
  protected acceptedWeaponTypes: WeaponSubType[] = ["axe"];

  private currentSeason: Season = "spring";
  private graphicState: TreeGraphicState = "with_apples";

  private treeGraphics: TreeGraphicsConfig;

  constructor(pos: ex.Vector, treeGraphics: TreeGraphicsConfig, z?: number) {
    super(
      `tree_${Date.now()}`,
      pos,
      64 * SCALE,
      208 * SCALE,
      z ?? Tree.generateRandomZIndex()
    );

    this.treeGraphics = treeGraphics;
    this.interactInventory.onRemoveItem = this.onApplesRemoved;
  }

  protected onMaterialSourceInitialize(engine: ex.Engine): void {
    const gameEngine = engine as GameEngine;

    this.currentSeason = this.getCurrentSeason(gameEngine);

    this.updateGraphic();

    gameEngine.timeCycle.onSeasonChange(() => {
      this.currentSeason = this.getCurrentSeason(gameEngine);
      this.updateGraphic();
    });

    this.setupInventory();
  }

  private getCurrentSeason(engine: GameEngine): Season {
    return engine.timeCycle.getCurrentSeason();
  }

  private updateGraphic() {
    let graphic: ex.ImageSource;

    if (this.currentSeason === "fall") {
      graphic = this.treeGraphics.fall;
      this.graphicState = "base";
    } else if (this.currentSeason === "winter") {
      graphic = this.treeGraphics.winter;
      this.graphicState = "base";
    } else {
      if (this.graphicState === "with_apples") {
        graphic = this.treeGraphics.apples;
      } else {
        graphic = this.treeGraphics.normal;
      }
    }

    const sprite = graphic.toSprite();
    sprite.scale = ex.vec(SCALE, SCALE);
    this.graphics.use(sprite);
  }

  public onApplesRemoved = () => {
    if (
      (this.currentSeason === "spring" || this.currentSeason === "summer") &&
      this.graphicState === "with_apples"
    ) {
      const hasApples = [...this.interactInventory.getAllItems()]
        .map(([, item]) => item)
        .some((item) => item?.name.toLowerCase().includes("apple"));

      if (!hasApples) {
        this.graphicState = "without_apples";
        this.updateGraphic();
      }
    }
  };

  protected onDeath() {
    this.graphics.opacity = 0.5;
  }

  public addToInteractInventory(slotIndex: number, item: InventoryItem) {
    this.interactInventory.addItem(slotIndex, item);

    if (
      item.name.toLowerCase().includes("apple") &&
      (this.currentSeason === "spring" || this.currentSeason === "summer")
    ) {
      this.graphicState = "with_apples";
      this.updateGraphic();
    }
  }

  public addToDropInventory(slotIndex: number, item: InventoryItem) {
    this.dropInventory.addItem(slotIndex, item);
  }

  private static generateRandomZIndex(): number {
    return Math.floor(Math.random() * 21) - 10;
  }

  private setupInventory() {
    const bark = createItem("bark");
    const branch = createItem("branch");
    const apple = createItem("apple");

    const log1 = createItem("log");
    const log2 = createItem("log");
    const log3 = createItem("log");

    const interactInventory = ["summer", "spring"].includes(this.currentSeason)
      ? [bark, branch, apple]
      : [bark, branch];

    interactInventory.forEach((item, i) => {
      this.addToInteractInventory(i, item);
    });

    [log1, log2, log3].forEach((item, i) => {
      this.addToDropInventory(i, item);
    });
  }
}
