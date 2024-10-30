import { Prisma } from "@prisma/client";

export class Character implements Prisma.CharacterUncheckedCreateInput {
  name: string;
  exp: number;
  level: number;
  levelupExp: number;
  heroClass: string;
  userCharactersId?: string | null | undefined;
  updated_at?: string | Date | undefined;
  created_at?: string | Date | undefined;
  characterAttributeId?: string;
  CharacterAttribute?: Prisma.CharacterAttributeUncheckedCreateNestedOneWithoutCharacterInput;
  id?: string;
  userId: any;
  skill?: any;

  constructor(partial: Partial<Character>) {
    Object.assign(this, partial);
  }
}
