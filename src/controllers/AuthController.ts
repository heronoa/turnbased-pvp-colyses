import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

interface ICredentials {
  email: string;
  password: string;
  username?: string;
}

export class AuthController {
  constructor(private authService = new AuthService()) {
    console.log("AuthController contructor");
  }

  async me(req: Request, res: Response) {
    try {
      if (!req.headers.authorization) {
        res.status(422).json({ msg: "missing parameters" });
      }
      const token = req?.headers?.authorization?.split(" ")[1];

      const me = await this.authService.me(token);
      res.status(200).json({ user: me });
    } catch (err) {
      res.status(500).json({ user: undefined, msg: "Login error" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email = "", password = "" } = req.body;

      if (!email.trim() || !password.trim()) {
        res.status(422).json({ error: "Missing Parameters" });
      }

      const data = await this.authService.login({
        email: email.toLowerCase(),
        password,
      });

      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async signup(req: Request, res: Response) {
    try {
      const { email = "", password = "", username = "" } = req.body;

      if (!email.trim() || !password.trim() || !username.trim()) {
        res.status(422).json({ error: "Missing Parameters" });
      }

      console.log({ email, password, username });
      const userCreationMsg = await this.authService.signup({
        email,
        password,
        username,
      });

      res.status(200).json({ msg: userCreationMsg });
    } catch (err: any) {
      console.log(err);
      res.status(400).json({ error: err.message });
    }
  }
}
