import { attributesCalculations } from "../utils/calculations";
import { MyRoom } from "./MyRoom";
import { Action, Skill } from "./schema/GameStates";

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
  ): Map<string, boolean> {
    const isHitMap: Map<string, boolean> = new Map();

    actionArr.forEach((ac) => {
      const attacker = room.state.players.get(ac.player);
      const opponentKey = Array.from(room.state.players.keys()).find(
        (k: string) => k !== ac.player
      );
      const opponent = room.state.players.get(opponentKey);
      const random = attributesCalculations.generateRadintBetween(1, 100);

      const skill: Skill = JSON.parse(ac.action);

      switch (skill.effect) {
        case "DAMAGE": {
          const hitOdd = ["BLUNT", "CUT", "PIERCE"].includes(skill?.type)
            ? attributesCalculations.calcMeleeHitOdd(attacker.dexterity)
            : attributesCalculations.calcSpecialHitOdd(attacker.intelligence);

          const dodgeOdd = ["BLUNT", "CUT", "PIERCE"].includes(skill?.type)
            ? attributesCalculations.calcOddDodgeMelee(
                opponent.willpower,
                attacker.dexterity
              )
            : attributesCalculations.calcOddDodgeSpecial(
                opponent.willpower,
                attacker.dexterity
              );

          console.log({ dodgeOdd, hitOdd });
          isHitMap.set(
            attacker.playerName,
            random < dodgeOdd && random < hitOdd
          );
        }
        case "BUFF": {
          const hitOdd = attributesCalculations.calcBuffHitOdd(
            attacker.willpower
          );

          console.log({ hitOdd });

          isHitMap.set(attacker.playerName, random < hitOdd);
        }
        case "STATUS": {
          const hitOdd = attributesCalculations.calcStatusHitOdd(
            attacker.willpower
          );

          const dodgeOdd = attributesCalculations.calcStatusDodgeOdd(
            opponent.willpower
          );

          console.log({ dodgeOdd, hitOdd });

          isHitMap.set(
            attacker.playerName,
            random < dodgeOdd && random < hitOdd
          );
        }
      }
    });

    return isHitMap;
  }
}
