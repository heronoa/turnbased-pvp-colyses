// import { Response } from "express";
// import fs from "fs";

// import { prismaClient as prisma } from "../../prisma/repositories/prismaClient";
// import {
//   RankName,
//   rankingPvpWalletsBlacklist,
//   ranks,
//   ranksIndex,
// } from "./constants";

// interface IGetRankingParams {
//   dateStart: string;
//   dateEnd: string;
// }

// interface IChangeRankingParams {
//   ranking: any;
// }

// interface IChangeRankingResponse {
//   status: "success" | "error";
//   message: string;
// }

// interface IGenerateRankingParams {
//   ranking: any;
//   res: Response;
// }

// export const getRanking = async ({ dateStart, dateEnd }: IGetRankingParams) => {
//   const startDate = new Date(dateStart);
//   const endDate = new Date(dateEnd);

//   if (startDate > endDate) {
//     throw new Error("DateStart must be less than dateEnd");
//   }

//   const ranking = await prisma.game.findMany({
//     where: {
//       AND: [
//         {
//           NOT: {
//             initial_players: {
//               hasSome: rankingPvpWalletsBlacklist,
//             },
//           },
//         },
//         {
//           created_at: {
//             gte: startDate,
//             lte: endDate,
//           },
//         },
//         { isRanked: true },
//       ],
//     },
//   });

//   //   const formattedRanking = ranking
//   //     .map((player) => {
//   //       const games = player.games.map((game) => game.game);

//   //       const wonGames = games.filter(
//   //         (game) => game.winnerId === player.id
//   //       ).length;
//   //       const lossGames = games.filter(
//   //         (game) => game.winnerId !== player.id && !game.isDraw
//   //       ).length;
//   //       const drawGames = games.filter((game) => game.isDraw).length;

//   //       const points = wonGames * 3 + drawGames - lossGames;

//   //       return {
//   //         ...player,
//   //         points,
//   //         wonGames,
//   //         lossGames,
//   //         drawGames,
//   //         totalGames: games.length,
//   //       };
//   //     })
//   //     .sort((a, b) => b.points - a.points);

//   //   return formattedRanking;
// };

// // export const changeRanking = async ({
// //   ranking,
// // }: IChangeRankingParams): Promise<IChangeRankingResponse> => {
// //   try {
// //     // need update the rank of the players in the database
// //     const top20 = ranking.slice(0, 20);
// //     const others = ranking.slice(20);

// //     const playersUp = top20
// //       .map((player: { rank: any; id: any }) => {
// //         if (player.rank) {
// //           return {
// //             id: player.id,
// //             rank: ranks[ranksIndex[player.rank as RankName] + 1],
// //           };
// //         }
// //         return null;
// //       })
// //       .filter((player: any) => Boolean(player));

// //     // update the rank of the players in the database
// //     const updatesUp = playersUp.map((player: { id: any; rank: any }) => {
// //       return prisma.player.update({
// //         where: {
// //           id: player?.id,
// //         },
// //         data: {
// //           rank: player?.rank,
// //         },
// //       });
// //     });

// //     const playersDown = others
// //       .map((player: { rank: any; id: any }) => {
// //         if (player.rank) {
// //           const newRankIndex =
// //             ranksIndex[player.rank as RankName] === 0
// //               ? 0
// //               : ranksIndex[player.rank as RankName] - 1;
// //           const rank = ranks[newRankIndex];

// //           return {
// //             id: player.id,
// //             rank,
// //           };
// //         }
// //         return null;
// //       })
// //       .filter((player: any) => Boolean(player));

// //     // update the rank of the players in the database

// //     const updatesDown = playersDown.map((player: { id: any; rank: any }) => {
// //       return prisma.player.update({
// //         where: {
// //           id: player?.id,
// //         },
// //         data: {
// //           rank: player?.rank,
// //         },
// //       });
// //     });

// //     await prisma.$transaction([...updatesUp, ...updatesDown]);

// //     return {
// //       status: "success",
// //       message: "Ranking updated",
// //     };
// //   } catch (error: any) {
// //     return {
// //       status: "error",
// //       message: error.message,
// //     };
// //   }
// // };

// // export const generateRankingReport = async ({
// //   ranking,
// //   res,
// // }: IGenerateRankingParams) => {
// //   try {
// //     fs.writeFileSync("ranking.json", JSON.stringify(ranking));

// //     res.download("ranking.json", "ranking.json", () => {
// //       fs.unlinkSync("ranking.json");
// //     });
// //   } catch (error: any) {
// //     fs.unlinkSync("ranking.json");
// //     return res.status(500).json({ message: error.message });
// //   }
// // };

// interface Player {
//   id: string;
//   name: string;
// }

// interface Game {
//   id: string;
//   player1: Player;
//   player2: Player;
// }

// interface PlayerGames {
//   player: Player;
//   games: string[];
// }

// function getPlayerGames(games: Game[]): PlayerGames[] {
//   const playerGamesMap: Map<string, PlayerGames> = new Map();

//   games.forEach((game) => {
//     const { player1, player2 } = game;

//     // Verifica se o player1 já existe no mapa, senão adiciona
//     if (!playerGamesMap.has(player1.id)) {
//       playerGamesMap.set(player1.id, {
//         player: player1,
//         games: [],
//       });
//     }
//     // Adiciona o jogo à lista de jogos do player1
//     playerGamesMap.get(player1.id)?.games.push(game.id);

//     // Verifica se o player2 já existe no mapa, senão adiciona
//     if (!playerGamesMap.has(player2.id)) {
//       playerGamesMap.set(player2.id, {
//         player: player2,
//         games: [],
//       });
//     }
//     // Adiciona o jogo à lista de jogos do player2
//     playerGamesMap.get(player2.id)?.games.push(game.id);
//   });

//   // Retorna uma lista a partir dos valores do mapa
//   return Array.from(playerGamesMap.values());
// }
