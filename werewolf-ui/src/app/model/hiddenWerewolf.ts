import { Character } from "./character"

export class HiddenWerewolf extends Character {
  override type = 'hiddenWerewolf'
  category = 'wolf'
  name = '隐狼'
  override allowNoAction = true
  note = '你的狼队友为{0}'
  override startAudio = 'hiddenWerewolfStart.mp3'
  override endAudio = 'hiddenWerewolfEnd.mp3'

  public constructor(init?:Partial<HiddenWerewolf>) {
    super()
    Object.assign(this, init)
  }
}