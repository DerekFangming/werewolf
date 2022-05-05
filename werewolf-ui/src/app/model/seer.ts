import { Character } from "./character";

export class Seer extends Character {
  type = 'seer'
  category = 'god'
  name = '预言家'
  note = '请选择需要检验的玩家。'
  actionName = 'seerExamine'
  actionTitle = '检验玩家'
  actionMessage = '确认检验 {0} 号玩家？'
  startAudio = 'seerStart.m4a'
  endAudio = 'seerEnd.m4a'

  public constructor(init?:Partial<Seer>) {
    super()
    Object.assign(this, init);
  }
}