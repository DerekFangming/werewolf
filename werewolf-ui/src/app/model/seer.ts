import { Character } from "./character";

export class Seer extends Character {
  name = '预言家'

  public constructor(init?:Partial<Seer>) {
    super()
    Object.assign(this, init);
  }
}