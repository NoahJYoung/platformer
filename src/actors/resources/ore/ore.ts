import * as ex from "excalibur";

import {
  type OreType,
  getHeightByOreType,
  getPositionOffsetByOreType,
} from "./ore-types";
import type { WeaponSubType, InventoryItem } from "../../character/types";
import { MaterialSource } from "../material-source";
import { OreResources } from "../../../resources/ore-resources";

export class Ore extends MaterialSource {
  protected acceptedWeaponTypes: WeaponSubType[] = ["pickaxe"];

  private oreType: OreType;
  private oreSprite?: ex.Sprite;

  constructor(
    pos: ex.Vector,
    oreType: OreType = "bronze",
    z: number = Ore.generateRandomZIndex()
  ) {
    super(
      `ore_${oreType}_${Date.now()}`,
      getPositionOffsetByOreType(pos, oreType),
      64,
      getHeightByOreType(oreType),
      z
    );

    this.oreType = oreType;
  }

  protected onMaterialSourceInitialize(engine: ex.Engine): void {
    const oreSpriteSheet = ex.SpriteSheet.fromImageSource({
      image: OreResources.ores_1,
      grid: {
        rows: 2,
        columns: 2,
        spriteWidth: 64,
        spriteHeight: 64,
      },
    });

    const spriteCoords = this.getSpriteIndicesByOreType(this.oreType);
    this.oreSprite = oreSpriteSheet.getSprite(
      spriteCoords.col,
      spriteCoords.row
    );

    if (this.oreSprite) {
      this.graphics.use(this.oreSprite);
    }

    this.setupInventory();
  }

  private getSpriteIndicesByOreType(oreType: OreType): {
    col: number;
    row: number;
  } {
    // 2x2 grid of 64x64 sprites in a 128x128 image
    // Bronze: top-left (0, 0)
    // Iron: top-right (1, 0)
    // Gold: bottom-left (0, 1)
    // Rune: bottom-right (1, 1)
    switch (oreType) {
      case "bronze":
        return { col: 0, row: 0 };
      case "iron":
        return { col: 1, row: 0 };
      case "gold":
        return { col: 0, row: 1 };
      case "rune":
        return { col: 1, row: 1 };
    }
  }

  protected onDeath() {
    this.graphics.opacity = 0.5;
  }

  public addToInteractInventory(slotIndex: number, item: InventoryItem) {
    this.interactInventory.addItem(slotIndex, item);
  }

  public addToDropInventory(slotIndex: number, item: InventoryItem) {
    this.dropInventory.addItem(slotIndex, item);
  }

  private static generateRandomZIndex(): number {
    const random = Math.random();
    return random < 0.6667 ? 0 : 2;
  }

  private setupInventory() {}

  public getOreType(): OreType {
    return this.oreType;
  }
}
