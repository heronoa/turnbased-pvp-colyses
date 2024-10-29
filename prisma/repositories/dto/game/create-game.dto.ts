import { Game } from "../../entities/game.entity";

export class CreateGameDto extends Game {
  super(partial: Partial<Game>) {
    Object.assign(this, partial);
  }
}
