import { Character } from "./character";

export class Witch extends Character {
  name = '女巫'

  public constructor(init?:Partial<Witch>) {
    super()
    Object.assign(this, init);
  }
}