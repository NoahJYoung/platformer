export interface StatConfig {
  baseValue: number;
  currentXP: number;
  xpToNextLevel: number;
  growthRate: number; // How much XP needed increases per level
}

export class StatsSystem {
  // Core stats with progression tracking
  private stats: {
    vitality: StatConfig;
    strength: StatConfig;
    agility: StatConfig;
    intelligence: StatConfig;
  };

  // Experience gain rates (how much XP per action)
  private xpGainRates = {
    damageReceived: 0.5, // XP per point of damage taken
    damageDealt: 1.0, // XP per point of damage dealt
    energyUsed: 0.3, // XP per point of energy used
    manaUsed: 0.5, // XP per point of mana used (future)
  };

  constructor(
    initialVitality: number = 10,
    initialStrength: number = 10,
    initialAgility: number = 10,
    initialIntelligence: number = 10
  ) {
    // Initialize all stats with same structure
    this.stats = {
      vitality: this.createStat(initialVitality),
      strength: this.createStat(initialStrength),
      agility: this.createStat(initialAgility),
      intelligence: this.createStat(initialIntelligence),
    };
  }

  private createStat(baseValue: number): StatConfig {
    return {
      baseValue: baseValue,
      currentXP: 0,
      xpToNextLevel: 100,
      growthRate: 1.15, // XP requirement increases by 15% per level
    };
  }

  // Getters for current stat values
  public getVitality(): number {
    return this.stats.vitality.baseValue;
  }

  public getStrength(): number {
    return this.stats.strength.baseValue;
  }

  public getAgility(): number {
    return this.stats.agility.baseValue;
  }

  public getIntelligence(): number {
    return this.stats.intelligence.baseValue;
  }

  // Track actions and award XP (to be wired up in Phase 3)
  public onDamageReceived(damageAmount: number): boolean {
    const xpGained = damageAmount * this.xpGainRates.damageReceived;
    return this.addStatXP("vitality", xpGained);
  }

  public onDamageDealt(damageAmount: number): boolean {
    const xpGained = damageAmount * this.xpGainRates.damageDealt;
    return this.addStatXP("strength", xpGained);
  }

  public onEnergyUsed(energyAmount: number): boolean {
    const xpGained = energyAmount * this.xpGainRates.energyUsed;
    return this.addStatXP("agility", xpGained);
  }

  public onManaUsed(manaAmount: number): boolean {
    const xpGained = manaAmount * this.xpGainRates.manaUsed;
    return this.addStatXP("intelligence", xpGained);
  }

  // Core XP and leveling logic
  private addStatXP(
    statName: keyof typeof this.stats,
    xpAmount: number
  ): boolean {
    const stat = this.stats[statName];
    stat.currentXP += xpAmount;

    // Check for level up
    if (stat.currentXP >= stat.xpToNextLevel) {
      return this.levelUpStat(statName);
    }

    return false;
  }

  private levelUpStat(statName: keyof typeof this.stats): boolean {
    const stat = this.stats[statName];

    // Level up the stat
    stat.baseValue += 1;
    stat.currentXP -= stat.xpToNextLevel;

    // Increase XP requirement for next level
    stat.xpToNextLevel = Math.floor(stat.xpToNextLevel * stat.growthRate);

    console.log(
      `${statName.toUpperCase()} increased to ${
        stat.baseValue
      }! Next level requires ${stat.xpToNextLevel} XP.`
    );

    return true; // Return true to signal a level up occurred
  }

  // Get stat progress (for UI)
  public getStatProgress(statName: keyof typeof this.stats): {
    current: number;
    required: number;
    percentage: number;
  } {
    const stat = this.stats[statName];
    return {
      current: stat.currentXP,
      required: stat.xpToNextLevel,
      percentage: (stat.currentXP / stat.xpToNextLevel) * 100,
    };
  }

  // Calculated properties based on stats (Phase 2 will use these)
  public getMaxHealth(): number {
    return Math.floor(100 + (this.stats.vitality.baseValue - 10) * 10);
  }

  public getMaxEnergy(): number {
    return Math.floor(100 + (this.stats.agility.baseValue - 10) * 5);
  }

  public getMoveSpeed(): number {
    return Math.floor(100 + (this.stats.agility.baseValue - 10) * 2);
  }

  public getDamageMultiplier(): number {
    return 1 + (this.stats.strength.baseValue - 10) * 0.05; // +5% damage per point
  }

  public getEnergyRecoveryRate(): number {
    return 4 + (this.stats.agility.baseValue - 10) * 0.2;
  }

  public getAttackSpeed(): number {
    // Lower is faster (milliseconds between attacks)
    const baseSpeed = 1000;
    const reduction = (this.stats.agility.baseValue - 10) * 20;
    return Math.max(200, baseSpeed - reduction); // Minimum 200ms cooldown
  }

  // Configure XP gain rates (optional tuning)
  public setXPGainRate(
    action: keyof typeof this.xpGainRates,
    rate: number
  ): void {
    this.xpGainRates[action] = rate;
  }

  // Serialization for save/load
  public serialize(): string {
    return JSON.stringify({
      stats: this.stats,
      xpGainRates: this.xpGainRates,
    });
  }

  public static deserialize(data: string): StatsSystem {
    const parsed = JSON.parse(data);
    const system = new StatsSystem();
    system.stats = parsed.stats;
    system.xpGainRates = parsed.xpGainRates;
    return system;
  }
}
