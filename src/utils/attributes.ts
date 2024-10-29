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

const comumInitialSkills = [
  {
    name: "Punch",
    effect: "DAMAGE",
    baseDamage: 1,
    type: "BLUNT",
    baseCost: 1,
  },
  {
    name: "Kick",
    effect: "DAMAGE",
    baseDamage: 2,
    type: "BLUNT",
    baseCost: 2,
  },
  {
    name: "Wait",
    effect: "DAMAGE",
    baseDamage: 2,
    type: "BLUNT",
    baseCost: 2,
  },
  {
    name: "Guard",
    effect: "STATUS",
    baseDamage: 2,
    type: "BLUNT",
    baseCost: 2,
  },
  {
    name: "Evade",
    effect: "STATUS",
    baseDamage: 2,
    type: "BLUNT",
    baseCost: 2,
  },
];

export const InitialSkills: any = {
  warrior: [...comumInitialSkills],
  mage: [...comumInitialSkills],
  scout: [...comumInitialSkills],
};
