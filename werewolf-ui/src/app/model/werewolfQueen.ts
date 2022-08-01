import { Character } from "./character";

export class WerewolfQueen extends Character {
  type = 'werewolfQueen'
  category = 'wolf'
  name = '狼美人'
  isWolf = true
  note = '请选择魅惑的玩家。'
  actionName = 'werewolfQueenLink'
  actionTitle = '魅惑玩家'
  actionMessage = '确认魅惑 {0} 号玩家？'
  startAudio = 'werewolfQueenStart.mp3'
  endAudio = 'werewolfQueenEnd.mp3'
  actionResult = '你昨晚魅惑的是 {0} 号玩家'

  public constructor(init?:Partial<WerewolfQueen>) {
    super()
    Object.assign(this, init);
  }
}