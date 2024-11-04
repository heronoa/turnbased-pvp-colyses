import { DefaultArgs } from "@prisma/client/runtime/library";
import { Player } from "./entities/player.entity";
import { prismaClient } from "./prismaClient";
import { Prisma } from "@prisma/client";

export interface IPlayersRepository {
  prismaClient: typeof prismaClient;
  findPlayers(query: Prisma.PlayerFindManyArgs<DefaultArgs>): Promise<Player[]>;
  findPlayersById(id: string): Promise<any>;
  createPlayer(player: any): Promise<any>;
  createManyPlayer(player: Player[]): Promise<any>;
  updatePlayer(id: string, player: Player): Promise<any>;
  updateByNftId(nft_id: string, player: Player): Promise<any>;
  deletePlayer(id: string): Promise<any>;
}

export class PlayersPrismaORMRepository implements IPlayersRepository {
  prismaClient: typeof prismaClient;
  constructor() {
    this.prismaClient = prismaClient;
  }
  async findPlayers(
    query: Prisma.PlayerFindManyArgs<DefaultArgs>
  ): Promise<Player[]> {
    return this.prismaClient.player.findMany(query);
  }

  async findPlayersById(id: string): Promise<any> {
    return this.prismaClient.player.findUnique({
      where: {
        id,
      },
    });
  }

  async updateByNftId(nft_id: string, player: Player) {
    return;
  }

  async createPlayer(player: Player): Promise<any> {
    const createResult = await this.prismaClient.player.create({
      data: player,
    });

    // console.log({ createResult, player });
    return createResult;
  }
  async createManyPlayer(player: Player[]): Promise<any> {
    return this.prismaClient.player.createMany({
      data: player,
    });
  }

  async updatePlayer(id: string, player: Partial<Player>): Promise<any> {
    return this.prismaClient.player.update({
      where: {
        id,
      },
      data: player,
    });
  }

  async deletePlayer(id: string): Promise<any> {
    return this.prismaClient.player.delete({
      where: {
        id,
      },
    });
  }
}
