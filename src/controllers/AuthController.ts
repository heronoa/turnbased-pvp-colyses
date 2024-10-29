import jwt, { JwtPayload } from "jsonwebtoken";
import { UsersPrismaORMRepository } from "../../prisma/repositories/user.repository";
import bcrypt from "bcrypt";

interface ICredentials {
  email: string;
  password: string;
  username?: string;
}

export class AuthController {
  static async me(token: string) {
    try {
      const payload = jwt.verify(token, process.env.SECRET) as JwtPayload;

      console.log("JWT PAYLOAD", { payload });

      const userRepository = new UsersPrismaORMRepository();

      if (payload?.id) {
        const userExists = await userRepository.findUserById(payload.id);
        return userExists;
      } else {
        console.log("User not found");
        return { msg: "User not found" };
      }
    } catch (err) {
      console.log({ err });
    }
  }

  static async login({ email, password }: ICredentials) {
    const userRepository = new UsersPrismaORMRepository();

    const userExists = await userRepository.findUsersByEmailAndPassword(email);

    let cryptResult = false;
    if (userExists) {
      cryptResult = await bcrypt.compare(password, userExists.password);

      console.log({ cryptResult });
      if (cryptResult) {
        const id = userExists.id;
        const token = jwt.sign({ id }, process.env.SECRET, {
          expiresIn: 300, // expires in 5min
        });

        return {
          token,
          user: {
            email: userExists.email,
            username: userExists.username,
            character: userExists?.character || [],
          },
        };
      } else {
        return { msg: "Password incorrect" };
      }
    } else {
      return { msg: "user not found" };
    }
  }

  static async signup({ email, username, password }: ICredentials) {
    const userRepository = new UsersPrismaORMRepository();

    const saltRounds = 10;
    let createUser;

    bcrypt.hash(password, saltRounds, async function (err, hash) {
      if (err) {
        return err.message;
      }
      createUser = await userRepository.createUser({
        email,
        password: hash,
        username,
      });
    });

    if (createUser) {
      return "User created sucessfully";
    }

    return "User creation failed";
  }
}
