import { Character } from "./character";

export class Werewolf extends Character {
  type = 'werewolf'
  name = '狼人'
  isWolf = true
  note = '请选择需要击杀的玩家。只需一名狼人玩家完成此操作。'
  actionName = 'werewolfKill'
  actionTitle = '击杀玩家'
  actionMessage = '确认击杀 {0} 号玩家？'
  startAudio = 'werewolfStart.m4a'
  endAudio = 'werewolfEnd.m4a'

  public constructor(init?:Partial<Werewolf>) {
    super()
    Object.assign(this, init);
  }
}