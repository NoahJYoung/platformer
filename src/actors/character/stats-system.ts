import type { Attribute, StatConfig, Stats } from "./types";

export class StatsSystem {
  private stats: Stats;
  private level: number;

  private baseHungerDepletionRate: number = 0.2;
  private baseThirstDepletionRate: number = 0.3;

  private xpGainRates = {
    damageReceived: 0.5,
    damageDealt: 1.0,
    energyUsed: 0.3,
    manaUsed: 0.5,
  };

  constructor(
    initialVitality: number = 5,
    initialStrength: number = 5,
    initialAgility: number = 5,
    initialIntelligence: number = 5
  ) {
    this.stats = {
      vitality: this.createStat(initialVitality),
      strength: this.createStat(initialStrength),
      agility: this.createStat(initialAgility),
      intelligence: this.createStat(initialIntelligence),
    };

    this.level = this.calculateCharacterLevel();
  }

  private createStat(baseValue: number): StatConfig {
    return {
      baseValue: baseValue,
      currentXP: 0,
      xpToNextLevel: this.calculateXPForLevel(baseValue),
    };
  }

  private calculateXPForLevel(level: number): number {
    const levelDiff = level - 5;
    return Math.floor(100 + levelDiff * levelDiff * 10);
  }

  private levelUpStat(statName: keyof typeof this.stats): boolean {
    const stat = this.stats[statName];

    stat.baseValue += 1;
    stat.currentXP -= stat.xpToNextLevel;

    stat.xpToNextLevel = this.calculateXPForLevel(stat.baseValue);

    console.log(
      `${statName.toUpperCase()} increased to ${
        stat.baseValue
      }! Next level requires ${stat.xpToNextLevel} XP.`
    );

    this.level = this.calculateCharacterLevel();

    return true;
  }

  public getLevel() {
    return this.level;
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

  public onMagicDamageDealt(damageAmount: number): boolean {
    const xpGained = damageAmount * this.xpGainRates.damageDealt;
    return this.addStatXP("intelligence", xpGained);
  }

  public onEnergyUsed(energyAmount: number): boolean {
    const xpGained = energyAmount * this.xpGainRates.energyUsed;
    return this.addStatXP("agility", xpGained);
  }

  public onManaUsed(manaAmount: number): boolean {
    const xpGained = manaAmount * this.xpGainRates.manaUsed;
    return this.addStatXP("intelligence", xpGained);
  }

  public getStat(attribute: Attribute) {
    return this.getStats()[attribute];
  }

  private calculateCharacterLevel() {
    let combinedStatValues = 0;
    const stats = Object.keys(this.getStats());
    stats.forEach((key) => {
      combinedStatValues +=
        this.stats[key as keyof typeof this.stats].baseValue;
    });

    const level = Math.round(combinedStatValues / stats.length);
    return level;
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
    return Math.floor(100 + (this.stats.vitality.baseValue - 10) * 5);
  }

  public getMaxMana(): number {
    return Math.floor(100 + (this.stats.intelligence.baseValue - 10) * 1.5);
  }

  public getMaxEnergy(): number {
    return Math.floor(100 + (this.stats.agility.baseValue - 10) * 1.5);
  }

  public getRunSpeed(): number {
    return Math.floor(150 + (this.stats.agility.baseValue - 10) * 2);
  }

  public getStrengthDamageMultiplier(): number {
    return 1 + (this.stats.strength.baseValue - 10) * 0.05;
  }

  public getIntelligenceDamageMultiplier(): number {
    return 1 + (this.stats.intelligence.baseValue - 10) * 0.05;
  }

  public getEnergyRecoveryRate(): number {
    return 8 + (this.stats.agility.baseValue - 10) * 0.2;
  }

  public getHealthRecoveryRate(): number {
    const value = Math.max(1 + (this.stats.vitality.baseValue - 10) * 0.2, 1);
    return Math.round(value);
  }

  public getManaRecoveryRate(): number {
    const value = Math.max(
      1 + (this.stats.intelligence.baseValue - 10) * 0.2,
      1
    );

    return Math.round(value);
  }

  public getDodgeCooldown(): number {
    const baseCooldown = 1000;
    const agility = this.stats.agility.baseValue;
    const reduction = (agility - 1) * 10.101;
    return Math.max(0, baseCooldown - reduction);
  }

  public getSpellCooldown(): number {
    const baseCooldown = 2000;
    const intelligence = this.stats.intelligence.baseValue;
    const reduction = (intelligence - 1) * 20.202;
    return Math.max(0, baseCooldown - reduction);
  }

  public getAttackCooldown(): number {
    const baseCooldown = 1000;
    const agility = this.stats.agility.baseValue;
    const reduction = (agility - 1) * 10.101;
    return Math.max(0, baseCooldown - reduction);
  }

  public getJumpSpeed(): number {
    const baseJumpSpeed = -275;
    const agility = this.stats.agility.baseValue;

    return Math.floor(baseJumpSpeed - agility * 1.25);
  }

  public getMaxNumberOfJumps(): number {
    const agility = this.stats.agility.baseValue;

    if (agility < 30) {
      return 1;
    } else if (agility < 90) {
      return 2;
    }

    return 3;
  }

  /**
   * Calculate vitality multiplier for hunger/thirst depletion
   * Higher vitality reduces depletion rate
   */
  private getVitalityMultiplier(): number {
    const vitality = this.stats.vitality.baseValue;
    // Formula: 1 - (vitality - 5) * 0.005
    // At vitality 5: 1.0 (100% depletion)
    // At vitality 50: 0.775 (77.5% depletion)
    // At vitality 100: 0.5 (50% depletion - minimum)
    return Math.max(0.5, 1 - (vitality - 5) * 0.005);
  }

  public getHungerDepletionRate(): number {
    return this.baseHungerDepletionRate * this.getVitalityMultiplier();
  }

  public getThirstDepletionRate(): number {
    return this.baseThirstDepletionRate * this.getVitalityMultiplier();
  }

  public setBaseHungerDepletionRate(rate: number): void {
    this.baseHungerDepletionRate = rate;
  }

  public setBaseThirstDepletionRate(rate: number): void {
    this.baseThirstDepletionRate = rate;
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
