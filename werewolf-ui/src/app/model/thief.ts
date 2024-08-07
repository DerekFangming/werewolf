import { Character } from "./character"

export class Thief extends Character {
  override type = 'thief'
  category = 'thirdParty'
  name = '盗贼'
  note = '请从下面两张身份牌中选出一张替换当前手牌。如果有狼，你必须选择狼身份牌。'
  override nonePlayerAction = true
  actionName = 'thiefChoose'
  actionTitle = '选择角色'
  actionMessage = '确认将自己手牌换成 {0} ？'
  override startAudio = 'thiefStart.mp3'
  override endAudio = 'thiefEnd.mp3'

  public constructor(init?:Partial<Thief>) {
    super()
    Object.assign(this, init)
  }
}