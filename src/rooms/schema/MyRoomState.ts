import { Schema, MapSchema, type } from "@colyseus/schema";
import { attributesCalculations } from "../../utils/calculations";
import { ICharacterInitial, Skill } from "./GameStates";

export class PlayerSchema extends Schema {
  @type("string") userId: string;
  @type("string") player_db_id: string;

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
  @type("number") vitality: number;
  @type("number") willpower: number;
  @type("number") intelligence: number;
  @type("number") initialMana: number;
  @type("number") manaRegen: number;
  @type("number") specialDamage: number;
  @type("number") meleeOdd: number;
  @type("number") meleeDefOdd: number;
  @type("number") specialOdd: number;
  @type("number") specialDefOdd: number;
  @type("number") meleeDodgeOdd: number;
  @type("number") specialDodgeOdd: number;

  receiveDamage(damage: number): string {
    this.hp = this.hp - damage < 0 ? 0 : this.hp - damage;

    return `${this.playerName}@atk@suc@${damage}@${this.hp}`;
  }
  receiveSpecialDamage(damage: number): string {
    this.hp = this.hp - damage < 0 ? 0 : this.hp - damage;
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
