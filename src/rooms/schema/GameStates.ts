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
  description: string;
  duration?: number;
  effect: Effect;
  baseDamage?: number;
  type?: SkillType;
  baseCost: number;
  countdown: number;
  factors?: string;
  // {
  //   strength?: number;
  //   dexterity?: number;
  //   resistence?: number;
  //   vitality?: number;
  //   willpower?: number;
  //   intelligence?: number;
  // };
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
    this.status = [];
    this.player_db_id = attributes.player_db_id;
    this.userId = attributes.userId;
    this.playerName = playerName;
    this.maxMana = attributesCalculations.calcMaxMana(
      attributes.character.intelligence,
      attributes.character.magicka
    );
    this.mana = this.maxMana;
    this.initialMana = attributesCalculations.calcMana(
      attributes.character.willpower,
      attributes.character.magicka
    );
    this.max_hp = attributesCalculations.calcMaxHp(
      attributes.character.hp,
      attributes?.character?.vitality
    );
    this.hp = this.max_hp;
    this.strength = attributes.character.strength;
    this.resistence = attributes.character.resistence;
    this.intelligence = attributes.character.intelligence;
    this.dexterity = attributes.character.dexterity;
    this.willpower = attributes.character.willpower;
    this.vitality = attributes.character.vitality;
    this.base_strength = attributes.character.strength;
    this.base_resistence = attributes.character.resistence;
    this.base_intelligence = attributes.character.intelligence;
    this.base_dexterity = attributes.character.dexterity;
    this.base_willpower = attributes.character.willpower;
    this.base_vitality = attributes.character.vitality;
    this.damage = attributesCalculations.calcDamageMelee(
      this.strength,
      this.dexterity
    );
    this.baseDamage = this.strength;
    this.specialDamage = attributesCalculations.specialDamageCalc(
      attributes?.character?.intelligence || -1
    );
    this.skill_countdown;
  }
}

export class BotPlayer extends Player {
  constructor(playerName: string, attributes: ICharacterInitial) {
    super(playerName, attributes);
  }
  randomAction() {
    const possibleActions = InitialSkills.warrior.filter(
      (skill: Skill) => skill.baseCost <= this.mana  && !this.skill_countdown.get(skill.name)
    ) as Skill[];

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
