import jwt, { JwtPayload } from "jsonwebtoken";
import { UsersPrismaORMRepository } from "../../prisma/repositories/user.repository";
import { NextFunction, Request, Response } from "express";

export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    res.status(422).json({ msg: "missing parameters" });
  }
  const token = req?.headers?.authorization?.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.SECRET) as JwtPayload;

    const userRepository = new UsersPrismaORMRepository();

    if (payload?.id) {
      const userExists = await userRepository.findUserById(payload.id);

      if (userExists.email !== process.env.ADMIN_EMAIL) {
        res.status(500).json({ msg: "Unauthorized" });
        return;
      }

      (req as any).userData = userExists;

      next();
      return;
    } else {
      console.log("Unauthorized");
      res.status(500).json({ msg: "Unauthorized" });
    }
  } catch (err) {
    console.log({ err });
  }
};
