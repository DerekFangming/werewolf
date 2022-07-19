import { Character } from "./character";

export class Guard extends Character {
  type = 'guard'
  category = 'god'
  name = '守卫'
  note = '请选择需要守卫的玩家。如果守卫的玩家被女巫使用解药，那名玩家将会死亡。你得护盾不能阻止女巫的毒药。如果不想守卫任何玩家，请点击下方直接结束回合。'
  allowNoAction = true
  actionName = 'guardProtect'
  actionTitle = '守卫玩家'
  actionMessage = '确认守卫 {0} 号玩家？'
  startAudio = 'guardStart.mp3'
  endAudio = 'guardEnd.mp3'

  public constructor(init?:Partial<Guard>) {
    super()
    Object.assign(this, init);
  }
}