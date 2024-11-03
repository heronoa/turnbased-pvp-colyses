import { Schema, MapSchema, type } from "@colyseus/schema";
import { attributesCalculations } from "../../utils/calculations";
import { ICharacterInitial, Skill } from "./GameStates";

export class StatusSchema extends Schema {
  @type("number") damage?: number;
  @type("string") factors?: string;
  @type("string") type: string;
  @type("number") duration: number;
}

export class SkillCountdownSchema extends Schema {
  @type("number") duration: number = 0;
  @type("string") id: string;
}

export class SkillCountdown extends SkillCountdownSchema {
  constructor(skill: Skill) {
    super();
    this.id = skill.id;
    this.duration = skill.countdown;
  }
}

export class PlayerSchema extends Schema {
  @type("string") userId: string;
  @type("string") player_db_id: string;
  @type({ array: StatusSchema }) status: StatusSchema[] = [];
  @type({ map: SkillCountdownSchema }) skill_countdown =
    new MapSchema<SkillCountdownSchema>();

  @type("boolean") connected: boolean = true;
  @type("number") hp: number;
  @type("number") max_hp: number;
  @type("string") playerName: string;
  @type("number") afkSequel: number = 0;
  @type("number") baseDamage: number;
  @type("number") damage: number;
  @type("number") criticalDamage: number;

  @type("boolean") hasCA: boolean = false;
  @type("number") CAfactor: number;
  @type("boolean") hasShield: boolean = true;
  @type("number") breakSequel: number = 0;
  @type("number") maxBreakSequel: number = 5;
  @type("number") mana: number;
  @type("number") maxMana: number;

  @type("number") strength: number;
  @type("number") dexterity: number;
  @type("number") resistence: number;
  @type("number") vitality: number;
  @type("number") willpower: number;
  @type("number") intelligence: number;
  @type("number") base_strength: number;
  @type("number") base_dexterity: number;
  @type("number") base_resistence: number;
  @type("number") base_vitality: number;
  @type("number") base_willpower: number;
  @type("number") base_intelligence: number;
  @type("number") initialMana: number;
  @type("number") manaRegen: number;
  @type("number") specialDamage: number;

  addSkillCountdown(skill: Skill) {
    const skillCountdown = new SkillCountdown(skill);

    this.skill_countdown.set(skill.id, skillCountdown);
  }

  resolveSkillCountdown() {
    this.skill_countdown.forEach((cd) => {
      cd.duration--;

      if (cd.duration <= 0) {
        this.skill_countdown.delete(cd.id);
      }
    });
  }

  resolveFactors(factors: {
    strength: number;
    dexterity: number;
    resistence: number;
    vitality: number;
    willpower: number;
    intelligence: number;
  }) {
    this.strength += this.base_strength * (factors?.strength || 0);
    this.dexterity += this.base_dexterity * (factors?.dexterity || 0);
    this.resistence += this.base_resistence * (factors?.resistence || 0);
    this.vitality += this.base_vitality * (factors?.vitality || 0);
    this.willpower += this.base_willpower * (factors?.willpower || 0);
    this.intelligence += this.base_intelligence * (factors?.intelligence || 0);
  }

  clearStatus(factors: {
    strength: number;
    dexterity: number;
    resistence: number;
    vitality: number;
    willpower: number;
    intelligence: number;
  }) {
    console.log("debuffing", {
      player1: JSON.stringify({
        strength: this.strength,
        dexterity: this.dexterity,
        resistence: this.resistence,
        vitality: this.vitality,
        willpower: this.willpower,
        intelligence: this.intelligence,
      }),
    });
    this.strength -= this.base_strength * (factors?.strength || 0);
    this.dexterity -= this.base_dexterity * (factors?.dexterity || 0);
    this.resistence -= this.base_resistence * (factors?.resistence || 0);
    this.vitality -= this.base_vitality * (factors?.vitality || 0);
    this.willpower -= this.base_willpower * (factors?.willpower || 0);
    this.intelligence -= this.base_intelligence * (factors?.intelligence || 0);
    console.log("debuffing", {
      player2: JSON.stringify({
        strength: this.strength,
        dexterity: this.dexterity,
        resistence: this.resistence,
        vitality: this.vitality,
        willpower: this.willpower,
        intelligence: this.intelligence,
      }),
    });
  }

  addStatus(status: StatusSchema) {
    console.log({ status });

    this.status.push(status);
    const factors = JSON.parse(status.factors);

    console.log("buffing", {
      player1: JSON.stringify({
        strength: this.strength,
        dexterity: this.dexterity,
        resistence: this.resistence,
        vitality: this.vitality,
        willpower: this.willpower,
        intelligence: this.intelligence,
      }),
    });
    this.resolveFactors(factors);
    console.log("buffing", {
      player2: JSON.stringify({
        strength: this.strength,
        dexterity: this.dexterity,
        resistence: this.resistence,
        vitality: this.vitality,
        willpower: this.willpower,
        intelligence: this.intelligence,
      }),
    });
  }

  resolveStatus() {
    this.status.forEach((stats: StatusSchema, index) => {
      console.log({ stats });
      this.receiveDamage(stats?.damage || 0);
      stats.duration--;

      if (stats.duration <= 0) {
        this.status.splice(index, 1);

        const factors = JSON.parse(stats.factors);

        this.clearStatus(factors);
      }
    });
  }

  receiveDamage(damage: number): number {
    const damageNegated = attributesCalculations.calcDamageNegated(
      damage,
      this.resistence,
      this.dexterity,
      this.strength
    );

    // const guardingNegation = damageNegated;
    // const normalNegation = damageNegated;

    // if (this.status.find((s) => s.factors)) {
    //   console.log({ guardingNegation, resistence: this.resistence });
    // } else {
    //   console.log({ normalNegation, resistence: this.resistence });
    // }

    const resultDamage =
      damage - damageNegated > 0 ? damage - damageNegated : 1;
    this.hp = this.hp - resultDamage < 0 ? 0 : this.hp - resultDamage;

    return resultDamage;
  }
  receiveSpecialDamage(damage: number): string {
    const damageNegated = attributesCalculations.calcDamageNegated(
      damage,
      this.willpower,
      this.intelligence,
      this.resistence
    );
    const resultDamage = damage - damageNegated;

    this.hp = this.hp - resultDamage < 0 ? 0 : this.hp - resultDamage;
    return `${this.playerName}@sp@suc@${damage}@${this.hp}`;
  }

  specialUsed(specialCost: number) {
    this.mana -= specialCost;
  }

  replenishHp() {
    this.hp = this.max_hp;
  }

  replenishMana() {
    if (this.mana < this.maxMana) this.mana += this.manaRegen;
  }
  resetMana() {
    this.mana = this.initialMana;
  }

  incrementAfkSequel() {
    this.afkSequel++;
  }

  afkClear() {
    this.afkSequel = 0;
  }

  activateCA() {
    this.hasCA = true;
    this.damage = attributesCalculations.calcCriticalDamageMelee(
      this.baseDamage
    );
    return this.playerName + "@def@suc@CA";
  }

  deactivateCA() {
    this.hasCA = false;
    this.damage = this.baseDamage;
  }

  breakShield() {
    this.hasShield = false;
    return this.playerName + "@brk@suc@" + this.maxBreakSequel;
  }

  recoverShield() {
    this.breakSequel = 0;
    this.hasShield = true;
  }

  incrementBreakSequel() {
    this.breakSequel++;
  }
}

export class BotPlayerSchema extends PlayerSchema {
  constructor(playerName: string, attributes: ICharacterInitial) {
    super(playerName, attributes);
  }
}

export class SkillSchema extends Schema {
  @type("string") id = "";
  @type("string") name: string;
  @type("number") duration = 0;
  @type("string") effect: string;
  @type("number") baseDamage = 0;
  @type("string") type: string;
  @type("number") baseCost = 0;
  @type("number") countdown = 0;
  @type("number") channeling = 0;
}
export class ActionSchema extends Schema {
  @type("string") action: string;
  @type("string") player: string;
}
export class WinnerSchema extends Schema {
  @type("number") round: number;
  @type("string") winner: string;
}

export class MyRoomState extends Schema {
  @type("number") currentTurn: number = 1;
  @type("number") currentRound: number = 1;
  @type("number") countdown: number = 25;
  @type("string") winner: string;
  @type("string") history: string = "{}";
  @type("string") db_id: string;
  @type("boolean") isRanked: boolean;
  @type({ map: PlayerSchema || BotPlayerSchema }) players = new MapSchema<
    PlayerSchema | BotPlayerSchema
  >();
  @type({ map: ActionSchema }) actions = new MapSchema<ActionSchema>();
  @type({ map: WinnerSchema }) roundWinners = new MapSchema<WinnerSchema>();
}
