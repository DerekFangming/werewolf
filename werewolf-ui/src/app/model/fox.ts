import { Character } from "./character";

export class Fox extends Character {
  type = 'fox'
  category = 'god'
  name = '九尾狐'
  allowNoAction = true
  note = '你还剩{0}条尾巴'
  startAudio = 'foxStart.mp3'
  endAudio = 'foxEnd.mp3'

  public constructor(init?:Partial<Fox>) {
    super()
    Object.assign(this, init);
  }
}