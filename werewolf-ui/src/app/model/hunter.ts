import { Character } from "./character"

export class Hunter extends Character {
  override type = 'hunter'
  category = 'god'
  name = '猎人'
  override allowNoAction = true
  note = '你今天{0}开枪'
  override startAudio = 'hunterStart.mp3'
  override endAudio = 'hunterEnd.mp3'

  public constructor(init?:Partial<Hunter>) {
    super()
    Object.assign(this, init)
  }
}