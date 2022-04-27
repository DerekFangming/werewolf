import { Character } from "./character";

export class Hunter extends Character {
  type = 'hunter'
  name = '猎人'

  public constructor(init?:Partial<Hunter>) {
    super()
    Object.assign(this, init);
  }
}