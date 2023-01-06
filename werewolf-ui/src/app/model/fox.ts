import { Character } from "./character";

export class Fox extends Character {
  type = 'fox'
  category = 'god'
  name = '九尾狐'

  public constructor(init?:Partial<Fox>) {
    super()
    Object.assign(this, init);
  }
}