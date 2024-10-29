import jwt, { JwtPayload } from "jsonwebtoken";
import { UsersPrismaORMRepository } from "../../prisma/repositories/user.repository";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = async (
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

    console.log("JWT PAYLOAD", { payload });

    const userRepository = new UsersPrismaORMRepository();

    if (payload?.id) {
      const userExists = await userRepository.findUserById(payload.id);
      (req as any).userData = userExists;
      console.log("middleware", req.body);
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
