import { InitialSkills } from "../../utils/attributes";
import { attributesCalculations } from "../../utils/calculations";
import {
  ActionSchema,
  BotPlayerSchema,
  PlayerSchema,
  SkillSchema,
  WinnerSchema,
} from "./MyRoomState";

type Effect = "DAMAGE" | "STATUS" | "BUFF";

type SkillType =
  | "FIRE"
  | "WATER"
  | "EARTH"
  | "AIR"
  | "BLUNT"
  | "CUT"
  | "PIERCE";

export interface Skill {
  id: string;
  name: string;
  duration?: string;
  effect: Effect;
  baseDamage?: number;
  type: SkillType;
  baseCost: number;
  countdown: number;
  channeling?: number;
}
export interface ICharacterInitial {
  player_db_id: string;
  userId: string;
  character: {
    name: string;
    magicka: number;
    dexterity: number;
    intelligence: number;
    willpower: number;
    strength: number;
    resistence: number;
    vitality: number;
    level: number;
    hp: number;
  };
}

export class Player extends PlayerSchema {
  constructor(playerName: string, attributes: ICharacterInitial) {
    super(playerName, attributes);
    this.player_db_id = attributes.player_db_id;
    this.userId = attributes.userId;
    this.playerName = playerName;
    this.maxMana = attributesCalculations.calcMaxMana(
      attributes.character.intelligence,
      attributes.character.magicka
    );
    this.mana = attributesCalculations.calcMana(
      attributes.character.intelligence,
      attributes?.character?.intelligence || 0
    );
    this.initialMana = attributesCalculations.calcMana(
      attributes.character.willpower,
      attributes.character.magicka
    );
    this.manaRegen = attributes.character.willpower;
    this.max_hp = attributesCalculations.calcMaxHp(
      attributes.character.hp,
      attributes?.character?.vitality
    );
    this.hp = this.max_hp;
    this.strength = attributes.character.strength;
    this.intelligence = attributes.character.intelligence;

    this.dexterity = attributes.character.dexterity;

    this.willpower = attributes.character.willpower;
    this.damage = attributesCalculations.calcDamageMelee(
      this.strength,
      this.dexterity
    );
    this.baseDamage = this.strength;
    this.specialDamage = attributesCalculations.specialDamageCalc(
      attributes?.character?.intelligence || -1
    );

    this.meleeOdd = attributesCalculations.calcOddAtkMelee(
      this.dexterity,
      this.willpower
    );
    this.meleeDefOdd = attributesCalculations.calcOddDefMelee(this.meleeOdd);

    this.specialOdd = attributesCalculations.calcOddAtkSpecial(
      this.intelligence,
      this.willpower
    );
    this.specialDefOdd = attributesCalculations.calcOddDefSpecial(
      this.specialOdd
    );

    this.meleeDodgeOdd = attributesCalculations.calcOddDodgeMelee(
      this.willpower,
      this.dexterity
    );
    this.specialDodgeOdd = attributesCalculations.calcOddDodgeSpecial(
      this.willpower,
      this.dexterity
    );
  }
}

export class BotPlayer extends Player {
  constructor(playerName: string, attributes: ICharacterInitial) {
    super(playerName, attributes);
  }
  randomAction() {
    const possibleActions = InitialSkills.warrior as Skill[];

    const actionChoosed =
      possibleActions[Math.floor(Math.random() * possibleActions.length)];

    const skillChoosed = JSON.stringify(actionChoosed);

    return skillChoosed;
  }
}

export class SkillClass extends SkillSchema {
  constructor(skill: Skill) {
    super(skill);
  }
}

export class Action extends ActionSchema {
  constructor(playerName: string, action: string) {
    super(playerName);
    this.player = playerName;
    this.action = action;
  }
}

export class Winner extends WinnerSchema {
  constructor(winner: string, round: number) {
    super();
    this.winner = winner;
    this.round = round;
  }
}
