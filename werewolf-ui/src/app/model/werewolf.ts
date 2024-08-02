import { Character } from "./character"

export class Werewolf extends Character {
  override type = 'werewolf'
  category = 'wolf'
  name = '狼人'
  override isWolf = true
  note = '请选择需要击杀的玩家。只需一名狼人玩家完成此操作。如果有狼美人，请代替狼美人完成操作。'
  actionName = 'werewolfKill'
  actionTitle = '击杀玩家'
  actionMessage = '确认击杀 {0} 号玩家？'
  override startAudio = 'werewolfStart.mp3'
  override endAudio = 'werewolfEnd.mp3'

  public constructor(init?:Partial<Werewolf>) {
    super()
    Object.assign(this, init)
  }
}