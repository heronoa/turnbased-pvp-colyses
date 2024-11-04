import { MyRoom } from "./MyRoom";
import { BotPlayer, Player, Winner } from "./schema/GameStates";
import { Player as DBPlayer } from "../../prisma/repositories/entities/player.entity";
import { GamesPrismaORMRepository } from "../../prisma/repositories/game.repository";
import { PlayersPrismaORMRepository } from "../../prisma/repositories/player.repository";
import { PlayerSchema } from "./schema/MyRoomState";
import { Game } from "../../prisma/repositories/entities/game.entity";

export class DBActions {
  static async saveGameOnDB(
    room: MyRoom,
    previousHistory: {
      gameId: string;
      initialPlayers: (Player | BotPlayer)[];
      rounds: string;
      winner: string;
    }
  ) {
    try {
      const gameRepo = new GamesPrismaORMRepository();

      const historyObj = previousHistory;

      if (room?.state?.db_id)
        await gameRepo.updateGame(room.state.db_id, {
          room_id: room?.roomId,
          initial_players:
            historyObj?.initialPlayers?.map((p) => p.userId) || [],
          rounds: JSON.stringify(historyObj.rounds),
          winner: historyObj?.winner || undefined,
          isRanked: room?.state?.isRanked,
        });
    } catch (err) {
      console.log({ err });
    }
  }

  static async createNewPlayer(player: DBPlayer): Promise<string> {
    if (player.id === "-1") {
      return;
    }
    try {
      const playerRepo = new PlayersPrismaORMRepository();

      const existPlayer: DBPlayer[] = await playerRepo.findPlayers({
        where: { wallet: player.wallet },
      });

      if (existPlayer[0]) {
        // console.log({ existPlayer });
        return existPlayer[0].id;
      } else {
        const newPlayer = await playerRepo.createPlayer(new DBPlayer(player));
        // console.log({ newPlayer });

        return newPlayer.id;
      }
    } catch (err) {
      console.log({ err });
    }
  }

  static async addGameToPlayer(player_id: string, game_id: string) {
    if (player_id === "-1" || game_id === "-1") {
      return;
    }

    try {
      const playerRepo = new PlayersPrismaORMRepository();

      const existingPlayer = await playerRepo.findPlayers({
        where: { id: player_id },
      });

      // console.log("Adding game to players");
      const gameArr = existingPlayer[0].GameHistory;

      const index = gameArr.findIndex((e) => e === game_id);
      if (index > -1) {
        // console.log("Game Already on the DB");
        // console.log({ index, gameArr, game_id });
        return;
      }
      playerRepo.updatePlayer(player_id, {
        GameHistory: [...gameArr, game_id],
      });
    } catch (err) {
      console.log({ err });
    }
  }

  static async checkRanked(players: PlayerSchema[]) {
    try {
      const gameRepo = new GamesPrismaORMRepository();
      const today = new Date(Date.now());
      today.setHours(21);
      today.setMinutes(0);
      today.setSeconds(0);
      const tomorrow = new Date(today.setDate(today.getDate() + 1));
      tomorrow.setHours(21);
      tomorrow.setMinutes(0);
      tomorrow.setSeconds(0);
      const isRanked = await gameRepo.findGames({
        AND: [
          {
            OR: players.map((p) => {
              return {
                initial_players: {
                  has: p.userId,
                },
              };
            }),
          },
          {
            updated_at: {
              gte: today,
            },
          },
          {
            updated_at: {
              lt: tomorrow,
            },
          },
        ],
      });
      return isRanked.length > 2;
    } catch (err) {
      console.log({ err });
    }
  }
  static async getGamesPlayed(players: PlayerSchema[]) {
    try {
      const gameRepo = new GamesPrismaORMRepository();
      const today = new Date(Date.now());
      today.setHours(21);
      today.setMinutes(0);
      today.setSeconds(0);
      const tomorrow = new Date(today.setDate(today.getDate() + 1));
      tomorrow.setHours(21);
      tomorrow.setMinutes(0);
      tomorrow.setSeconds(0);
      const isRanked = await gameRepo.findGames({
        AND: [
          {
            OR: players.map((p) => {
              return {
                initial_players: {
                  has: p.userId,
                },
              };
            }),
          },
          {
            updated_at: {
              gte: today,
            },
          },
          {
            updated_at: {
              lt: tomorrow,
            },
          },
        ],
      });
      return isRanked.length > 2;
    } catch (err) {
      console.log({ err });
    }
  }
}
