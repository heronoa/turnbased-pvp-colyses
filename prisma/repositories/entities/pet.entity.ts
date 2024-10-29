import { Prisma } from "@prisma/client";

export class Pet implements Prisma.PetUncheckedCreateInput {
  id?: string | undefined;
  assetId: string;
  wallet: string;
  GameHistory?: string[] | undefined;

  constructor(partial: Partial<Pet>) {
    Object.assign(this, partial);
  }
}
