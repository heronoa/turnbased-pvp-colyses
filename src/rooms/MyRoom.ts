import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { Action, ICharacterInitial, Player, Skill } from "./schema/GameStates";
import { Delayed } from "colyseus";
import { GameLogic } from "./GameLogic";
import { MockedJoinOptions } from "./schema/MockedData";
import { DBActions } from "./DBActions";

export class MyRoom extends Room<MyRoomState> {
  turnTimer = 25;
  maxRounds = 3;
  maxTurns = 10;
  round = 1;
  turn = 1;
  maxClients = 2;
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

    this.onMessage("action", (client, message: Skill) => {
      console.log({ message });
      if (this.state.actions.get(client.sessionId)) {
        return client.send("warn", "you already take a action");
      }

      const skill = JSON.stringify(message);

      const player = this.state.players.get(client.sessionId);

      if (player.mana < message.baseCost) {
        return client.send(
          "warn",
          `You don't have enough magicka to use ${message.name}`
        );
      }

      const skillCountdown = player.skill_countdown.get(message.id);

      if (skillCountdown) {
        return client.send(
          "warn",
          `You need to wait ${skillCountdown.duration} to use ${message.name} again`
        );
      }

      const newAction = new Action(client.sessionId, skill as string);

      this.state.actions.set(newAction.player, newAction);
    });
  }

  async onJoin(client: Client, options: ICharacterInitial) {
    // console.log({ options });
    // const playerEnum = this.state.players.size + 1;
    const player = new Player(
      client.sessionId,
      options?.character ? options : MockedJoinOptions
    );

    client.userData = player;

    this.state.players.set(client.sessionId, player);
    // this.state.players.set(client.sessionId, player);

    this.broadcast(
      "Join",
      `${client.sessionId} joined and is ready for battle`
    );

    const previousHistory = JSON.parse(this.state.history);
    const newHistory = JSON.parse(JSON.stringify(previousHistory));
    if (newHistory?.initialPlayers) {
      newHistory.initialPlayers.push(player);
    } else {
      newHistory.initialPlayers = [player];
    }
    this.state.history = JSON.stringify(newHistory);

    if (this.state.players.size > 1) {
      const isRanked = await DBActions.checkRanked(
        Array.from(this.state.players.values())
      );
      this.state.isRanked = isRanked;
      this.disposeInterval.pause();
      const prevHistory = JSON.parse(this.state.history);
      if (!prevHistory?.initialPlayers) {
        prevHistory.initialPlayers = [];
      }
      const initialPlayers = [...prevHistory.initialPlayers, player];
      this.state.history = JSON.stringify({ initialPlayers });

      this.clock.start();

      this.refreshInterval = this.clock.setInterval(() => {
        // console.log("Time now " + this.clock.currentTime);
        if (this.state.winner) {
          this.disconnect();
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

    // flag client as inactive for other users
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
