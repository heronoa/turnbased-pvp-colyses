import jwt, { JwtPayload } from "jsonwebtoken";
import { CharactersPrismaORMRepository } from "../../prisma/repositories/characters.repository";

import bcrypt from "bcrypt";
import { InitialAttributesByClass, InitialSkills } from "../utils/attributes";
import { prismaClient } from "../../prisma/repositories/prismaClient";
import { Skill } from "../rooms/schema/GameStates";

interface ICharacters {
  heroClass: "warrior" | "scout" | "mage";
  name: string;
  id: string;
}

export class CharacterController {
  static async createCharacter({ heroClass, name, id }: ICharacters) {
    try {
      // Verifica se o usuário já possui algum Character associado
      const userWithCharacters = await prismaClient.user.findUnique({
        where: { id },
        include: { character: true },
      });

      if (!userWithCharacters) {
        console.log("Usuário não encontrado.");
        return;
      }

      // Se o usuário não tiver nenhum Character, cria um novo Character e associa ao User
      if (userWithCharacters.character.length === 0) {
        const newCharacter = await prismaClient.character.create({
          data: {
            level: 1,
            exp: 0,
            levelupExp: 100,
            userId: id,
            name,
            heroClass: heroClass,
            CharacterAttribute: {
              create: {
                ...InitialAttributesByClass[heroClass],
              },
            },
            skill: {
              createMany: {
                data: InitialSkills[heroClass] as Skill[],
              },
            },
          },
        });

        console.log(
          "Novo personagem criado e associado ao usuário:",
          newCharacter
        );
        return "Character created sucessfully";
      } else {
        // Se o usuário já tiver personagens, adiciona um novo ao array
        const additionalCharacter = await prismaClient.character.create({
          data: {
            level: 1,
            exp: 0,
            levelupExp: 100,
            userId: id,
            name,
            heroClass: heroClass,
            CharacterAttribute: {
              create: {
                ...InitialAttributesByClass[heroClass],
              },
            },
            skill: {
              createMany: {
                data: InitialSkills[heroClass],
              },
            },
          },
        });

        console.log(
          "Personagem adicional adicionado ao usuário:",
          additionalCharacter
        );
        return "Character created sucessfully";
      }
    } catch (error) {
      console.error("Erro ao adicionar personagem:", error);
      return "Character creation failed";
    }
  }

  static async getCharacter(characterId: string) {
    try {
      const characterRepo = new CharactersPrismaORMRepository();

      const character = await characterRepo.findCharactersById(characterId);

      return character;
    } catch (err) {
      console.log({ err });
    }
  }

  static async deleteCharacter(characterId: string) {
    try {
      const characterRepo = new CharactersPrismaORMRepository();

      const character = await characterRepo.deleteCharacter(characterId);

      return character;
    } catch (err) {
      console.log({ err });
    }
  }
}
