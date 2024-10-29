import { Prisma } from "@prisma/client";

export class User implements Prisma.UserUncheckedCreateInput {
  id?: string;
  email: string;
  username: string;
  password: string;
  updated_at?: string | Date;
  created_at?: string | Date;
  character?: any;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
