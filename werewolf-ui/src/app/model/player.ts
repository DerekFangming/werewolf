import { Character } from "./character"
import { Villager } from "./villager"

export class Player {
  character: Character = new Villager()
  id: string = ''
  isOcupied = false
  isSelf = false

  public constructor(init?:Partial<Player>) {
    Object.assign(this, init);
  }
}