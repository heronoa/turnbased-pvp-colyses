import { CharactersPrismaORMRepository } from "../../prisma/repositories/characters.repository";
import { UsersPrismaORMRepository } from "../../prisma/repositories/user.repository";

interface ICharacters {
  heroClass: "warrior" | "scout" | "mage";
  name: string;
  id: string;
}

export class CharacterService {
  constructor(
    private characterRepository = new CharactersPrismaORMRepository()
  ) {
    console.log("CharacterService constructor");
  }

  async getCharacter(characterId: string) {
    try {
      const character = await this.characterRepository.findCharactersById(
        characterId
      );

      return character;
    } catch (err) {
      console.log({ err });
    }
  }

  async deleteCharacter(characterId: string) {
    try {
      const character = await this.characterRepository.deleteCharacter(
        characterId
      );

      return character;
    } catch (err) {
      console.log({ err });
    }
  }

  async createCharacter({ heroClass, name, id }: ICharacters) {
    try {
      // Se o usuário não tiver nenhum Character, cria um novo Character e associa ao User
      const newCharacter = await this.characterRepository.createNewCharacter({
        name,
        heroClass,
        id,
      });

      console.log(
        "Novo personagem criado e associado ao usuário:",
        newCharacter
      );
      return "Character created sucessfully";
    } catch (error) {
      console.error("Erro ao adicionar personagem:", error);
      return "Character creation failed";
    }
  }
}
