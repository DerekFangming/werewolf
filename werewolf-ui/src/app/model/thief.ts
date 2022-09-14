import { Character } from "./character";

export class Thief extends Character {
  type = 'thief'
  category = 'thirdParty'
  name = '盗贼'

  public constructor(init?:Partial<Thief>) {
    super()
    Object.assign(this, init);
  }
}