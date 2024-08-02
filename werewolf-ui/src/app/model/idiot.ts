import { Character } from "./character"

export class Idiot extends Character {
  override type = 'idiot'
  category = 'god'
  name = '白痴'

  public constructor(init?:Partial<Idiot>) {
    super()
    Object.assign(this, init)
  }
}