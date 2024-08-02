import { Character } from "./character"

export class Fox extends Character {
  override type = 'fox'
  category = 'god'
  name = '九尾狐'
  override allowNoAction = true
  note = '你还剩{0}条尾巴'
  override startAudio = 'foxStart.mp3'
  override endAudio = 'foxEnd.mp3'

  public constructor(init?:Partial<Fox>) {
    super()
    Object.assign(this, init)
  }
}