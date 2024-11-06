import express, { Request, Response } from "express";
import { CharacterController } from "../controllers/CharacterController";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

const characterController = new CharacterController();
const authController = new AuthController();

router.post(
  "/character/search",
  authMiddleware,
  (req: Request, res: Response) => characterController.getCharacter(req, res)
);
router.post(
  "/character/create",
  authMiddleware,
  (req: Request, res: Response) => characterController.createCharacter(req, res)
);
router.delete(
  "/character/delete",
  authMiddleware,
  (req: Request, res: Response) => characterController.deleteCharacter(req, res)
);

router.get("/auth/me", async (req: Request, res: Response) => {
  authController.me(req, res);
});

router.post("/auth/login", async (req: Request, res: Response) => {
  authController.login(req, res);
});
router.post("/auth/signup", async (req: Request, res: Response) => {
  authController.signup(req, res);
});

export default router;
