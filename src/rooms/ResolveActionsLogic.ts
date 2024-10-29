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

    if (
      actionArr.find((ac) => ac.action === "atk") ||
      actionArr.find((ac) => ac.action === "sp")
    ) {
      actionArr
        .filter((ac) => ["atk", "sp"].includes(ac.action))
        .forEach((ac) => {
          const attacker = room.state.players.get(ac.player);
          const opponentKey = Array.from(room.state.players.keys()).find(
            (k: string) => k !== ac.player
          );
          const opponent = room.state.players.get(opponentKey);
          const random = attributesCalculations.generateRadintBetween(1, 100);

          const odd =
            ac.action === "atk"
              ? opponent.meleeDodgeOdd
              : opponent.specialDodgeOdd;
          isHitMap.set(attacker.playerName, attacker.hasCA || random < odd);
        });
    }

    if (
      actionArr.find((ac) => ac.action === "def") &&
      (actionArr.find((ac) => ac.action === "atk") ||
        actionArr.find((ac) => ac.action === "sp"))
    ) {
      const defender = room.state.players.get(
        actionArr.find((ac) => ac.action === "def").player
      );

      const random = attributesCalculations.generateRadintBetween(1, 100);

      const attackerAction =
        actionArr.find((ac) => ac.action === "atk") ||
        actionArr.find((ac) => ac.action === "sp");

      const odd =
        attackerAction.action === "atk"
          ? defender.meleeDefOdd
          : defender.specialDefOdd;
      isDefend = !isHitMap.get(attackerAction.player) || random < odd;
    }

    return [isHitMap, isDefend];
  }
}
