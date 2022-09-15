import { Character } from "./character";

export class Cupid extends Character {
  type = 'cupid'
  category = 'thirdParty'
  name = '丘比特'
  note = '请指定两个玩家成为情侣，也可以包括自己在内。'
  nonePlayerAction = true
  actionName = 'cupidChoose'
  actionTitle = '选择角色'
  actionMessage = '确认将自己手牌换成 {0} ？'
  startAudio = 'cupidStart.mp3'
  endAudio = 'cupidEnd.mp3'

  public constructor(init?:Partial<Cupid>) {
    super()
    Object.assign(this, init);
  }
}