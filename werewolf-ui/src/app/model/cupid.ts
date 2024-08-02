import { Character } from "./character"

export class Cupid extends Character {
  override type = 'cupid'
  category = 'thirdParty'
  name = '丘比特'
  note = '请指定两个玩家成为情侣，也可以包括自己在内。重复点击玩家即可取消选择。'
  override nonePlayerAction = true
  actionName = 'cupidChoose'
  override startAudio = 'cupidStart.mp3'
  override endAudio = 'cupidEnd.mp3'

  public constructor(init?:Partial<Cupid>) {
    super()
    Object.assign(this, init)
  }
}