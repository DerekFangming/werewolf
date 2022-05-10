import { Character } from "./character";

export class Hunter extends Character {
  type = 'hunter'
  category = 'god'
  name = '猎人'
  allowNoAction = true
  note = '你今天{0}开枪'
  startAudio = 'hunterStart.mp3'
  endAudio = 'hunterEnd.mp3'

  public constructor(init?:Partial<Hunter>) {
    super()
    Object.assign(this, init);
  }
}