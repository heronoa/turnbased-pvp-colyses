import { Room, Client } from "@colyseus/core";
import { BotPlayerSchema, MyRoomState } from "./schema/MyRoomState";
import {
  Action,
  BattleField,
  BotPlayer,
  ICharacterInitial,
  Player,
  Skill,
} from "./schema/GameStates";
import { Delayed } from "colyseus";
import { GameLogic } from "./GameLogic";
import { MockedJoinOptions } from "./schema/MockedData";
import { DBActions } from "./DBActions";
import { prismaClient } from "../../prisma/repositories/prismaClient";

export class BotRoom extends Room<MyRoomState> {
  turnTimer = 25;
  maxRounds = 3;
  maxTurns = 10;
  round = 1;
  turn = 1;
  maxClients = 1;
  refreshInterval: Delayed;
  disposeInterval: Delayed;
  maxAfkSequel = 3;
  MapX = 3;
  MapY = 4;

  onCreate(options: any) {
    this.setState(new MyRoomState());
    this.autoDispose = false;

    this.disposeInterval = this.clock.setInterval(() => {
      if (this.state.winner) {
        this.disconnect();
      }

      if (this.clients.length < 2) {
        this.disconnect();
      }
    }, 60000);

    this.onMessage("chat", (client, message) => {
      this.broadcast("chat", `${client.sessionId}: ${message.data}`);
    });
    this.onMessage(
      "action",
      async (
        client,
        message: { skill: Skill; movement?: { x: number; y: number } }
      ) => {
        console.log({ message });
        if (this.state.actions.get(client.sessionId)) {
          return client.send("warn", "you already take a action");
        }

        const skill = message.skill;

        const player = this.state.players.get(client.sessionId);

        if (player.mana < message.skill.baseCost) {
          return client.send(
            "warn",
            `You don't have enough magicka to use ${message.skill.name}`
          );
        }

        const skillCountdown = player.skill_countdown.get(message.skill.id);

        if (skillCountdown) {
          return client.send(
            "warn",
            `You need to wait ${skillCountdown.duration} to use ${message.skill.name} again`
          );
        }

        if (message?.movement) {
          const bf = this.state.battleField.get(client.sessionId);
          const wantedBFtile =
            bf.map[message.movement.y].tilesets[message.movement.x];

          if (!wantedBFtile?.enabled) {
            return client.send("warn", `This tileset is unabled`);
          }
        }

        const newAction = new Action(
          client.sessionId,
          skill,
          message?.movement
        );

        this.state.actions.set(newAction.player, newAction);

        GameLogic.inputBotAction(this, newAction.player);
        console.log("Finished");
      }
    );
  }

  async onJoin(client: Client, options: ICharacterInitial) {
    const player = new Player(
      client.sessionId,
      options?.character ? options : MockedJoinOptions
    );

    const bot = new BotPlayer(
      client.sessionId.split("").reverse().join(""),
      MockedJoinOptions
    );

    client.userData = player;

    this.state.players.set(client.sessionId, player);
    this.state.players.set(bot.playerName, bot);

    const opponentBF = new BattleField(this.MapX, this.MapY);
    const playerBF = new BattleField(this.MapX, this.MapY);

    playerBF.addPlayerInitialToTileSet(player);
    opponentBF.addPlayerInitialToTileSet(bot);

    this.state.battleField.set(client.sessionId, playerBF);
    this.state.battleField.set(bot.playerName, opponentBF);
    // this.state.players.set(client.sessionId, player);

    this.broadcast(
      "Join",
      `${client.sessionId} joined and is ready for battle`
    );

    if (this.state.players.size > 1) {
      const isRanked = await DBActions.checkRanked([player]);
      this.state.isRanked = isRanked;
      this.disposeInterval.pause();
      const initialPlayers = [player, bot];
      this.state.history = JSON.stringify({ initialPlayers });

      this.clock.start();

      this.refreshInterval = this.clock.setInterval(() => {
        // console.log("Time now " + this.clock.currentTime);

        if (this.state.winner) {
          this.disconnect();
        }

        if (this.state.actions.size === 1) {
          const rAction = bot.randomAction();

          const botAction = new Action(
            bot.playerName,
            rAction.skill,
            rAction.movement
          );

          this.state.actions.set(botAction.player, botAction);
        }

        if (this.state.actions.size > 1 || this.state.countdown === 0) {
          GameLogic.resolveActions(this);
        }

        this.state.countdown--;
      }, 1000);
    }
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.players.get(client.sessionId).connected = false;

    try {
      if (consented) {
        throw new Error("consented leave");
      }

      await this.allowReconnection(client, 60);

      this.state.players.get(client.sessionId).connected = true;
    } catch (e) {
      this.disposeInterval.reset();
      this.disposeInterval.resume();
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
