import { Character } from "./character";

export class Hunter extends Character {
  type = 'hunter'
  name = '猎人'
  allowNoAction = true
  note = '你今天{0}开枪'

  public constructor(init?:Partial<Hunter>) {
    super()
    Object.assign(this, init);
  }
}