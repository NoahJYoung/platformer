export interface StatConfig {
  baseValue: number;
  currentXP: number;
  xpToNextLevel: number;
  growthRate: number;
}

export class StatsSystem {
  private stats: {
    vitality: StatConfig;
    strength: StatConfig;
    agility: StatConfig;
    intelligence: StatConfig;
  };

  private xpGainRates = {
    damageReceived: 0.5,
    damageDealt: 1.0,
    energyUsed: 0.3,
    manaUsed: 0.5,
  };

  constructor(
    initialVitality: number = 10,
    initialStrength: number = 10,
    initialAgility: number = 10,
    initialIntelligence: number = 10
  ) {
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
      growthRate: 1.15,
    };
  }

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

  private addStatXP(
    statName: keyof typeof this.stats,
    xpAmount: number
  ): boolean {
    const stat = this.stats[statName];
    stat.currentXP += xpAmount;

    if (stat.currentXP >= stat.xpToNextLevel) {
      return this.levelUpStat(statName);
    }

    return false;
  }

  private levelUpStat(statName: keyof typeof this.stats): boolean {
    const stat = this.stats[statName];

    stat.baseValue += 1;
    stat.currentXP -= stat.xpToNextLevel;

    stat.xpToNextLevel = Math.floor(stat.xpToNextLevel * stat.growthRate);

    console.log(
      `${statName.toUpperCase()} increased to ${
        stat.baseValue
      }! Next level requires ${stat.xpToNextLevel} XP.`
    );

    return true;
  }

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
    return 1 + (this.stats.strength.baseValue - 10) * 0.05;
  }

  public getEnergyRecoveryRate(): number {
    return 8 + (this.stats.agility.baseValue - 10) * 0.2;
  }

  public getAttackSpeed(): number {
    const baseSpeed = 1000;
    const reduction = (this.stats.agility.baseValue - 10) * 20;
    return Math.max(200, baseSpeed - reduction);
  }

  public setXPGainRate(
    action: keyof typeof this.xpGainRates,
    rate: number
  ): void {
    this.xpGainRates[action] = rate;
  }

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

  public getStats() {
    return this.stats;
  }
}
