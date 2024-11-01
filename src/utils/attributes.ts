import { Skill } from "../rooms/schema/GameStates";

export const InitialAttributesByClass = {
  warrior: {
    hp: 10,
    magicka: 5,
    strength: 10,
    dexterity: 5,
    willpower: 5,
    resistence: 10,
    intelligence: 5,
    vitality: 10,
  },
  mage: {
    hp: 5,
    magicka: 10,
    strength: 5,
    dexterity: 9,
    willpower: 10,
    resistence: 5,
    intelligence: 10,
    vitality: 5,
  },
  scout: {
    hp: 8,
    magicka: 7,
    strength: 7,
    dexterity: 8,
    willpower: 8,
    resistence: 6,
    intelligence: 7,
    vitality: 8,
  },
};

const comumInitialSkills: Omit<Skill, "id">[] = [
  {
    name: "Punch",
    effect: "DAMAGE",
    baseDamage: 1,
    type: "BLUNT",
    baseCost: 1,
    countdown: 0,
  },
  {
    name: "Kick",
    effect: "DAMAGE",
    baseDamage: 2,
    type: "BLUNT",
    baseCost: 2,
    countdown: 0,
  },
  {
    name: "Wait",
    effect: "STATUS",
    baseDamage: 2,
    type: "BLUNT",
    baseCost: 2,
    countdown: 0,
  },
  {
    name: "Guard",
    effect: "BUFF",
    baseDamage: 2,
    type: "BLUNT",
    baseCost: 2,
    countdown: 0,
    factors: JSON.stringify({
      resistence: 2,
      dexterity: 4,
    }),
  },
  {
    name: "Evade",
    effect: "BUFF",
    baseDamage: 2,
    type: "BLUNT",
    baseCost: 2,
    countdown: 0,
    factors: JSON.stringify({ resistence: 9, dexterity: -0.5 }),
  },
];

export const InitialSkills: any = {
  warrior: [...comumInitialSkills],
  mage: [...comumInitialSkills],
  scout: [...comumInitialSkills],
};
