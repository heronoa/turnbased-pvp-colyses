import { InitialSkills } from "../../utils/attributes";
import { attributesCalculations } from "../../utils/calculations";
import {
  ActionSchema,
  BattleFieldSchema,
  MapAction,
  PlayerSchema,
  SkillSchema,
  TilesetX,
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
  effect: string;
  baseDamage?: number;
  type?: string;
  baseCost: number;
  countdown: number;
  factors?: string;
  areaX?: number[]; // [1,1]
  areaY?: number[]; //  [1,1]
  targetable?: boolean;
  combineCoords?: "ALL" | "ONLY_COMBINE" | "NO_COMBINE";
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
  initial_pos: {
    x: number;
    y: number;
  };
}

export class BattleField extends BattleFieldSchema {
  constructor(x: number, y: number) {
    super();
    const newMap = new Array(y).fill(0);

    const filledMap = newMap.map((ts) => new TilesetX(x));

    this.map = filledMap;
  }
}

export class Player extends PlayerSchema {
  constructor(playerName: string, attributes: ICharacterInitial) {
    super(playerName, attributes);
    this.location_x = attributes?.initial_pos?.x || 0;
    this.location_y = attributes?.initial_pos?.y || 0;
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
      (skill) => skill.baseCost <= this.mana
    );

    const actionChoosed =
      possibleActions[Math.floor(Math.random() * possibleActions.length)];

    const skillChoosed = {
      skill: actionChoosed,
      movement: { x: (Math.random() * 3) >> 0, y: (Math.random() * 4) >> 0 },
    };

    return skillChoosed;
  }
}

export class SkillClass extends SkillSchema {
  constructor(skill: Skill) {
    super(skill);
  }
}

export class Action extends ActionSchema {
  constructor(
    playerName: string,
    action: Skill,
    movement?: { x: number; y: number },
    target?: { x: number; y: number }
  ) {
    super(playerName);
    this.player = playerName;
    this.action = new SkillClass(action);
    if (movement) this.movement = new MapAction(movement);
    if (target) this.target = new MapAction(target);
  }
}

export class Winner extends WinnerSchema {
  constructor(winner: string, round: number) {
    super();
    this.winner = winner;
    this.round = round;
  }
}
