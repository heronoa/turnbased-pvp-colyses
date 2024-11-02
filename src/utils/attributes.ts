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
    description: "Soco simples",
    baseDamage: 1,
    type: "BLUNT",
    baseCost: 5,
    countdown: 0,
  },
  {
    name: "Kick",
    effect: "DAMAGE",
    description: "Chute simples",
    baseDamage: 7,
    type: "BLUNT",
    baseCost: 2,
    countdown: 0,
  },
  {
    name: "Wait",
    effect: "BUFF",
    description: "Espera o proximo golpe e recupera um pouco de energia",
    baseDamage: 2,
    type: "BLUNT",
    baseCost: -3,
    countdown: 0,
    factors: JSON.stringify({
      resistence: 2,
      dexterity: 2,
    }),
  },
  {
    name: "Guard",
    description:
      "Se prepara para o proximo impacto reduz o dano recebido e aumenta a chance de evitar o golpe",

    effect: "BUFF",
    baseDamage: 2,
    type: "BLUNT",
    baseCost: 2,
    countdown: 0,
    factors: JSON.stringify({
      resistence: 4,
      dexterity: 4,
    }),
  },
  {
    name: "Evade",
    effect: "BUFF",
    description:
      "Se prepara para evadir o proximo golpe, aumenta muito a chance de evadir o golpe, mas se acertado recebe o dano em dobro",

    type: "BLUNT",
    baseCost: 2,
    countdown: 0,
    factors: JSON.stringify({ resistence: -0.5, dexterity: 9 }),
  },
];

export const InitialSkills: any = {
  warrior: [
    ...comumInitialSkills,
    {
      name: "Tower Stance",
      effect: "BUFF",
      description:
        "Se poe em modo de defesa aumentando sua defesa por um 3 turnos",

      baseCost: 5,
      countdown: 0,
      factors: JSON.stringify({ resistence: 3 }),
    },
  ],
  mage: [
    ...comumInitialSkills,
    {
      name: "Regeneration",
      effect: "BUFF",
      description:
        "Usa o turno para regenerar um pouco de magicka e aumenta willpower",

      baseCost: -5,
      countdown: 2,
      factors: JSON.stringify({ willpower: 2 }),
    },
    {
      name: "Fireball",
      effect: "DAMAGE",
      description: "Lança uma bola de fogo no inimigo",

      type: "FIRE",
      baseDamage: 12,
      baseCost: 8,
      countdown: 2,
      factors: JSON.stringify({ willpower: 2 }),
    },
  ],
  scout: [
    ...comumInitialSkills,
    {
      name: "Counter-Attack",
      effect: "BUFF",
      description: "Aumenta por 1 turno o dano e o a chance de esquiva",
      baseCost: -5,
      countdown: 2,
      factors: JSON.stringify({ dexterity: 2, strength: 3 }),
    },
  ],
};
