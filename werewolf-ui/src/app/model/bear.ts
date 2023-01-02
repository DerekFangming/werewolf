import { Character } from "./character";

export class Bear extends Character {
  type = 'bear'
  category = 'god'
  name = '熊'

  public constructor(init?:Partial<Bear>) {
    super()
    Object.assign(this, init);
  }
}