import { Character } from "./character";

export class Player {
  character: Character
  id: string
  selected = false

  public constructor(init?:Partial<Player>) {
    Object.assign(this, init);
  }
}