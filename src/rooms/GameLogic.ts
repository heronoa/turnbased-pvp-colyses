import { attributesCalculations } from "../utils/calculations";
import { MyRoom } from "./MyRoom";
import { Action, BotPlayer, Winner } from "./schema/GameStates";
import {
  BotPlayerSchema,
  MyRoomState,
  WinnerSchema,
} from "./schema/MyRoomState";
import { DBActions } from "./DBActions";
import { Client } from "colyseus";
import { handleBattleMessage } from "../utils/messages";
import { ResolveActionsLogic } from "./ResolveActionsLogic";

export class GameLogic {
  private static findMostFrequentWinner(results: WinnerSchema[]): string {
    const winnerCount: { [key: string]: number } = {};

    results.forEach((result) => {
      const { winner } = result;
      if (winnerCount[winner]) {
        winnerCount[winner]++;
      } else {
        winnerCount[winner] = 1;
      }
    });

    let maxCount = 0;
    let mostFrequentWinner: string = "0";

    for (const winner in winnerCount) {
      if (winnerCount[winner] > maxCount) {
        maxCount = winnerCount[winner];
        mostFrequentWinner = winner;
      } else if (winnerCount[winner] === maxCount) {
        mostFrequentWinner = "0";
      }
    }

    return mostFrequentWinner;
  }

  private static async updateHistory(
    room: MyRoom,
    actionsMsgArr: {
      resultMsg: { msg: string; damageTaken?: number };
      action: string;
      player: string;
    }[],
    isHitMap: Map<string, boolean>
  ) {
    const previousHistory = JSON.parse(room.state.history);

    if (!previousHistory?.rounds) {
      previousHistory.rounds = {};
    }

    if (!previousHistory.rounds?.[`${room.state.currentRound}`]) {
      previousHistory.rounds[`${room.state.currentRound}`] = {};
    }

    if (
      !previousHistory.rounds?.[`${room.state.currentRound}`]?.[
        `${room.state.currentTurn}`
      ]
    ) {
      previousHistory.rounds[`${room.state.currentRound}`][
        `${room.state.currentTurn}`
      ] = {};
    }

    previousHistory.rounds[`${room.state.currentRound}`][
      `${room.state.currentTurn}`
    ].actionArr = actionsMsgArr.map((e) => {
      return {
        action: e.action,
        player: e.player,
        isHit: isHitMap.get(e.player),
        resultMsg: e.resultMsg,
      };
    });

    previousHistory.rounds[`${room.state.currentRound}`][
      `${room.state.currentTurn}`
    ].players = Array.from(room.state.players.values()).map((p) => {
      return p;
    });

    DBActions.saveGameOnDB(room, previousHistory);

    room.state.history = JSON.stringify(previousHistory);
  }

  static async determineRoundWinner(room: MyRoom): Promise<boolean> {
    // console.log("Determine Round Winner 1");
    const playersArr = Array.from(room.state.players.values());

    console.log(playersArr);
    const awayPlayers = playersArr.filter(
      (p) => p.afkSequel >= room.maxAfkSequel
    );

    const deadPlayers = playersArr.filter((p) => p.hp <= 0);

    if (deadPlayers.length === 1) {
      const newWinner = new Winner(
        playersArr.find((e) => e.hp > 0).userId,
        room.state.currentRound
      );

      room.state.roundWinners.set(String(room.state.currentRound), newWinner);
      room.broadcast(
        "Round Over",
        `${newWinner.winner} won round ${room.state.currentRound}`
      );
      const previousHistory = JSON.parse(room.state.history);
      if (!previousHistory.rounds?.[`${room.state.currentRound}`]) {
        previousHistory.rounds[`${room.state.currentRound}`] = {};
      }

      previousHistory.rounds[`${room.state.currentRound}`].winner =
        newWinner.winner;

      DBActions.saveGameOnDB(room, previousHistory);

      room.state.history = JSON.stringify(previousHistory);
      // console.log("Determine Round Winner 2");

      return true;
    }

    if (deadPlayers.length === 2) {
      const newWinner = new Winner("0", room.state.currentRound);

      room.state.roundWinners.set(String(room.state.currentRound), newWinner);
      room.broadcast("Round Over", "Round draw");

      const previousHistory = JSON.parse(room.state.history);
      if (!previousHistory.rounds?.[`${room.state.currentRound}`]) {
        previousHistory.rounds[`${room.state.currentRound}`] = {};
      }

      previousHistory.rounds[`${room.state.currentRound}`].winner =
        newWinner.winner;

      DBActions.saveGameOnDB(room, previousHistory);

      room.state.history = JSON.stringify(previousHistory);
      // console.log("Determine Round Winner 3");

      return true;
    }

    if (awayPlayers.length === 2) {
      room.state.winner = "0";
      room.broadcast(
        "Game Over",
        "The match ended in a draw because both players were away."
      );

      const previousHistory = JSON.parse(room.state.history);
      if (!previousHistory.rounds?.[`${room.state.currentRound}`]) {
        previousHistory.rounds[`${room.state.currentRound}`] = {};
      }

      previousHistory.rounds[`${room.state.currentRound}`].winner = "0";

      DBActions.saveGameOnDB(room, previousHistory);

      // console.log("Determine Round Winner 4");
    }
    if (awayPlayers.length === 1) {
      const activePlayer = playersArr.find(
        (p) => !awayPlayers.map((e) => e.playerName).includes(p.playerName)
      )?.playerName;
      room.state.winner = activePlayer || "0";

      room.broadcast(
        "Game Over",
        `${activePlayer}: You won the match because your opponent was away.`
      );
      ("");

      const previousHistory = JSON.parse(room.state.history);
      if (!previousHistory.rounds?.[`${room.state.currentRound}`]) {
        previousHistory.rounds[`${room.state.currentRound}`] = {};
      }

      previousHistory.rounds[`${room.state.currentRound}`].winner =
        activePlayer;

      DBActions.saveGameOnDB(room, previousHistory);

      room.state.history = JSON.stringify(previousHistory);

      // console.log("Determine Round Winner 5");

      return true;
    }

    if (room.state.currentTurn === room.maxTurns) {
      const roundWinner =
        playersArr[0].hp > playersArr[1].hp
          ? playersArr[0].userId
          : playersArr[0].hp < playersArr[1].hp
          ? playersArr[1].userId
          : "0";

      const newWinner = new Winner(roundWinner, room.state.currentRound);

      room.state.roundWinners.set(String(room.state.currentRound), newWinner);

      room.broadcast(
        "Round Over",
        newWinner.winner === "0"
          ? `Round ended in draw`
          : `${newWinner.winner} won round ${room.state.currentRound}`
      );

      const previousHistory = JSON.parse(room.state.history);
      if (!previousHistory.rounds?.[`${room.state.currentRound}`]) {
        previousHistory.rounds[`${room.state.currentRound}`] = {};
      }

      previousHistory.rounds[`${room.state.currentRound}`].winner =
        newWinner.winner;

      room.state.history = JSON.stringify(previousHistory);

      DBActions.saveGameOnDB(room, previousHistory);

      // console.log("Determine Round Winner 6");

      return true;
    }

    // console.log("Determine Round Winner 7");

    return false;
  }

  static async determineMatchWinner(room: MyRoom) {
    const winnersArr = Array.from(room.state.roundWinners.values());
    if (room.state.roundWinners.size >= room.maxRounds - 1) {
      // console.log(
      //   "Determine Match Winner ",
      //   room.state.roundWinners.size >= room.maxRounds - 1
      // );

      if (winnersArr.filter((w) => w.winner === "0").length > 1) {
        room.broadcast("Game Over", `Match end on draw`);

        return true;
      }
      const matchWinner = this.findMostFrequentWinner(winnersArr);

      if (matchWinner === "0" && room.state.roundWinners.size === 2) {
        return false;
      }
      room.state.winner = matchWinner;

      room.broadcast(
        "Game Over",
        matchWinner === "0"
          ? `Match end on draw`
          : `${matchWinner} have won the match`
      );

      const previousHistory = JSON.parse(room.state.history);

      previousHistory.winner = matchWinner;

      DBActions.saveGameOnDB(room, previousHistory);

      room.state.history = JSON.stringify(previousHistory);

      return true;
    }
    return false;
  }

  static async turnPass(room: MyRoom) {
    //TODO: Set a delay before round pass
    room.state.actions.clear();

    const hasAWinner = await this.determineRoundWinner(room);

    if (hasAWinner) {
      // console.log("Has A Winner");
      if (await this.determineMatchWinner(room)) {
        // console.log("Has A Match Winner");
        return;
      }
      room.state.currentRound++;
      room.state.currentTurn = 1;

      Array.from(room.state.players.values()).forEach((p) => {
        p.resetMana();
        p.replenishHp();
        p.recoverShield();
      });
    } else {
      // console.log("Hasnt A Winner");

      room.state.currentTurn++;

      const playersArr = Array.from(room.state.players.values());

      playersArr.forEach((p) => {
        p.replenishMana();
        if (playersArr.filter((p) => !p.hasShield).length > 0) {
          if (p.breakSequel === p.maxBreakSequel) {
            p.recoverShield();
          } else {
            p.incrementBreakSequel();
          }
        }
      });
    }
    room.state.countdown = room.turnTimer;
    room.refreshInterval.reset();
    room.clock.setInterval(() => {
      room.refreshInterval.resume();
    }, 3000);
  }

  static resolveActions(room: MyRoom) {
    room.refreshInterval.pause();

    const actionArr = Array.from(room.state.actions.values());

    ResolveActionsLogic.handleAfkAction(room, actionArr);
    const [isHitMap, isDefend] = ResolveActionsLogic.handleCheckHit(
      room,
      actionArr
    );

    const actionsMsgArr = Array.from(room.state.actions.values()).map((e) => {
      const player = room.state.players.get(e.player);
      const opponentKey = Array.from(room.state.players.keys()).find(
        (k: string) => k !== e.player
      );
      const opponent = room.state.players.get(opponentKey);

      player.afkClear();

      const finalMsg = `${e.player}: `;

      switch (e.action) {
        case "atk": {
          const isHit = isHitMap.get(e.player);

          const opponentNotDef =
            room?.state.actions?.get(opponentKey)?.action !== "def";

          if (opponentNotDef) {
            if (player.hasCA) {
              const damageMsg = opponent.receiveDamage(player.damage);
              player.deactivateCA();

              room.broadcast("action", {
                msg: finalMsg + damageMsg,
                damageTaken: player.damage,
              });
              return {
                ...e,
                resultMsg: {
                  msg: finalMsg + damageMsg,
                  damageTaken: player.damage,
                },
              };
            }

            if (isHit) {
              const damageMsg = opponent.receiveDamage(player.damage);

              room.broadcast("action", { msg: finalMsg + damageMsg });
              return { ...e, resultMsg: { msg: finalMsg + damageMsg } };
            }
            player.deactivateCA();

            const msg = `${player.playerName}@atk@miss`;

            room.broadcast("action", { msg: finalMsg + msg });
            return { ...e, resultMsg: { msg: finalMsg + msg } };
          }

          if (!opponentNotDef && isDefend) {
            player.deactivateCA();
            const msg = `${player.playerName}@atk@defended`;

            room.broadcast("action", { msg: finalMsg + msg });
            return { ...e, resultMsg: { msg: finalMsg + msg } };
          }
          if (isHit || player.hasCA) {
            // console.log({
            //   CA: player.hasCA,
            //   damage: player.damage,
            //   baseDamage: player.baseDamage,
            // });

            const damageMsg = opponent.receiveDamage(player.damage);
            player.deactivateCA();

            room.broadcast("action", {
              msg: finalMsg + damageMsg,
              damageTaken: player.damage,
            });
            return {
              ...e,
              resultMsg: {
                msg: finalMsg + damageMsg,
                damageTaken: player.damage,
              },
            };
          } else {
            player.deactivateCA();

            const msg = `${player.playerName}@atk@miss`;
            room.broadcast("action", { msg: finalMsg + msg });

            return { ...e, resultMsg: { msg: finalMsg + msg } };
          }
        }
        case "sp": {
          player.specialUsed(1);
          const isHit = isHitMap.get(e.player);

          const opponentNotDef =
            room?.state.actions?.get(opponentKey)?.action !== "def";

          if (opponentNotDef) {
            if (player.hasCA) {
              const damageMsg = opponent.receiveDamage(player.specialDamage);

              player.deactivateCA();

              room.broadcast("action", {
                msg: finalMsg + damageMsg,
                damageTaken: player.specialDamage,
              });
              return {
                ...e,
                resultMsg: {
                  msg: finalMsg + damageMsg,
                  damageTaken: player.specialDamage,
                },
              };
            }

            if (isHit) {
              const damageMsg = opponent.receiveDamage(player.specialDamage);
              room.broadcast("action", {
                msg: finalMsg + damageMsg,
                damageTaken: player.specialDamage,
              });
              return {
                ...e,
                resultMsg: {
                  msg: finalMsg + damageMsg,
                  damageTaken: player.specialDamage,
                },
              };
            }
            player.deactivateCA();

            const msg = `${player.playerName}@sp@miss`;
            room.broadcast("action", { msg: finalMsg + msg });
            return { ...e, resultMsg: { msg: finalMsg + msg } };
          }

          if (!opponentNotDef && isDefend) {
            player.deactivateCA();

            const msg = `${player.playerName}@sp@defended`;
            room.broadcast("action", { msg: finalMsg + msg });
            return { ...e, resultMsg: { msg: finalMsg + msg } };
          }
          if (isHit || player.hasCA) {
            const damageMsg = opponent.receiveDamage(player.specialDamage);
            player.deactivateCA();

            room.broadcast("action", {
              msg: finalMsg + damageMsg,
              damageTaken: player.specialDamage,
            });
            return {
              ...e,
              resultMsg: {
                msg: finalMsg + damageMsg,
                damageTaken: player.specialDamage,
              },
            };
          } else {
            player.deactivateCA();

            const msg = `${player.playerName}@sp@miss`;

            room.broadcast("action", { msg: finalMsg + msg });

            return { ...e, resultMsg: { msg: finalMsg + msg } };
          }
        }
        case "def": {
          player.deactivateCA();
          const opponentKey = Array.from(room.state.players.keys()).find(
            (k: string) => k !== e.player
          );

          const opponentIsAttaking = ["atk", "sp"].includes(
            room?.state.actions?.get(opponentKey)?.action
          );

          if (opponentIsAttaking && isDefend) {
            const CAMsg = player.activateCA();
            room.broadcast("action", { msg: finalMsg + CAMsg });
            return { ...e, resultMsg: { msg: finalMsg + CAMsg } };
          } else {
            const msg = `${e.player}@def@miss`;
            room.broadcast("action", { msg: finalMsg + msg });
            return { ...e, resultMsg: { msg: finalMsg + msg } };
          }
        }

        case "brk": {
          player.deactivateCA();
          const opponentKey = Array.from(room.state.players.keys()).find(
            (k: string) => k !== e.player
          );

          if (room?.state.actions?.get(opponentKey)?.action === "def") {
            const msg = opponent.breakShield();
            room.broadcast("action", { msg: finalMsg + msg });
            return { ...e, resultMsg: { msg: finalMsg + msg } };
          } else {
            const msg = `${e.player}@brk@miss`;
            room.broadcast("action", { msg: finalMsg + msg });
            return { ...e, resultMsg: { msg: finalMsg + msg } };
          }
        }
        case undefined: {
          console.log("ERROR: ", { e: JSON.stringify(e) });
        }
        default:
          console.log("ERROR: ", { e: JSON.stringify(e) });
      }
    });

    this.sendMessages(room, actionsMsgArr);

    this.updateHistory(room, actionsMsgArr, isHitMap);

    this.turnPass(room);
  }

  static sendMessages(
    room: MyRoom,
    msgArrs: {
      resultMsg: {
        msg: string;
        damageTaken?: number;
      };
      action: string;
      player: string;
    }[]
  ) {
    room.clients.forEach((c: MyRoom["clients"][0]) => {
      const {
        playerMsg,
        opponentMsg,
        playerRawMsg,
        playerDamageTaken,
        opponentDamageTaken,
      } = this.buildMsg(msgArrs, c.sessionId);

      c.send("action", {
        playerMsg,
        opponentMsg,
        playerRawMsg,
        playerDamageTaken,
        opponentDamageTaken,
      });
    });
  }

  static buildMsg(
    msgArrs: {
      resultMsg: {
        msg: string;
        damageTaken?: number;
      };
      action: string;
      player: string;
    }[],
    sessionId: string
  ): {
    playerMsg: string;
    opponentMsg: string;
    playerRawMsg: string;
    playerDamageTaken: number;
    opponentDamageTaken: number;
  } {
    const ownerMsg = msgArrs.find((m) => m.player === sessionId) || {
      resultMsg: { msg: "afk", damageTaken: 0 },
    };
    const opponentMsg = msgArrs.find((m) => m.player !== sessionId) || {
      resultMsg: { msg: "afk", damageTaken: 0 },
    };

    const { opponentMessageFinal, ownerMessageFinal } = handleBattleMessage({
      owner: {
        ownerIsAttacking:
          ownerMsg.resultMsg.msg.includes("atk") ||
          ownerMsg.resultMsg.msg.includes("sp"),
        ownerIsCA: ownerMsg.resultMsg.msg.includes("@ca@"),
        ownerIsBreakingBlock: ownerMsg.resultMsg.msg.includes("brk"),
        ownerIsSpecialing: ownerMsg.resultMsg.msg.includes("sp"),
        ownerIsDefending: ownerMsg.resultMsg.msg.includes("@def@"),
        ownerIsMissed: ownerMsg.resultMsg.msg.includes("miss"),
        ownerIsAFK: ownerMsg.resultMsg.msg === "afk",
      },
      opponent: {
        opponentIsAttacking:
          opponentMsg.resultMsg.msg.includes("atk") ||
          opponentMsg.resultMsg.msg.includes("sp"),

        opponentIsCA: opponentMsg.resultMsg.msg.includes("@ca@"),
        opponentIsBreakingBlock: opponentMsg.resultMsg.msg.includes("brk"),
        opponentIsSpecialing: opponentMsg.resultMsg.msg.includes("sp"),
        opponentIsDefending: opponentMsg.resultMsg.msg.includes("@def@"),
        opponentIsMissed: opponentMsg.resultMsg.msg.includes("miss"),
        opponentIsAFK: opponentMsg.resultMsg.msg === "afk",
      },
      damageDealt: Number(ownerMsg.resultMsg.msg.split("@")?.[3] || -1) || -1,
      damagePersisted:
        Number(opponentMsg.resultMsg.msg.split("@")?.[3] || -1) || -1,
    });

    return {
      playerMsg: ownerMessageFinal,
      opponentMsg: opponentMessageFinal,
      playerRawMsg: ownerMsg.resultMsg.msg,
      playerDamageTaken: ownerMsg.resultMsg?.damageTaken || -1,
      opponentDamageTaken: opponentMsg.resultMsg?.damageTaken || -1,
    };
  }

  static inputBotAction(room: MyRoom, playerKey: string) {
    const opponentKey = Array.from(room.state.players.keys()).find(
      (k: string) => k !== playerKey
    );

    const bot = room.state.players.get(opponentKey) as BotPlayer;

    const rAction = bot.randomAction();

    const botAction = new Action(bot.playerName, rAction).assign({
      action: rAction,
      player: bot.playerName,
    });

    room.state.actions.set(botAction.player, botAction);
  }
}
