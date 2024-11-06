import { Skill } from "../../src/rooms/schema/GameStates";
import {
  InitialAttributesByClass,
  InitialSkills,
} from "../../src/utils/attributes";
import { Character } from "./entities/character.entity";
import { prismaClient } from "./prismaClient";

export interface ICharactersRepository {
  prismaClient: typeof prismaClient;
  findCharacters(query?: any): Promise<Character[]>;
  findCharactersById(id: string): Promise<any>;
  createCharacter(character: any): Promise<any>;
  createManyCharacter(character: Character[]): Promise<any>;
  updateCharacter(id: string, character: any): Promise<any>;
  deleteCharacter(id: string): Promise<any>;
}

export class CharactersPrismaORMRepository implements ICharactersRepository {
  prismaClient: typeof prismaClient;
  constructor() {
    this.prismaClient = prismaClient;
  }
  async findCharacters(query?: any): Promise<any> {
    try {
      return this.prismaClient.character.findMany({ where: query });
    } catch (err) {
      console.log({ err });
    }
  }

  async findCharactersById(id: string): Promise<any> {
    try {
      return this.prismaClient.character.findUnique({
        where: {
          id,
        },
        include: {
          CharacterAttribute: true,
          skill: true,
        },
      });
    } catch (err) {
      console.log({ err });
    }
  }

  async createCharacter(character: any): Promise<Character> {
    try {
      const createResult = await this.prismaClient.character.create({
        data: character,
      });
      return createResult;
    } catch (err) {
      console.log({ err });
    }

    // console.log({ createResult, character });
  }
  async createManyCharacter(character: any[]): Promise<any> {
    try {
      return this.prismaClient.character.createMany({
        data: character,
      });
    } catch (err) {
      console.log({ err });
    }
  }

  async updateCharacter(
    id: string,
    character: Partial<Character>
  ): Promise<any> {
    try {
      return this.prismaClient.character.update({
        where: {
          id,
        },
        data: character,
      });
    } catch (err) {
      console.log({ err });
    }
  }

  async deleteCharacter(id: string): Promise<any> {
    try {
      return this.prismaClient.character.delete({
        where: {
          id,
        },
      });
    } catch (err) {
      console.log({ err });
    }
  }

  async createNewCharacter({
    name,
    id,
    heroClass,
  }: Partial<Character>): Promise<any> {
    const newCharacter = await this.prismaClient.character.create({
      data: {
        level: 1,
        exp: 0,
        levelupExp: 100,
        userId: id,
        name,
        heroClass: heroClass,
        CharacterAttribute: {
          create: {
            ...InitialAttributesByClass[
              heroClass as "warrior" | "mage" | "scout"
            ],
          },
        },
        skill: {
          createMany: {
            data: InitialSkills[heroClass] as Skill[],
          },
        },
      },
    });

    return newCharacter;
  }
}
