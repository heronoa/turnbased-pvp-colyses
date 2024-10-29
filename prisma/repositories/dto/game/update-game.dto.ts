import { Game } from "../../entities/game.entity";

export class UpdateGameDto extends Game {
  super(partial: Partial<Game>) {
    Object.assign(this, partial);
  }
}
