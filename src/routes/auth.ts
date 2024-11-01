import express, { Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
export const authRouter = express.Router();

authRouter.get("/me", async (req: any, res: any) => {
  try {
    if (!req.headers.authorization) {
      res.status(422).json({ msg: "missing parameters" });
    }
    const token = req?.headers?.authorization?.split(" ")[1];

    const me = await AuthController.me(token);
    res.status(200).json({ user: me });
  } catch (err) {
    res.status(500).json({ user: undefined, msg: "Login error" });
  }
});

authRouter.post("/login", async (req: any, res: any) => {
  const {
    email = undefined,
    username = undefined,
    password = undefined,
  } = req.body;

  if (email && password) {
    const { token = undefined, user = undefined } = await AuthController.login({
      email,
      password,
    });

    // console.log({ token, user });

    if (token && user) {
      res.status(200).json({ token, user });
    } else {
      res.status(404).json({ msg: "User not found" });
    }
    return;
  }

  res.status(500).json({ msg: "Missing Parameters" });
});
// define a rota 'ajuda'
authRouter.post("/signup", async (req: Request, res: Response) => {
  const {
    email = undefined,
    username = undefined,
    password = undefined,
  } = req.body;

  if (email && password && username) {
    const msg = await AuthController.signup({
      email,
      username,
      password,
    });

    res.status(200).json({ msg });
    return;
  }

  res.status(500).json({ msg: "Missing Parameters" });
});
