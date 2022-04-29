import { Character } from "./character";

export class Witch extends Character {
  type = 'witch'
  name = '女巫'
  action = ' '

  public constructor(init?:Partial<Witch>) {
    super()
    Object.assign(this, init);
  }
}