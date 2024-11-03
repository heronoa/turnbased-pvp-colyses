import { attributesCalculations } from "../utils/calculations";
import { MyRoom } from "./MyRoom";
import { Action, BotPlayer, Skill, Winner } from "./schema/GameStates";
import {
  BotPlayerSchema,
  MyRoomState,
  SkillSchema,
  StatusSchema,
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

    // console.log(playersArr);
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
          : `${matchWinner.split("@")[0]} have won the match`
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
    Array.from(room.state.players.values()).forEach((p) => p.resolveStatus());
    const isHitMap = ResolveActionsLogic.handleCheckHit(room, actionArr);

    const actionsMsgArr = Array.from(room.state.actions.values())
      .sort((a, b) => {
        if (
          JSON.parse(a.action).type === "BUFF" &&
          JSON.parse(b.action).type !== "BUFF"
        )
          return -1;
        if (
          JSON.parse(a.action).type !== "BUFF" &&
          JSON.parse(b.action).type === "BUFF"
        )
          return 1;
        return 0;
      })
      .map((playerAction) => {
        const skill = JSON.parse(playerAction.action) as Skill;
        const player = room.state.players.get(playerAction.player);
        const opponentKey = Array.from(room.state.players.keys()).find(
          (k: string) => k !== playerAction.player
        );
        const opponent = room.state.players.get(opponentKey);

        player.afkClear();

        switch (skill.effect) {
          case "BUFF": {
            player.specialUsed(skill?.baseCost || 0);
            const username = player.userId.split("@")[0];
            const isHit = isHitMap.get(playerAction.player);

            if (isHit && skill?.baseCost > 0) {
              const damage = attributesCalculations.calcStatusDamage(
                skill.baseDamage,
                player.willpower
              );

              // const factors = JSON.stringify(skill.factors);

              const status = new StatusSchema({
                damage,
                factors: skill?.factors || "{}",
                type: skill.type,
                duration: skill.duration || 0,
              });

              player.addStatus(status);
            }

            console.log({ caster: username, name: skill.name });

            const msg = `${username}@${skill.name}@${
              isHit || skill?.baseCost < 0 ? "suc" : "miss"
            }@${skill.baseCost}`;
            room.broadcast("action", { msg });

            return { ...playerAction, resultMsg: { msg } };
          }
          case "DAMAGE": {
            player.specialUsed(skill?.baseCost || 0);

            const isHit = isHitMap.get(playerAction.player);
            let basedamage = 0;
            let resultDamage = 0;

            if (isHit) {
              basedamage = ["BLUNT", "PIERCE", "CUT"].includes(skill.type)
                ? attributesCalculations.calcMeleeDamage(
                    skill.type as "BLUNT" | "PIERCE" | "CUT",
                    skill.baseDamage,
                    player.strength,
                    player.dexterity
                  )
                : attributesCalculations.calcSpecialDamage(
                    skill.baseDamage,
                    player.willpower,
                    player.intelligence
                  );
              resultDamage = opponent.receiveDamage(basedamage);
            }

            const username = player.userId.split("@")[0];

            const msg = `${username}@${skill.name}@${
              isHit ? "suc" : "miss"
            }@${resultDamage}@${skill?.baseCost || 0}@${skill.type}`;
            room.broadcast("action", { msg });
            console.log({ caster: username, name: skill.name });

            return { ...playerAction, resultMsg: { msg } };
          }
          case "STATUS": {
            player.specialUsed(skill?.baseCost || 0);

            const isHit = isHitMap.get(playerAction.player);

            if (isHit) {
              const damage = attributesCalculations.calcStatusDamage(
                skill.baseDamage,
                player.willpower
              );

              // const factors = JSON.stringify(skill.factors);

              console.log({ name: skill.name });

              const status = new StatusSchema({
                factors: skill?.factors || "{}",
                type: skill.type,
                duration: skill.duration || 0,
              });

              opponent.addStatus(status);
            }

            const username = player.userId.split("@")[0];

            console.log({ caster: username, name: skill.name });

            const msg = `${username}@${skill.name}@${isHit ? "suc" : "miss"}@${
              skill?.baseCost || 0
            }`;
            room.broadcast("action", { msg });

            return { ...playerAction, resultMsg: { msg } };
          }

          case undefined: {
            console.log("ERROR: ", { e: JSON.stringify(playerAction) });
          }
          default:
            console.log("ERROR: ", { e: JSON.stringify(playerAction) });
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
      const { playerMsg, opponentMsg } = this.buildMsg(msgArrs, c.sessionId);

      c.send("action", {
        playerMsg,
        opponentMsg,
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
  } {
    const ownerMsg = msgArrs.find((m) => m.player === sessionId);
    const opponentMsg = msgArrs.find((m) => m.player !== sessionId);
    let ownerMessageFinal = "Turn pass without your action",
      opponentMessageFinal = "Turn pass without you opponent take action";

    if (ownerMsg) {
      const [
        caster = undefined,
        action = undefined,
        result = undefined,
        damage = undefined,
        cost = undefined,
      ] = ownerMsg?.resultMsg?.msg.split("@");
      ownerMessageFinal = `${caster} use ${action}!${
        result === "miss"
          ? " But Miss"
          : Number(damage) > 0
          ? ` And deal ${damage} for damage`
          : " Successfully"
      }${
        Number(cost) === 0
          ? ""
          : Number(cost) > 0
          ? ` And uses ${cost} Magicka`
          : ` And recover ${cost} Magicka`
      }`;
    }
    if (opponentMsg) {
      const [
        caster = undefined,
        action = undefined,
        result = undefined,
        damage = undefined,
        cost = undefined,
      ] = opponentMsg?.resultMsg?.msg.split("@");
      opponentMessageFinal = `${caster} use ${action}!${
        result === "miss"
          ? " But Miss"
          : Number(damage) === 0
          ? " Successfully"
          : Number(damage) > 0
          ? ` And deal ${damage} for damage`
          : ` And Heal ${damage} HP`
      }${
        Number(cost) === 0
          ? ""
          : Number(cost) > 0
          ? ` And uses ${cost} Magicka`
          : ` And recover ${cost} Magicka`
      }`;
    }
    return {
      playerMsg: ownerMessageFinal,
      opponentMsg: opponentMessageFinal,
    };
  }

  static inputBotAction(room: MyRoom, playerKey: string) {
    const opponentKey = Array.from(room.state.players.keys()).find(
      (k: string) => k !== playerKey
    );

    const bot = room.state.players.get(opponentKey) as BotPlayer;

    const rAction = bot.randomAction();

    const botAction = new Action(bot.playerName, rAction);

    room.state.actions.set(botAction.player, botAction);
    console.log("finished");
  }
}
