import { Character } from "./character";

export class Cupid extends Character {
  type = 'cupid'
  category = 'thirdParty'
  name = '丘比特'
  note = '请指定两个玩家成为情侣，也可以包括自己在内。重复点击玩家即可取消选择。'
  nonePlayerAction = true
  actionName = 'cupidChoose'
  startAudio = 'cupidStart.mp3'
  endAudio = 'cupidEnd.mp3'

  public constructor(init?:Partial<Cupid>) {
    super()
    Object.assign(this, init);
  }
}