import { Character } from "./character";

export class Seer extends Character {
  type = 'seer'
  name = '预言家'

  public constructor(init?:Partial<Seer>) {
    super()
    Object.assign(this, init);
  }
}