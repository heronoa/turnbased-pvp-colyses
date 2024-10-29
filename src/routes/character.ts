import express, { Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { CharacterController } from "../controllers/CharacterController";
export const characterRouter = express.Router();

characterRouter.post("/search", async (req: any, res: any) => {
  const { characterId } = req.body;

  try {
    const character = await CharacterController.getCharacter(characterId);

    console.log({ character });
    res.status(200).json({ character });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ msg: "error on find character" });
  }
});

characterRouter.post("/create", async (req: any, res: any) => {
  const { name = undefined, classHero = undefined } = req.body;

  console.log("character route", req.body);

  const userData = req?.userData as any;

  if (name && classHero) {
    console.log({ userData, name, classHero });

    const msg = await CharacterController.createCharacter({
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
});
// define a rota 'ajuda'
