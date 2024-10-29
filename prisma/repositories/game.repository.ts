import { CreateGameDto } from "./dto/game/create-game.dto";
import { UpdateGameDto } from "./dto/game/update-game.dto";
import { Game } from "./entities/game.entity";
import { prismaClient } from "./prismaClient";

export interface IGamesRepository {
  prismaClient: typeof prismaClient;
  findGames(query?: any): Promise<Game[]>;
  findGamesById(id: string): Promise<any>;
  createGame(game: any): Promise<any>;
  createManyGame(game: CreateGameDto[]): Promise<any>;
  updateGame(id: string, game: any): Promise<any>;
  updateByNftId(nft_id: string, game: UpdateGameDto): Promise<any>;
  deleteGame(id: string): Promise<any>;
}

export class GamesPrismaORMRepository implements IGamesRepository {
  prismaClient: typeof prismaClient;
  constructor() {
    this.prismaClient = prismaClient;
  }
  async findGames(query?: any): Promise<any> {
    try {
      return this.prismaClient.game.findMany({ where: query });
    } catch (err) {
      console.log({ err });
    }
  }

  async findGamesById(id: string): Promise<any> {
    try {
      return this.prismaClient.game.findUnique({
        where: {
          id,
        },
      });
    } catch (err) {
      console.log({ err });
    }
  }

  async updateByNftId(nft_id: string, game: UpdateGameDto) {
    return;
  }

  async createGame(game: Game): Promise<any> {
    try {
      const createResult = await this.prismaClient.game.create({
        data: game,
      });
      return createResult;
    } catch (err) {
      console.log({ err });
    }

    // console.log({ createResult, game });
  }
  async createManyGame(game: CreateGameDto[]): Promise<any> {
    try {
      return this.prismaClient.game.createMany({
        data: game,
      });
    } catch (err) {
      console.log({ err });
    }
  }

  async updateGame(id: string, game: Game): Promise<any> {
    try {
      return this.prismaClient.game.update({
        where: {
          id,
        },
        data: game,
      });
    } catch (err) {
      console.log({ err });
    }
  }

  async deleteGame(id: string): Promise<any> {
    try {
      return this.prismaClient.game.delete({
        where: {
          id,
        },
      });
    } catch (err) {
      console.log({ err });
    }
  }
}
