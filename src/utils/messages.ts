export const handleBattleMessage = ({
  owner: {
    ownerIsAttacking,
    ownerIsCA,
    ownerIsBreakingBlock,
    ownerIsSpecialing,
    ownerIsDefending,
    ownerIsMissed,
    ownerIsAFK,
  },
  opponent: {
    opponentIsAttacking,
    opponentIsCA,
    opponentIsBreakingBlock,
    opponentIsSpecialing,
    opponentIsDefending,
    opponentIsMissed,
    opponentIsAFK,
  },
  damageDealt,
  damagePersisted,
}: {
  owner: {
    ownerIsAttacking: boolean;
    ownerIsCA: boolean;
    ownerIsBreakingBlock: boolean;
    ownerIsSpecialing: boolean;
    ownerIsDefending: boolean;
    ownerIsMissed: boolean;
    ownerIsAFK: boolean;
  };
  opponent: {
    opponentIsAttacking: boolean;
    opponentIsCA: boolean;
    opponentIsBreakingBlock: boolean;
    opponentIsSpecialing: boolean;
    opponentIsDefending: boolean;
    opponentIsMissed: boolean;
    opponentIsAFK: boolean;
  };
  damageDealt: number;
  damagePersisted: number;
}) => {
  let ownerMessage = "";
  let opponentMessage = "";

  const isBothDefending = ownerIsDefending && opponentIsDefending;
  const isBothBreakingBlock = ownerIsBreakingBlock && opponentIsBreakingBlock;

  if (isBothDefending || isBothBreakingBlock) {
    const msg = "No attack was cast. Both players have tried";
    ownerMessage = `${msg} ${
      isBothDefending ? "defending!" : "breaking shield!"
    }`;
    opponentMessage = `${msg} ${
      isBothDefending ? "defending!" : "breaking shield!"
    }`;
    return {
      opponentMessageFinal: opponentMessage,
      ownerMessageFinal: ownerMessage,
    };
  }

  const ownerDmgMsg = `You hit your opponent for ${
    damageDealt || 0
  } health points ${ownerIsSpecialing ? "using special" : ""}`;
  const ownerMissDmgMsg = `You missed your ${
    ownerIsSpecialing ? "special " : ""
  }attack`;

  const opponentDmgMsg = `Your opponent hits you for ${damagePersisted} health points ${
    opponentIsSpecialing ? "using special" : ""
  }`;
  const opponentMissDmgMsg = `Your opponent missed the ${
    opponentIsSpecialing ? "special " : ""
  }attack`;

  let ownerMsg = "";
  let opponentMsg = "";

  if (ownerIsAttacking || ownerIsSpecialing) {
    ownerMsg = ownerIsMissed ? ownerMissDmgMsg : ownerDmgMsg;
  }

  if (opponentIsAttacking || ownerIsSpecialing) {
    opponentMsg = opponentIsMissed ? opponentMissDmgMsg : opponentDmgMsg;
  }

  if (ownerIsAttacking) {
    if (opponentIsBreakingBlock) {
      return {
        opponentMessageFinal: "Your opponent missed the break defense attempt",
        ownerMessageFinal: ownerIsMissed
          ? "You missed your attack"
          : ownerDmgMsg,
      };
    }

    if (opponentIsDefending) {
      const opponentMsg =
        opponentIsMissed || ownerIsMissed
          ? "Your opponent missed the defense attempt"
          : !opponentIsMissed && !ownerIsMissed
          ? `Your attack has been blocked! Your opponent has a counter attack!`
          : "";

      const ownerMsg = ownerIsMissed
        ? "You missed your attack"
        : opponentIsMissed
        ? ownerDmgMsg
        : "";

      return {
        opponentMessageFinal: opponentMsg,

        ownerMessageFinal: ownerMsg,
      };
    }
  }

  if (ownerIsDefending) {
    if (opponentIsAttacking) {
      const opponentMsg =
        !opponentIsMissed && ownerIsMissed
          ? opponentDmgMsg
          : !opponentIsMissed && !ownerIsMissed
          ? ""
          : opponentIsMissed
          ? opponentMissDmgMsg
          : "";

      const ownerMsg =
        !ownerIsMissed && !opponentIsMissed
          ? "You blocked the attack. You have an increased melee damage in the next turn."
          : "You missed the attempt to defend";

      return {
        opponentMessageFinal: opponentMsg,
        ownerMessageFinal: ownerMsg,
      };
    }

    if (opponentIsBreakingBlock) {
      return {
        opponentMessageFinal:
          "Your shield is broken! You can't defend for 5 turns!",
        ownerMessageFinal: "",
      };
    }
  }

  if (ownerIsBreakingBlock) {
    ownerMsg = "You missed the attempt to break defese";

    if (opponentIsDefending) {
      return {
        opponentMessageFinal: "",
        ownerMessageFinal:
          "You broke your opponent's shield. They can't defend for 5 turns!",
      };
    }
  }

  if (ownerIsAFK && opponentIsAFK) {
    return {
      opponentMessageFinal: "The turn ended with both players away.",
      ownerMessageFinal: "The turn ended with both players away.",
    };
  }

  return {
    opponentMessageFinal: opponentMsg ?? "Missing msg for this case",
    ownerMessageFinal: ownerMsg ?? "Missing msg for this case",
  };
};
