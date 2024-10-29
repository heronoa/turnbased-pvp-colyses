import { Room, Client } from "@colyseus/core";
import { BotPlayerSchema, MyRoomState } from "./schema/MyRoomState";
import {
  Action,
  BotPlayer,
  ICharacterInitial,
  Player,
} from "./schema/GameStates";
import { Delayed } from "colyseus";
import { GameLogic } from "./GameLogic";
import { MockedJoinOptions } from "./schema/MockedData";
import { DBActions } from "./DBActions";

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
    this.onMessage("atk", (client) => {
      if (this.state.actions.get(client.sessionId)) {
        return client.send("warn", "you already take a action");
      }

      const newAction = new Action(client.sessionId, "atk");
      this.state.actions.set(newAction.player, newAction);

      GameLogic.inputBotAction(this, newAction.player);
    });
    this.onMessage("def", (client) => {
      if (!this.state.players.get(client.sessionId).hasShield) {
        const p = this.state.players.get(client.sessionId);
        const defCoutdown = p.maxBreakSequel - p.breakSequel;
        return client.send(
          "warn",
          `your shield is broken wait ${defCoutdown} turn${
            defCoutdown > 1 ? "s" : ""
          }`
        );
      }
      if (this.state.actions.get(client.sessionId)) {
        return client.send("warn", "you already take a action");
      }

      const newAction = new Action(client.sessionId, "def");
      this.state.actions.set(newAction.player, newAction);

      GameLogic.inputBotAction(this, newAction.player);
    });
    this.onMessage("brk", (client) => {
      if (this.state.actions.get(client.sessionId)) {
        return client.send("warn", "you already take a action");
      }

      const newAction = new Action(client.sessionId, "brk");
      this.state.actions.set(newAction.player, newAction);

      GameLogic.inputBotAction(this, newAction.player);
    });
    this.onMessage("sp", (client) => {
      if (this.state.actions.get(client.sessionId)) {
        return client.send("warn", "you already take a action");
      }

      const newAction = new Action(client.sessionId, "sp");

      this.state.actions.set(newAction.player, newAction);

      GameLogic.inputBotAction(this, newAction.player);
    });
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

          const botAction = new Action(bot.playerName, rAction).assign({
            action: rAction,
            player: bot.playerName,
          });

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
