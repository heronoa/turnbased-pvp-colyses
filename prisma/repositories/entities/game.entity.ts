import { Prisma } from "@prisma/client";

export class Game implements Prisma.GameUncheckedCreateInput {
  id?: string | undefined;
  room_id: string;
  updated_at?: string | Date;
  created_at?: string | Date;
  initial_players?: string[] | undefined;
  rounds: string;
  isRanked?: boolean;
  winner?: string;

  constructor(partial: Partial<Game>) {
    Object.assign(this, partial);
  }
}
