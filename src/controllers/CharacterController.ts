import { CharactersPrismaORMRepository } from "../../prisma/repositories/characters.repository";
import { InitialAttributesByClass, InitialSkills } from "../utils/attributes";
import { prismaClient } from "../../prisma/repositories/prismaClient";
import { Skill } from "../rooms/schema/GameStates";
import { CharacterService } from "../services/CharacterService";

export class CharacterController {
  constructor(private characterService = new CharacterService()) {
    console.log("CharacterController contructor");
  }

  async getCharacter(req: any, res: any) {
    const { characterId } = req.body;

    try {
      const character = await this.characterService.getCharacter(characterId);

      res.status(200).json({ character });
    } catch (err) {
      console.log({ err });
      res.status(500).json({ msg: "error on find character" });
    }
  }

  async deleteCharacter(req: any, res: any) {
    const { characterId } = req.body;

    try {
      await this.characterService.deleteCharacter(characterId);

      res.status(200).json({ msg: "Character deleted sucessfully" });
    } catch (err) {
      console.log({ err });
      res.status(500).json({ msg: "error on find character" });
    }
  }

  async createCharacter(req: any, res: any) {
    const { name = undefined, classHero = undefined } = req.body;

    const userData = req?.userData as any;

    if (name && classHero) {
      const msg = await this.characterService.createCharacter({
        id: userData.id,
        heroClass: classHero,
        name,
      });

      if (msg.indexOf("sucess") !== -1) {
        res.status(200).json({ msg });
      } else {
        res.status(500).json({ msg });
      }
      return;
    }

    res.status(500).json({ msg: "Missing Parameters" });
  }
}
