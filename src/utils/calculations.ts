import { ICharacterInitial } from "../rooms/schema/GameStates";

export class attributesCalculations {
  static generateRadintBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  static calcTotalStrength(strength: number, extra_strength = 0) {
    return strength + extra_strength;
  }

  static calcMana(intelligence: number, extra_intelligence = 0) {
    return intelligence + extra_intelligence;
  }
  static calcMaxMana(intelligence: number, extra_intelligence = 0) {
    return intelligence + extra_intelligence + 10;
  }
  static calcMaxHp(hp: number, extra_hp = 0) {
    return hp + extra_hp;
  }

  static calcDamageMelee(strength: number, dexterity: number) {
    const random = this.generateRadintBetween(0, 30);
    const factor = 1 + random / 100;
    const baseDamage = strength + dexterity / 2;

    return (baseDamage * factor) >> 0;
  }

  static calcOddDefMelee = (chanceOddAtkMelee: number) => {
    const result = (chanceOddAtkMelee / 2) >> 0;
    return result > 95 ? 95 : result;
  };

  static calcOddDefSpecial = (chanceOddAtkSpecial: number) => {
    const result = (chanceOddAtkSpecial / 3) >> 0;
    return result > 95 ? 95 : result;
  };

  static calcOddAtkSpecial(intelligence: number, willpower: number) {
    const result = (40 + intelligence * 2 + willpower) >> 0;
    return result > 95 ? 95 : result;
  }

  static calcOddAtkMelee(dexterity: number, willpower: number) {
    const result = (dexterity + willpower + 50) >> 0;
    return result > 95 ? 95 : result;
  }

  static calcOddDodgeSpecial(willpower: number, dexterity: number) {
    const odd = (willpower + dexterity) * 1;
    return odd > 50 ? 50 : odd;
  }

  static calcTotalIntelligence(intelligence: number) {
    return intelligence;
  }
  static calcTotalDexterity(dexterity: number) {
    return dexterity;
  }
  static calcTotalwillpower(willpower: number) {
    return willpower;
  }
  static calcDamageCriticalCounter = (damageMelee: number) => {
    return damageMelee * 2;
  };

  static damageCalc(strength: number) {
    return strength;
  }

  static specialDamageCalc(intelligence: number) {
    return (2.5 * (intelligence + 0.7)) >> 0;
  }

  static oddDodgeSpecialCalc(willpower: number, dexterity: number) {
    const odd = (willpower + dexterity) * 1;
    return odd > 50 ? 50 : odd;
  }

  static calcOddDodgeMelee(willpower: number, dexterity: number) {
    const odd = (willpower + dexterity) * 1;
    return odd > 50 ? 50 : odd;
  }

  static calcOddCritc = (dexterity: number, willpower: number) => {
    return dexterity + willpower;
  };

  static calcCriticalDamageMelee(damageMelee: number) {
    const radint = this.generateRadintBetween(100, 130);
    const randFactor = radint / 100;
    return 2 * damageMelee; // (damageMelee * 1.2 * randFactor) >> 0;
  }
}
