import { Character } from "./character";

export class Hunter extends Character {
  type = 'hunter'
  category = 'god'
  name = '猎人'
  allowNoAction = true
  note = '你今天{0}开枪'
  startAudio = 'hunterStart.m4a'
  endAudio = 'hunterEnd.m4a'

  public constructor(init?:Partial<Hunter>) {
    super()
    Object.assign(this, init);
  }
}