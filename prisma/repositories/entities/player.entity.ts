import { Prisma } from "@prisma/client";

export class Player implements Prisma.PlayerUncheckedCreateInput {
  id?: string | undefined;
  wallet: string;
  gameId?: string;
  GameHistory?: string[];

  constructor(partial: Partial<Player>) {
    Object.assign(this, partial);
  }
}
