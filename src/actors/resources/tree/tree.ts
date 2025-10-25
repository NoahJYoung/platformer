import * as ex from "excalibur";

import {
  type TreeType,
  type TreeGraphics,
  type AppleTreeGraphicState,
  type AppleTreeGraphics,
  type PineTreeGraphics,
  type SimpleTreeGraphics,
  isAppleTreeGraphics,
  isPineTreeGraphics,
  isSimpleTreeGraphics,
  getHeightByTreeType,
  getPositionOffsetByTreeType,
} from "./tree-types";
import type { GameEngine } from "../../../engine/game-engine";
import { createItem } from "../../../items/item-creator";
import { TreeResources } from "../../../resources/tree-resources";
import type { WeaponSubType, InventoryItem } from "../../character/types";
import { MaterialSource } from "../material-source";

type Season = "spring" | "summer" | "fall" | "winter";

export class Tree extends MaterialSource {
  protected acceptedWeaponTypes: WeaponSubType[] = ["axe"];

  private treeType: TreeType;
  private currentSeason: Season = "spring";

  private graphicState: AppleTreeGraphicState = "base";

  private selectedNormalVariant: 1 | 2 = 1;
  private selectedFallVariant: 1 | 2 = 1;

  private treeGraphics: TreeGraphics;

  constructor(
    pos: ex.Vector,
    treeType: TreeType = "apple-tree",
    z: number = Tree.generateRandomZIndex()
  ) {
    super(
      `tree_${treeType}_${Date.now()}`,
      getPositionOffsetByTreeType(pos, treeType),
      64,
      getHeightByTreeType(treeType),
      z
    );

    this.treeType = treeType;

    this.treeGraphics = this.initializeGraphics(treeType);

    if (treeType === "pine-tree") {
      this.selectedNormalVariant = Math.random() > 0.5 ? 1 : 2;
      this.selectedFallVariant = Math.random() > 0.5 ? 1 : 2;
    }

    if (treeType === "apple-tree") {
      this.interactInventory.onRemoveItem = this.onApplesRemoved;
      this.graphicState = "with_apples";
    }
  }

  private initializeGraphics(treeType: TreeType): TreeGraphics {
    switch (treeType) {
      case "apple-tree":
        return {
          normal: TreeResources.apple.normal,
          apples: TreeResources.apple.apples,
          fall: TreeResources.apple.fall,
          winter: TreeResources.apple.winter,
        } as AppleTreeGraphics;

      case "pine-tree":
        return {
          normal_1: TreeResources.pine.normal_1,
          normal_2: TreeResources.pine.normal_2,
          fall_1: TreeResources.pine.fall_1,
          fall_2: TreeResources.pine.fall_2,
          winter_1: TreeResources.pine.winter_1,
        } as PineTreeGraphics;

      case "birch-tree":
        return {
          normal: TreeResources.birch.normal,
          fall: TreeResources.birch.fall,
          winter: TreeResources.birch.winter,
        } as SimpleTreeGraphics;

      case "willow-tree":
        return {
          normal: TreeResources.willow.normal,
          fall: TreeResources.willow.fall,
          winter: TreeResources.willow.winter,
        } as SimpleTreeGraphics;

      default:
        throw new Error("invalid tree type");
    }
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

  /**
   * Update the tree's graphic based on tree type, season, and state
   */
  private updateGraphic() {
    let graphic: ex.ImageSource;

    if (isAppleTreeGraphics(this.treeGraphics)) {
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
    } else if (isPineTreeGraphics(this.treeGraphics)) {
      if (this.currentSeason === "fall") {
        graphic =
          this.selectedFallVariant === 1
            ? this.treeGraphics.fall_1
            : this.treeGraphics.fall_2;
      } else if (this.currentSeason === "winter") {
        graphic = this.treeGraphics.winter_1;
      } else {
        graphic =
          this.selectedNormalVariant === 1
            ? this.treeGraphics.normal_1
            : this.treeGraphics.normal_2;
      }
    } else if (isSimpleTreeGraphics(this.treeGraphics)) {
      if (this.currentSeason === "fall") {
        graphic = this.treeGraphics.fall;
      } else if (this.currentSeason === "winter") {
        graphic = this.treeGraphics.winter;
      } else {
        graphic = this.treeGraphics.normal;
      }
    } else {
      throw new Error("invalid tree graphic");
    }

    const sprite = graphic.toSprite();

    this.graphics.use(sprite);
  }

  public onApplesRemoved = () => {
    if (this.treeType !== "apple-tree") return;

    if (
      (this.currentSeason === "spring" || this.currentSeason === "summer") &&
      this.graphicState === "with_apples"
    ) {
      const hasApples = [...this.interactInventory.getAllItems()]
        .map(([, itemSlot]) => itemSlot)
        .some((itemSlot) =>
          itemSlot?.item?.name.toLowerCase().includes("apple")
        );

      if (!hasApples) {
        this.graphicState = "without_apples";
        this.updateGraphic();
      }
    }
  };

  protected onDeath() {
    this.graphics.opacity = 0.5;
  }

  /**
   * Add item to interact inventory (the items you get when interacting with the tree)
   */
  public addToInteractInventory(slotIndex: number, item: InventoryItem) {
    this.interactInventory.addItem(slotIndex, item);

    if (this.treeType === "apple-tree") {
      if (
        item.name.toLowerCase().includes("apple") &&
        (this.currentSeason === "spring" || this.currentSeason === "summer")
      ) {
        this.graphicState = "with_apples";
        this.updateGraphic();
      }
    }
  }

  /**
   * Add item to drop inventory (the items you get when the tree dies)
   */
  public addToDropInventory(slotIndex: number, item: InventoryItem) {
    this.dropInventory.addItem(slotIndex, item);
  }

  private static generateRandomZIndex(): number {
    const random = Math.random();
    return random < 0.6667 ? 0 : 2;
  }

  /**
   * Setup inventory based on tree type and season
   */
  private setupInventory() {
    const bark = createItem("bark");
    const branch = createItem("branch");

    const log1 = createItem("log");
    const log2 = createItem("log");
    const log3 = createItem("log");

    let interactItems: InventoryItem[] = [];

    if (this.treeType === "apple-tree") {
      if (["summer", "spring"].includes(this.currentSeason)) {
        const apple = createItem("apple");
        interactItems = [bark, branch, apple];
      } else {
        interactItems = [bark, branch];
      }
    } else {
      interactItems = [bark, branch];
    }

    interactItems.forEach((item, i) => {
      this.addToInteractInventory(i, item);
    });

    [log1, log2, log3].forEach((item, i) => {
      this.addToDropInventory(i, item);
    });
  }

  /**
   * Get the type of this tree
   */
  public getTreeType(): TreeType {
    return this.treeType;
  }
}
