import { DefaultArgs } from "@prisma/client/runtime/library";
import { User } from "./entities/user.entity";
import { prismaClient } from "./prismaClient";
import { Prisma } from "@prisma/client";

export interface IUsersRepository {
  prismaClient: typeof prismaClient;
  findUsers(query: Prisma.UserFindManyArgs<DefaultArgs>): Promise<User[]>;
  findUserById(id: string): Promise<Partial<User>>;
  findUsersByEmailAndPassword(email: string, password: string): Promise<any>;
  createUser(user: any): Promise<any>;
  createManyUser(user: User[]): Promise<any>;
  updateUser(id: string, user: User): Promise<any>;
  updateByNftId(nft_id: string, user: User): Promise<any>;
  deleteUser(id: string): Promise<any>;
}

export class UsersPrismaORMRepository implements IUsersRepository {
  prismaClient: typeof prismaClient;
  constructor() {
    this.prismaClient = prismaClient;
  }
  async findUsers(
    query: Prisma.UserFindManyArgs<DefaultArgs>
  ): Promise<User[]> {
    return this.prismaClient.user.findMany(query);
  }

  async findUsersByEmailAndPassword(email: string): Promise<Partial<User>> {
    return this.prismaClient.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        id: true,
        username: true,
        character: true,
        password: true,
      },
    });
  }

  async findUserById(id: string): Promise<Partial<User>> {
    return this.prismaClient.user.findUnique({
      where: {
        id,
      },
      select: {
        email: true,
        id: true,
        username: true,
        character: true,
      },
    });
  }

  async updateByNftId(nft_id: string, user: User) {
    return;
  }

  async createUser(user: User): Promise<any> {
    const createResult = await this.prismaClient.user.create({
      data: { ...user },
    });

    // console.log({ createResult, user });
    return createResult;
  }
  async createManyUser(user: User[]): Promise<any> {
    return this.prismaClient.user.createMany({
      data: user,
    });
  }

  async updateUser(id: string, user: Partial<User>): Promise<any> {
    return this.prismaClient.user.update({
      where: {
        id,
      },
      data: user,
    });
  }

  async deleteUser(id: string): Promise<any> {
    return this.prismaClient.user.delete({
      where: {
        id,
      },
    });
  }
}
