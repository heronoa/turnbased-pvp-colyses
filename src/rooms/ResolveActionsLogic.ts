import { attributesCalculations } from "../utils/calculations";
import { MyRoom } from "./MyRoom";
import { Action } from "./schema/GameStates";

export class ResolveActionsLogic {
  static handleAfkAction(room: MyRoom, actionArr: Action[]) {
    if (room.state.actions.size < 2) {
      const activePlayers = actionArr.map((ac) => ac.player);

      const allPlayers = Array.from(room.state.players.keys());

      const afkPlayers = allPlayers.filter((p) => !activePlayers.includes(p));

      afkPlayers.forEach((p) => {
        const player = room.state.players.get(p);

        player.incrementAfkSequel();
      });
    }
  }

  static handleCheckHit(
    room: MyRoom,
    actionArr: Action[]
  ): [Map<string, boolean>, boolean] {
    const isHitMap: Map<string, boolean> = new Map();
    let isDefend: boolean = false;

    actionArr.forEach((ac) => {
      const attacker = room.state.players.get(ac.player);
      const opponentKey = Array.from(room.state.players.keys()).find(
        (k: string) => k !== ac.player
      );
      const opponent = room.state.players.get(opponentKey);
      const random = attributesCalculations.generateRadintBetween(1, 100);

      console.log({ ac });

      const odd = ["BLUNT", "CUT", "PIERCE"].includes(ac.action?.type)
        ? opponent.meleeDodgeOdd
        : opponent.specialDodgeOdd;
      isHitMap.set(attacker.playerName, attacker.hasCA || random < odd);
    });

    return [isHitMap, isDefend];
  }
}
