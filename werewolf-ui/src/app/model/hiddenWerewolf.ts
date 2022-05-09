import { Character } from "./character";

export class HiddenWerewolf extends Character {
  type = 'hiddenWerewolf'
  category = 'wolf'
  name = '隐狼'
  allowNoAction = true
  note = '你的狼队友为{0}'
  startAudio = 'hiddenWerewolfStart.m4a'
  endAudio = 'hiddenWerewolfEnd.m4a'

  public constructor(init?:Partial<HiddenWerewolf>) {
    super()
    Object.assign(this, init);
  }
}