import { Character } from "./character"

export class Knight extends Character {
  override type = 'knight'
  category = 'god'
  name = '骑士'

  public constructor(init?:Partial<Knight>) {
    super()
    Object.assign(this, init)
  }
}