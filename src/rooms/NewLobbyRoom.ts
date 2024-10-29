import { Room, Client, Delayed, matchMaker } from "colyseus";
import { ICardAttributes } from "./schema/GameStates";
import { MockedJoinOptions } from "./schema/MockedData";

interface MatchmakingGroup {
  averageRank: number;
  clients: ClientStat[];
  priority?: boolean;

  ready?: boolean;
  confirmed?: number;

  // cancelConfirmationTimeout?: Delayed;
}

interface ClientStat {
  client: Client;
  waitingTime: number;
  options?: any;
  group?: MatchmakingGroup;
  rank: number;
  confirmed?: boolean;
}

export class MyLobbyRoom extends Room {
  allowUnmatchedGroups: boolean = true;
  evaluateGroupsInterval = 2000;
  groups: MatchmakingGroup[] = [];
  roomToCreate = "match_room";
  maxWaitingTime = 15 * 1000;
  maxWaitingTimeForPriority?: number = 10 * 1000;
  numClientsToMatch = 2;
  stats: ClientStat[] = [];

  onCreate() {
    console.log("lobby created");
    this.setSimulationInterval(
      () => this.redistributeGroups(),
      this.evaluateGroupsInterval
    );
  }

  onJoin(client: Client, options: ICardAttributes) {
    // console.log({ client });
    options = options || MockedJoinOptions;

    this.stats.push({
      client: client,
      rank: options.pet.level,
      waitingTime: 0,
      options,
    });

    client.send("clients", 1);
  }

  createGroup() {
    let group: MatchmakingGroup = { clients: [], averageRank: 0 };
    this.groups.push(group);
    return group;
  }

  redistributeGroups() {
    console.log("RedistributeGrups");
    // re-set all groups
    this.groups = [];

    const stats = this.stats.sort((a, b) => a.rank - b.rank);

    let currentGroup: MatchmakingGroup = this.createGroup();
    let totalRank = 0;

    // console.log({ groups: JSON.stringify(this.groups) });

    for (let i = 0, l = stats.length; i < l; i++) {
      const stat = stats[i];
      stat.waitingTime += this.clock.deltaTime;

      if (currentGroup.averageRank > 0 && !currentGroup.priority) {
        const diff = Math.abs(stat.rank - currentGroup.averageRank);
        const diffRatio = diff / currentGroup.averageRank;

        if (diffRatio > 2) {
          currentGroup = this.createGroup();
          totalRank = 0;
        }
      }

      stat.group = currentGroup;
      currentGroup.clients.push(stat);

      // console.log("push new client to group", {
      //   groups: JSON.stringify(this.groups),
      // });

      totalRank += stat.rank;
      currentGroup.averageRank = totalRank / currentGroup.clients.length;

      if (
        currentGroup.clients.length === this.numClientsToMatch ||
        (stat.waitingTime >= this.maxWaitingTime && this.allowUnmatchedGroups)
      ) {
        console.log("bot match");
        currentGroup.ready = true;
        currentGroup = this.createGroup();
        totalRank = 0;
      }
    }

    this.checkGroupsReady();
  }

  async checkGroupsReady() {
    await Promise.all(
      this.groups.map(async (group) => {
        if (group.ready) {
          group.confirmed = 0;

          /**
           * Create room instance in the server.
           */
          const room = await matchMaker.createRoom(
            group.clients.length > 1 ? this.roomToCreate : "bot_match_room",
            {}
          );

          await Promise.all(
            group.clients.map(async (client) => {
              const matchData = await matchMaker.reserveSeatFor(
                room,
                client.options
              );

              /**
               * Send room data for new WebSocket connection!
               */
              client.client.send("seat", matchData);

              // Send the matchData to the front and the front must request the server to enter the new room where he has a seat reservation

              client.client.leave();
              // console.log(matchData);
            })
          );
        } else {
          group.clients.forEach((client) => {
            client.client.send(
              "clients",
              group.clients.map((c) => c.client.sessionId)
            );
          });
        }
      })
    );
  }

  onLeave(client: Client, consented: boolean) {
    const index = this.stats.findIndex((stat) => stat.client === client);
    this.stats.splice(index, 1);
  }

  onDispose() {}
}
