import { Character } from "./character";

export class Player {
  character: Character
  id: string
  isOcupied = false
  isSelf = false

  public constructor(init?:Partial<Player>) {
    Object.assign(this, init);
  }
}