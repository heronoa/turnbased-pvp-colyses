import { UsersPrismaORMRepository } from "../../prisma/repositories/user.repository";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";

interface ICredentials {
  email: string;
  password: string;
  username?: string;
}

export class AuthService {
  constructor(private userRepository = new UsersPrismaORMRepository()) {
    console.log("AuthService constructor");
  }

  async me(token: string) {
    try {
      const payload = jwt.verify(token, process.env.SECRET) as JwtPayload;

      if (payload?.id) {
        const userExists = await this.userRepository.findUserById(payload.id);
        return userExists;
      } else {
        throw new Error("User not found");
      }
    } catch (err) {
      console.log({ err });
    }
  }

  async login({ email, password }: ICredentials) {
    const userExists = await this.userRepository.findUsersByEmailAndPassword(
      email
    );

    let cryptResult = false;
    if (userExists) {
      cryptResult = await bcrypt.compare(password, userExists.password);

      if (cryptResult) {
        const id = userExists.id;
        const token = jwt.sign({ id }, process.env.SECRET, {
          expiresIn: 1800, // expires in 5min
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
        throw new Error("User or Password incorrect");
      }
    } else {
      throw new Error("user not found");
    }
  }

  async signup({ email, username, password }: ICredentials): Promise<string> {
    try {
      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const createUser = await this.userRepository.createUser({
        email,
        password: hashedPassword,
        username,
      });

      if (createUser) {
        return "User created sucessfully";
      }

    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}
