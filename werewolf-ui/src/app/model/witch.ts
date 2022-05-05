import { Character } from "./character";

export class Witch extends Character {
  type = 'witch'
  category = 'god'
  name = '女巫'
  allowNoAction = true
  note = '今晚被击杀的是{0}号玩家。请点击{0}号玩家使用解药或点击其他玩家使用毒药。解药和毒药不可以在同一局一起使用。如果选择解救被击杀的玩家，你本局将无法使用毒药。如果都不想使用，请点击下方直接结束回合。'
  actionName = 'witchPills'
  actionTitle = '确认使用{0}'
  actionMessage = '确认对 {0} 号玩家使用{1}？'
  startAudio = 'witchStart.m4a'
  endAudio = 'witchEnd.m4a'

  public constructor(init?:Partial<Witch>) {
    super()
    Object.assign(this, init);
  }
}