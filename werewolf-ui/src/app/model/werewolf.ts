import { Character } from "./character";

export class Werewolf extends Character {
  name = '狼人'

  public constructor(init?:Partial<Werewolf>) {
    super()
    Object.assign(this, init);
  }
}