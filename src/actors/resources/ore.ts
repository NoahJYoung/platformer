import * as ex from "excalibur";
import { MaterialSource } from "./material-source";
import type { WeaponSubType } from "../character/types";
import { SCALE } from "../config";

export type OreType = "rock" | "bronze" | "iron" | "gold" | "luminite";

interface OreConfig {
  name: string;
  displayName: string;
  maxHealth: number;
  graphic: ex.ImageSource;
  // Drop rates and items would go here
  dropTable: {
    itemKey: string;
    minAmount: number;
    maxAmount: number;
    dropChance: number; // 0-1
  }[];
}

// Configuration for different ore types
export const OreConfigs: Record<OreType, OreConfig> = {
  rock: {
    name: "rock",
    displayName: "Rock",
    maxHealth: 80,
    graphic: null as any, // Replace with actual ImageSource
    dropTable: [
      { itemKey: "stone", minAmount: 2, maxAmount: 5, dropChance: 1.0 },
      { itemKey: "flint", minAmount: 0, maxAmount: 2, dropChance: 0.3 },
    ],
  },
  bronze: {
    name: "bronze",
    displayName: "Bronze Ore",
    maxHealth: 100,
    graphic: null as any, // Replace with actual ImageSource
    dropTable: [
      { itemKey: "bronze_ore", minAmount: 1, maxAmount: 3, dropChance: 1.0 },
      { itemKey: "stone", minAmount: 1, maxAmount: 2, dropChance: 0.5 },
    ],
  },
  iron: {
    name: "iron",
    displayName: "Iron Ore",
    maxHealth: 120,
    graphic: null as any, // Replace with actual ImageSource
    dropTable: [
      { itemKey: "iron_ore", minAmount: 1, maxAmount: 3, dropChance: 1.0 },
      { itemKey: "stone", minAmount: 1, maxAmount: 2, dropChance: 0.4 },
    ],
  },
  gold: {
    name: "gold",
    displayName: "Gold Ore",
    maxHealth: 150,
    graphic: null as any, // Replace with actual ImageSource
    dropTable: [
      { itemKey: "gold_ore", minAmount: 1, maxAmount: 2, dropChance: 1.0 },
      { itemKey: "stone", minAmount: 1, maxAmount: 3, dropChance: 0.6 },
    ],
  },
  luminite: {
    name: "luminite",
    displayName: "Luminite Ore",
    maxHealth: 200,
    graphic: null as any, // Replace with actual ImageSource
    dropTable: [
      { itemKey: "luminite_ore", minAmount: 1, maxAmount: 2, dropChance: 0.8 },
      {
        itemKey: "luminite_shard",
        minAmount: 0,
        maxAmount: 1,
        dropChance: 0.3,
      },
      { itemKey: "stone", minAmount: 1, maxAmount: 2, dropChance: 0.5 },
    ],
  },
};

export class Ore extends MaterialSource {
  protected acceptedWeaponTypes: WeaponSubType[] = ["pickaxe"];

  private oreType: OreType;
  private config: OreConfig;

  constructor(pos: ex.Vector, oreType: OreType) {
    const config = OreConfigs[oreType];

    // Ore size - adjust as needed for your graphics
    super(`ore_${oreType}_${Date.now()}`, pos, 48, 48);

    this.oreType = oreType;
    this.config = config;
    this.maxHealth = config.maxHealth;
    this.health = this.maxHealth;
  }

  protected onMaterialSourceInitialize(engine: ex.Engine): void {
    // Set up ore graphic
    this.updateGraphic();

    // Pre-populate the drop inventory based on drop table
    // This happens at initialization so drops are ready when mined
    this.populateDropInventory();
  }

  private updateGraphic() {
    if (!this.config.graphic) {
      // Fallback colored rectangle if no graphic is set
      const colors: Record<OreType, ex.Color> = {
        rock: ex.Color.Gray,
        bronze: ex.Color.fromHex("#CD7F32"),
        iron: ex.Color.fromHex("#C0C0C0"),
        gold: ex.Color.fromHex("#FFD700"),
        luminite: ex.Color.fromHex("#4DBEEE"), // Blue/cyan color
      };

      const rect = new ex.Rectangle({
        width: this.width,
        height: this.height,
        color: colors[this.oreType],
      });

      this.graphics.use(rect);
    } else {
      const sprite = this.config.graphic.toSprite();
      sprite.scale = ex.vec(SCALE, SCALE);
      this.graphics.use(sprite);
    }
  }

  private populateDropInventory() {
    // Roll for each item in the drop table
    this.config.dropTable.forEach((drop, index) => {
      const roll = Math.random();

      if (roll <= drop.dropChance) {
        // Determine amount
        const amount = Math.floor(
          Math.random() * (drop.maxAmount - drop.minAmount + 1) + drop.minAmount
        );

        if (amount > 0) {
          // TODO: Create the actual item using createItem()
          // For now, just log what would be dropped
          console.log(
            `Would drop ${amount}x ${drop.itemKey} from ${this.config.displayName}`
          );

          // When you have the item system ready:
          // const item = createItem(drop.itemKey, 'male'); // or get sex from context
          // for (let i = 0; i < amount; i++) {
          //   this.dropInventory.addItem(index * 10 + i, item);
          // }
        }
      }
    });
  }

  protected onDeath() {
    // Ore shatters, plays breaking sound, etc.

    // Add a simple shake/shatter effect
    const originalPos = this.pos.clone();

    // Quick shake animation
    let shakeCount = 0;
    const shakeInterval = setInterval(() => {
      if (shakeCount < 5) {
        this.pos = ex.vec(
          originalPos.x + (Math.random() - 0.5) * 4,
          originalPos.y + (Math.random() - 0.5) * 4
        );
        shakeCount++;
      } else {
        clearInterval(shakeInterval);
        this.pos = originalPos;
        this.graphics.opacity = 0.3;
      }
    }, 50);
  }

  // Getter for ore type info
  public getOreType(): OreType {
    return this.oreType;
  }

  public getDisplayName(): string {
    return this.config.displayName;
  }
}
